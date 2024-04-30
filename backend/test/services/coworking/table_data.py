"""Table data for tests."""

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session

from backend.models.room import Room
from ....entities.coworking import TableEntity
from ....models.coworking.table_details import NewTableDetails, TableDetails
from ....models.coworking.table_details import NewTableDetails, TableDetails
from ....models.coworking.table import Table
from typing import Sequence

from ..reset_table_id_seq import reset_table_id_seq
from ..room_data import the_xl, pair_a
from ..room_data import the_xl, pair_a

__authors__ = ["Wei Jiang, Benjamin Zhang"]
__copyright__ = "Copyright 2024"
__license__ = "MIT"

demo_table_00 = NewTableDetails(
    id=0,
    x=8,
    y=8,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_01 = NewTableDetails(
    id=1,
    x=87,
    y=8,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_10 = NewTableDetails(
    # Circle Table
    id=2,
    x=190,
    y=200,
    width=40.0,
    height=40.0,
    rotation=0,
    radius=20,
    is_circle=True,
    room=the_xl.to_room(),
)

demo_table_11 = NewTableDetails(
    # Circle Table
    id=3,
    x=250,
    y=255,
    width=40.0,
    height=40.0,
    rotation=0,
    radius=20,
    is_circle=True,
    room=the_xl.to_room(),
)

demo_table_100 = NewTableDetails(
    # Circle Table
    id=4,
    x=283,
    y=168,
    width=40.0,
    height=40.0,
    rotation=0,
    radius=20,
    is_circle=True,
    room=the_xl.to_room(),
)

demo_table_101 = NewTableDetails(
    id=5,
    x=8,
    y=143,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_110 = NewTableDetails(
    id=6,
    x=87,
    y=143,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_111 = NewTableDetails(
    id=7,
    x=8,
    y=170,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_1000 = NewTableDetails(
    id=8,
    x=87,
    y=170,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_1001 = NewTableDetails(
    id=9,
    x=8,
    y=282,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_1010 = NewTableDetails(
    id=10,
    x=87,
    y=282,
    width=75.0,
    height=20.0,
    rotation=0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_1011 = NewTableDetails(
    id=11,
    x=208,
    y=40,
    width=40,
    height=40,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

demo_table_1100 = NewTableDetails(
    id=12,
    x=300,
    y=40,
    width=44,
    height=67,
    rotation=0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room(),
)

new_table = NewTableDetails(
    id=100,
    x=0.0,
    y=0.0,
    width=0.0,
    height=0.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)

new_table_bad_room = NewTableDetails(
    id=100,
    x=0.0,
    y=0.0,
    width=0.0,
    height=0.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=Room(id="SN10000", nickname=""),
)

edited_demo_table_00 = NewTableDetails(
    id=0,
    x=0.0,
    y=0.0,
    width=0.0,
    height=0.0,
    rotation=0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room(),
)


demo_tables = [
    demo_table_00,
    demo_table_10,
    demo_table_01,
    demo_table_11,
    demo_table_100,
    demo_table_101,
    demo_table_110,
    demo_table_111,
    demo_table_1000,
    demo_table_1001,
    demo_table_1010,
    demo_table_1011,
    demo_table_1100,
]
tables: Sequence[Table] = demo_tables  # + common_area_tables + conference_table_tables


def insert_fake_data(session: Session):
    for table in tables:
        entity = TableEntity.from_new_model(table)
        entity = TableEntity.from_new_model(table)
        session.add(entity)
    reset_table_id_seq(session, TableEntity, TableEntity.id, len(tables))
    reset_table_id_seq(session, TableEntity, TableEntity.id, len(tables))


@pytest.fixture(autouse=True)
def fake_data_fixture(session: Session):
    insert_fake_data(session)
    session.commit()


def delete_all(session: Session):
    session.execute(delete(TableEntity))
