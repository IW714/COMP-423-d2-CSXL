import { Room } from 'src/app/coworking/coworking.models';
import { RoomItemService } from './room-item.service';
import { ChangeDetectorRef } from '@angular/core';

export interface RoomItemInterface {
  room: Room;
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  selectedForResizing: boolean;
  type?: 'seat' | 'table';

  calculateAngle(x: number, y: number): number;
  selectItem(roomItemService: RoomItemService): void;
  getMousePositionInSVG(event: MouseEvent, svgElement: SVGSVGElement): DOMPoint;
  startRotating(
    roomItemService: RoomItemService,
    event: MouseEvent,
    changeDetectorRef: ChangeDetectorRef
  ): void;
  getItemCenter(): { x: number; y: number };
}

export class RoomItem implements RoomItemInterface {
  room: Room;
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  selectedForResizing: boolean;
  type: 'seat' | 'table' | undefined;

  MIN_WIDTH = 20;
  MIN_HEIGHT = 20;

  constructor(
    room: Room,
    id: number,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    selectedForResizing: boolean,
    type: 'seat' | 'table' | undefined
  ) {
    this.room = room;
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.selectedForResizing = selectedForResizing;
    this.type = type;
  }

  calculateAngle(x: number, y: number): number {
    return Math.atan2(y, x) * (180 / Math.PI);
  }

  selectItem(roomItemService: RoomItemService): void {
    const svg = document.getElementById(
      'room-editor'
    ) as unknown as SVGSVGElement;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (this) {
        const currentMousePosition = this.getMousePositionInSVG(moveEvent, svg);
        const [newX, newY] = this.calculateNewItemPosition(
          currentMousePosition,
          svg,
          roomItemService
        );

        this.x = newX;
        this.y = newY;

        roomItemService.updateAlignmentLines();
        roomItemService.updateRoomItemCard(this);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      roomItemService.isItemBeingMoved = false;
      roomItemService.clearAlignmentLines();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  getMousePositionInSVG(event: MouseEvent, svg: SVGSVGElement): DOMPoint {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    return pt.matrixTransform(svg.getScreenCTM()?.inverse());
  }

  private calculateNewItemPosition(
    currentMousePosition: DOMPoint,
    svg: SVGSVGElement,
    roomItemService: RoomItemService
  ): [number, number] {
    let newX = currentMousePosition.x - this.width / 2;
    let newY = currentMousePosition.y - this.height / 2;

    const { x: snappedX, y: snappedY } = this.snapToOtherItemCenters(
      newX,
      newY,
      roomItemService
    );

    const margin = 5;
    newX = this.enforceXBoundaries(snappedX, svg, margin);
    newY = this.enforceYBoundaries(snappedY, svg, margin);

    return [newX, newY];
  }

  private snapToOtherItemCenters(
    newX: number,
    newY: number,
    roomItemService: RoomItemService
  ): { x: number; y: number } {
    const snapThreshold = 5;
    const currentItems = roomItemService.roomItemsSource.getValue();
    let snappedX = newX;
    let snappedY = newY;

    currentItems.forEach((otherItem) => {
      if (otherItem !== this) {
        const otherCenterX = otherItem.x + otherItem.width / 2;
        const otherCenterY = otherItem.y + otherItem.height / 2;
        const newCenterX = newX + this.width / 2;
        const newCenterY = newY + this.height / 2;

        // Snap horizontally to center
        if (Math.abs(newCenterX - otherCenterX) < snapThreshold) {
          snappedX = otherCenterX - this.width / 2;
        }

        // Snap vertically to center
        if (Math.abs(newCenterY - otherCenterY) < snapThreshold) {
          snappedY = otherCenterY - this.height / 2;
        }
      }
    });

    return { x: snappedX, y: snappedY };
  }

  private enforceXBoundaries(
    x: number,
    svg: SVGSVGElement,
    margin: number
  ): number {
    return Math.max(
      margin,
      Math.min(svg.width.baseVal.value - this.width - margin, x)
    );
  }

  private enforceYBoundaries(
    y: number,
    svg: SVGSVGElement,
    margin: number
  ): number {
    return Math.max(
      margin,
      Math.min(svg.height.baseVal.value - this.height - margin, y)
    );
  }

  startRotating(
    roomItemService: RoomItemService,
    event: MouseEvent,
    changeDetectorRef: ChangeDetectorRef
  ): void {
    event.stopPropagation();

    const svg = document.getElementById(
      'room-editor'
    ) as unknown as SVGSVGElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    const initialAngle = this.calculateAngle(
      svgPoint.x - centerX,
      svgPoint.y - centerY
    );
    const initialRotation = this.rotation;

    const onMouseMove = (moveEvent: MouseEvent) => {
      pt.x = moveEvent.clientX;
      pt.y = moveEvent.clientY;
      const newPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const currentAngle = this.calculateAngle(
        newPoint.x - centerX,
        newPoint.y - centerY
      );
      let deltaAngle = currentAngle - initialAngle;
      let newRotation = (initialRotation + deltaAngle + 360) % 360;

      // Snapping logic
      const snapThreshold = 5; // degrees within which to snap to the nearest 90
      const nearest90 = Math.round(newRotation / 90) * 90;
      if (Math.abs(newRotation - nearest90) < snapThreshold) {
        newRotation = nearest90; // Snap to nearest 90 degrees
      }

      this.rotation = newRotation;
      roomItemService.updateRoomItemCard(this);
      changeDetectorRef.markForCheck(); // Manually trigger change detection
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  getItemCenter(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }

  static transformItemsForBackend(items: RoomItemInterface[]) {
    return items.map(
      ({ selectedForResizing, ...itemWithoutDimensions }) =>
        itemWithoutDimensions
    );
  }
}
