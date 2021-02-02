import { Component, OnInit } from '@angular/core';
import {fabric} from 'fabric';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.css']
})
export class DrawingCanvasComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const canvas = new fabric.Canvas('canvas');
    canvas.setHeight(400);
    canvas.setWidth(400);
    const lines: any[] = [];
    lines.push(new fabric.Line([0, 25, 400, 25], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 50, 400, 50], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 75, 400, 75], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 100, 400, 100], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 125, 400, 125], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 150, 400, 150], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 175, 400, 175], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 200, 400, 200], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 225, 400, 225], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 250, 400, 250], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 275, 400, 275], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 300, 400, 300], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 325, 400, 325], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 350, 400, 350], {stroke: 'blue'}));
    lines.push(new fabric.Line([0, 375, 400, 375], {stroke: 'blue'}));

    lines.push(new fabric.Line([25, 0, 25, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([50, 0, 50, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([75, 0, 75, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([100, 0, 100, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([125, 0, 125, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([150, 0, 150, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([175, 0, 175, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([200, 0, 200, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([225, 0, 225, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([250, 0, 250, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([275, 0, 275, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([300, 0, 300, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([325, 0, 325, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([350, 0, 350, 400], {stroke: 'blue'}));
    lines.push(new fabric.Line([375, 0, 375, 400], {stroke: 'blue'}));
    canvas.add(...lines);
    const text = new fabric.Text('25',
      {
        left: 5,
        top: 5,
        fontSize: 9,
        fontStyle: 'italic',
        fontFamily: 'Delicious',
        stroke: '#000'
      }
      );
    const rect = new fabric.Rect({ width: 20, height: 20, fill: '#f55', opacity: 0.7, top: 2.5, left: 27.5 });
    canvas.add(text);
    canvas.add(rect);
    canvas.renderAll();
  }
}
