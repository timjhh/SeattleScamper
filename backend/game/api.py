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
router = APIRouter()

@router.get("/team/")
async def read_team(
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    return current_user


@router.get("/team/challenges/")
async def read_team_cantons(
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    if current_user:
        return current_user
    return None

@router.get("/score/")
async def read_teams(db: SessionDep):
    return db.exec(select(Team)).all()


@router.get("/teams/", response_model=Sequence[TeamPublic])
async def read_users(db: SessionDep):
    return db.exec(select(Team)).all()


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
    challenge_db = db.get(Challenge, challenge.id)

    if challenge_db is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Challenge ID",
        )

    team = current_user

    if team is None or team.id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not in team",
        )

    # canton = db.get(Canton, challenge.canton)
    challenge = db.get(Challenge, challenge.id)

    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Canton ID",
        )
    
    if challenge in team.challenges:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Challenge already submitted",
        )


    team_copy = team.model_copy()
    challenge_copy = challenge.model_copy()
    team.challenges.append(challenge)
    db.add(team)
    db.commit()
    db.refresh(team)

    return {"team": team_copy, "challenge": challenge_copy}

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
    team = current_user

    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid team"
        )
    text = "({0}) {1}".format(team.team_name, event.text)
    new_event(db, text, team.team_name)