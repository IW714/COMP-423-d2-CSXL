/**
 * The Room editor page enables the administrator to add and edit
 * rooms.
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @copyright 2023
 * @license MIT
 */

import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PermissionService } from 'src/app/permission.service';
import { profileResolver } from 'src/app/profile/profile.resolver';
import {
  roomResolver,
  termResolver
} from 'src/app/academics/academics.resolver';
import { Room, Term } from 'src/app/academics/academics.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AcademicsService } from 'src/app/academics/academics.service';
import { Profile } from 'src/app/models.module';
import { DatePipe } from '@angular/common';
import { RoomItemService } from '../room-item.service';
import { Subject, Subscribable, Subscription } from 'rxjs';
import { RoomItem, RoomItemInterface } from '../room-item';

const canActivateEditor: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  /** Determine if page is viewable by user based on permissions */

  let id: string = route.params['id'];

  if (id === 'new') {
    return inject(PermissionService).check('room.create', 'room');
  } else {
    return inject(PermissionService).check('room.update', `room/${id}`);
  }
};
@Component({
  selector: 'app-room-editor',
  templateUrl: './room-editor.component.html',
  styleUrls: ['./room-editor.component.css']
})
export class RoomEditorComponent implements OnInit {
  public static Route: Route = {
    path: 'room/edit/:id',
    component: RoomEditorComponent,
    title: 'Room Editor',
    resolve: {
      profile: profileResolver,
      room: roomResolver
    }
  };

  public profile: Profile | null = null;
  public room: Room;
  public roomId: string = 'new';
  itemSubscription!: Subscription;
  selectedItem!: RoomItemInterface | null;

  maxRoomWidth = 30;
  maxRoomLength = 24;

  id = new FormControl('', [Validators.required]);
  nickname = new FormControl('', [Validators.required]);
  building = new FormControl('', [Validators.required]);
  roomName = new FormControl('', [Validators.required]);
  capacity = new FormControl(0, [Validators.required]);
  reservable = new FormControl(false, [Validators.required]);
  width = new FormControl({ value: 26.25, disabled: true }, [
    Validators.required,
    Validators.max(this.maxRoomWidth)
  ]);
  length = new FormControl({ value: 26.25, disabled: true }, [
    Validators.required,
    Validators.max(this.maxRoomLength)
  ]);

  public roomForm = this.formBuilder.group({
    id: this.id,
    nickname: this.nickname,
    building: this.building,
    room: this.roomName,
    capacity: this.capacity,
    reservable: this.reservable,
    width: this.width,
    length: this.length
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    protected formBuilder: FormBuilder,
    protected snackBar: MatSnackBar,
    private academicsService: AcademicsService,
    private roomItemService: RoomItemService
  ) {
    const data = this.route.snapshot.data as { profile: Profile; room: Room };
    this.profile = data.profile;
    this.room = data.room;
    this.roomId = this.route.snapshot.params['id'];
  }

  ngOnInit(): void {
    this.roomForm.setValue({
      id: this.room.id,
      nickname: this.room.nickname,
      building: this.room.building,
      room: this.room.room,
      capacity: this.room.capacity,
      reservable: this.room.reservable,
      width: this.room.width / 10,
      length: this.room.height / 10
    });

    if (this.roomId == 'new') {
      this.roomForm.get('width')?.enable();
      this.roomForm.get('length')?.enable();

      this.room.reservable = true;
      this.academicsService.updateRoom(this.room).subscribe({
        next: (room) => this.onSuccess(room),
        error: (err) => this.onError(err)
      });
    }

    this.itemSubscription = this.roomItemService.selectedItem$.subscribe(
      (item) => {
        this.selectedItem = item; // This will update even if item is null
      }
    );
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      Object.assign(this.room, this.roomForm.value);

      if (this.roomId == 'new') {
        this.academicsService.createRoom(this.room).subscribe({
          next: (room) => this.onSuccess(room),
          error: (err) => this.onError(err)
        });
      } else {
        this.academicsService.updateRoom(this.room).subscribe({
          next: (room) => this.onSuccess(room),
          error: (err) => this.onError(err)
        });
      }
      this.roomItemService.submitForm(this.roomId);
    }
  }

  private onSuccess(room: Room): void {
    this.router.navigate(['/academics/admin/room']);
    this.snackBar.open(
      this.roomId === 'new' ? 'Room Created' : 'Room Updated',
      '',
      { duration: 2000 }
    );
  }

  private onError(err: any): void {
    this.snackBar.open(
      this.roomId === 'new'
        ? 'Error: Room Not Created'
        : 'Error: Room Not Updated',
      '',
      { duration: 2000 }
    );
  }

  createSeat(): void {
    this.roomItemService.createSeat(this.roomId);
  }

  createTable(): void {
    this.roomItemService.createTable(this.roomId);
  }

  validateRoomDimensionInput(event: KeyboardEvent, maxLimit: number) {
    const inputElement = event.target as HTMLInputElement;
    let proposedValue = inputElement.value + event.key;

    // Allow backspace, delete, arrows, and control commands (like Ctrl+C, Ctrl+V)
    if (
      ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(event.key) ||
      event.ctrlKey
    ) {
      return; // Allow normal control operations without interference
    }

    // Block characters that aren't digits or necessary input control keys
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Convert the proposed value to an integer and check if it's within the allowed range
    if (parseInt(proposedValue) > maxLimit || parseInt(proposedValue) <= 0) {
      event.preventDefault();
      return;
    }
  }
}
