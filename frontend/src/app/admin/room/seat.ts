import { Room } from 'src/app/coworking/coworking.models';
import { RoomItem, RoomItemInterface } from './room-item';

export interface SeatInterface extends RoomItemInterface {
  title: string;
  shorthand: string;
  reservable: boolean;
  has_monitor: boolean;
  sit_stand: boolean;
}

export class Seat extends RoomItem implements SeatInterface {
  title: string;
  shorthand: string;
  reservable: boolean;
  has_monitor: boolean;
  sit_stand: boolean;

  static SEAT_API_URL: string = '/api/seat';

  constructor(
    room: Room,
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    selectedForResizing: boolean,
    title: string,
    shorthand: string,
    reservable: boolean,
    has_monitor: boolean,
    sit_stand: boolean,
    type: 'seat' | 'table' | undefined
  ) {
    super(room, id, x, y, width, height, rotation, selectedForResizing, type);

    this.title = title;
    this.shorthand = shorthand;
    this.reservable = reservable;
    this.has_monitor = has_monitor;
    this.sit_stand = sit_stand;
  }
}
