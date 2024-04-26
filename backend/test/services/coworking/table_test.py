"""Tests for Coworking Tables Service."""

from unittest.mock import create_autospec
import pytest

from backend.services.exceptions import (
    ResourceNotFoundException,
    UserPermissionException,
)
from backend.services.permission import PermissionService
from ....services.coworking import TableService
from ....models.coworking import TableDetails

# Imported fixtures provide dependencies injected for the tests as parameters.
from .fixtures import table_svc

# Import the setup_teardown fixture explicitly to load entities in database
from ..role_data import fake_data_fixture as fake_role_data_fixture
from ..user_data import fake_data_fixture as fake_user_data_fixture
from ..room_data import fake_data_fixture as insert_room_fake_data
from .table_data import fake_data_fixture as insert_table_fake_data

# Import the fake model data in a namespace for test assertions
from . import table_data
from .. import user_data

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


def test_list(table_svc: TableService):
    """Tests retreiving all tables."""
    tables = table_svc.all()
    assert len(tables) == len(table_data.tables)
    assert isinstance(tables[0], TableDetails)


def test_get_by_id(table_svc: TableService):
    """Tests retreiving table by ID."""
    table = table_svc.get_by_id(table_data.demo_table_00.id)

    assert isinstance(table, TableDetails)
    assert table.id == table_data.demo_table_00.id


def test_get_by_room_id(table_svc: TableService):
    """Tests retreiving table by Room ID."""
    tables = table_svc.get_by_room_id(table_data.demo_table_00.room.id)
    assert isinstance(tables[0], TableDetails)
    assert tables[0].room.id == table_data.demo_table_00.room.id
    assert len(tables) == len(table_data.tables)

def test_get_by_room_id_not_found(table_svc: TableService):
    """Tests retreiving table by Room ID that does not exist."""
    with pytest.raises(ResourceNotFoundException):
        tables = table_svc.get_by_room_id("SN1000000")
        pytest.fail()

def test_get_by_id_not_found(table_svc: TableService):
    """Tests retreiving table by ID that doesn't exist."""
    with pytest.raises(ResourceNotFoundException):
        table = table_svc.get_by_id("500")
        pytest.fail()  # Fail test if no error was thrown above


def test_create_as_root(table_svc: TableService):
    """Tests that root user can create tables."""

    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    table = table_svc.create(user_data.root, table_data.new_table)

    permission_svc.enforce.assert_called_with(user_data.root, "table.create", "table")

    assert isinstance(table, TableDetails)
    assert table.id == len(
        table_data.tables
    )  # new_table id is 100, tests if the id is autoincrementing correctly

def test_create_as_root_room_not_found(table_svc: TableService):
    """Tests that root user cannot create tables with invalid room."""

    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc
    with pytest.raises(ResourceNotFoundException):
        table = table_svc.create(user_data.root, table_data.new_table_bad_room)
        pytest.fail()

def test_create_as_user(table_svc: TableService):
    """Tests that any user is not able to create tables."""
    with pytest.raises(UserPermissionException):
        table = table_svc.create(user_data.user, table_data.new_table)
        pytest.fail()


def test_update_as_root(table_svc: TableService):
    """Tests that root user can update tables."""
    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    table = table_svc.update(user_data.root, table_data.edited_demo_table_00)

    permission_svc.enforce.assert_called_with(
        user_data.root, "table.update", f"table/{table.id}"
    )

    assert isinstance(table, TableDetails)
    assert table.id == table_data.edited_demo_table_00.id
    assert table.x == table_data.edited_demo_table_00.x
    assert table.y == table_data.edited_demo_table_00.y
    assert table.width == table_data.edited_demo_table_00.width
    assert table.height == table_data.edited_demo_table_00.height
    assert table.radius == table_data.edited_demo_table_00.radius
    assert table.is_circle == table_data.edited_demo_table_00.is_circle
    assert table.rotation == table_data.edited_demo_table_00.rotation


def test_update_as_root_not_found(table_svc: TableService):
    """Tests updating a room that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        table = table_svc.update(user_data.root, table_data.new_table)
        pytest.fail()

def test_update_as_root_room_not_found(table_svc: TableService):
    """Tests updating a table with a room that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        table = table_svc.update(user_data.root, table_data.new_table_bad_room)
        pytest.fail()


def test_update_as_user(table_svc: TableService):
    """Tests that any user cannot update tables."""

    with pytest.raises(UserPermissionException):
        table = table_svc.create(user_data.user, table_data.edited_demo_table_00)
        pytest.fail()


def test_delete_as_root(table_svc: TableService):
    """Tests that root user can delete tables."""
    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    table_svc.delete(user_data.root, table_data.demo_table_01.id)

    permission_svc.enforce.assert_called_with(
        user_data.root, "table.delete", f"table/{table_data.demo_table_01.id}"
    )

    tables = table_svc.all()
    assert len(tables) == len(table_data.tables) - 1


def test_delete_as_root_not_found(table_svc: TableService):
    """Tests deleting a room that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    table_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        table = table_svc.delete(user_data.root, table_data.new_table.id)
        pytest.fail()


def test_delete_as_user(table_svc: TableService):
    """Tests that any user cannot delete tables."""
    with pytest.raises(UserPermissionException):
        table = table_svc.delete(user_data.user, table_data.demo_table_01.id)
        pytest.fail()

