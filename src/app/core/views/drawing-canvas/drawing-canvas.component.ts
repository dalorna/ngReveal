import { Component, OnInit, AfterViewInit } from '@angular/core';
import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';

@Component({
  selector: 'app-drawing-canvas',
  templateUrl: './drawing-canvas.component.html',
  styleUrls: ['./drawing-canvas.component.css']
})
export class DrawingCanvasComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
    const canvasEl = (document.getElementById('canvas') as HTMLCanvasElement);
    const context = canvasEl.getContext('2d');
    context.fillStyle = 'red';
    context.fillRect(100, 100, 20, 20);

  }

  ngAfterViewInit(): void {
    // Reveal.initialize(document.querySelector('.reveal'), {
    //   plugins: [Markdown, Highlight]
    // });
  }

}
