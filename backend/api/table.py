"""Table operations open to root user"""

from fastapi import APIRouter, Depends

from backend.models.coworking.table_details import NewTableDetails, TableDetails

from ..services.coworking.table import TableService
from ..api.authentication import registered_user
from ..models.user import User

api = APIRouter(prefix="/api/table")
openapi_tags = {
    "name": "Tables",
    "description": "Create, update, delete, and retrieve tables.",
}


@api.get("", response_model=list[TableDetails], tags=["Tables"])
def get_tables(
    table_service: TableService = Depends(),
) -> list[TableDetails]:
    """
    Get all Tables

    Parameters:
        Table_service: a valid TableService

    Returns:
        list[TableDetails]: All Tables in the `Table` database table
    """
    return table_service.all()


@api.get("/room/{room_id}", response_model=list[TableDetails], tags=["Tables"])
def get_tables_by_room_id(
    room_id: str,
    table_service: TableService = Depends(),
) -> list[TableDetails]:
    """
    Get all Tables from a room

    Parameters:
        Table_service: a valid TableService

    Returns:
        list[TableDetails]: All Tables in the `Table` database table of a particular room
    """

    return table_service.get_by_room_id(room_id)


@api.get(
    "/{id}",
    response_model=TableDetails,
    tags=["Tables"],
)
def get_table_by_id(id: int, table_service: TableService = Depends()) -> TableDetails:
    """
    Get table with matching id

    Parameters:
        id: an int representing a unique identifier for a table
        table_service: a valid TableService

    Returns:
        TableDetails: TableDetails with matching slug
    """

    return table_service.get_by_id(id)


@api.post("", response_model=TableDetails, tags=["Tables"])
def new_table(
    table: NewTableDetails,
    subject: User = Depends(registered_user),
    table_service: TableService = Depends(),
) -> TableDetails:
    """
    Create table

    Parameters:
        table: a valid table model
        subject: a valid User model representing the currently logged in User
        table_service: a valid TableService

    Returns:
        TableDetails: Created table
    """

    return table_service.create(subject, table)


@api.put(
    "",
    response_model=TableDetails,
    tags=["Tables"],
)
def update_table(
    table: TableDetails,
    subject: User = Depends(registered_user),
    table_service: TableService = Depends(),
) -> TableDetails:
    """
    Update table

    Parameters:
        table: a valid Table model
        subject: a valid User model representing the currently logged in User
        table_service: a valid TableService

    Returns:
        TableDetails: Updated table
    """

    return table_service.update(subject, table)


@api.put(
    "/multiple",
    response_model=list[TableDetails],
    tags=["Tables"],
)
def update_tables(
    tables: list[TableDetails],
    subject: User = Depends(registered_user),
    table_service: TableService = Depends(),
) -> list[TableDetails]:
    """
    Update table

    Parameters:
        tables: a list of valid Table models
        subject: a valid User model representing the currently logged in User
        table_service: a valid TableService

    Returns:
        TableDetails: Updated tables
    """

    return [table_service.update(subject, table) for table in tables]


@api.delete("/{id}", response_model=None, tags=["Tables"])
def delete_table(
    id: int,
    subject: User = Depends(registered_user),
    table_service: TableService = Depends(),
):
    """
    Delete table based on id

    Parameters:
        id: a string representing a unique identifier for an table
        subject: a valid User model representing the currently logged in User
        table_service: a valid TableService
    """

    table_service.delete(subject, id)
