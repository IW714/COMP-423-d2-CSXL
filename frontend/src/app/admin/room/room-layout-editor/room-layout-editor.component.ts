import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { Observable, Subject, map } from 'rxjs';
import { RoomItemService } from '../room-item.service';
import { RoomItem, RoomItemInterface } from '../room-item';
import { Seat, SeatInterface } from '../seat';
import { Table, TableInterface } from '../table';

@Component({
  selector: 'app-room-layout-editor',
  templateUrl: './room-layout-editor.component.html',
  styleUrls: ['./room-layout-editor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomLayoutEditorComponent implements OnInit, OnDestroy {
  @Input() inputRoomWidth!: number;
  @Input() inputRoomLength!: number;
  @Input() inputRoomId!: string;
  @Output() itemSelected = new EventEmitter<RoomItemInterface>();

  public static Route = {
    path: 'room-layout-editor',
    component: RoomLayoutEditorComponent,
    title: 'Room Layout Editor'
  };

  // Properties for room size
  roomX: number = 10;
  roomY: number = 10;

  feetToPixelsConversionFactor: number = 10;

  get roomWidth(): number {
    return this.inputRoomWidth * this.feetToPixelsConversionFactor;
  }

  get roomLength(): number {
    return this.inputRoomLength * this.feetToPixelsConversionFactor;
  }

  seats$!: Observable<SeatInterface[]>;
  tables$!: Observable<TableInterface[]>;
  alignmentLines$!: Observable<
    { x1: number; y1: number; x2: number; y2: number }[]
  >;

  constructor(
    public roomItemService: RoomItemService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnInit(): void {
    this.loadSeats();
    this.loadTables();
    this.seats$ = this.roomItemService.roomItems$.pipe(
      map((items) => items.filter((item) => 'shorthand' in item) as Seat[])
    );
    this.tables$ = this.roomItemService.roomItems$.pipe(
      map((items) => items.filter((item) => 'is_circle' in item) as Table[])
    );
    this.alignmentLines$ = this.roomItemService.alignmentLines$;
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.resetEditor();
  }

  private resetEditor(): void {
    this.roomItemService.resetServiceState();
  }

  private loadSeats(): void {
    if (this.inputRoomId && this.inputRoomId != 'new') {
      this.roomItemService
        .getSeatsByRoomId(this.inputRoomId)
        .subscribe((seats) => {
          this.roomItemService.updateRoomItems(seats);
        });
    }
    this.changeDetectorRef.markForCheck();
  }

  private loadTables(): void {
    if (this.inputRoomId && this.inputRoomId != 'new') {
      this.roomItemService
        .getTablesByRoomId(this.inputRoomId)
        .subscribe((tables) => {
          this.roomItemService.updateRoomItems(tables);
        });
    }
    this.changeDetectorRef.markForCheck();
  }

  startRotating(item: RoomItemInterface, event: MouseEvent): void {
    this.roomItemService.startRotating(item, event, this.changeDetectorRef);
    this.changeDetectorRef.markForCheck();
  }

  selectItem(item: RoomItemInterface, event: MouseEvent): void {
    event.stopPropagation();
    this.roomItemService.selectItem(item);
    this.changeDetectorRef.markForCheck();
    this.itemSelected.emit(item);
  }

  createSeat(): void {
    this.roomItemService.createSeat(this.inputRoomId);
    this.changeDetectorRef.markForCheck();
  }

  createTable(): void {
    this.roomItemService.createTable(this.inputRoomId);
    this.changeDetectorRef.markForCheck();
  }

  deleteItem(item: RoomItemInterface): void {
    this.roomItemService.deleteItem(item);
    this.roomItemService.updateRoomItemCard(null);
    this.changeDetectorRef.markForCheck();
  }

  toggleResizing(item: RoomItemInterface, event: MouseEvent): void {
    event.stopPropagation();
    if ((item as Table).is_circle) {
      this.convertToCircle(item as Table);
    }
    this.roomItemService.toggleResizing(item);
    this.roomItemService.updateRoomItemCard(item);
    this.changeDetectorRef.markForCheck();
  }

  convertToCircle(table: Table): void {
    table.convertToCircle();
    this.changeDetectorRef.markForCheck(); // Trigger view update
  }

  startResizing(item: TableInterface, event: MouseEvent, corner: string): void {
    this.roomItemService.startResizing(
      item,
      event,
      corner,
      this.changeDetectorRef
    );
    this.changeDetectorRef.markForCheck();
  }

  clearSelection(event: MouseEvent): void {
    if (this.roomItemService.selectedItem) {
      this.roomItemService.clearSelectedItem();
      event.stopPropagation();
    }
    this.changeDetectorRef.markForCheck();
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const isInputActive =
      target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (isInputActive) {
      return; // Do nothing if the user is typing in an input or textarea
    }

    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'c':
          this.roomItemService.copyItem();
          break;
        case 'v':
          this.roomItemService.pasteItem(this.inputRoomId);
          break;
      }
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      console.log(this.roomItemService.selectedItem);
      if (this.roomItemService.selectedItem) {
        this.deleteItem(this.roomItemService.selectedItem);
      }
    }
    this.changeDetectorRef.markForCheck();
  };

  getImagePath(seat: SeatInterface): string {
    if (!seat.reservable) {
      return 'assets/seat-grey.png';
    } else if (seat.has_monitor && seat.sit_stand) {
      return 'assets/seat-purple.png';
    } else if (seat.has_monitor) {
      return 'assets/seat-green.png';
    } else {
      return 'assets/seat-red.png';
    }
  }
}
