import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Room } from 'src/app/academics/academics.models';
//import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'room-map',
  templateUrl: './room-map.widget.html',
  styleUrls: ['./room-map.widget.css']
})
export class RoomMap {
  @Input() rooms?: Room[] | null;
  @Output() roomPressed = new EventEmitter<string>();

  constructor() {}

  /*
    this.rooms.forEach((room) => {
      room.safeSvg = this.sanitizer.bypassSecurityTrustHtml(room.svgContent);
    });
    */
}
