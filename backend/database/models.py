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
    username: str = Field(index=True)
    score: int = Field(default=0)
    challenges: int = Field(default=0)


class Team(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str | None = Field(default=None)
    #users: list["User"] = Relationship(back_populates="team")
    #cantons: list["Canton"] = Relationship(back_populates="team")

class TeamPublic(TeamBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    team_name: str = Field(index=True)
    #users: list["User"] = Relationship(back_populates="team")
    #cantons: list["Canton"] = Relationship(back_populates="team")

class TeamUpdate(TeamBase):
    team_name: str | None  # pyright:ignore
    score: int | None  # pyright:ignore
    challenges: int | None  # pyright:ignore
    username: str
    password: str | None = None

class TeamCreate(TeamBase):
    password: str


class EventBase(SQLModel):
    source: str | None
    text: str
    time: datetime.datetime
    # location: Location | None


class Event(EventBase, table=True):
    id: int | None = Field(default=None, primary_key=True)


class EventPost(SQLModel):
    text: str


class ChallengeBase(SQLModel):
    id: int | None = Field(default=None, primary_key=True)


class Challenge(ChallengeBase, table=True):
    name: str
    description: str
    points: int = Field(default=1)
    neighborhood: str

class ChallengePost(ChallengeBase):
    canton: int = Field(foreign_key="canton.id")
    # Location
