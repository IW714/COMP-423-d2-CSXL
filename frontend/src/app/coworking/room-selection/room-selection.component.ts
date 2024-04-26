import { Component, OnInit, inject } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ResolveFn,
  Route,
  Router
} from '@angular/router';
import { Observable, take, timer } from 'rxjs';
import { Room } from 'src/app/academics/academics.models';
import { AcademicsService } from 'src/app/academics/academics.service';
import { isAuthenticated } from 'src/app/gate/gate.guard';
import { profileResolver } from 'src/app/profile/profile.resolver';
import { CoworkingStatus, SeatAvailability } from '../coworking.models';
import { roomResolver } from 'src/app/academics/academics.resolver';
import { Profile, PublicProfile } from 'src/app/profile/profile.service';
import { CoworkingService } from '../coworking.service';
import { PermissionService } from 'src/app/permission.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimeRange } from 'src/app/time-range';
import { AmbassadorXlService } from '../ambassador-home/ambassador-xl/ambassador-xl.service';
import { Location } from '@angular/common';

/** Injects the room's name to adjust the title. */
let titleResolver: ResolveFn<string> = (route: ActivatedRouteSnapshot) => {
  return (
    `${route.parent!.data['room']?.id} (${
      route.parent!.data['room'].nickname
    })` ?? 'Room Not Found'
  );
};

@Component({
  selector: 'app-room-selection',
  templateUrl: './room-selection.component.html',
  styleUrls: ['./room-selection.component.css']
})
export class RoomSelectionComponent implements OnInit {
  public room: Room;
  public selectedSeats: SeatAvailability[];
  public status$: Observable<CoworkingStatus>;
  public adminPermission$: Observable<boolean>;
  public ambassadorPermission$: Observable<boolean>;
  public seats: SeatAvailability[];
  public ambassadorUsers?: PublicProfile[];
  public update: Boolean = false;

  /* needs to be amended with what is in organization-details component in order to display the room name in the title */

  public static Route: Route = {
    path: 'selection/:id',
    component: RoomSelectionComponent,
    canActivate: [isAuthenticated],
    resolve: {
      profile: profileResolver,
      room: roomResolver
    },
    children: [
      {
        path: '',
        title: titleResolver,
        component: RoomSelectionComponent
      }
    ]
  };

  constructor(
    private route: ActivatedRoute,
    protected academicsService: AcademicsService,
    private router: Router,
    private coworkingService: CoworkingService,
    private permissionService: PermissionService,
    private ambassadorService: AmbassadorXlService,
    private snackBar: MatSnackBar,
    private location: Location
  ) {
    const data = this.route.snapshot.data as {
      profile: Profile;
      room: Room;
    };
    this.room = data.room;
    this.selectedSeats = [];
    //might need to add this in NgOnInit as well
    this.status$ = coworkingService.status$;
    this.adminPermission$ = this.permissionService.check(
      'admin.view',
      'admin/'
    );
    this.ambassadorPermission$ = this.permissionService.check(
      'coworking.reservation.*',
      '*'
    );
    this.seats = [];

    let state: any = location.getState();
    this.ambassadorUsers = state.users;
    console.log(this.ambassadorUsers);
  }

  ngOnInit(): void {
    /* 
    TODO: make it so that it only polls for status if the room is SN156,
          this requires changing the html ngIf logic
    */
    this.status$ = this.coworkingService.status$;
    this.coworkingService.pollStatus();
    this.room.seats?.forEach((seat) => {
      this.seats.push(Object.assign({}, seat, { availability: [] }));
    });
    console.log(this.room);
  }

  seatsSelected(seats: SeatAvailability[]): void {
    this.coworkingService.pollStatus();
    this.selectedSeats = seats;
  }

  navigateToNewReservation() {
    this.router.navigate(['/coworking']);
  }

  reserve(seatSelection: SeatAvailability[]) {
    const reservationRoom = {
      id: this.room.id,
      nickname: this.room.nickname // Assuming these fields exist on the Room object
    };

    if (this.ambassadorUsers) {
      this.ambassadorService
        .makeDropinReservation(seatSelection, this.ambassadorUsers)
        .subscribe({
          next: (reservation) => {
            this.snackBar.open(
              `Walk-in reservation made for ${reservation.users[0].first_name} ${reservation.users[0].last_name}!`,
              'Close',
              { duration: 3000 }
            );
            this.coworkingService.pollStatus();
            this.selectedSeats = [];
            this.updateWidget();
            this.router.navigate(['/coworking/ambassador']);
          },
          error: (e) => {
            this.snackBar.open(e.error.message, '', {
              duration: 3000
            });
          }
        });
      return;
    }
    this.coworkingService
      .draftReservation(seatSelection, reservationRoom)
      .subscribe({
        error: (error) => {
          this.snackBar.open(error.error.message, '', { duration: 3000 });
          this.selectedSeats = [];
        this.updateWidget();
        },
        next: (reservation) => {
          this.router.navigateByUrl(`/coworking/reservation/${reservation.id}`);
        }
      });
  }

  updateWidget() {
    this.update = true;
    timer(50, 100)
      .pipe(take(1))
      .subscribe((value) => {
        this.update = false;
        this.coworkingService.pollStatus();
      });
  }
}
