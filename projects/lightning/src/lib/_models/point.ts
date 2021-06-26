import { random } from "../_helpers/random";
import { Rect } from "./rect";
import { Vector } from "./vector";

export class Point extends Vector {
  private _vector: Vector;

  public color = 'rgb(255, 255, 255)';
  public dragging = false;
  public temporary = false;
  public active = false;
  public _easeRadius: number;
  public _currentRadius: number;
  public _latestDrag!: Point;

  constructor(public x: number = 0, public y: number = 0, public radius: number = 7) {
    super(x, y);
    this._vector = new Vector(x || random(1, -1), y || random(1, -1)).normalize();
    this._easeRadius = this.radius;
    this._currentRadius = this.radius;
  }

  public update(points: Point[], bounds: Rect, $static = false) {
    if (this.active) {
      this._currentRadius = random(this._easeRadius, this._easeRadius * 0.35);
      this._easeRadius += (this.radius - this._easeRadius) * 0.1;
    }
    if (this.dragging) return;
    if ($static) return;

    const vec = this._vector;
    for (let i = 0, len = points.length; i < len; i++) {
      const p = points[i];
      if (p !== this) {
        const d = this.distanceToSq(p);
        if (d < 90000) {
          vec.add(Vector.sub(this, p).normalize().scale(0.03));
        } else if (d > 250000) {
          vec.add(Vector.sub(p, this).normalize().scale(0.015));
        }
      }
    }
    if (vec.length() > 3) vec.normalize().scale(3);
    this.add(vec);
    if (this.x < bounds.x) {
      this.x = bounds.x;
      if (vec.x < 0) vec.x *= -1;
    } else if (this.x > bounds.right) {
      this.x = bounds.right;
      if (vec.x > 0) vec.x *= -1;
    }

    if (this.y < bounds.y) {
      this.y = bounds.y;
      if (vec.y < 0) vec.y *= -1;
    } else if (this.y > bounds.bottom) {
      this.y = bounds.bottom;
      if (vec.y > 0) vec.y *= -1;
    }
  }

  public hitTest(p: Point): boolean {
    if (this.distanceToSq(p) < 900) {
      this._easeRadius = this.radius * 2.5;
      return true;
    }
    return false;
  }

  public Set(p: Point): Point {
    super.set(p.x, p.y);
    return this;
  }

  public startDrag() {
    this.dragging = true;
    this._vector.set(0, 0);
    this._latestDrag = new Point().Set(this);
  }

  public drag(p: Point) {
    this._latestDrag.Set(this);
    this.Set(p);
  }

  public endDrag() {
    this._vector = Vector.sub(this, this._latestDrag);
    this.dragging = false;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this._currentRadius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.restore();
  }
}