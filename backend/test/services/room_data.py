"""Room data for tests."""

import pytest
from sqlalchemy.orm import Session

from backend.models.coworking.seat import Seat
from ...entities import RoomEntity
from ...models import RoomDetails
from .reset_table_id_seq import reset_table_id_seq

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


the_xl = RoomDetails(
    id="SN156",
    building="Sitterson",
    room="156",
    nickname="The XL",
    capacity=40,
    reservable=False,
    seats=[],
    tables=[],
    x=51,
    y=72,
    width=350,
    height=300,
)

group_a = RoomDetails(
    id="SN135",
    building="Sitterson",
    room="135",
    nickname="Group A",
    capacity=4,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=50,
    width=100,
    height=75,
)

group_b = RoomDetails(
    id="SN137",
    building="Sitterson",
    room="137",
    nickname="Group B",
    capacity=4,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=125,
    width=100,
    height=75,
)

group_c = RoomDetails(
    id="SN141",
    building="Sitterson",
    room="141",
    nickname="Group C",
    capacity=6,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=235,
    width=100,
    height=75,
)

group_d = RoomDetails(
    id="SN147",
    building="Sitterson",
    room="147",
    nickname="Group D",
    capacity=5,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=345,
    width=100,
    height=75,
)

group_e = RoomDetails(
    id="SN146",
    building="Sitterson",
    room="146",
    nickname="Group E",
    capacity=5,
    reservable=True,
    seats=[],
    tables=[],
    x=350,
    y=450,
    width=77,
    height=72,
)

pair_a = RoomDetails(
    id="SN139",
    building="Sitterson",
    room="139",
    nickname="Pair A",
    capacity=2,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=200,
    width=100,
    height=35,
)

pair_b = RoomDetails(
    id="SN144",
    building="Sitterson",
    room="144",
    nickname="Pair B",
    capacity=2,
    reservable=True,
    seats=[],
    tables=[],
    x=500,
    y=310,
    width=100,
    height=35,
)

new_room = RoomDetails(
    id="FB009",
    building="Fred Brooks",
    room="009",
    nickname="Large Room",
    capacity=100,
    reservable=False,
    seats=[],
    tables=[],
    x=0,
    y=0,
    width=0,
    height=0,
)

edited_xl = RoomDetails(
    id="SN156",
    building="Sitterson",
    room="156",
    nickname="The CSXL",
    capacity=100,
    reservable=False,
    seats=[],
    tables=[],
    x=0,
    y=0,
    width=0,
    height=0,
)

rooms = [the_xl, group_a, group_b, group_c, group_d, group_e, pair_a, pair_b]


def insert_fake_data(session: Session):
    for room in rooms:
        entity = RoomEntity.from_model(room)
        session.add(entity)

    # Don't need to reset room sequence because its ID is a string


@pytest.fixture(autouse=True)
def fake_data_fixture(session: Session):
    insert_fake_data(session)
    session.commit()
