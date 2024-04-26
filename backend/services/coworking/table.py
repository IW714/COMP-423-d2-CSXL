"""Service that manages tables in the coworking space."""

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.entities.room_entity import RoomEntity
from backend.models.coworking.table_details import TableDetails, NewTableDetails
from backend.models.user import User
from backend.services.exceptions import ResourceNotFoundException
from ...database import db_session
from ...models.coworking.table import Table
from ...entities.coworking.table_entity import TableEntity
from ..permission import PermissionService


class TableService:
    """TableService is the access layer to coworking tables."""

    def __init__(
        self,
        session: Session = Depends(db_session),
        permission_svc: PermissionService = Depends(),
    ):
        """Initializes a new TableService.

        Args:
            session (Session): The database session to use, typically injected by FastAPI.
        """
        self._session = session
        self._permission_svc = permission_svc

    def all(self) -> list[TableDetails]:
        """Returns all tables.

        Returns:
            list[TableDetails]: All tables.
        """
        entities = self._session.query(TableEntity).all()
        return [entity.to_model() for entity in entities]

    def get_by_room_id(self, room_id: str) -> list[TableDetails]:
        """Gets all tables from the table for a room id.

        Args:
            id: ID of the room to retrieve tables from.
        Returns:
            TableDetails[]: Tables based on the room id.
        """

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == room_id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(f"Room with id: {room_id} does not exist.")

        # Get Tables by Room ID
        table_query = select(TableEntity).filter(TableEntity.room_id == room_id)
        table_entities = self._session.scalars(table_query).all()

        return [entity.to_model() for entity in table_entities]

    def get_by_id(self, id: int) -> TableDetails:
        """Gets the table from the table for an id.

        Args:
            id: ID of the table to retrieve.
        Returns:
            TableDetails: Table based on the id.
        """
        # Select all entries in the `Table` table and sort by end date
        query = select(TableEntity).filter(TableEntity.id == id)
        entity = self._session.scalars(query).one_or_none()

        # Raise an error if no entity was found.
        if entity is None:
            raise ResourceNotFoundException(f"Table with id: {id} does not exist.")

        # Return the model
        return entity.to_model()

    def create(self, subject: User, table: NewTableDetails) -> TableDetails:
        """Creates a new table.

        Args:
            subject: a valid User model representing the currently logged in User
            table: Table to add to table

        Returns:
            TableDetails: Object added to table
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "table.create", f"table")

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == table.room.id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(
                f"Room with id: {table.room.id} does not exist."
            )

        # Make sure that the table ID is None so that entity can handle
        table.id = None

        # Create new object
        table_entity = TableEntity.from_new_model(table)

        # Add new object to table and commit changes
        self._session.add(table_entity)
        self._session.commit()

        # Return added object
        return table_entity.to_model()

    def update(self, subject: User, table: TableDetails) -> TableDetails:
        """Updates a table.

        Args:
            subject: a valid User model representing the currently logged in User
            table: Table to update

        Returns:
            TableDetails: Object updated in the table
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "table.update", f"table/{table.id}")

        # Check if room exists.
        room_query = select(RoomEntity).filter(RoomEntity.id == table.room.id)
        room_entity = self._session.scalars(room_query).one_or_none()

        # Raise an error if no entity was found.
        if room_entity is None:
            raise ResourceNotFoundException(
                f"Room with id: {table.room.id} does not exist."
            )

        # Find the entity to update
        table_entity = self._session.get(TableEntity, table.id)

        # Raise an error if no entity was found
        if table_entity is None:
            raise ResourceNotFoundException(
                f"Table with id: {table.id} does not exist."
            )

        # Update the entity
        table_entity.x = table.x
        table_entity.y = table.y
        table_entity.width = table.width
        table_entity.height = table.height
        table_entity.rotation = table.rotation
        table_entity.radius = table.radius # type: ignore // Figure out this issue

        table_entity.is_circle = table.is_circle
        table_entity.room_id = table.room.id

        # Commit changes
        self._session.commit()

        # Return edited object
        return table_entity.to_model()

    def delete(self, subject: User, id: int) -> None:
        """Deletes a table.

        Args:
            subject: a valid User model representing the currently logged in User
            id: ID of table to delete
        """

        # Check if user has admin permissions
        self._permission_svc.enforce(subject, "table.delete", f"table/{id}")

        # Find the entity to delete
        table_entity = self._session.get(TableEntity, id)

        # Raise an error if no entity was found
        if table_entity is None:
            raise ResourceNotFoundException(f"Table with id: {id} does not exist.")

        # Delete and commit changes
        self._session.delete(table_entity)
        self._session.commit()
