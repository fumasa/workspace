import * as SimplexNoise from "simplex-noise";
import { randint, random } from "../_helpers/random";
import { Point } from "./point";
import { Vector } from "./vector";

export class Lightning {
  public color = 'rgba(255, 255, 255, 1)';
  public speed = 0.025;
  public amplitude = 1;
  public lineWidth = 5;
  public blur = 50;
  public blurColor = 'rgba(255, 255, 255, 0.5)';
  public points: Point[] = [];
  public off = 0;

  private _simplexNoise: SimplexNoise | null = new SimplexNoise();
  private children: Lightning[] = [];

  private _timeoutId!: ReturnType<typeof setTimeout>;
  private parent!: Lightning;
  private startStep = 0;
  private endStep = 0;

  constructor (public startPoint: Point = new Point(), public endPoint: Point = new Point(), public step = 45, child = 0) {

    this.setChildNum(child);

    this.startPoint.active = true;
    this.endPoint.active = true;
  }

  public length() {
    return this.startPoint.distanceTo(this.endPoint);
  }

  public getChildNum() {
    return this.children.length;
  }

  public setChildNum(num: number) {
    const len = this.children.length;

    if (len > num) {
      for (let i = num; i < len; i++) {
        this.children[i].dispose();
      }
      this.children.splice(num, len - num);

    } else {
      for (let i = len; i < num; i++) {
        const child = new Lightning();
        child._setAsChild(this);
        this.children.push(child);
      }
    }
  }

  public update() {
    if (this.parent) {
      if (this.endStep > this.parent.step) {
        this._updateStepsByParent();
      }

      this.startPoint.Set(this.parent.points[this.startStep]);
      this.endPoint.Set(this.parent.points[this.endStep]);
    }

    const length = this.length();
    const normal = Vector.sub(this.endPoint, this.startPoint).normalize().scale(length / this.step);
    const radian = normal.angle();
    const sinv = Math.sin(radian);
    const cosv = Math.cos(radian);

    this.points = [];
    const off = this.off += random(this.speed, this.speed * 0.2);
    let  waveWidth = (this.parent ? length * 1.5 : length) * this.amplitude;
    if (waveWidth > 750) waveWidth = 750;

    for (let i = 0, len = this.step + 1; i < len; i++) {
      const n = i / 60;
      const av = waveWidth * this._noise(n - off) * 0.5;
      const ax = sinv * av;
      const ay = cosv * av;

      const bv = waveWidth * this._noise(n + off) * 0.5;
      const bx = sinv * bv;
      const by = cosv * bv;

      const m = Math.sin((Math.PI * (i / (len - 1))));

      const x = this.startPoint.x + normal.x * i + (ax - bx) * m;
      const y = this.startPoint.y + normal.y * i - (ay - by) * m;

      this.points.push(new Point(x, y));
    }

    for (let i = 0, len = this.children.length; i < len; i++) {
      const child = this.children[i];
      child.color = this.color;
      child.speed = this.speed * 1.35;
      child.amplitude = this.amplitude;
      child.lineWidth = this.lineWidth * 0.75;
      child.blur = this.blur;
      child.blurColor = this.blurColor;
      this.children[i].update();
    }
  }

  public draw(ctx: CanvasRenderingContext2D) {
    // Blur
    if (this.blur) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.shadowBlur = this.blur;
      ctx.shadowColor = this.blurColor;
      ctx.beginPath();
      for (let i = 0, len = this.points.length; i < len; i++) {
        const p = this.points[i];
        const d = len > 1 ? p.distanceTo(this.points[i === len - 1 ? i - 1 : i + 1]) : 0;
        ctx.moveTo(p.x + d, p.y);
        ctx.arc(p.x, p.y, d, 0, Math.PI * 2, false);
      }
      ctx.fill();
      ctx.restore();
    }

    ctx.save();
    ctx.lineWidth = random(this.lineWidth, 0.5);
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    for (let i = 0, len = this.points.length; i < len; i++) {
      const p = this.points[i];
      ctx[i === 0 ? 'moveTo' : 'lineTo'](p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();

    // Draw children
    for (let i = 0, len = this.children.length; i < len; i++) {
      this.children[i].draw(ctx);
    }
  }

  private dispose() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
    }
    this._simplexNoise = null;

    this.startPoint.active = false;
    this.endPoint.active = false;
  }

  private _noise(v: number): number {
    if (this._simplexNoise === null) this._simplexNoise = new SimplexNoise();
    var octaves = 6,
      fallout = 0.5,
      amp = 1, f = 1, sum = 0,
      i;

    for (i = 0; i < octaves; ++i) {
      amp *= fallout;
      sum += amp * (this._simplexNoise.noise2D(v * f, 0) + 1) * 0.5;
      f *= 2;
    }

    return sum;
  }

  private _setAsChild(lightning: Lightning) {
    this.parent = lightning;

    var self = this,
      setTimer = function () {
        self._updateStepsByParent();
        self._timeoutId = setTimeout(setTimer, randint(1500));
      };

    self._timeoutId = setTimeout(setTimer, randint(1500));
  }

  private _updateStepsByParent() {
    if (!this.parent) return;
    var parentStep = this.parent.step;
    this.startStep = randint(parentStep - 2);
    this.endStep = this.startStep + randint(parentStep - this.startStep - 2) + 2;
    this.step = this.endStep - this.startStep;
  }
}