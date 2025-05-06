from typing import Annotated
from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine, select
import sqlite3
import csv

from ..auth.crypto import get_password_hash

from ..config import settings
from .models import Challenge, Team


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    load_default_data()
    load_admin_user()
    load_challenges(engine)


def load_default_data():
    with open("scripts/load-data.sql", "r") as sql_file:
        sql_script = sql_file.read()

        db = sqlite3.connect("database/local/main.db")
        cursor = db.cursor()
        cursor.executescript(sql_script)
        db.commit()
        db.close()

def load_admin_user():
    hashed_password = get_password_hash(settings.admin_pass)
    admin_user = Team(
        username=settings.admin_username,
        team_name="joe",
        score=0,
        challenges=[],
        hashed_password=hashed_password,
    )
    db = next(get_session())

    db.add(admin_user)
    db.commit()
    db.refresh(admin_user)


def load_challenges(engine):
    challenges = []
    with open("database/challenges.tsv", newline="", encoding="utf8") as csvfile:
        reader = csv.reader(csvfile, delimiter="\t", quotechar='"')
        next(reader)  # Discard the header line.
        for row in reader:
            print(row)
            #points = 0 if row[2] == "" else int(row[2])
            challenges.append(
                Challenge(name=row[0], description=row[1], points=row[2], neighborhood=row[3], url=row[4])
            )

    with Session(engine) as session:
        check_statement = select(Challenge)
        if len(session.exec(check_statement).all()) == 0:
            for c in challenges:
                session.add(c)
                session.commit()

def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

sqlite_file_name = settings.dbname
sqlite_url = f"sqlite:///database/local/{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)
