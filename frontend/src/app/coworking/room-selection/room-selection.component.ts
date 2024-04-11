import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  ResolveFn,
  Route,
  Router
} from '@angular/router';
import { Observable } from 'rxjs';
import { Room } from 'src/app/academics/academics.models';
import { AcademicsService } from 'src/app/academics/academics.service';
import { isAuthenticated } from 'src/app/gate/gate.guard';
import { profileResolver } from 'src/app/profile/profile.resolver';
import { CoworkingStatus, Seat, SeatAvailability } from '../coworking.models';
import { roomResolver } from 'src/app/academics/academics.resolver';
import { Profile } from 'src/app/profile/profile.service';
import { CoworkingService } from '../coworking.service';
import { PermissionService } from 'src/app/permission.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  /* needs to be amended with what is in organization-details component in order to display the room name in the title */

  public static Route: Route = {
    path: 'selection/:id',
    component: RoomSelectionComponent,
    canActivate: [isAuthenticated],
    resolve: { profile: profileResolver, room: roomResolver },
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
    private snackBar: MatSnackBar
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
  }

  ngOnInit(): void {
    this.status$ = this.coworkingService.status$;
    this.coworkingService.pollStatus();
    console.log(this.room);
  }

  seatsSelected(seats: SeatAvailability[]): void {
    this.selectedSeats = seats;
    console.log(seats);
  }

  navigateToNewReservation() {
    this.router.navigate(['/coworking']);
  }

  reserve(seatSelection: SeatAvailability[]) {
    this.coworkingService.draftReservation(seatSelection).subscribe({
      error: (error) => {
        this.snackBar.open(error.error.message, '', { duration: 3000 });
        console.log(error);
      },
      next: (reservation) => {
        this.router.navigateByUrl(`/coworking/reservation/${reservation.id}`);
      }
    });
  }
}
