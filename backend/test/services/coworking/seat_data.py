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
    title="Standing Monitor 1",
    shorthand="M00",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    x=20,
    y=32,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_01 = NewSeatDetails(
    id=1,
    title="Standing Monitor 2",
    shorthand="M01",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    width=20,
    height=20,
    x=50,
    y=32,
    room=the_xl.to_room(),
)

monitor_seat_10 = NewSeatDetails(
    id=2,
    title="Sitting Monitor 1",
    shorthand="M10",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=180,
    width=20,
    height=20,
    x=20,
    y=119,
    room=the_xl.to_room(),
)

monitor_seat_11 = NewSeatDetails(
    id=3,
    title="Sitting Monitor 2",
    shorthand="M11",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=180,
    width=20,
    height=20,
    x=50,
    y=119,
    room=the_xl.to_room(),
)


monitor_seat_100 = NewSeatDetails(
    id=4,
    title="Standing Monitor 3",
    shorthand="M100",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    width=20,
    height=20,
    x=98,
    y=32,
    room=the_xl.to_room(),
)

monitor_seat_101: Seat = NewSeatDetails(
    id=5,
    title="Standing Monitor 4",
    shorthand="M101",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    width=20,
    height=20,
    x=127,
    y=32,
    room=the_xl.to_room(),
)

monitor_seat_110 = NewSeatDetails(
    id=6,
    title="Sitting Monitor 3",
    shorthand="M110",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,
    x=98,
    y=119,
    room=the_xl.to_room(),
)

monitor_seat_111 = NewSeatDetails(
    id=7,
    title="Sitting Monitor 4",
    shorthand="M111",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    width=20,
    height=20,
    x=127,
    y=119,
    room=the_xl.to_room(),
)

monitor_seat_1000 = NewSeatDetails(
    id=8,
    title="Sitting Monitor 5",
    shorthand="M1000",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    x=20,
    y=195,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1001 = NewSeatDetails(
    id=9,
    title="Sitting Monitor 6",
    shorthand="M1001",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    x=50,
    y=195,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1010 = NewSeatDetails(
    id=10,
    title="Sitting Monitor 7",
    shorthand="M1010",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    x=98,
    y=195,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1011 = NewSeatDetails(
    id=11,
    title="Sitting Monitor 8",
    shorthand="M1011",
    reservable=True,
    has_monitor=True,
    sit_stand=True,
    rotation=180,
    x=127,
    y=195,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1100 = NewSeatDetails(
    id=12,
    title="Standing Monitor 5",
    shorthand="M1100",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    x=20,
    y=259,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1101 = NewSeatDetails(
    id=13,
    title="Standing Monitor 6",
    shorthand="M1101",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    x=50,
    y=259,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1110 = NewSeatDetails(
    id=14,
    title="Standing Monitor 7",
    shorthand="M1110",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    x=98,
    y=259,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

monitor_seat_1111 = NewSeatDetails(
    id=15,
    title="Standing Monitor 8",
    shorthand="M1111",
    reservable=True,
    has_monitor=True,
    sit_stand=False,
    rotation=0,
    x=127,
    y=259,
    width=20,
    height=20,
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
    monitor_seat_1000,
    monitor_seat_1001,
    monitor_seat_1010,
    monitor_seat_1011,
    monitor_seat_1100,
    monitor_seat_1101,
    monitor_seat_1110,
    monitor_seat_1111,
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
    room=Room(id="SN10000", nickname=""),
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

# Common Area Seats

common_area_00 = NewSeatDetails(
    id=16,
    title="Common Area 1",
    shorthand="C00",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    x=218,
    y=16,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_01 = NewSeatDetails(
    id=17,
    title="Common Area 2",
    shorthand="C01",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=90,
    x=252,
    y=50,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_02 = NewSeatDetails(
    id=18,
    title="Common Area 3",
    shorthand="C02",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=180,
    x=218,
    y=84,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_03 = NewSeatDetails(
    id=19,
    title="Common Area 4",
    shorthand="C03",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=184,
    y=50,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_04 = NewSeatDetails(
    id=20,
    title="Common Area 5",
    shorthand="C04",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    x=312,
    y=16,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_05 = NewSeatDetails(
    id=21,
    title="Common Area 6",
    shorthand="C05",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=276,
    y=50,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_06 = NewSeatDetails(
    id=22,
    title="Common Area 7",
    shorthand="C06",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=276,
    y=74,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_07 = NewSeatDetails(
    id=23,
    title="Common Area 8",
    shorthand="C07",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=180,
    x=312,
    y=110,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_08 = NewSeatDetails(
    id=24,
    title="Common Area 9",
    shorthand="C08",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    x=293,
    y=143,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_09 = NewSeatDetails(
    id=25,
    title="Common Area 10",
    shorthand="C09",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=90,
    x=326,
    y=178,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_10 = NewSeatDetails(
    id=26,
    title="Common Area 11",
    shorthand="C10",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=180,
    x=293,
    y=212,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_11 = NewSeatDetails(
    id=27,
    title="Common Area 12",
    shorthand="C11",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=260,
    y=178,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_12 = NewSeatDetails(
    id=28,
    title="Common Area 13",
    shorthand="C12",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    x=260,
    y=232,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_13 = NewSeatDetails(
    id=29,
    title="Common Area 14",
    shorthand="C13",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=90,
    x=294,
    y=265,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_14 = NewSeatDetails(
    id=30,
    title="Common Area 15",
    shorthand="C14",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=226,
    y=265,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_15 = NewSeatDetails(
    id=31,
    title="Common Area 16",
    shorthand="C15",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=0,
    x=200,
    y=176,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_16 = NewSeatDetails(
    id=32,
    title="Common Area 17",
    shorthand="C16",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=90,
    x=234,
    y=210,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_17 = NewSeatDetails(
    id=33,
    title="Common Area 18",
    shorthand="C17",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=180,
    x=200,
    y=244,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_18 = NewSeatDetails(
    id=34,
    title="Common Area 19",
    shorthand="C18",
    reservable=True,
    has_monitor=False,
    sit_stand=False,
    rotation=270,
    x=166,
    y=210,
    width=20,
    height=20,
    room=the_xl.to_room(),
)

common_area_seats = [
    common_area_00,
    common_area_01,
    common_area_02,
    common_area_03,
    common_area_04,
    common_area_05,
    common_area_06,
    common_area_07,
    common_area_08,
    common_area_09,
    common_area_10,
    common_area_11,
    common_area_12,
    common_area_13,
    common_area_14,
    common_area_15,
    common_area_16,
    common_area_17,
    common_area_18,
]


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

seats: Sequence[Seat] = monitor_seats + common_area_seats  # + conference_table_seats

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
