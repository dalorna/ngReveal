import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-neural',
  templateUrl: './neural.component.html',
  styleUrls: ['./neural.component.scss']
})
export class NeuralComponent implements OnInit {

  private readonly INPUT_NEURONS = 4;
  private readonly HIDDEN_NEURONS = 3;
  private readonly OUTPUT_NEURONS = 4;
  private readonly LEARN_RATE = 0.2;
  /* Input to Hidden Weights (with Biases) */
  private weightsInputToHidden = [];
  /* Hidden to Output Weights (with Biases) */
  private weightsHiddenToOutput = [];
  /* Activations */
  private inputs = [];
  private hidden = [];
  private target = [];
  private actual = [];
  /* Unit Errors */
  private errOutput = [];
  private errHidden = [];

  /* Sample Data*/
  /* H  K  G  E   A  R  W  H*/
  private samples = [
    [new Player( 2, 0, 0, 0), new Action(0, 0, 1, 0)],
    [new Player( 2, 0, 0, 1), new Action(0, 0, 1, 0)],
    [new Player( 2, 0, 1, 1), new Action(1, 0, 0, 0)],
    [new Player( 2, 0, 1, 2), new Action(1, 0, 0, 0)],
    [new Player( 2, 1, 0, 2), new Action(0, 0, 0, 1)],
    [new Player( 2, 1, 0, 1), new Action(1, 0, 0, 0)],

    [new Player( 1, 0, 0, 0), new Action(0, 0, 1, 0)],
    [new Player( 1, 0, 0, 1), new Action(0, 0, 0, 1)],
    [new Player( 1, 0, 1, 1), new Action(1, 0, 0, 0)],
    [new Player( 1, 0, 1, 2), new Action(0, 0, 0, 1)],
    [new Player( 1, 1, 0, 2), new Action(0, 0, 0, 1)],
    [new Player( 1, 1, 0, 1), new Action(0, 0, 0, 1)],

    [new Player( 0, 0, 0, 0), new Action(0, 0, 1, 0)],
    [new Player( 0, 0, 0, 1), new Action(0, 0, 0, 1)],
    [new Player( 0, 0, 1, 1), new Action(0, 0, 0, 1)],
    [new Player( 0, 0, 1, 2), new Action(0, 1, 0, 0)],
    [new Player( 0, 1, 0, 2), new Action(0, 1, 0, 0)],
    [new Player( 0, 1, 0, 1), new Action(0, 0, 0, 1)]
  ];

  public trainingDone = false;
  public finalError = 0;
  public actions = ['Attack', 'Run', 'Wander', 'Hide'];
  private errorsTotal = [];
  public neuralForm: FormGroup;
  public highlightAttack = false;
  public highlightRun = false;
  public highlightWander = false;
  public highlightHide = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.neuralForm = this.fb.group({
      health: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+$')]),
      knife: new FormControl(null, [Validators.required, Validators.pattern('^[0-1]+$')]),
      gun: new FormControl(null, [Validators.required, Validators.pattern('^[0-1]+$')]),
      enemy: new FormControl(null, [Validators.required, Validators.pattern('^[0-3]+$')])
    });
  }

  smallRandom(): number {
    return (Math.random() * (0.50 - (-0.500)) - 0.500);
  }

  assignRandomWeights(): void {
    for (let i = 0; i < this.INPUT_NEURONS + 1; i++) {
      this.weightsInputToHidden.push([]);
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        this.weightsInputToHidden[i].push([]);
        this.weightsInputToHidden[i][h] = this.smallRandom();
      }
    }

    for (let h = 0; h < this.HIDDEN_NEURONS + 1; h++ ) {
      this.weightsHiddenToOutput.push([]);
      for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
        this.weightsHiddenToOutput[h].push([]);
        this.weightsHiddenToOutput[h][o] = this.smallRandom();
      }
    }
  }

  sigmoid(val: number): number {
    return 1.0 / (1.0 + Math.exp(-val));
  }

  sigmoidDerivative(val: number): number {
    return (val * (1.0 - val));
  }

  feedForward(): void {
    let sum = 0;
    this.actual = [];
    /* Calculate input to hidden layer */
    for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
      sum = 0;
      for (let i = 0; i < this.INPUT_NEURONS; i++) {
        sum += this.inputs[i] * this.weightsInputToHidden[i][h];
      }

      /* Add in Bias*/
      sum += this.weightsInputToHidden[this.INPUT_NEURONS][h];
      this.hidden[h] = this.sigmoid(sum);
    }
    /* Calculate the hidden to output layer */
    for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
      sum = 0;
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        sum += this.hidden[h] * this.weightsHiddenToOutput[h][o];
      }
      /* Add in Bias*/
      sum += this.weightsHiddenToOutput[this.HIDDEN_NEURONS][o];
      this.actual[o] = this.sigmoid(sum);
    }
  }

  backPropagate(): void {
    /* Calculate the error of the output layer */
    for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
      this.errOutput[o] = (this.target[o] - this.actual[o]) * this.sigmoidDerivative(this.actual[o]);
    }

    /* Calculate the hidden layer error */
    for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
      this.errHidden[h] = 0;
      for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
        this.errHidden[h] += this.errOutput[o] * this.weightsHiddenToOutput[h][o];
      }
      this.errHidden[h] *= this.sigmoidDerivative(this.hidden[h]);
    }

    /* Update the weights for the output layer */
    for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        this.weightsHiddenToOutput[h][o] += (this.LEARN_RATE * this.errOutput[o] * this.hidden[h]);
      }
      /* Update the Bias*/
      this.weightsHiddenToOutput[this.HIDDEN_NEURONS][o] += (this.LEARN_RATE * this.errOutput[o]);
    }

    /* Update the weights for the hidden layer */
    for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
      for (let i = 0; i < this.INPUT_NEURONS; i++) {
        this.weightsInputToHidden[i][h] += (this.LEARN_RATE * this.errHidden[h] * this.inputs[i]);
      }
      /* Update the Bias */
      this.weightsInputToHidden[this.INPUT_NEURONS][h] += (this.LEARN_RATE * this.errHidden[h]);
    }
  }

  trainNetwork(): void {
    this.trainingDone = false;
    this.errorsTotal = [];
    this.assignRandomWeights();

    // let sampleNumber = 0;
    let err = 0;
    for (let i = 0; i < 100000; i++) {
      this.inputs = [];
      this.target = [];
      const sampleNumber = Math.floor(Math.random() * 18);
      this.inputs.push(this.samples[sampleNumber][0]['health']);
      this.inputs.push(this.samples[sampleNumber][0]['knife']);
      this.inputs.push(this.samples[sampleNumber][0]['gun']);
      this.inputs.push(this.samples[sampleNumber][0]['enemy']);

      this.target.push(this.samples[sampleNumber][1]['attack']);
      this.target.push(this.samples[sampleNumber][1]['run']);
      this.target.push(this.samples[sampleNumber][1]['wander']);
      this.target.push(this.samples[sampleNumber][1]['hide']);

      this.feedForward();

      err = 0;
      for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
        err += Math.pow(this.target[o] - this.actual[o], 2);
      }
      err = .5 * err;

      this.errorsTotal.push(err);
      this.backPropagate();
    }
    this.trainingDone = true;
    this.finalError = err;
    console.log('min Error: ', Math.min(...this.errorsTotal));
  }

  testNetwork(): void {
    for (let i = 0; i < this.samples.length; i++) {
      this.inputs = [];
      this.target = [];
      this.inputs.push(this.samples[i][0]['health']);
      this.inputs.push(this.samples[i][0]['knife']);
      this.inputs.push(this.samples[i][0]['gun']);
      this.inputs.push(this.samples[i][0]['enemy']);

      this.target.push(this.samples[i][1]['attack']);
      this.target.push(this.samples[i][1]['run']);
      this.target.push(this.samples[i][1]['wander']);
      this.target.push(this.samples[i][1]['hide']);

      this.feedForward();

      if (this.actions[this.target.indexOf(Math.max(...this.target))] !== this.actions[this.actual.indexOf(Math.max(...this.actual))]) {
        console.log('Target: ' + this.actions[this.target.indexOf(Math.max(...this.target))] + ' - Actual: ' +
          this.actions[this.actual.indexOf(Math.max(...this.actual))]);
        console.log('Samples', this.samples[i]);
        console.log('target', this.target);
        console.log('actual', this.actual);
      }
    }
  }

  useNetwork(): void {
    if (this.neuralForm.valid) {
      this.highlightAttack = false;
      this.highlightRun = false;
      this.highlightWander = false;
      this.highlightHide = false;
      this.inputs = [];
      this.target = [];
      this.inputs.push(parseInt(this.neuralForm.get('health').value, 10));
      this.inputs.push(parseInt(this.neuralForm.get('knife').value, 10));
      this.inputs.push(parseInt(this.neuralForm.get('gun').value, 10));
      this.inputs.push(parseInt(this.neuralForm.get('enemy').value, 10));

      this.feedForward();
      switch (this.actions[this.actual.indexOf(Math.max(...this.actual))]) {
        case 'Attack': this.highlightAttack = true; break;
        case 'Run': this.highlightRun = true; break;
        case 'Wander': this.highlightWander = true; break;
        case 'Hide': this.highlightHide = true; break;
      }
    }
  }
}
class Player {
  constructor(h, k, g, e) {
    this.health = h;
    this.knife = k;
    this.gun = g;
    this.enemy = e;
  }
  health: number;
  knife: number;
  gun: number;
  enemy: number;
}
class Action {
  constructor(a, r, w, h) {
    this.attack = a;
    this.run = r;
    this.wander = w;
    this.hide = h;
  }
  attack: number;
  run: number;
  wander: number;
  hide: number;
}
