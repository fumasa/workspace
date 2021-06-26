import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Lightning } from './_models/lightning';
import { Point } from './_models/point';
import { Rect } from './_models/rect';

@Component({
  selector: 'lightning',
  template: `
    <canvas #lightning></canvas>
  `,
  styles: [
    'canvas {width:100%;height:100%}'
  ]
})
export class LightningComponent implements OnInit, AfterViewInit {

  @ViewChild('lightning', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  public context!: CanvasRenderingContext2D | null;

  public centerX: number = 0;
  public centerY: number = 0;
  public control = {
    childNum: 3,
    color: [255, 255, 255],
    static: true,
    backgroundColor: '#0b5693',
    lineWidth: 5
  };
  public bounds = new Rect();
  public grad!: CanvasGradient;
  public mouse = new Point();
  public points: Point[] = [];
  public lightning: Lightning = new Lightning();
  public tempLightings: Lightning[][] = [];

  constructor() {

  }

  ngOnInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.centerX = this.canvas.nativeElement.width * 0.5;
    this.centerY = this.canvas.nativeElement.height * 0.5;
    this.bounds = new Rect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.points = [
      new Point(this.centerX, this.centerY - 200, this.control.lineWidth * 1.25),
      new Point(this.centerX, this.centerY + 200, this.control.lineWidth * 1.25)
    ];
  }

  ngAfterViewInit(): void {
    this.context = this.canvas.nativeElement.getContext('2d');
    if (this.context !== null) {
      this.grad = this.context.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, Math.sqrt(this.centerX * this.centerX + this.centerY * this.centerY));
      this.grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      this.grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

      this.loop();
    }
  }

  loop() {
    if (this.context !== null) {
      this.context.save();
      this.context.fillStyle = this.control.backgroundColor;
      this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.context.fillStyle = this.grad;
      this.context.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.context.restore();

      this.lightning.startPoint.Set(this.points[0]);
      this.lightning.endPoint.Set(this.points[1]);
      const lightningLength = this.lightning.length();

      let count = 0;

      for (let i = 0; i < this.points.length; i++) {
        const p = this.points[i];
        if (p.dragging) p.drag(this.mouse);
        p.update(this.points, this.bounds, this.control.static);
        var isActive = false;
        if (p.temporary) {
          for (let j = 0; j < i; j++) {
            if (this.points[j].active && this.points[j].distanceTo(p) < lightningLength) {
              isActive = true;
              if (this.tempLightings[j] === undefined) {
                this.tempLightings[j] = [];
              }
              if (this.tempLightings[j][i] === undefined) {
                this.tempLightings[j][i] = new Lightning(this.points[j], p, 3);
              } else {
                this.tempLightings[j][i].startPoint.Set(this.points[j]);
                this.tempLightings[j][i].endPoint.Set(p);
              }
              this.tempLightings[j][i].step = Math.ceil(this.tempLightings[j][i].length() / 10);
              if (this.tempLightings[j][i].step < 5) this.tempLightings[j][i].step = 5;
              this.tempLightings[j][i].amplitude = 0.3;
              // tempLightings[j][i].lineWidth = lightning.lineWidth * 0.3;
              this.tempLightings[j][i].update();
              this.tempLightings[j][i].draw(this.context);
              count++;
            }
          }
          p.active = isActive;
        }
        p.draw(this.context);
      }

      this.lightning.step = Math.ceil(lightningLength / 10);
      if (this.lightning.step < 5) this.lightning.step = 5;

      // if (count > 2) {
      //   lightning.lineWidth = Math.ceil(lightning.lineWidth / (count * 1));
      //   if (lightning.lineWidth < 0.1) lightning.lineWidth = 0.1;
      // }

      this.lightning.update();
      this.lightning.draw(this.context);
      
      window.requestAnimationFrame(this.loop);
    }
  }

}
