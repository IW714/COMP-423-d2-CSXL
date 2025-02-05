"""Entity for Room."""

from sqlalchemy import Integer, String, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.entities.coworking import SeatEntity
from backend.entities.coworking.table_entity import TableEntity
from .entity_base import EntityBase
from ..models import Room, RoomDetails
from typing import Self

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


class RoomEntity(EntityBase):
    """Entity for Rooms under XL management."""

    __tablename__ = "room"

    # Room Model Fields
    id: Mapped[str] = mapped_column(String, primary_key=True)
    capacity: Mapped[int] = mapped_column(Integer, index=True)
    # RoomDetails Model Fields Follow
    building: Mapped[str] = mapped_column(String)
    room: Mapped[str] = mapped_column(String)
    nickname: Mapped[str] = mapped_column(String)
    reservable: Mapped[bool] = mapped_column(Boolean)
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)

    seats: Mapped[list["SeatEntity"]] = relationship(  # type: ignore
        "SeatEntity", back_populates="room"
    )

    tables: Mapped[list["TableEntity"]] = relationship(
        "TableEntity", back_populates="room"
    )

    course_sections: Mapped[list["SectionRoomEntity"]] = relationship(  # type: ignore
        back_populates="room"
    )

    def to_model(self) -> Room:
        """Converts the entity to a model.

        Returns:
            Room: The model representation of the entity."""
        return Room(id=self.id, nickname=self.nickname)

    def to_details_model(self) -> RoomDetails:
        """Converts the entity to a RoomDetail model.

        Returns:
            RoomDetails: The model representation of the entity."""
        return RoomDetails(
            id=self.id,
            nickname=self.nickname,
            building=self.building,
            room=self.room,
            capacity=self.capacity,
            reservable=self.reservable,
            seats=[seat.to_model() for seat in self.seats],
            tables=[table.to_model() for table in self.tables],
            x=self.x,
            y=self.y,
            width=self.width,
            height=self.height,
        )

    @classmethod
    def from_model(cls, model: RoomDetails) -> Self:
        """Create an RoomEntity from a Room model.

        Args:
            model (Room): The model to create the entity from.

        Returns:
            Self: The entity (not yet persisted)."""
        return cls(
            id=model.id,
            nickname=model.nickname,
            building=model.building,
            room=model.room,
            capacity=model.capacity,
            reservable=model.reservable,
            seats=model.seats,
            tables=model.tables,
            x=model.x,
            y=model.y,
            width=model.width,
            height=model.height,
        )
