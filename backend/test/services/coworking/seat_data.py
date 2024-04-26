"""Seat data for tests."""

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session

from backend.models.room import Room
from ....entities.coworking import SeatEntity
from ....models.coworking.seat_details import NewSeatDetails, SeatDetails
from ....models.coworking.seat_details import NewSeatDetails, SeatDetails
from ....models.coworking.seat import Seat
from typing import Sequence

from ..reset_table_id_seq import reset_table_id_seq
from ..room_data import the_xl, pair_a

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"

monitor_seat_00 = NewSeatDetails(
    id=0,
    title="Standing Monitor 00",
    shorthand="M00",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=0,
    x=10,
    y=10,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_01 = NewSeatDetails(
    id=1,
    title="Standing Monitor 01",
    shorthand="M01",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=0,
    width=20,
    height=20,
    x=30,
    y=10,
    room=the_xl.to_room(),
)

monitor_seat_10 = NewSeatDetails(
    id=2,
    title="Monitor 10",
    shorthand="M10",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,
    x=10,
    y=50,
    room=the_xl.to_room(),
)

monitor_seat_11 = NewSeatDetails(
    id=3,
    title="Monitor 11",
    shorthand="M11",
    reservable=False,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,
    x=30,
    y=50,
    room=the_xl.to_room(),
)


monitor_seat_100 = NewSeatDetails(
    id=4,
    title="Standing Monitor 100",
    shorthand="M100",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=0,
    width=20,
    height=20,    
    x=50,
    y=10,
    room=the_xl.to_room(),
)

monitor_seat_101: Seat = NewSeatDetails(
    id=5,
    title="Standing Monitor 101",
    shorthand="M101",
    reservable=False,
    has_monitor=True,
    sit_stand=True,
    rotation=0,
    width=20,
    height=20,
    x=70,
    y=10,
    room=the_xl.to_room(),
)

monitor_seat_110 = NewSeatDetails(
    id=6,
    title="Monitor 110",
    shorthand="M110",
    reservable=False,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,    
    x=50,
    y=50,
    room=the_xl.to_room(),
)

monitor_seat_111 = NewSeatDetails(
    id=7,
    title="Monitor 111",
    shorthand="M111",
    reservable=False,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,
    x=70,
    y=50,
    room=the_xl.to_room(),
)

monitor_seats = [
    monitor_seat_00,
    monitor_seat_01,
    monitor_seat_10,
    monitor_seat_11,
    monitor_seat_100,
    monitor_seat_101,
    monitor_seat_110,
    monitor_seat_111,
]

new_seat = NewSeatDetails(
    id=100,
    title="new seat",
    shorthand="new",
    reservable=False,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,    
    x=100,
    y=100,
    room=pair_a.to_room(),
)

new_seat_bad_room = NewSeatDetails(
    id=100,
    title="new seat",
    shorthand="new",
    reservable=False,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,    
    x=100,
    y=100,
    room= Room(
        id="SN10000",
        nickname=""
    ),
)

edited_monitor_seat_00 = SeatDetails(
    id=0,
    title="Edited Standing Monitor 00",
    shorthand="M00",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=0,
    width=20,
    height=20,
    x=0,
    y=0,
    room=the_xl.to_room(),
)

# common_area_00 = SeatDetails(
#     id=20,
#     title="Common Area 00",
#     shorthand="C00",
#     reservable=False,
#     has_monitor=False,
#     sit_stand=False,
#     x=5,
#     y=0,
#     room=the_xl.to_room()
# )
# common_area_01 = SeatDetails(
#     id=21,
#     title="Common Area 01",
#     shorthand="C01",
#     reservable=False,
#     has_monitor=False,
#     sit_stand=False,
#     x=5,
#     y=1,
#     room=the_xl.to_room()
# )
# common_area_seats = [common_area_00, common_area_01]

# conference_table_00 = SeatDetails(
#     id=40,
#     title="Conference Table 01",
#     shorthand="G01",
#     reservable=True,
#     has_monitor=False,
#     sit_stand=False,
#     x=20,
#     y=20,
#     room=the_xl.to_room()
# )
# conference_table_01 = SeatDetails(
#     id=41,
#     title="Conference Table 02",
#     shorthand="G02",
#     reservable=False,
#     has_monitor=False,
#     sit_stand=False,
#     x=20,
#     y=21,
#     room=the_xl.to_room(),
# )
# conference_table_seats = [conference_table_00, conference_table_01]

seats: Sequence[Seat] = monitor_seats  # + common_area_seats + conference_table_seats

reservable_seats = [seat for seat in seats if seat.reservable]

unreservable_seats = [seat for seat in seats if not seat.reservable]


def insert_fake_data(session: Session):
    for seat in seats:
        entity = SeatEntity.from_new_model(seat)
        entity = SeatEntity.from_new_model(seat)
        session.add(entity)
    reset_table_id_seq(session, SeatEntity, SeatEntity.id, len(seats))
    reset_table_id_seq(session, SeatEntity, SeatEntity.id, len(seats))


@pytest.fixture(autouse=True)
def fake_data_fixture(session: Session):
    insert_fake_data(session)
    session.commit()


def delete_all(session: Session):
    session.execute(delete(SeatEntity))
