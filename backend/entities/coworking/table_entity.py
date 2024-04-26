"""Entity for Tables."""

from sqlalchemy import Float, Integer, String, Boolean, ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship, Session, joinedload

from backend.models.coworking.table_details import TableDetails, NewTableDetails
from ..entity_base import EntityBase
from ...models.coworking.table import TableIdentity, Table
from typing import Self


class TableEntity(EntityBase):
    """Entity for Tables under XL management."""

    __tablename__ = "coworking__table"

    # Table Model Fields
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float)
    radius: Mapped[float] = mapped_column(Float, nullable=True)

    is_circle: Mapped[bool] = mapped_column(Boolean)

    # TableDetails Model Fields Follow
    room_id: Mapped[str] = mapped_column(String, ForeignKey("room.id"))

    room: Mapped["RoomEntity"] = relationship("RoomEntity", back_populates="tables")  # type: ignore

    def to_model(self) -> TableDetails:
        """Converts the entity to a model.

        Returns:
            Table: The model representation of the entity."""
        return TableDetails(
            id=self.id,
            x=self.x,
            y=self.y,
            width=self.width,
            height=self.height,
            rotation=self.rotation,
            radius=self.radius,
            is_circle=self.is_circle,
            room=self.room.to_model(),
        )

    @classmethod
    def from_model(cls, model: TableDetails) -> Self:
        """Create an TableEntity from a Table model.

        Args:
            model (Table): The model to create the entity from.

        Returns:
            Self: The entity (not yet persisted)."""
        return cls(
            id=model.id,
            x=model.x,
            y=model.y,
            width=model.width,
            height=model.height,
            rotation=model.rotation,
            radius=model.radius,
            is_circle=model.is_circle,
            room_id=model.room.id,
        )

    @classmethod
    def from_new_model(cls, model: NewTableDetails) -> Self:
        """Create an TableEntity from a New Table model.

        Args:
            model (Table): The model to create the entity from.

        Returns:
            Self: The entity (not yet persisted)."""
        return cls(
            id=model.id,
            x=model.x,
            y=model.y,
            width=model.width,
            height=model.height,
            rotation=model.rotation,
            radius=model.radius,
            is_circle=model.is_circle,
            room_id=model.room.id,
        )
