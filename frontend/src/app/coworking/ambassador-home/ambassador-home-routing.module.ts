import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmbassadorXlListComponent } from './ambassador-xl/list/ambassador-xl-list.component';
import { AmbassadorPageComponent } from './ambassador-home.component';
import { AmbassadorRoomListComponent } from './ambassador-room/list/ambassador-room-list.component';
import { AmbassadorMapComponent } from './ambassador-map/ambassador-map.component';

const routes: Routes = [
  {
    path: '',
    component: AmbassadorPageComponent,
    children: [
      AmbassadorXlListComponent.Route,
      AmbassadorMapComponent.Route,
      AmbassadorRoomListComponent.Route
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmbassadorHomeRoutingModule {}
