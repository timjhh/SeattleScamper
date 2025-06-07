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
    TeamChallengeLink,
    Event,
    EventPost,
    Team,

)
from ..auth import auth
router = APIRouter()

POINTS_FOR_FIND = 3


@router.get("/team/")
async def read_team(
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    return current_user


@router.get("/team/challenges/")
async def read_team_challenges(
    db: SessionDep,
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    
    if not current_user or not current_user.id:
        # This should ideally be caught by auth.get_current_user raising an error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not authenticate team.",
        )

    if current_user:
        statement = select(TeamChallengeLink).where(TeamChallengeLink.team_id == current_user.id)

        team_challenges = db.exec(statement).all()
        if not team_challenges:
            return []
        return team_challenges

    return []

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

@router.post("/add/team/")
async def read_team(
    team_name: str,
    db: SessionDep,
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    if current_user.username != "timjhh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unauthenticated",
        )
    
    query = select(Team).where(Team.team_name == team_name)
    team = db.exec(query).first()
    if team is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team already exists",
        )

    password=auth.get_password_hash(team_name)
    new_team = Team(
        team_name=team_name,
        username=team_name,
        score=0,
        hashed_password=password,
        challenges=[]
    )
    db.add(new_team)
    db.commit()
    return new_team

@router.post("/remove/team/")
async def read_team(
    team_id: int,
    db: SessionDep,
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    if current_user.username != "timjhh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unauthenticated",
        )
    
    team = db.get(Team, team_id)
    if team is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team not found",
        )
    db.delete(team)
    db.commit()
    return team

@router.post("/challenge/")
async def post_challenge(
    challenge: ChallengePost,
    db: SessionDep,
    current_user: Annotated[Team, Depends(auth.get_current_user)],
):
    team = current_user

    if team is None or team.id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not in team",
        )
    
    challenge = db.get(Challenge, challenge.id)
    if challenge is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Challenge ID",
        )

    query = select(TeamChallengeLink).where(TeamChallengeLink.team_id == team.id, TeamChallengeLink.challenge_id == challenge.id)
    team_challenge_link = db.exec(query).first()

    if team_challenge_link:
        # Link exists, check its state
        if team_challenge_link.completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Challenge already completed by this team.",
            )
        
        # If it was found but not completed, now mark as completed
        if team_challenge_link.found and not team_challenge_link.completed:
            team_challenge_link.completed = True
            team.score += challenge.points # Add challenge's specific points
        # else if found is False (should not happen if link exists from previous logic, but as a safeguard)
        elif not team_challenge_link.found:
            team_challenge_link.found = True
            team_challenge_link.completed = False
            team.score += POINTS_FOR_FIND

        db.add(team_challenge_link)
        db.add(team)
        db.commit()
        db.refresh(team_challenge_link)
        db.refresh(team)
        return team_challenge_link


    else:
        # No link exists, this is the first interaction ("finding" it)
        new_link = TeamChallengeLink(
            team_id=team.id,
            challenge_id=challenge.id,
            found=True,
            completed=False,
        )
        team.score += POINTS_FOR_FIND

        db.add(new_link)
        db.add(team) # Add team to persist score change
        db.commit()
        db.refresh(new_link)
        db.refresh(team)
        return new_link

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