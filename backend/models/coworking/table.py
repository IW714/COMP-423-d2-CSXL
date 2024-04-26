from pydantic import BaseModel


class TableIdentity(BaseModel):
    id: int


class Table(TableIdentity, BaseModel):
    x: float
    y: float
    width: float
    height: float
    rotation: float
    radius: float | None

    is_circle: bool


class NewTable(Table, BaseModel):
    id: int | None = None
