import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Room } from 'src/app/academics/academics.models';
import { SeatAvailability } from 'src/app/coworking/coworking.models';

@Component({
  selector: 'seating-chart',
  templateUrl: './seating-chart.widget.html',
  styleUrls: ['./seating-chart.widget.css']
})
export class SeatingChart implements OnInit {
  @Input() room!: Room;
  @Input() seat_availability!: SeatAvailability[];
  @Input() selection_limit?: number;
  @Output() seatsSelected = new EventEmitter<SeatAvailability[]>();

  protected selected_seats: SeatAvailability[];

  constructor(private snackBar: MatSnackBar) {
    this.selected_seats = [];
  }

  ngOnInit() {
    console.log(this.seat_availability); // Debug to see the room object and its seats
  }

  seatClicked(seat: SeatAvailability): void {
    const epsilon = 59 /* seconds */ * 1000; /* milliseconds */
    const now = new Date(Date.now() + epsilon);

    if (!seat.reservable || seat.availability[0].start > now) {
      this.snackBar.open('This seat is unavailable', 'Close', {
        duration: 3000
      });
      return;
    }
    // functionality will need to be changed when hooked up to reservation system

    const index = this.selected_seats.indexOf(seat);
    if (index > -1) {
      this.selected_seats.splice(index, 1);
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

    if (!seat.reservable || seat.availability[0].start > now) {
      return 'assets/seat-grey.png';
    }
    const isSelected = this.selected_seats.includes(seat);
    return isSelected ? 'assets/seat-yellow.png' : 'assets/seat-green.png';
  }
}
