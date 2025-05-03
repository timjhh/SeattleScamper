from datetime import datetime
from typing import Annotated, Sequence
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select

from .helpers import (
    #calculate_score,
    new_event,
)

from ..database.database import SessionDep
from ..database.models import (
    TeamPublic,
    Game,

    Challenge,
    ChallengePost,

    Event,
    EventPost,
    Team,

)
from ..auth import auth

TOLL_COST = 50

router = APIRouter()



@router.get("/team/")
async def read_team(
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    return current_user.team


@router.get("/team/challenges/")
async def read_team_cantons(
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    if current_user.team:
        return current_user.team.cantons
    return None

@router.get("/score/")
async def read_teams(db: SessionDep):
    return db.exec(select(Team)).all()


@router.get("/teams/", response_model=Sequence[TeamPublic])
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
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    return "hi"
    # challenge_db = db.get(Challenge, challenge.id)

    # if challenge_db is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Invalid Challenge ID",
    #     )

    # team = current_user.team

    # if team is None or team.id is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="User not in team",
    #     )

    # canton = db.get(Canton, challenge.canton)

    # if canton is None:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Invalid Canton ID",
    #     )

    # if not canton.destroyed:
    #     team.money += challenge_db.money

    #     if challenge_db.levels > 0:
    #         other_team_id = 1 if team.id == 2 else 2
    #         other_team = db.get(Team, other_team_id)

    #         if canton.team == team:
    #             canton.level += challenge_db.levels
    #         elif canton.team is None:
    #             canton.level += challenge_db.levels
    #             canton.team = team
    #         else:
    #             if canton.level == challenge_db.levels:
    #                 canton.team = None
    #             elif canton.level < challenge_db.levels:
    #                 canton.team = team
    #             canton.level = abs(canton.level - challenge_db.levels)

    #         canton.level = min(canton.level, 3)

    #         if canton.team:
    #             canton.team_id = canton.team.id
    #         else:
    #             canton.team_id = None

    #         team.income = calculate_passive_income(team)
    #         team.score = calculate_score(team)

    #         if other_team:
    #             other_team.income = calculate_passive_income(other_team)
    #             other_team.score = calculate_score(other_team)
    #             db.add(other_team)
    #             db.commit()
    #             db.refresh(other_team)

    # if team.hand_size == 4:
    #     team.hand_size = 3

    # if team.challenges > 0:
    #     team.challenges -= 1

    # event = Event(
    #     text="Team '{0}' completed the challenge '{1}'".format(
    #         team.name, challenge_db.name
    #     ),
    #     source=team.name,
    #     time=datetime.now(),
    # )

    # team_copy = team.model_copy()
    # canton_copy = canton.model_copy()
    # db.add(team)
    # db.commit()
    # db.refresh(team)

    # db.add(canton)
    # db.commit()
    # db.refresh(canton)

    # db.add(event)
    # db.commit()
    # db.refresh(event)

    # return {"team": team_copy, "canton": canton_copy}

@router.get("/game/")
async def get_game(
    db: SessionDep,
):
    return db.get(Game, 1)


@router.post("/event/")
async def send_event(
    event: EventPost,
    db: SessionDep,
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    team = current_user.team

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )

    text = "({0}) {1}: {2}".format(team.name, current_user.firstname, event.text)

    new_event(db, text, team.name)