import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public marker;
  public item;

  constructor() {
  }

  ngOnInit(): void {
    this.marker = document.querySelector('#marker');
    this.item = document.querySelectorAll('ul li a');
    this.item.forEach(link => link.addEventListener('mousemove', (e) => { this.indicator(e.target); }));
  }

  indicator(e): void {
    this.marker.style.top = e.offsetTop + 'px';
    this.marker.style.width = e.offsetWidth + 'px';
  }
}
