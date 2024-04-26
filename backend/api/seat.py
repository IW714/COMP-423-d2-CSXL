"""Seat operations open to root user"""

from fastapi import APIRouter, Depends

from backend.models.coworking.seat_details import NewSeatDetails

from ..models.coworking import SeatDetails
from ..services.coworking import SeatService
from ..api.authentication import registered_user
from ..models.user import User

__authors__ = ["Benjamin Zhang", "Wei Jiang"]
__copyright__ = "Copyright 2024"
__license__ = "MIT"

api = APIRouter(prefix="/api/seat")
openapi_tags = {
    "name": "Seats",
    "description": "Create, update, delete, and retrieve seats.",
}


@api.get("", response_model=list[SeatDetails], tags=["Seats"])
def get_seats(
    seat_service: SeatService = Depends(),
) -> list[SeatDetails]:
    """
    Get all Seats

    Parameters:
        Seat_service: a valid SeatService

    Returns:
        list[SeatDetails]: All Seats in the `Seat` database table
    """
    return seat_service.all()


@api.get("/room/{room_id}", response_model=list[SeatDetails], tags=["Seats"])
def get_seats_by_room_id(
    room_id: str,
    seat_service: SeatService = Depends(),
) -> list[SeatDetails]:
    """
    Get all Seats from a room

    Parameters:
        Seat_service: a valid SeatService

    Returns:
        list[SeatDetails]: All Seats in the `Seat` database table of a particular room
    """

    return seat_service.get_by_room_id(room_id)


@api.get(
    "/{id}",
    response_model=SeatDetails,
    tags=["Seats"],
)
def get_seat_by_id(id: int, seat_service: SeatService = Depends()) -> SeatDetails:
    """
    Get seat with matching id

    Parameters:
        id: an int representing a unique identifier for a seat
        seat_service: a valid SeatService

    Returns:
        SeatDetails: SeatDetails with matching slug
    """

    return seat_service.get_by_id(id)


@api.post("", response_model=SeatDetails, tags=["Seats"])
def new_seat(
    seat: NewSeatDetails,
    subject: User = Depends(registered_user),
    seat_service: SeatService = Depends(),
) -> SeatDetails:
    """
    Create seat

    Parameters:
        seat: a valid seat model
        subject: a valid User model representing the currently logged in User
        seat_service: a valid SeatService

    Returns:
        SeatDetails: Created seat
    """

    return seat_service.create(subject, seat)


@api.put(
    "",
    response_model=SeatDetails,
    tags=["Seats"],
)
def update_seat(
    seat: SeatDetails,
    subject: User = Depends(registered_user),
    seat_service: SeatService = Depends(),
) -> SeatDetails:
    """
    Update seat

    Parameters:
        seat: a valid Seat model
        subject: a valid User model representing the currently logged in User
        seat_service: a valid SeatService

    Returns:
        SeatDetails: Updated seat
    """

    return seat_service.update(subject, seat)


@api.put(
    "/multiple",
    response_model=list[SeatDetails],
    tags=["Seats"],
)
def update_seats(
    seats: list[SeatDetails],
    subject: User = Depends(registered_user),
    seat_service: SeatService = Depends(),
) -> list[SeatDetails]:
    """
    Update seat

    Parameters:
        seats: a list of valid Seat models
        subject: a valid User model representing the currently logged in User
        seat_service: a valid SeatService

    Returns:
        SeatDetails: Updated seats
    """

    return [seat_service.update(subject, seat) for seat in seats]


@api.delete("/{id}", response_model=None, tags=["Seats"])
def delete_seat(
    id: int,
    subject: User = Depends(registered_user),
    seat_service: SeatService = Depends(),
):
    """
    Delete seat based on id

    Parameters:
        id: a string representing a unique identifier for an seat
        subject: a valid User model representing the currently logged in User
        seat_service: a valid SeatService
    """

    seat_service.delete(subject, id)
