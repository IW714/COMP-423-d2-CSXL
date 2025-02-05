"""Entity for Seats."""

from sqlalchemy import Float, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship, Session, joinedload

from backend.entities.coworking.reservation_seat_table import reservation_seat_table
from backend.models.coworking.seat_details import NewSeatDetails

from backend.models.coworking.seat_details import NewSeatDetails
from ..entity_base import EntityBase
from ...models.coworking import SeatDetails
from ...models.coworking.seat import SeatIdentity, Seat
from typing import Self

__authors__ = ["Kris Jordan"]
__copyright__ = "Copyright 2023"
__license__ = "MIT"


class SeatEntity(EntityBase):
    """Entity for Seats under XL management."""

    __tablename__ = "coworking__seat"

    # Seat Model Fields
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String)
    shorthand: Mapped[str] = mapped_column(String)
    reservable: Mapped[bool] = mapped_column(Boolean)
    has_monitor: Mapped[bool] = mapped_column(Boolean)
    sit_stand: Mapped[bool] = mapped_column(Boolean)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    rotation: Mapped[float] = mapped_column(Float)
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    # SeatDetails Model Fields Follow
    room_id: Mapped[str] = mapped_column(String, ForeignKey("room.id"))

    # Relationships
    reservation: Mapped[list["ReservationEntity"]] = relationship(
        secondary=reservation_seat_table
    )
    room: Mapped["RoomEntity"] = relationship("RoomEntity", back_populates="seats")  # type: ignore

    def to_model(self) -> SeatDetails:
        """Converts the entity to a model.

        Returns:
            Seat: The model representation of the entity."""
        return SeatDetails(
            id=self.id,
            title=self.title,
            shorthand=self.shorthand,
            reservable=self.reservable,
            has_monitor=self.has_monitor,
            sit_stand=self.sit_stand,
            x=self.x,
            y=self.y,
            width=self.width,
            height=self.height,
            rotation=self.rotation,
            room=self.room.to_model(),
        )

    @classmethod
    def get_models_from_identities(
        cls, session: Session, identities: list[SeatIdentity]
    ) -> list[Seat]:
        seat_ids = [seat.id for seat in identities]
        entities = (
            session.query(cls)
            .filter(cls.id.in_(seat_ids))
            .options(joinedload(SeatEntity.room))
            .all()
        )
        return [entity.to_model() for entity in entities]

    @classmethod
    def from_model(cls, model: SeatDetails) -> Self:
        """Create an SeatEntity from a Seat model.

        Args:
            model (Seat): The model to create the entity from.

        Returns:
            Self: The entity (not yet persisted)."""
        return cls(
            id=model.id,
            title=model.title,
            shorthand=model.shorthand,
            reservable=model.reservable,
            has_monitor=model.has_monitor,
            sit_stand=model.sit_stand,
            rotation=model.rotation,
            width=model.width,
            height=model.height,
            x=model.x,
            y=model.y,
            room_id=model.room.id,
        )

    @classmethod
    def from_new_model(cls, model: NewSeatDetails) -> Self:
        """Create an SeatEntity from a New Seat model.

        Args:
            model (Seat): The model to create the entity from.

        Returns:
            Self: The entity (not yet persisted)."""
        return cls(
            id=model.id,
            title=model.title,
            shorthand=model.shorthand,
            reservable=model.reservable,
            has_monitor=model.has_monitor,
            sit_stand=model.sit_stand,
            rotation=model.rotation,
            width=model.width,
            height=model.height,
            x=model.x,
            y=model.y,
            room_id=model.room.id,
        )
