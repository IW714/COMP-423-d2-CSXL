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
import { Seat, SeatAvailability } from 'src/app/coworking/coworking.models';

@Component({
  selector: 'seating-chart',
  templateUrl: './seating-chart.widget.html',
  styleUrls: ['./seating-chart.widget.css']
})
export class SeatingChart implements OnInit, OnChanges {
  @Input() room!: Room;
  @Input() seat_availability!: SeatAvailability[];
  @Input() selection_limit?: number;
  @Input() update_selected_seats?: SeatAvailability[];
  @Input() can_select_unavailable?: boolean;
  @Output() seatsSelected = new EventEmitter<SeatAvailability[]>();

  protected selected_seats: SeatAvailability[];

  constructor(private snackBar: MatSnackBar) {
    this.selected_seats = [];
  }

  ngOnInit() {
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

    if (!seat.reservable || seat.availability[0].start > now) {
      if (!this.can_select_unavailable) {
        this.snackBar.open('This seat is unavailable', 'Close', {
          duration: 3000
        });
        return;
      }
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
    const epsilon = 59 /* seconds */ * 1000; /* milliseconds */
    const now = new Date(Date.now() + epsilon);
    const isSelected =
      this.selected_seats.findIndex((s) => s.id === seat.id) != -1;

    if (!seat.reservable || seat.availability[0].start > now) {
      if (!isSelected) return 'assets/seat-grey.png';
    }

    return isSelected ? 'assets/seat-yellow.png' : 'assets/seat-green.png';
  }
}
