import { Point } from "./point";

export class Vector {
  constructor(public x: number = 0, public y: number = 0) {
  }

  public set(x: number, y: number): Vector {
    this.x = x || 0;
    this.y = y || 0;
    return this;
  }

  add(v: Vector): Vector {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector): Vector {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  scale(s: number): Vector {
    this.x *= s;
    this.y *= s;
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector {
    var len = Math.sqrt(this.x * this.x + this.y * this.y);
    if (len) {
      this.x /= len;
      this.y /= len;
    }
    return this;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  distanceTo(v: Vector): number {
    var dx = v.x - this.x,
      dy = v.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceToSq(v: Vector): number {
    var dx = v.x - this.x,
      dy = v.y - this.y;
    return dx * dx + dy * dy;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }

  public static add(a: Vector, b: Vector): Vector {
    return new Vector(a.x + b.x, a.y + b.y);
  }

  public static sub(a: Vector, b: Vector): Vector {
    return new Vector(a.x - b.x, a.y - b.y);
  }
}