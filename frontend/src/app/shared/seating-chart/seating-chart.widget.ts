import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Room } from 'src/app/academics/academics.models';
import { SeatInterface } from 'src/app/admin/room/seat';
import { SeatAvailability } from 'src/app/coworking/coworking.models';

@Component({
  selector: 'seating-chart',
  templateUrl: './seating-chart.widget.html',
  styleUrls: ['./seating-chart.widget.css']
})
export class SeatingChart implements OnInit, OnChanges {
  @Input() room!: Room;
  @Input() seat_availability!: SeatAvailability[];
  @Input() selection_limit?: number;
  @Input() viewOnly?: boolean;
  @Input() update_selected_seats?: SeatAvailability[];
  @Input() can_select_unavailable?: boolean;
  @Output() seatsSelected = new EventEmitter<SeatAvailability[]>();

  protected selected_seats: SeatAvailability[];
  protected viewOnlySeats: SeatInterface[];

  constructor(private snackBar: MatSnackBar) {
    this.selected_seats = [];
    this.viewOnlySeats = [];
  }

  ngOnInit() {
    console.log(this.seat_availability); // Debug to see the room object and its seats

    if (this.room && this.room.seats) {
      const seatIdsInAvailability = new Set(
        this.seat_availability.map((seat) => seat.id)
      );

      // Filter out seats that are in seat_availability
      this.viewOnlySeats = this.room.seats.filter(
        (seat) => !seatIdsInAvailability.has(seat.id)
      );
    }
    this.selected_seats = [];
  }

  ngOnChanges() {
    const epsilon = 59 /* seconds */ * 1000; /* milliseconds */
    const now = new Date(Date.now() + epsilon);

    if (this.update_selected_seats) {
      this.selected_seats = this.update_selected_seats;
      console.log(this.selected_seats);
    }

    if (this.can_select_unavailable) return;

    const before = this.selected_seats.length;

    this.selected_seats = this.selected_seats.filter((seat) => {
      const found = this.seat_availability.find((s) => s.id === seat.id);
      if (found) return found.availability[0].start <= now;
      else return false;
    });

    if (this.selected_seats.length < before) {
      this.snackBar.open(
        'Sorry, the seat(s) you have selected are now unavailable.',
        'Close',
        {
          duration: 3000
        }
      );
      this.seatsSelected.emit(this.selected_seats);
    }
  }

  seatClicked(seat: SeatAvailability): void {
    const epsilon = 59 /* seconds */ * 1000; /* milliseconds */
    const now = new Date(Date.now() + epsilon);

    if (
      seat.availability.length === 0 ||
      !seat.reservable ||
      seat.availability[0].start > now
    ) {
      this.snackBar.open('This seat is unavailable', 'Close', {
        duration: 3000
      });
      return;
    }
    // functionality will need to be changed when hooked up to reservation system

    const index = this.selected_seats.findIndex((s) => s.id === seat.id);
    if (index > -1) {
      if (
        this.selection_limit &&
        this.selected_seats.length > this.selection_limit
      ) {
        this.selected_seats = [];
      } else this.selected_seats.splice(index, 1);
    } else {
      if (
        this.selection_limit &&
        this.selected_seats.length == this.selection_limit
      ) {
        this.snackBar.open(
          `Cannot select more than ${this.selection_limit} seats`,
          'Close',
          {
            duration: 3000
          }
        );
        return;
      }
      this.selected_seats.push(seat);
    }
    this.seatsSelected.emit(this.selected_seats);
  }

  getImagePath(seat: SeatAvailability): string {
    if (this.viewOnly) {
      return 'assets/seat-yellow.png';
    }

    const epsilon = 59 /* seconds */ * 1000; /* milliseconds */
    const now = new Date(Date.now() + epsilon);
    const isSelected =
      this.selected_seats.findIndex((s) => s.id === seat.id) != -1;

    if (
      seat.availability.length === 0 ||
      !seat.reservable ||
      seat.availability[0].start > now
    ) {
      return 'assets/seat-grey.png';
    }

    let seatTypePath = '';
    if (seat.has_monitor && seat.sit_stand) {
      seatTypePath = 'assets/seat-purple.png';
    } else if (seat.has_monitor) {
      seatTypePath = 'assets/seat-green.png';
    } else {
      seatTypePath = 'assets/seat-red.png';
    }

    return isSelected ? 'assets/seat-yellow.png' : seatTypePath;
  }

  viewOnlyGetImagePath(): string {
    return 'assets/seat-grey.png';
  }
}
