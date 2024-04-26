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
    id = 0,
    x = 80.0,
    y = 80.0,
    width = 10.0,
    height = 50.0,
    rotation = 45,
    radius=0,
    is_circle=False,
    room=the_xl.to_room()
)

demo_table_01 = NewTableDetails(
    # Square Table
    id = 1,
    x = 100.0,
    y = 100.0,
    width = 50.0,
    height = 50.0,
    rotation = 0,
    radius=None,
    is_circle=False,
    room=the_xl.to_room()
)

demo_table_10 = NewTableDetails(
    # Circle Table
    id = 2,
    x = 250.0,
    y = 250.0,
    width = 0.0,
    height = 0.0,
    rotation = 0,
    radius=10,
    is_circle=True,
    room=the_xl.to_room()
)

demo_table_11 = NewTableDetails(
    # Rectangle Table
    id = 3,
    x = 125.0,
    y = 175.0,
    width = 20.0,
    height = 50.0,
    rotation = 0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room()
)

new_table = NewTableDetails(
    id = 100,
    x = 0.0,
    y = 0.0,
    width = 0.0,
    height = 0.0,
    rotation = 0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room()
)

new_table_bad_room = NewTableDetails(
    id = 100,
    x = 0.0,
    y = 0.0,
    width = 0.0,
    height = 0.0,
    rotation = 0,
    radius=0,
    is_circle=False,
    room= Room(
        id="SN10000",
        nickname=""
    ),
)

edited_demo_table_00 = NewTableDetails(
    id = 0,
    x = 0.0,
    y = 0.0,
    width = 0.0,
    height = 0.0,
    rotation = 0,
    radius=0,
    is_circle=False,
    room=the_xl.to_room()
)


demo_tables = [demo_table_00, demo_table_10, demo_table_01, demo_table_11]
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
