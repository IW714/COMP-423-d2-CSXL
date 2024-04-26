import { Room } from 'src/app/coworking/coworking.models';
import { RoomItem, RoomItemInterface } from './room-item';
import { RoomItemService } from './room-item.service';

export interface TableInterface extends RoomItemInterface {
  radius: number;
  is_circle: boolean;

  resizeRectangle(
    dx: number,
    dy: number,
    corner: string,
    roomItemService: RoomItemService
  ): void;
  resizeCircle(
    dx: number,
    dy: number,
    corner: string,
    roomItemService: RoomItemService
  ): void;
  convertToCircle(): void;
}

export class Table extends RoomItem implements TableInterface {
  radius: number;

  is_circle: boolean;

  static TABLE_API_URL: string = '/api/table';

  constructor(
    room: Room,
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    selectedForResizing: boolean,
    radius: number,
    is_circle: boolean,
    type: 'seat' | 'table' | undefined
  ) {
    super(room, id, x, y, width, height, rotation, selectedForResizing, type);

    this.radius = radius;
    this.is_circle = is_circle;
  }

  resizeRectangle(
    dx: number,
    dy: number,
    corner: string,
    roomItemService: RoomItemService
  ): void {
    const minWidth = this.MIN_WIDTH;
    const minHeight = this.MIN_HEIGHT;
    let newWidth = this.width;
    let newHeight = this.height;

    switch (corner) {
      case 'top-left':
        newWidth -= dx;
        newHeight -= dy;
        if (newWidth > minWidth && newHeight > minHeight) {
          this.x += dx;
          this.y += dy;
          this.width = newWidth;
          this.height = newHeight;
        }
        break;
      case 'top-right':
        newWidth += dx;
        newHeight -= dy;
        if (newWidth > minWidth && newHeight > minHeight) {
          this.y += dy;
          this.width = newWidth;
          this.height = newHeight;
        }
        break;
      case 'bottom-left':
        newWidth -= dx;
        newHeight += dy;
        if (newWidth > minWidth && newHeight > minHeight) {
          this.x += dx;
          this.width = newWidth;
          this.height = newHeight;
        }
        break;
      case 'bottom-right':
        newWidth += dx;
        newHeight += dy;
        if (newWidth > minWidth && newHeight > minHeight) {
          this.width = newWidth;
          this.height = newHeight;
        }
        break;
    }

    roomItemService.updateRoomItemCard(this);
  }

  resizeCircle(
    dx: number,
    dy: number,
    corner: string,
    roomItemService: RoomItemService
  ): void {
    // Calculate direction multiplier based on the specific corner and the drag direction.
    let directionMultiplier =
      (dx < 0 && (corner === 'bottom-right' || corner === 'top-right')) ||
      (dx > 0 && (corner === 'bottom-left' || corner === 'top-left')) ||
      (dy < 0 && (corner === 'bottom-right' || corner === 'bottom-left')) ||
      (dy > 0 && (corner === 'top-right' || corner === 'top-left'))
        ? -1
        : 1;

    const movement = Math.sqrt(dx * dx + dy * dy) * directionMultiplier;

    let newDiameter = this.width + movement;
    const newRadius = newDiameter / 2;
    if (newRadius > 10) {
      // Assuming minimum radius constraint
      this.radius = newRadius;
      this.width = newDiameter;
      this.height = newDiameter; // Maintain the aspect ratio for visual consistency

      // Adjust x and y to keep the bottom-right corner stationary
      if (corner === 'top-left') {
        this.x -= movement;
        this.y -= movement;
      } else if (corner === 'top-right') {
        this.y -= movement;
      } else if (corner === 'bottom-left') {
        this.x -= movement;
      }
    }

    roomItemService.updateRoomItemCard(this);
  }

  convertToCircle(): void {
    // Assuming you determine the center and calculate the radius based on the smaller dimension
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = this.radius;

    // Update table properties to reflect the circle
    this.is_circle = true;
    this.radius = radius;
    this.x = centerX - radius; // New x-coordinate of the circle's bounding box
    this.y = centerY - radius; // New y-coordinate of the circle's bounding box
    this.width = 2 * radius; // Use diameter for width
    this.height = 2 * radius; // Use diameter for height
  }
}
