from datetime import datetime

from ..database.database import SessionDep
from ..database.models import Event, Team

PASSIVE_INCOME = 25


def new_event(db: SessionDep, text: str, source: str):
    event = Event(text=text, source=source, time=datetime.now())

    db.add(event)
    db.commit()
    db.refresh(event)



def calculate_passive_income(team: Team):
    sum = 0
    for canton in team.cantons:
        if canton.level >= 2:
            sum += PASSIVE_INCOME
    return sum


def calculate_score(team: Team):
    return len(team.cantons)
