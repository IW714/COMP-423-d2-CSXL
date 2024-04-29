import { Component } from '@angular/core';
import { permissionGuard } from 'src/app/permission.guard';
import { Observable, map, take, timer } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, Router } from '@angular/router';
import {
  CoworkingStatus,
  Reservation,
  SeatAvailability
} from '../../coworking.models';
import { CoworkingService } from '../../coworking.service';
import { AcademicsService } from 'src/app/academics/academics.service';
import { Room } from 'src/app/academics/academics.models';
import { OnInit } from '@angular/core';
import { AmbassadorXlService } from '../ambassador-xl/ambassador-xl.service';

@Component({
  selector: 'app-ambassador-map',
  templateUrl: './ambassador-map.component.html',
  styleUrls: ['./ambassador-map.component.css']
})
export class AmbassadorMapComponent implements OnInit {
  public selectedSeats: SeatAvailability[];
  public status$: Observable<CoworkingStatus>;
  public XL?: Room;
  public reservation?: Reservation[];

  public static Route: Route = {
    path: 'map',
    component: AmbassadorMapComponent,
    title: 'XL Map View',
    canActivate: [permissionGuard('coworking.reservation.*', '*')],
    resolve: {}
  };
  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private coworkingService: CoworkingService,
    private academicsService: AcademicsService,
    private ambassadorService: AmbassadorXlService
  ) {
    this.status$ = coworkingService.status$;
    academicsService.getRoom('SN156').subscribe((room) => (this.XL = room));
    this.selectedSeats = [];
  }

  ngOnInit(): void {
    this.selectedSeats = [];
    this.status$ = this.coworkingService.status$;
    this.coworkingService.pollStatus();
    this.academicsService
      .getRoom('SN156')
      .subscribe((room) => (this.XL = room));
  }

  seatSelected(seatSelection: SeatAvailability[]) {
    this.reservation = undefined;
    this.selectedSeats = seatSelection;
    if (seatSelection.length === 0) {
      this.coworkingService.pollStatus();
      return;
    }
    this.ambassadorService.fetchReservations();
    this.ambassadorService.reservations$
      .pipe(take(1))
      .pipe(
        map((reservations) =>
          reservations.filter((r) => {
            console.log(r);
            if (r.state !== 'CHECKED_OUT')
              return (
                r.seats.filter((s) => s.id === seatSelection[0].id).length > 0
              );
            else return false;
          })
        )
      )
      .subscribe({
        error: () => {},
        next: (value) => {
          this.reservation = value;
          if (!value || value.length === 0) return;
          this.status$.pipe(take(1)).subscribe((status) => {
            this.selectedSeats = status.seat_availability.filter((seat) =>
              value[0].seats.find((s) => s.id === seat.id)
            );
            this.updateWidget();
          });
        }
      });
  }

  updateWidget() {
    /* 
      wait for 50ms so that widget has time to reload with updated selected seat
      and then set update to be false and trigger a reload of coworking status
      to update the seat to be available
    */
    timer(50, 100)
      .pipe(take(1))
      .subscribe((value) => {
        this.coworkingService.pollStatus();
      });
  }

  checkIn(reservation: Reservation) {
    this.ambassadorService.checkIn(reservation);
    this.snackBar.open(
      `Checked In ${reservation.users[0].first_name}!`,
      'Close',
      {
        duration: 3000
      }
    );
    this.selectedSeats = [];
    this.reservation = undefined;
    this.updateWidget();
  }

  cancel(reservation: Reservation) {
    this.ambassadorService.cancel(reservation);
    this.snackBar.open(
      `Canceled ${reservation.users[0].first_name}'s reservation!`,
      'Close',
      {
        duration: 3000
      }
    );
    this.selectedSeats = [];
    this.reservation = undefined;
    this.updateWidget();
  }

  checkOut(reservation: Reservation) {
    this.ambassadorService.checkOut(reservation);
    this.snackBar.open(
      `Checked Out ${reservation.users[0].first_name}!`,
      'Close',
      {
        duration: 3000
      }
    );
    this.selectedSeats = [];
    this.reservation = undefined;
    this.updateWidget();
  }
}
