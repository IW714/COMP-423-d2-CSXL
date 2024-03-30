import { Component } from '@angular/core';
import { Route } from '@angular/router';
import { isAuthenticated } from 'src/app/gate/gate.guard';
import { profileResolver } from 'src/app/profile/profile.resolver';

@Component({
  selector: 'app-room-selection',
  templateUrl: './room-selection.component.html',
  styleUrls: ['./room-selection.component.css']
})
export class RoomSelectionComponent {
  public static Route: Route = {
    path: 'selection/:id',
    component: RoomSelectionComponent,
    canActivate: [isAuthenticated],
    resolve: { profile: profileResolver }
  };
}
