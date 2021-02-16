import {Component, OnInit} from '@angular/core';
import {fabric} from 'fabric';

@Component({
  selector: 'app-artificial-life',
  templateUrl: './artificial-life.component.html',
  styleUrls: ['./artificial-life.component.scss']
})
export class ArtificialLifeComponent implements OnInit {
  private NumberOfCarnivores = 3;
  private NumberOfHerbivores = 5;
  private NumberOfPlants = 15;
  private lineHeight = 25;
  private lineWidth = 25;
  public gridHeight = 400;
  public gridWidth = 400;
  public openingOff = false;
  public canvas;
  public Herbivores: Herbivore[] = [];
  public Carnivores: Carnivore[] = [];
  public Plants: Plant[] = [];
  public PlantColor = '#004018';
  public HerbivoreColor = '#9E7400';
  public CarnivoreColor = '#C40010';
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => {
      this.openingOff = true;
      }, 5000);
    setTimeout(() => {
      this.setUpGrid();
      this.setUpAgents();
      setInterval(() => {
        this.createTurn();
      }, 1000);
    }, 5500);
  }

  setUpGrid(): void {
    this.canvas = new fabric.Canvas('aLifeCanvas');
    this.canvas.setHeight(this.gridHeight);
    this.canvas.setWidth(this.gridWidth);
    const lines: any[] = [];
    for (let h = this.lineHeight; h < this.gridHeight; h += this.lineHeight) {
      lines.push(new fabric.Line([0, h, this.gridWidth, h], {stroke: 'blue'}));
    }
    for (let h = this.lineWidth; h < this.gridWidth; h += this.lineWidth) {
      lines.push(new fabric.Line([h, 0, h, this.gridHeight], {stroke: 'blue'}));
    }
    this.canvas.add(...lines);
    this.canvas.renderAll();
  }
  setUpAgents(): void {
    const maxX = (this.gridWidth / this.lineWidth) - 1;
    const maxY = (this.gridHeight / this.lineHeight) - 1;
    for (let i = 0; i < this.NumberOfPlants; i++) {
      this.Plants.push(new Plant(this.PlantColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), Math.floor(Math.random() * 31)));
    }
    for (let i = 0; i < this.NumberOfHerbivores; i++) {
      this.Herbivores.push(new Herbivore(this.HerbivoreColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), 'H_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight));
    }
    for (let i = 0; i < this.NumberOfCarnivores; i++) {
      this.Carnivores.push(new Carnivore(this.CarnivoreColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), 'C_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight));
    }

  }
  async createTurn(): Promise<void> {
    const alivePlants = this.Plants.filter(f => !f.dead);
    this.Plants = [];
    this.Plants.push(...alivePlants);
    const aliveHerbs = this.Herbivores.filter(f => !f.dead);
    this.Herbivores = [];
    this.Herbivores.push(...aliveHerbs);
    const aliveCarnivores = this.Carnivores.filter(f => !f.dead);
    this.Carnivores = [];
    this.Carnivores.push(...aliveCarnivores);
    const herbOnGrid = this.canvas.getObjects().filter(f => f.fill === this.HerbivoreColor);
    const plantOnGrid = this.canvas.getObjects().filter(f => f.fill === this.PlantColor);
    const carnivoresOnGrid = this.canvas.getObjects().filter(f => f.fill === this.CarnivoreColor);
    for (const h of herbOnGrid) {
      this.canvas.remove(h);
    }
    for (const p of plantOnGrid) {
      this.canvas.remove(p);
    }
    for (const c of carnivoresOnGrid) {
      this.canvas.remove(c);
    }
    if (this.Herbivores.length < this.NumberOfHerbivores) {
      const maxX = (this.gridWidth / this.lineWidth) - 1;
      const maxY = (this.gridHeight / this.lineHeight) - 1;
      for (let i = 0; i < (this.NumberOfHerbivores - this.Herbivores.length); i++) {
        this.Herbivores.push(new Herbivore(this.HerbivoreColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), 'H_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight));
      }
    }
    if (this.Plants.length < this.NumberOfPlants) {
      const maxX = (this.gridWidth / this.lineWidth) - 1;
      const maxY = (this.gridHeight / this.lineHeight) - 1;
      for (let i = 0; i < (this.NumberOfPlants - this.Plants.length); i++) {
        this.Plants.push(new Plant(this.PlantColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), Math.floor(Math.random() * 31)));
      }
    }

    if (this.Carnivores.length < this.NumberOfCarnivores) {
      const maxX = (this.gridWidth / this.lineWidth) - 1;
      const maxY = (this.gridHeight / this.lineHeight) - 1;
      for (let i = 0; i < (this.NumberOfCarnivores - this.Carnivores.length); i++) {
        this.Carnivores.push(new Carnivore(this.CarnivoreColor, Math.floor(Math.random() * maxX), Math.floor(Math.random() * maxY), 'C_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight));
      }
    }
    for (const p of this.Plants) {
      p.grow();
      const adjust = 2.5;
      const l = (p.location[0] * this.lineWidth) === this.gridWidth ? adjust : (p.location[0] * this.lineWidth) + adjust;
      const t = (p.location[1] * this.lineHeight) === this.gridHeight ? adjust : (p.location[1] * this.lineHeight) + adjust;
      const o = (p.health / 25).toFixed(1);
      const rect = new fabric.Rect({width: 20, height: 20, fill: p.color, opacity: o, top: t, left: l});
      this.canvas.add(rect);
    }
    let stork = [];
    for (const h of this.Herbivores) {
      const baby = await h.action(this.gatherInputs(h.location[0], h.location[1]));
      if (!!baby) {
        stork.push(baby);
      }
      const adjust = 2.5;
      const l = (h.location[0] * this.lineWidth) === this.gridWidth ? adjust : (h.location[0] * this.lineWidth) + adjust;
      const t = (h.location[1] * this.lineHeight) === this.gridHeight ? adjust : (h.location[1] * this.lineHeight) + adjust;
      const rect = new fabric.Rect({width: 20, height: 20, fill: h.color, opacity: (h.health / 25).toFixed(2), top: t, left: l});
      this.canvas.add(rect);
    }
    if (stork.length > 0) {
      this.Herbivores.push(...stork);
    }
    stork = [];
    for (const c of this.Carnivores) {
      const baby = await c.action(this.gatherInputs(c.location[0], c.location[1]));
      if (!!baby) {
        stork.push(baby);
      }
      const adjust = 2.5;
      const l = (c.location[0] * this.lineWidth) === this.gridWidth ? adjust : (c.location[0] * this.lineWidth) + adjust;
      const t = (c.location[1] * this.lineHeight) === this.gridHeight ? adjust : (c.location[1] * this.lineHeight) + adjust;
      const rect = new fabric.Rect({width: 20, height: 20, fill: c.color, opacity: (c.health / 25).toFixed(2), top: t, left: l});
      this.canvas.add(rect);
    }

    this.canvas.renderAll();
  }
  gatherInputs(x: number, y: number): any[] {
    const p1 = this.Plants.find(f => f.location[0] === x - 2 && f.location[1] === y);
    const p2 = this.Plants.find(f => f.location[0] === x - 1 && f.location[1] === y);
    const p3 = this.Plants.find(f => f.location[0] === x && f.location[1] === y);
    const p4 = this.Plants.find(f => f.location[0] === x + 2 && f.location[1] === y);
    const p5 = this.Plants.find(f => f.location[0] === x - 2 && f.location[1] === y);

    const p6 = this.Plants.find(f => f.location[0] === x - 2 && f.location[1] === y - 1);
    const p7 = this.Plants.find(f => f.location[0] === x - 1 && f.location[1] === y - 1);
    const p8 = this.Plants.find(f => f.location[0] === x && f.location[1] === y - 1);
    const p9 = this.Plants.find(f => f.location[0] === x + 1 && f.location[1] === y - 1);
    const p10 = this.Plants.find(f => f.location[0] === x + 2 && f.location[1] === y - 1);

    const p11 = this.Plants.find(f => f.location[0] === x - 2 && f.location[1] === y - 2);
    const p12 = this.Plants.find(f => f.location[0] === x - 1 && f.location[1] === y - 2);
    const p13 = this.Plants.find(f => f.location[0] === x && f.location[1] === y - 2);
    const p14 = this.Plants.find(f => f.location[0] === x + 1 && f.location[1] === y - 2);
    const p15 = this.Plants.find(f => f.location[0] === x + 2 && f.location[1] === y - 2);

    const h1 = this.Herbivores.find(f => f.location[0] === x - 2 && f.location[1] === y);
    const h2 = this.Herbivores.find(f => f.location[0] === x - 1 && f.location[1] === y);
    const h3 = this.Herbivores.find(f => f.location[0] === x && f.location[1] === y);
    const h4 = this.Herbivores.find(f => f.location[0] === x + 2 && f.location[1] === y);
    const h5 = this.Herbivores.find(f => f.location[0] === x - 2 && f.location[1] === y);

    const h6 = this.Herbivores.find(f => f.location[0] === x - 2 && f.location[1] === y - 1);
    const h7 = this.Herbivores.find(f => f.location[0] === x - 1 && f.location[1] === y - 1);
    const h8 = this.Herbivores.find(f => f.location[0] === x && f.location[1] === y - 1);
    const h9 = this.Herbivores.find(f => f.location[0] === x + 1 && f.location[1] === y - 1);
    const h10 = this.Herbivores.find(f => f.location[0] === x + 2 && f.location[1] === y - 1);

    const h11 = this.Herbivores.find(f => f.location[0] === x - 2 && f.location[1] === y - 2);
    const h12 = this.Herbivores.find(f => f.location[0] === x - 1 && f.location[1] === y - 2);
    const h13 = this.Herbivores.find(f => f.location[0] === x && f.location[1] === y - 2);
    const h14 = this.Herbivores.find(f => f.location[0] === x + 1 && f.location[1] === y - 2);
    const h15 = this.Herbivores.find(f => f.location[0] === x + 2 && f.location[1] === y - 2);

    const c1 = this.Carnivores.find(f => f.location[0] === x - 2 && f.location[1] === y);
    const c2 = this.Carnivores.find(f => f.location[0] === x - 1 && f.location[1] === y);
    const c3 = this.Carnivores.find(f => f.location[0] === x && f.location[1] === y);
    const c4 = this.Carnivores.find(f => f.location[0] === x + 2 && f.location[1] === y);
    const c5 = this.Carnivores.find(f => f.location[0] === x - 2 && f.location[1] === y);

    const c6 = this.Carnivores.find(f => f.location[0] === x - 2 && f.location[1] === y - 1);
    const c7 = this.Carnivores.find(f => f.location[0] === x - 1 && f.location[1] === y - 1);
    const c8 = this.Carnivores.find(f => f.location[0] === x && f.location[1] === y - 1);
    const c9 = this.Carnivores.find(f => f.location[0] === x + 1 && f.location[1] === y - 1);
    const c10 = this.Carnivores.find(f => f.location[0] === x + 2 && f.location[1] === y - 1);

    const c11 = this.Carnivores.find(f => f.location[0] === x - 2 && f.location[1] === y - 2);
    const c12 = this.Carnivores.find(f => f.location[0] === x - 1 && f.location[1] === y - 2);
    const c13 = this.Carnivores.find(f => f.location[0] === x && f.location[1] === y - 2);
    const c14 = this.Carnivores.find(f => f.location[0] === x + 1 && f.location[1] === y - 2);
    const c15 = this.Carnivores.find(f => f.location[0] === x + 2 && f.location[1] === y - 2);
    return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, h1, h2, h3, h4, h5, h6, h7, h8, h9, h10, h11, h12, h13, h14, h15,
      c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15];
  }
}
class Herbivore implements Agent {
  constructor(_color: string, x: number, y: number, _name: string, _gh: number, _gw: number, _lh: number, _lw: number) {
    this.color = _color;
    this.createBrain();
    this.turns = 0;
    this.location = [x, y];
    this.health = 35;
    this.name = _name;
    this.gridHeight = _gh;
    this.gridWidth = _gw;
    this.lineHeight = _lh;
    this.lineWidth = _lw;
  }
  readonly name: string;
  readonly gridHeight: number;
  readonly gridWidth: number;
  readonly lineHeight: number;
  readonly lineWidth: number;
  public dead = false;
  public turns: number;
  public color: string;
  public weights: number[];
  public bias: number[];
  public health: number;
  public location: number[];

  public async action(inputs: any[]): Promise<any> {
    return new Promise<any>(resolve => {
      this.health -= 1;
      this.turns++;
      const act = this.feedForward(inputs);
      switch (act.toString()) {
        case 'Up':
          this.move(0, 1);
          break;
        case 'UpRight':
          this.move(1, 1);
          break;
        case 'Right':
          this.move(1, 0);
          break;
        case 'DownRight':
          this.move(1, -1);
          break;
        case 'Down':
          this.move(0, -1);
          break;
        case 'DownLeft':
          this.move(-1, -1);
          break;
        case 'Left':
          this.move(-1, 0);
          break;
        case 'UpLeft':
          this.move(-1, 1);
          break;
        case 'Eat':
          const plants = [inputs[1], inputs[2], inputs[6], inputs[7], inputs[8]];
          const index = plants.findIndex(f => !!f);
          this.eat(plants[index]);
          plants[index].dead = true;
          break;
      }
      let birth = null;
      if (this.health > 70) {
        birth = this.birth();
      }
      if (this.health <= 0) {
        this.dead = true;
      }
      return resolve(birth);
    });
  }
  public move(x: number, y: number): void {
    this.location[0] += x;
    this.location[1] += y;
    const maxX = this.gridWidth / this.lineWidth;
    const maxY = this.gridHeight / this.lineHeight;
    if (this.location[0] === maxX) {
      this.location[0] = 0;
    }
    if (this.location[0] === -1) {
      this.location[0] = maxX - 1;
    }
    if (this.location[1] === maxY) {
      this.location[1] = 0;
    }
    if ( this.location[1] === -1) {
      this.location[1] = maxY - 1;
    }
  }
  private birth(): Herbivore {
    const child = new Herbivore(this.color, this.location[0], this.location[1], 'H_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight);
    const biasRandom = Math.floor(Math.random() * 9);
    const weightRandom1 = Math.floor(Math.random() * 45);
    const weightRandom2 = Math.floor(Math.random() * 45);
    const weightRandom3 = Math.floor(Math.random() * 45);
    const childBias = [];
    const childWeights = [];
    childBias.push(...this.bias);
    childBias[biasRandom] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights.push(...this.weights);
    childWeights[weightRandom1] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights[weightRandom2] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights[weightRandom3] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    child.bias = childBias;
    child.weights = childWeights;
    child.location = [this.location[0] + 1, this.location[1]];
    this.health = 35;
    return child;
  }
  public eat(p: Plant): void {
    if (!p.dead) {
      this.health += p.health;
      p.dead = true;
    }
  }
  public feedForward(inputs: any[]): Action | string {
    const actionTaken = Object.values(Action);
    const plants = [inputs[1], inputs[2], inputs[6], inputs[7], inputs[8]];
    const index = plants.findIndex(f => !!f);
    const myInputs = [...inputs];
    const healthInput = this.health / 20 < 1 ? 4 : 1;
    myInputs.push(healthInput);
    const canEat = index > 0;

    const feedForwardCalc = [];
    for (let b = 0; b < this.bias.length; b++) {
      let sum = 0;
      for (let w = 0; w < this.weights.length; w++) {
        if ((b === 0 && canEat) || b !== 0) {
          sum += (!!inputs[w] ? 1 : 0) * this.weights[w];
        } else {
          sum += -10;
        }
      }
      sum += this.bias[b];
      feedForwardCalc.push(sum);
    }
    return actionTaken[feedForwardCalc.indexOf(Math.max(...feedForwardCalc))];
  }
  public createBrain(): void {
    this.weights = [];
    this.bias = [];
    for (let i = 0; i < 46; i++) {
      this.weights.push(Math.floor(Math.random() * 10) - 5);
    }
    for (let i = 0; i < 9; i++) {
      this.bias.push(Math.floor(Math.random() * 10) - 5);
    }
  }
}
class Carnivore implements Agent {
  constructor(_color, x: number, y: number, _name: string, _gh: number, _gw: number, _lh: number, _lw: number) {
    this.color = _color;
    this.createBrain();
    this.turns = 0;
    this.location = [x, y];
    this.name = _name;
    this.health = 35;
    this.gridHeight = _gh;
    this.gridWidth = _gw;
    this.lineHeight = _lh;
    this.lineWidth = _lw;
  }
  readonly gridHeight: number;
  readonly gridWidth: number;
  readonly lineHeight: number;
  readonly lineWidth: number;
  readonly name: string;
  public dead = false;
  public turns: number;
  public color: string;
  public weights: number[];
  public bias: number[];
  public health: number;
  public location: number[];
  public async action(inputs: any[]): Promise<any> {
    return new Promise<any>(resolve => {
      this.health -= 1;
      const act = this.feedForward(inputs);
      this.turns++;
      switch (act) {
        case Action.Up:
          this.move(0, 1);
          break;
        case Action.UpRight:
          this.move(1, 1);
          break;
        case Action.Right:
          this.move(1, 0);
          break;
        case Action.DownRight:
          this.move(1, -1);
          break;
        case Action.Down:
          this.move(0, -1);
          break;
        case Action.DownLeft:
          this.move(-1, -1);
          break;
        case Action.Left:
          this.move(-1, 0);
          break;
        case Action.UpLeft:
          this.move(-1, 1);
          break;
        case Action.Eat:
          const herbs = [inputs[16], inputs[17], inputs[21], inputs[22], inputs[23]];
          const index = herbs.findIndex(f => !!f);
          if (index > 0) {
            this.eat(herbs[index]);
            herbs[index].dead = true;
            herbs[index].health =  0;
          } else {
            this.move(Math.floor(Math.random() * 3) - 1, Math.floor(Math.random() * 3) - 1);
          }
          break;
      }
      let birth = null;
      if (this.health > 50) {
        birth = this.birth();
      }
      if (this.health <= 0) {
        this.dead = true;
      }
      return resolve(birth);
    });
  }
  public move(x: number, y: number): void {
    this.location[0] += x;
    this.location[1] += y;
    const maxX = this.gridWidth / this.lineWidth;
    const maxY = this.gridHeight / this.lineHeight;
    if (this.location[0] === maxX) {
      this.location[0] = 0;
    }
    if (this.location[0] === -1) {
      this.location[0] = maxX - 1;
    }
    if (this.location[1] === maxY) {
      this.location[1] = 0;
    }
    if ( this.location[1] === -1) {
      this.location[1] = maxY - 1;
    }
  }
  private birth(): Carnivore {
    const child = new Carnivore(this.color, this.location[0], this.location[1], 'C_' + Math.floor(Math.random() * 1000), this.gridHeight, this.gridWidth, this.lineHeight, this.lineHeight);
    const biasRandom = Math.floor(Math.random() * 9);
    const weightRandom1 = Math.floor(Math.random() * 45);
    const weightRandom2 = Math.floor(Math.random() * 45);
    const weightRandom3 = Math.floor(Math.random() * 45);
    const childBias = [];
    const childWeights = [];
    childBias.push(...this.bias);
    childBias[biasRandom] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights.push(...this.weights);
    childWeights[weightRandom1] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights[weightRandom2] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    childWeights[weightRandom3] += !!(Math.floor(Math.random() * 3) - 1) ? 1 : -1;
    child.bias = childBias;
    child.weights = childWeights;
    child.location = [this.location[0] + 1, this.location[1]];
    this.health = 45;
    return child;
  }
  public eat(h: Herbivore): void {
    this.health += (h.health * 2);
  }
  public feedForward(inputs: any[]): Action | string {
    const actionTaken = Object.values(Action);
    const herbs = [inputs[16], inputs[17], inputs[21], inputs[22], inputs[23]];
    const index = herbs.findIndex(f => !!f);
    const myInputs = [...inputs];
    const healthInput = this.health / 20 < 1 ? 4 : 1;
    myInputs.push(healthInput);
    const canEat = index > 0;
    const feedForwardCalc = [];
    for (let b = 0; b < this.bias.length; b++) {
      let sum = 0;
      for (let w = 0; w < this.weights.length; w++) {
        if ((b === 0 && canEat || b !== 0)){
          sum += (!!inputs[w] ? 1 : 0) * this.weights[w];
        } else {
          sum += -10;
        }
      }
      sum += this.bias[b];
      feedForwardCalc.push(sum);
    }
    return actionTaken[feedForwardCalc.indexOf(Math.max(...feedForwardCalc))];
  }
  public createBrain(): void {
    this.weights = [];
    this.bias = [];
    for (let i = 0; i < 46; i++) {
      this.weights.push(Math.floor(Math.random() * 10) - 5);
    }
    for (let i = 0; i < 9; i++) {
      this.bias.push(Math.floor(Math.random() * 10) - 5);
    }
  }
}
class Plant implements Agent {
  constructor(_color, _health, x: number, y: number) {
    this.color = _color;
    this.health = _health;
    this.location = [x, y];
    this.dead = false;
  }
  dead: boolean;
  color: string;
  health: number;
  location: number[];
  grow(): void {
    if (this.health < 50) {
      this.health += 1;
    }
  }

}
interface Agent {
  color: string;
  health: number;
  location: number[];
}
enum Action {

  Eat = 'Eat',
  Up = 'Up',
  UpRight = 'UpRight',
  Right = 'Right',
  DownRight = 'DownRight',
  Down = 'Down',
  DownLeft = 'DownLeft',
  Left = 'Left',
  UpLeft = 'UpLeft'
}
