export class AlignmentLine {
  x1: number;
  x2: number;
  y1: number;
  y2: number;

  static ALIGNMENT_LINE_THRESHOLD = 30;

  constructor(x1: number, x2: number, y1: number, y2: number) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }
}
