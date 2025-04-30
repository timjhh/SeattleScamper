from datetime import datetime
from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from .helpers import (
    calculate_passive_income,
    calculate_score,
    new_event,
    handle_powerup,
)

from ..database.database import SessionDep
from ..database.models import (
    BuyCursePost,
    BuyPowerUpPost,
    Game,
    Canton,
    Challenge,
    ChallengePost,
    Curse,
    DestroyCantonPost,
    EnterCantonPost,
    Event,
    EventPost,
    PowerUp,
    Team,
    User,
    UserPublic,
)
from ..auth import auth

TOLL_COST = 50

router = APIRouter()


@router.get("/user/", response_model=UserPublic)
async def read_user(
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    return current_user


@router.get("/team/")
async def read_team(
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    return current_user.team


@router.get("/team/cantons/")
async def read_team_cantons(
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    if current_user.team:
        return current_user.team.cantons
    return None


@router.get("/cantons/")
async def read_cantons(db: SessionDep):
    return db.exec(select(Canton)).all()


@router.get("/teams/")
async def read_teams(db: SessionDep):
    return db.exec(select(Team)).all()


@router.get("/users/", response_model=Sequence[UserPublic])
async def read_users(db: SessionDep):
    return db.exec(select(Event)).all()


@router.get("/events/")
async def read_events(db: SessionDep):
    return db.exec(select(Event)).all()


@router.get("/challenges/")
async def read_challenges(db: SessionDep):
    return db.exec(select(Challenge)).all()


@router.post("/challenge/")
async def post_challenge(
    challenge: ChallengePost,
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    challenge_db = db.get(Challenge, challenge.id)

    if challenge_db is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Challenge ID",
        )

    team = current_user.team

    if team is None or team.id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not in team",
        )

    canton = db.get(Canton, challenge.canton)

    if canton is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Canton ID",
        )

    if not canton.destroyed:
        team.money += challenge_db.money

        if challenge_db.levels > 0:
            other_team_id = 1 if team.id == 2 else 2
            other_team = db.get(Team, other_team_id)

            if canton.team == team:
                canton.level += challenge_db.levels
            elif canton.team is None:
                canton.level += challenge_db.levels
                canton.team = team
            else:
                if canton.level == challenge_db.levels:
                    canton.team = None
                elif canton.level < challenge_db.levels:
                    canton.team = team
                canton.level = abs(canton.level - challenge_db.levels)

            canton.level = min(canton.level, 3)

            if canton.team:
                canton.team_id = canton.team.id
            else:
                canton.team_id = None

            team.income = calculate_passive_income(team)
            team.score = calculate_score(team)

            if other_team:
                other_team.income = calculate_passive_income(other_team)
                other_team.score = calculate_score(other_team)
                db.add(other_team)
                db.commit()
                db.refresh(other_team)

    if team.hand_size == 4:
        team.hand_size = 3

    if team.challenges > 0:
        team.challenges -= 1

    event = Event(
        text="Team '{0}' completed the challenge '{1}'".format(
            team.name, challenge_db.name
        ),
        source=team.name,
        time=datetime.now(),
    )

    team_copy = team.model_copy()
    canton_copy = canton.model_copy()
    db.add(team)
    db.commit()
    db.refresh(team)

    db.add(canton)
    db.commit()
    db.refresh(canton)

    db.add(event)
    db.commit()
    db.refresh(event)

    return {"team": team_copy, "canton": canton_copy}


@router.get("/curses/")
async def get_curses(
    db: SessionDep,
):
    return db.exec(select(Curse)).all()


@router.post("/curse/")
async def buy_curse(
    curse: BuyCursePost,
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Team",
        )

    curse_db = db.get(Curse, curse.id)

    if curse_db is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Curse",
        )

    if team.money < curse_db.cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient money",
        )


    game = db.get(Game, 1)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to find game.",
        )


    team.money -= curse_db.cost * game.multiplier
    team.curses += 1

    text = "Team '{0}' purchased a curse".format(team.name)
    new_event(db, text, team.name)

    db.add(team)
    db.commit()
    db.refresh(team)


@router.post("/use_curse/")
async def use_curse(
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Team",
        )

    if team.curses < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No curses available",
        )

    team.curses -= 1

    text = "Team '{0}' used a curse".format(team.name)
    new_event(db, text, team.name)

    db.add(team)
    db.commit()
    db.refresh(team)


@router.post("/powerup/")
async def buy_powerup(
    powerup: BuyPowerUpPost,
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Team",
        )

    powerup_db = db.get(PowerUp, powerup.id)

    if powerup_db is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Power Up",
        )

    if team.money < powerup_db.cost:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient money",
        )

    game = db.get(Game, 1)
    if game is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to find game.",
        )

    team.money -= powerup_db.cost * game.multiplier

    text = "Team '{0}' used power up '{1}'".format(team.name, powerup_db.description)
    new_event(db, text, team.name)
    handle_powerup(db, powerup_db, team)

    if team:
        db.add(team)
        db.commit()
        db.refresh(team)


@router.get("/game/")
async def get_game(
    db: SessionDep,
):
    return db.get(Game, 1)


@router.get("/powerups/")
async def get_powerups(
    db: SessionDep,
):
    return db.exec(select(PowerUp)).all()


@router.post("/draw_challenge/")
async def draw_challenge(
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    if team.challenges < team.hand_size:
        team.challenges += 1

    db.add(team)
    db.commit()
    db.refresh(team)


@router.post("/discard_challenge/")
async def discard_card(
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    if team.hand_size == 4:
        team.hand_size = 3

    if team.challenges > 0:
        team.challenges -= 1

    db.add(team)
    db.commit()
    db.refresh(team)


@router.post("/enter_canton/")
async def post_enter_canton(
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
    canton: EnterCantonPost,
):
    db_canton = db.get(Canton, canton.id)

    if db_canton is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Canton ID"
        )

    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    text = "Team '{0}' entered '{1}'".format(team.name, db_canton.name)

    new_event(db, text, team.name)

    team.challenges += 1
    team.challenges = min(team.hand_size, team.challenges)
    db.add(team)
    db.commit()
    db.refresh(team)

    if db_canton.level == 3 and db_canton.team != current_user.team:
        other_team_id = 1 if team.id == 2 else 2
        other_team = db.get(Team, other_team_id)

        game = db.get(Game, 1)
        if game is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Unable to find game."
            )

        team.money -= TOLL_COST * game.multiplier
        team.money = max(0, team.money)

        db.add(team)
        db.commit()
        db.refresh(team)

        if other_team is None:
            return
        other_team.money += TOLL_COST

        db.add(team)
        db.commit()
        db.refresh(team)

        text = "Team '{0}' paid a toll to Team '{1}'".format(team.name, other_team.name)
        new_event(db, text, team.name)

    return {"draw_card": True}


@router.post("/event/")
async def send_event(
    event: EventPost,
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    text = "({0}) {1}: {2}".format(team.name, current_user.firstname, event.text)

    new_event(db, text, team.name)


@router.post("/destroy_canton/")
async def post_destroy_canton(
    db: SessionDep,
    current_user: Annotated[User, Depends(auth.get_current_user)],
    canton: DestroyCantonPost,
):
    db_canton = db.get(Canton, canton.id)

    if db_canton is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Canton ID"
        )

    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    if db_canton.team:
        team = db_canton.team
        team.score -= 1

        db.add(team)
        db.commit()
        db.refresh(team)

    db_canton.level = 0
    db_canton.team = None
    db_canton.team_id = None
    db_canton.destroyed = True

    text = "Team '{0}' destroyed {1}".format(team.name, db_canton.name)
    new_event(db, text, team.name)

    db.add(db_canton)
    db.commit()
    db.refresh(db_canton)
