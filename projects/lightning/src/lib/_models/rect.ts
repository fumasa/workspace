export class Rect {
  constructor (public x: number = 0, public y: number = 0, public width: number = 0, public height: number = 0 ) {
  }

  public get right(): number {
    return this.x + this.width;
  }

  public get bottom(): number {
    return this.y + this.height;
  }
  
}