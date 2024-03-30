import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Room } from 'src/app/academics/academics.models';
//import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'room-map',
  templateUrl: './room-map.widget.html',
  styleUrls: ['./room-map.widget.css']
})
export class RoomMap implements OnInit {
  @Input() rooms?: Room[] | null;
  @Output() roomPressed = new EventEmitter<string>();
  /*rooms: {
    id: number;
    x: number;
    y: number;
    svgContent: string;
    safeSvg?: SafeHtml;
  }[] = [
    { id: 1, x: 0, y: 0, svgContent: "<rect width='25' height='25'/>" },
    { id: 2, x: 50, y: 50, svgContent: "<rect width='25' height='25'/>" },
    { id: 3, x: 50, y: 100, svgContent: "<rect width='25' height='25'/>" },
    { id: 4, x: 50, y: 0, svgContent: "<rect width='25' height='25'/>" }
  ];
  */

  constructor(private router: Router) {}

  ngOnInit(): void {
    /*
    this.rooms.forEach((room) => {
      room.safeSvg = this.sanitizer.bypassSecurityTrustHtml(room.svgContent);
    });
    */
    this.rooms?.forEach((room) => console.log(room.id));
  }
}
