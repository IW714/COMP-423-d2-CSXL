from pydantic import BaseModel

from .table import Table, NewTable
from .. import Room


class TableDetails(Table, BaseModel):
    room: Room


class NewTableDetails(NewTable, BaseModel):
    room: Room
