import datetime
from sqlmodel import Relationship, SQLModel, Field


class GameBase(SQLModel):
    active: bool
    day: int
    start: datetime.datetime
    end: datetime.datetime
    day_start: datetime.time
    day_end: datetime.time
    passive_income_enabled: bool
    multiplier: int


class Game(GameBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class GameCreate(GameBase):
    pass



class TeamBase(SQLModel):
    team_name: str = Field(index=True)
    score: int = Field(default=0)
    username: str = Field(index=True)
    hashed_password: str | None = Field(default=None)
    

class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    challenges: list["Challenge"] = Relationship(back_populates="team") # pyright:ignore


class TeamPublic(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

class TeamUpdate(TeamBase):
    team_name: str | None  # pyright:ignore
    score: int | None  # pyright:ignore
    username: str
    password: str | None = None

class TeamCreate(TeamBase):
    password: str

class ChallengeBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)

class Challenge(ChallengeBase, table=True):
    name: str
    description: str
    points: int = Field(default=1)
    team: Team | None = Relationship(back_populates="challenges")
    team_id: int | None = Field(default=None, foreign_key="team.id")
    neighborhood: str
    found: bool = Field(default=False)
    completed: bool = Field(default=False)


class ChallengePost(ChallengeBase):
    challenge: int = Field(foreign_key="challenge.id")
    # Location

class EventBase(SQLModel):
    source: str | None
    text: str
    time: datetime.datetime
    # location: Location | None


class Event(EventBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class EventPost(SQLModel):
    text: str



