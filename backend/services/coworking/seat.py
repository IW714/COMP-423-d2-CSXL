"""Service that manages seats in the coworking space."""

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.entities.room_entity import RoomEntity
from backend.models.coworking.seat import NewSeat
from backend.models.coworking.seat_details import NewSeatDetails
from backend.models.user import User
from backend.services.exceptions import ResourceNotFoundException
from ...database import db_session
from ...models.coworking import Seat, SeatDetails
from ...entities.coworking import SeatEntity
from ..permission import PermissionService

from ..permission import PermissionService


__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


class SeatService:
    """SeatService is the access layer to coworking seats."""

   
    def __init__(
        self,
        session: Session = Depends(db_session),
        permission_svc: PermissionService = Depends(),
    ):
        """Initializes a new SeatService.

        Args:
            session (Session): The database session to use, typically injected by FastAPI.
        """
        self._session = session
        self._permission_svc = permission_svc
        self._permission_svc = permission_svc

    def all(self) -> list[SeatDetails]:
        """Returns all seats.

        Returns:
            list[SeatDetails]: All seats.
            list[SeatDetails]: All seats.
        """
        entities = self._session.query(SeatEntity).all()
        return [entity.to_model() for entity in entities]

    def get_by_room_id(self, room_id: str) -> list[SeatDetails]:
        """Gets all seats from the table for a room id.

        Args:
            id: ID of the room to retrieve seats from.
        Returns:
            SeatDetails[]: Seats based on the room id.
        """

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == room_id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(f"Room with id: {room_id} does not exist.")

        # Get Seats by Room ID
        seat_query = select(SeatEntity).filter(SeatEntity.room_id == room_id)
        seat_entities = self._session.scalars(seat_query).all()

        return [entity.to_model() for entity in seat_entities]

    def get_by_id(self, id: int) -> SeatDetails:
        """Gets the seat from the table for an id.

        Args:
            id: ID of the seat to retrieve.
        Returns:
            SeatDetails: Seat based on the id.
        """
        # Select all entries in the `Seat` table and sort by end date
        query = select(SeatEntity).filter(SeatEntity.id == id)
        entity = self._session.scalars(query).one_or_none()

        # Raise an error if no entity was found.
        if entity is None:
            raise ResourceNotFoundException(f"Seat with id: {id} does not exist.")

        # Return the model
        return entity.to_model()

    def create(self, subject: User, seat: NewSeatDetails) -> SeatDetails:
        """Creates a new seat.

        Args:
            subject: a valid User model representing the currently logged in User
            seat: Seat to add to table

        Returns:
            SeatDetails: Object added to table
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "seat.create", f"seat")

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == seat.room.id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(
                f"Room with id: {seat.room.id} does not exist."
            )

        # Make sure that the seat ID is None so that entity can handle
        seat.id = None

        # Create new object
        seat_entity = SeatEntity.from_new_model(seat)
        # Add new object to table and commit changes
        self._session.add(seat_entity)
        self._session.commit()

        # Return added object
        return seat_entity.to_model()

    def update(self, subject: User, seat: SeatDetails) -> SeatDetails:
        """Updates a seat.

        Args:
            subject: a valid User model representing the currently logged in User
            seat: Seat to update

        Returns:
            SeatDetails: Object updated in the table
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "seat.update", f"seat/{seat.id}")

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == seat.room.id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(
                f"Room with id: {seat.room.id} does not exist."
            )

        # Find the entity to update
        seat_entity = self._session.get(SeatEntity, seat.id)

        # Raise an error if no entity was found
        if seat_entity is None:
            raise ResourceNotFoundException(f"Seat with id: {seat.id} does not exist.")

        # Update the entity
        seat_entity.title = seat.title
        seat_entity.shorthand = seat.shorthand
        seat_entity.reservable = seat.reservable
        seat_entity.has_monitor = seat.has_monitor
        seat_entity.sit_stand = seat.sit_stand
        seat_entity.rotation = seat.rotation
        seat_entity.x = seat.x
        seat_entity.y = seat.y
        seat_entity.width = seat.width
        seat_entity.height = seat.height
        seat_entity.rotation = seat.rotation
        seat_entity.room_id = seat.room.id

        # Commit changes
        self._session.commit()

        # Return edited object
        return seat_entity.to_model()

    def delete(self, subject: User, id: int) -> None:
        """Deletes a seat.

        Args:
            subject: a valid User model representing the currently logged in User
            id: ID of seat to delete
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "seat.delete", f"seat/{id}")

        # Find the entity to delete
        seat_entity = self._session.get(SeatEntity, id)

        # Raise an error if no entity was found
        if seat_entity is None:
            raise ResourceNotFoundException(f"Seat with id: {id} does not exist.")

        # Delete and commit changes
        self._session.delete(seat_entity)
        self._session.commit()
