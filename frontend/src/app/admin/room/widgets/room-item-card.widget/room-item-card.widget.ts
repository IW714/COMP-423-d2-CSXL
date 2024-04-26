import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RoomItem, RoomItemInterface } from '../../room-item';
import { Seat } from '../../seat';
import { Table } from '../../table';
import { RoomItemService } from '../../room-item.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'room-item-card',
  templateUrl: './room-item-card.widget.html',
  styleUrls: ['./room-item-card.widget.css']
})
export class RoomItemCard implements OnChanges, OnInit, OnDestroy {
  @Input() item!: RoomItemInterface;
  itemForm: FormGroup;
  private itemSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private roomItemService: RoomItemService,
    private snackBar: MatSnackBar
  ) {
    this.itemForm = this.fb.group({
      title: [''],
      x: ['', Validators.required],
      y: ['', Validators.required],
      shape: [''],
      width: [''],
      height: [''],
      radius: [''],
      rotation: [''],
      reservable: [''],
      has_monitor: [''],
      sit_stand: ['']
    });

    this.handleShapeChange();
  }

  ngOnInit() {
    this.itemSubscription = this.roomItemService.selectedItem$.subscribe(
      (item) => {
        if (item) {
          this.item = item;
          this.setupForm(item);
        }
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item'] && changes['item'].currentValue) {
      this.setupForm(changes['item'].currentValue);
    }
  }

  ngOnDestroy() {
    if (this.itemSubscription) {
      this.itemSubscription.unsubscribe();
    }
  }

  private setupForm(item: RoomItemInterface): void {
    this.itemForm.reset({
      title: 'title' in item ? item.title : '',
      x: item.x || '',
      y: item.y || '',
      width: item.width || '',
      height: item.height || '',
      shape: this.isTable(item)
        ? item.is_circle
          ? 'circle'
          : 'rectangle'
        : null,
      // Defaults to radius 20 when switching from rectangle to circle
      radius: 'radius' in item ? item.radius : 20,
      rotation: this.isTable(item)
        ? item.is_circle
          ? 0
          : item.rotation
        : item.rotation,
      reservable: 'reservable' in item ? item.reservable : '',
      has_monitor: 'has_monitor' in item ? item.has_monitor : '',
      sit_stand: 'sit_stand' in item ? item.sit_stand : ''
    });

    // Apply appropriate validators
    this.toggleFieldsBasedOnShape(this.itemForm.value.shape);
    this.itemForm
      .get('shape')!
      .valueChanges.subscribe((shape) => this.toggleFieldsBasedOnShape(shape));
  }

  private handleShapeChange(): void {
    this.itemForm.get('shape')!.valueChanges.subscribe((shape) => {
      const isCircle = shape === 'circle';
      this.itemForm
        .get('radius')!
        .setValidators(
          isCircle ? [Validators.required, Validators.min(10)] : null
        );
      this.itemForm
        .get('width')!
        .setValidators(
          !isCircle ? [Validators.required, Validators.min(20)] : null
        );
      this.itemForm
        .get('height')!
        .setValidators(
          !isCircle ? [Validators.required, Validators.min(20)] : null
        );

      this.itemForm.get('radius')!.updateValueAndValidity();
      this.itemForm.get('width')!.updateValueAndValidity();
      this.itemForm.get('height')!.updateValueAndValidity();
      if (isCircle) {
        this.itemForm.get('radius')!.setValue(20);
      }
    });
  }

  private toggleFieldsBasedOnShape(shape: string): void {
    if (shape === 'circle') {
      this.itemForm.get('width')!.disable();
      this.itemForm.get('height')!.disable();
      this.itemForm.get('radius')!.enable();
    } else {
      this.itemForm.get('width')!.enable();
      this.itemForm.get('height')!.enable();
      this.itemForm.get('radius')!.disable();
    }
  }

  private isTable(item: RoomItemInterface): item is Table {
    return item.type === 'table';
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.snackBar.open('Please correct errors before updating!', 'Close', {
        duration: 3000
      });
      return;
    }

    const updatedValues = this.itemForm.value;
    console.log(updatedValues);
    if (this.isTable(this.item)) {
      updatedValues.is_circle = updatedValues.shape === 'circle';
      if (updatedValues.is_circle) {
        updatedValues.rotation = 0;
      }
    }
    this.roomItemService.updateItem({ ...this.item, ...updatedValues });
    this.snackBar.open('Item updated successfully!', 'Close', {
      duration: 3000
    });
  }
}
