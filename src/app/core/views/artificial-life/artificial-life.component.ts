import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-artificial-life',
  templateUrl: './artificial-life.component.html',
  styleUrls: ['./artificial-life.component.scss']
})
export class ArtificialLifeComponent implements OnInit {
  public openingOff = false;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => { this.openingOff = true; }, 7500);
  }

}
