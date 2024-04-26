import { HttpClient } from '@angular/common/http';
import { Injectable, ChangeDetectorRef } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  first,
  forkJoin,
  map,
  tap,
  throwError
} from 'rxjs';
import { AcademicsService } from '../../academics/academics.service';
import { Room } from 'src/app/coworking/coworking.models';
import { RoomItem, RoomItemInterface } from './room-item';
import { Seat, SeatInterface } from './seat';
import { Table, TableInterface } from './table';
import { AlignmentLine } from './alignment-line';

@Injectable({
  providedIn: 'root'
})
export class RoomItemService {
  roomItemsSource = new BehaviorSubject<RoomItemInterface[]>([]);
  roomItems$: Observable<RoomItemInterface[]> =
    this.roomItemsSource.asObservable();

  deletedItems$ = new BehaviorSubject<RoomItemInterface[]>([]);
  selectedItem$: BehaviorSubject<RoomItemInterface | null> =
    new BehaviorSubject<RoomItemInterface | null>(null);

  resizingItem: TableInterface | null = null;

  private alignmentLinesSource = new BehaviorSubject<
    { x1: number; y1: number; x2: number; y2: number }[]
  >([]);
  alignmentLines$: Observable<
    { x1: number; y1: number; x2: number; y2: number }[]
  > = this.alignmentLinesSource.asObservable();

  selectedItem: RoomItemInterface | null = null;
  copiedItem: RoomItemInterface | null = null;
  isItemBeingMoved: boolean = false;

  constructor(
    private http: HttpClient,
    private academicsService: AcademicsService
  ) {}

  tempIdCounter = -1;

  createSeat(roomID: string, seat?: SeatInterface): void {
    if (seat) {
      this.academicsService
        .getRoom(roomID)
        .pipe(first())
        .subscribe((room) => {
          const newSeat = new Seat(
            { id: room.id, nickname: room.nickname } as Room,
            this.tempIdCounter--,
            seat.x + 10,
            seat.y + 10,
            seat.width,
            seat.height,
            seat.rotation,
            false,
            '',
            '',
            false,
            false,
            false,
            'seat'
          );
          this.addItem(newSeat);
        });
    } else {
      this.academicsService
        .getRoom(roomID)
        .pipe(first())
        .subscribe((room) => {
          const newSeat = new Seat(
            { id: room.id, nickname: room.nickname } as Room,
            this.tempIdCounter--, // Decrease each time to ensure uniqueness
            5,
            5,
            20,
            20,
            0,
            false,
            '',
            '',
            false,
            false,
            false,
            'seat'
          );
          this.addItem(newSeat);
        });
    }
  }

  createTable(roomID: string, table?: Table): void {
    if (table) {
      this.academicsService
        .getRoom(roomID)
        .pipe(first())
        .subscribe((room) => {
          const newTable = new Table(
            { id: room.id, nickname: room.nickname } as Room,
            this.tempIdCounter--,
            table.x + 10,
            table.y + 10,
            table.width,
            table.height,
            table.rotation,
            false,
            0,
            false,
            'table'
          );
          this.addItem(newTable);
        });
    } else {
      this.academicsService
        .getRoom(roomID)
        .pipe(first())
        .subscribe((room) => {
          const newTable = new Table(
            { id: room.id, nickname: room.nickname } as Room, // Adjusted room object
            this.tempIdCounter--,
            5,
            5,
            40,
            40,
            0,
            false,
            0,
            false,
            'table'
          );
          this.addItem(newTable);
        });
    }
  }

  addItem(item: RoomItemInterface): void {
    this.roomItemsSource.next([...this.roomItemsSource.getValue(), item]);
  }

  deleteItem(item: RoomItemInterface): void {
    this.deletedItems$.next([...this.deletedItems$.getValue(), item]); // Now it accumulates deleted items
    const updatedItems = this.roomItemsSource
      .getValue()
      .filter((it) => it !== item);
    this.roomItemsSource.next(updatedItems);
  }

  updateItem(updatedItem: RoomItemInterface): void {
    const items = this.roomItemsSource.getValue();
    const itemIndex = items.findIndex(
      (item) => item.id === updatedItem.id && item.type === updatedItem.type
    );

    if (itemIndex >= 0) {
      // Convert to the correct type if necessary
      const itemToUpdate = items[itemIndex];
      Object.assign(itemToUpdate, updatedItem);
      this.roomItemsSource.next(items);
    }
  }

  copyItem(): void {
    if (this.selectedItem) {
      this.copiedItem = {
        ...this.selectedItem
      } as RoomItem;
    }
  }

  pasteItem(roomId: string): void {
    if (this.copiedItem) {
      if (this.copiedItem.type == 'seat') {
        this.createSeat(roomId, this.copiedItem as Seat);
      } else {
        this.createTable(roomId, this.copiedItem as Table);
      }
    }
  }

  updateRoomItemCard(item: RoomItemInterface | null): void {
    this.roomItemsSource.next([...this.roomItemsSource.getValue()]);
    this.selectedItem$.next(item);
  }

  selectItem(item: RoomItemInterface): void {
    if (this.selectedItem != item) {
      this.clearSelectedItem();
      this.selectedItem = item;
    }
    this.isItemBeingMoved = true;
    item.selectItem(this);
  }

  startResizing(
    item: TableInterface,
    event: MouseEvent,
    corner: string,
    changeDetectorRef: ChangeDetectorRef
  ): void {
    event.stopPropagation();
    this.resizingItem = item;
    const svg = document.getElementById(
      'room-editor'
    ) as unknown as SVGSVGElement;

    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    let prevPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const onMouseMove = (moveEvent: MouseEvent) => {
      pt.x = moveEvent.clientX;
      pt.y = moveEvent.clientY;
      const newPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());

      const dx = newPoint.x - prevPoint.x;
      const dy = newPoint.y - prevPoint.y;

      if (this.resizingItem) {
        // Ensure resizingItem is not null before calling the service
        if (item.type === 'table' && (item as Table).is_circle) {
          item.resizeCircle(dx, dy, corner, this);
        } else {
          item.resizeRectangle(dx, dy, corner, this);
        }
        changeDetectorRef.markForCheck(); // Ensure UI updates
        prevPoint = newPoint;
      }
      this.updateAlignmentLines();
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      upEvent.stopPropagation();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      this.resizingItem = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  clearSelectedItem(): void {
    if (this.selectedItem) {
      this.selectedItem.selectedForResizing = false;
      this.selectedItem = null;
    }
  }

  toggleResizing(item: RoomItemInterface): void {
    if (this.selectedItem === item) {
      item.selectedForResizing = !item.selectedForResizing;
    } else {
      this.clearSelectedItem();
      this.selectedItem = item;
      item.selectedForResizing = true;
    }
  }

  startRotating(
    item: RoomItemInterface,
    event: MouseEvent,
    changeDetectorRef: ChangeDetectorRef
  ): void {
    item.startRotating(this, event, changeDetectorRef);
  }

  updateAlignmentLines(): void {
    if (this.shouldUpdateAlignmentLines()) {
      const lines = this.calculateAlignmentLines();
      this.alignmentLinesSource.next(lines);
    } else {
      this.clearAlignmentLines();
    }
  }

  private shouldUpdateAlignmentLines(): boolean {
    return this.isItemBeingMoved;
  }

  private calculateAlignmentLines(): AlignmentLine[] {
    const lines: AlignmentLine[] = [];
    const items = this.roomItemsSource.getValue();

    if (this.selectedItem) {
      const selectedItemCenter = this.selectedItem.getItemCenter();

      items.forEach((otherItem) => {
        if (otherItem !== this.selectedItem) {
          const otherItemCenter = otherItem.getItemCenter();
          this.addHorizontalAlignmentLine(
            lines,
            selectedItemCenter,
            otherItemCenter
          );
          this.addVerticalAlignmentLine(
            lines,
            selectedItemCenter,
            otherItemCenter
          );
        }
      });
    }

    return lines;
  }

  private addHorizontalAlignmentLine(
    lines: AlignmentLine[],
    selectedItemCenter: { x: number; y: number },
    otherItemCenter: { x: number; y: number }
  ): void {
    if (
      Math.abs(selectedItemCenter.x - otherItemCenter.x) <
      AlignmentLine.ALIGNMENT_LINE_THRESHOLD
    ) {
      lines.push({
        x1: selectedItemCenter.x,
        y1: 0,
        x2: selectedItemCenter.x,
        y2: 10000
      });
    }
  }

  private addVerticalAlignmentLine(
    lines: AlignmentLine[],
    selectedItemCenter: { x: number; y: number },
    otherItemCenter: { x: number; y: number }
  ): void {
    if (
      Math.abs(selectedItemCenter.y - otherItemCenter.y) <
      AlignmentLine.ALIGNMENT_LINE_THRESHOLD
    ) {
      lines.push({
        x1: 0,
        y1: selectedItemCenter.y,
        x2: 10000,
        y2: selectedItemCenter.y
      });
    }
  }

  clearAlignmentLines(): void {
    this.alignmentLinesSource.next([]);
  }

  getCurrentSeats(): SeatInterface[] {
    return this.roomItemsSource
      .getValue()
      .filter((item) => 'shorthand' in item) as SeatInterface[];
  }

  getCurrentTables(): TableInterface[] {
    return this.roomItemsSource
      .getValue()
      .filter((item) => 'radius' in item) as TableInterface[];
  }

  updateRoomItems(newItems: RoomItemInterface[]): void {
    const currentItems = this.roomItemsSource.getValue();
    const updatedItems = [...currentItems, ...newItems];
    this.roomItemsSource.next(updatedItems);
  }

  getSeatsByRoomId(roomId: string): Observable<SeatInterface[]> {
    return this.http
      .get<SeatInterface[]>(`${Seat.SEAT_API_URL}/room/${roomId}`)
      .pipe(
        map((seats) =>
          seats.map(
            (seat) =>
              new Seat(
                seat.room,
                seat.id,
                seat.x,
                seat.y,
                20,
                20,
                seat.rotation || 0,
                false,
                seat.title,
                seat.shorthand,
                seat.reservable,
                seat.has_monitor,
                seat.sit_stand,
                'seat'
              )
          )
        )
      );
  }

  getTablesByRoomId(roomId: string): Observable<TableInterface[]> {
    return this.http
      .get<TableInterface[]>(`${Table.TABLE_API_URL}/room/${roomId}`)
      .pipe(
        map((tables) =>
          tables.map(
            (table) =>
              new Table(
                table.room, // Assuming `room` is a property expected by the Table constructor
                table.id,
                table.x,
                table.y,
                table.width,
                table.height,
                table.rotation || 0,
                table.selectedForResizing || false,
                table.radius,
                table.is_circle,
                'table'
              )
          )
        )
      );
  }

  submitForm(roomId: string) {
    const transformedCurrentTables = RoomItem.transformItemsForBackend(
      this.getCurrentTables()
    );
    const transformedCurrentSeats = RoomItem.transformItemsForBackend(
      this.getCurrentSeats()
    );

    const newTables = transformedCurrentTables.filter(
      (table) => table.id <= -1
    );

    const existingTables = transformedCurrentTables.filter(
      (table) => table.id > -1
    );

    const newSeats = transformedCurrentSeats.filter((seat) => seat.id <= -1);
    const existingSeats = transformedCurrentSeats.filter(
      (seat) => seat.id > -1
    );

    const deletedSeats = this.deletedItems$
      .getValue()
      .filter((seat) => 'shorthand' in seat) as Seat[];

    this.processSeats(newSeats, existingSeats, deletedSeats);

    const deletedTables = this.deletedItems$
      .getValue()
      .filter((table) => 'radius' in table) as Table[];

    this.processTables(newTables, existingTables, deletedTables);
  }

  private processSeats(
    newSeats: any[],
    existingSeats: any[],
    deletedSeats: any[]
  ) {
    // Create new seats
    if (newSeats.length > 0) {
      this.createSeats(newSeats).subscribe({
        next: (response) => console.log('New seats created:', response),
        error: (error) => console.error('Error creating seats:', error.message)
      });
    }

    // Update existing seats
    if (existingSeats.length > 0) {
      this.updateSeats(existingSeats).subscribe({
        next: (response) => console.log('Existing seats updated:', response),
        error: (error) => console.error('Error updating seats:', error.message)
      });
    }

    // Delete seats that are confirmed to exist in the database
    if (deletedSeats.length > 0) {
      this.deleteSeats(deletedSeats).subscribe({
        next: (response) => console.log('Seats deleted:', response),
        error: (error) => console.error('Error deleting seats:', error.message)
      });
    }
  }

  private processTables(
    newTables: any[],
    existingTables: any[],
    deletedTables: any[]
  ) {
    // Create new seats
    if (newTables.length > 0) {
      this.createTables(newTables).subscribe({
        next: (response) => console.log('New tables created:', response),
        error: (error) => console.error('Error creating tables:', error.message)
      });
    }

    // Update existing seats
    if (existingTables.length > 0) {
      this.updateTables(existingTables).subscribe({
        next: (response) => console.log('Existing tables updated:', response),
        error: (error) => console.error('Error updating tables:', error.message)
      });
    }

    // Delete seats that are confirmed to exist in the database
    if (deletedTables.length > 0) {
      this.deleteTables(deletedTables).subscribe({
        next: (response) => console.log('Tables deleted:', response),
        error: (error) => console.error('Error deleting tables:', error.message)
      });
    }
  }

  private createTables(newTables: TableInterface[]): Observable<any> {
    console.log(
      'Creating tables:',
      newTables.map((table) => table.id)
    );

    const requests = newTables.map((table) => {
      return this.http.post(`${Table.TABLE_API_URL}`, table).pipe(
        catchError((error) => {
          console.error('Error creating table:', error);
          return throwError(
            () =>
              new Error(
                'Failed to create table due to an error: ' + error.message
              )
          );
        })
      );
    });

    return forkJoin(requests).pipe(
      tap((responses) => console.log('All tables created:', responses)),
      catchError((error) => {
        console.error('Error in creating multiple tables:', error.message);
        return throwError(
          () =>
            new Error(
              'Failed to create multiple tables due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  private updateTables(existingTables: TableInterface[]): Observable<any> {
    console.log(
      'Updating tables:',
      existingTables.map((table) => table.id)
    );

    if (existingTables.length === 1) {
      return this.http.put(`${Table.TABLE_API_URL}`, existingTables[0]).pipe(
        catchError((error) => {
          console.error('Error updating table:', error);
          return throwError(
            () =>
              new Error(
                'Failed to update table due to an error: ' + error.message
              )
          );
        })
      );
    }

    const requests = existingTables.map((table) => {
      return this.http.put(`${Table.TABLE_API_URL}/multiple`, [table]).pipe(
        catchError((error) => {
          console.error('Error updating table:', error);
          return throwError(
            () =>
              new Error(
                'Failed to update table due to an error: ' + error.message
              )
          );
        })
      );
    });

    return forkJoin(requests).pipe(
      tap((responses) => console.log('All tables updated:', responses)),
      catchError((error) => {
        console.error(
          'Error in updating multiple tables:',
          error.error.message
        );
        return throwError(
          () =>
            new Error(
              'Failed to update multiple tables due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  private deleteTables(deletedTables: TableInterface[]): Observable<any> {
    console.log(
      'Deleting tables:',
      deletedTables.map((table) => table.id)
    );

    if (deletedTables.length === 1) {
      return this.http
        .delete(`${Table.TABLE_API_URL}/${deletedTables[0].id}`)
        .pipe(
          catchError((error) => {
            console.error('Error deleting table:', error);
            return throwError(
              () =>
                new Error(
                  'Failed to delete table due to an error: ' + error.message
                )
            );
          })
        );
    }

    const requests = deletedTables.map((table) => {
      return this.http.delete(`${Table.TABLE_API_URL}/${table.id}`).pipe(
        catchError((error) => {
          console.error('Error deleting table:', error);
          return throwError(
            () =>
              new Error(
                'Failed to delete table due to an error: ' + error.message
              )
          );
        })
      );
    });

    return forkJoin(requests).pipe(
      tap((responses) => console.log('All tables deleted:', responses)),
      catchError((error) => {
        console.error('Error in deleting multiple tables:', error.message);
        return throwError(
          () =>
            new Error(
              'Failed to delete multiple tables due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  private deleteSeats(seats: SeatInterface[]): Observable<any> {
    console.log(
      'Deleting seats:',
      seats.map((seat) => seat.id)
    );

    if (seats.length === 1) {
      return this.http.delete(`${Seat.SEAT_API_URL}/${seats[0].id}`).pipe(
        catchError((error) => {
          console.error('Error deleting seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to delete seat due to an error: ' + error.message
              )
          );
        })
      );
    }

    const requests = seats.map((seat) => {
      return this.http.delete(`${Seat.SEAT_API_URL}/${seat.id}`).pipe(
        catchError((error) => {
          console.error('Error deleting seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to delete seat due to an error: ' + error.message
              )
          );
        })
      );
    });

    return forkJoin(requests).pipe(
      tap((responses) => console.log('All seats deleted:', responses)),
      catchError((error) => {
        console.error('Error in deleting multiple seats:', error.message);
        return throwError(
          () =>
            new Error(
              'Failed to delete multiple seats due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  private createSeats(seats: SeatInterface[]): Observable<any> {
    console.log(
      'Creating seats:',
      seats.map((seat) => seat.id)
    );

    if (seats.length === 1) {
      return this.http.post(`${Seat.SEAT_API_URL}`, seats[0]).pipe(
        catchError((error) => {
          console.error('Error creating seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to create seat due to an error: ' + error.message
              )
          );
        })
      );
    }

    const requests = seats.map((seat) => {
      return this.http.post(`${Seat.SEAT_API_URL}`, seat).pipe(
        catchError((error) => {
          console.error('Error creating seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to create seat due to an error: ' + error.message
              )
          );
        })
      );
    });

    return forkJoin(requests).pipe(
      tap((responses) => console.log('All seats created:', responses)),
      catchError((error) => {
        console.error('Error in creating multiple seats:', error.error.message);
        return throwError(
          () =>
            new Error(
              'Failed to create multiple seats due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  private updateSeats(seats: SeatInterface[]): Observable<any> {
    // If there's only one seat to update, make a single PUT request
    if (seats.length === 1) {
      return this.http.put(`${Seat.SEAT_API_URL}`, seats[0]).pipe(
        catchError((error) => {
          console.error('Error updating seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to update seat due to an error: ' + error.message
              )
          );
        })
      );
    }

    // Map each seat to an individual PUT request observable
    const requests = seats.map((seat) => {
      return this.http.put(`${Seat.SEAT_API_URL}/multiple`, [seat]).pipe(
        catchError((error) => {
          console.error('Error updating seat:', error);
          return throwError(
            () =>
              new Error(
                'Failed to update seat due to an error: ' + error.message
              )
          );
        })
      );
    });

    // Use forkJoin to wait for all PUT requests to complete
    return forkJoin(requests).pipe(
      tap((responses) => console.log('All seats updated:', responses)),
      catchError((error) => {
        console.error('Error in updating multiple seats:', error.error.message);
        return throwError(
          () =>
            new Error(
              'Failed to update multiple seats due to an error: ' +
                error.message
            )
        );
      })
    );
  }

  resetServiceState(): void {
    // Clear the arrays being tracked by BehaviorSubjects
    this.roomItemsSource.next([]);
    this.deletedItems$.next([]);
    this.alignmentLinesSource.next([]);

    // Reset single item states
    this.selectedItem = null;
    this.copiedItem = null;
    this.resizingItem = null;
    this.isItemBeingMoved = false;

    this.updateRoomItemCard(null);
  }
}
