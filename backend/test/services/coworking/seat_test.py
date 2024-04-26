"""Tests for Coworking Seats Service."""

from unittest.mock import create_autospec
import pytest

from backend.services.exceptions import (
    ResourceNotFoundException,
    UserPermissionException,
)
from backend.services.permission import PermissionService
from ....services.coworking import SeatService
from ....models.coworking import SeatDetails

# Imported fixtures provide dependencies injected for the tests as parameters.
from .fixtures import seat_svc

# Import the setup_teardown fixture explicitly to load entities in database
from ..role_data import fake_data_fixture as fake_role_data_fixture
from ..user_data import fake_data_fixture as fake_user_data_fixture
from ..room_data import fake_data_fixture as insert_room_fake_data
from .seat_data import fake_data_fixture as insert_seat_fake_data

# Import the fake model data in a namespace for test assertions
from . import seat_data
from .. import user_data

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


def test_list(seat_svc: SeatService):
    """Tests retreiving all seats."""
    seats = seat_svc.all()
    assert len(seats) == len(seat_data.seats)
    assert isinstance(seats[0], SeatDetails)


def test_get_by_id(seat_svc: SeatService):
    """Tests retreiving seat by ID."""
    seat = seat_svc.get_by_id(seat_data.monitor_seat_00.id)

    assert isinstance(seat, SeatDetails)
    assert seat.id == seat_data.monitor_seat_00.id


def test_get_by_room_id(seat_svc: SeatService):
    """Tests retreiving seat by Room ID."""
    seats = seat_svc.get_by_room_id(seat_data.monitor_seat_00.room.id)
    assert isinstance(seats[0], SeatDetails)
    assert seats[0].room.id == seat_data.monitor_seat_00.room.id
    assert len(seats) == len(seat_data.seats)
    
def test_get_by_room_id_not_found(seat_svc: SeatService):
    """Tests retreiving seat by Room ID that does not exist."""
    with pytest.raises(ResourceNotFoundException):
        seats = seat_svc.get_by_room_id("SN1000000")
        pytest.fail()


def test_get_by_id_not_found(seat_svc: SeatService):
    """Tests retreiving seat by ID that doesn't exist."""
    with pytest.raises(ResourceNotFoundException):
        seat = seat_svc.get_by_id("500")
        pytest.fail()  # Fail test if no error was thrown above


def test_create_as_root(seat_svc: SeatService):
    """Tests that root user can create seats."""

    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    seat = seat_svc.create(user_data.root, seat_data.new_seat)

    permission_svc.enforce.assert_called_with(user_data.root, "seat.create", "seat")

    assert isinstance(seat, SeatDetails)
    assert seat.id == len(
        seat_data.seats
    )  # new_seat id is 100, tests if the id is autoincrementing correctly

def test_create_as_root_room_not_found(seat_svc: SeatService):
    """Tests that root user cannot create seats with invalid room."""

    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc
    with pytest.raises(ResourceNotFoundException):
        seat = seat_svc.create(user_data.root, seat_data.new_seat_bad_room)
        pytest.fail()


def test_create_as_user(seat_svc: SeatService):
    """Tests that any user is not able to create seats."""
    with pytest.raises(UserPermissionException):
        seat = seat_svc.create(user_data.user, seat_data.new_seat)
        pytest.fail()


def test_update_as_root(seat_svc: SeatService):
    """Tests that root user can update seats."""
    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    seat = seat_svc.update(user_data.root, seat_data.edited_monitor_seat_00)

    permission_svc.enforce.assert_called_with(
        user_data.root, "seat.update", f"seat/{seat.id}"
    )

    assert isinstance(seat, SeatDetails)
    assert seat.id == seat_data.edited_monitor_seat_00.id
    assert seat.title == seat_data.edited_monitor_seat_00.title


def test_update_as_root_not_found(seat_svc: SeatService):
    """Tests updating a seat that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        seat = seat_svc.update(user_data.root, seat_data.new_seat)
        pytest.fail()

def test_update_as_root_room_not_found(seat_svc: SeatService):
    """Tests updating a seat with a room that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        seat = seat_svc.update(user_data.root, seat_data.new_seat_bad_room)
        pytest.fail()


def test_update_as_user(seat_svc: SeatService):
    """Tests that any user cannot update seats."""

    with pytest.raises(UserPermissionException):
        seat = seat_svc.create(user_data.user, seat_data.edited_monitor_seat_00)
        pytest.fail()


def test_delete_as_root(seat_svc: SeatService):
    """Tests that root user can delete seats."""
    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    seat_svc.delete(user_data.root, seat_data.monitor_seat_01.id)

    permission_svc.enforce.assert_called_with(
        user_data.root, "seat.delete", f"seat/{seat_data.monitor_seat_01.id}"
    )

    seats = seat_svc.all()
    assert len(seats) == len(seat_data.seats) - 1


def test_delete_as_root_not_found(seat_svc: SeatService):
    """Tests deleting a room that doesn't exist."""
    permission_svc = create_autospec(PermissionService)
    seat_svc._permission_svc = permission_svc

    with pytest.raises(ResourceNotFoundException):
        seat = seat_svc.delete(user_data.root, seat_data.new_seat.id)
        pytest.fail()


def test_delete_as_user(seat_svc: SeatService):
    """Tests that any user cannot delete seats."""
    with pytest.raises(UserPermissionException):
        seat = seat_svc.delete(user_data.user, seat_data.monitor_seat_01.id)
        pytest.fail()
