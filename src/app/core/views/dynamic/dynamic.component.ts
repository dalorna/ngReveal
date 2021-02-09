import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit {
  public dynamicForm: FormGroup;
  private INPUT_NEURONS: number;
  private HIDDEN_NEURONS: number;
  private OUTPUT_NEURONS: number;
  private HIDDEN_LAYERS: number;
  private LEARN_RATE: number;

  /* Input to Hidden Weights (with Biases) */
  private weightsInputToHidden = [];

  /* Hidden to Hidden Weights (with Biases) */
  private weightsHiddenToHidden = [];

  /* Hidden to Output Weights (with Biases) */
  private weightsHiddenToOutput = [];

  private hiddenLayerWeights = [];
  private hiddenErrorLayers = [];
  /* Activations */
  private inputs = [];
  private hidden = [];
  private hiddenLayersCalc = [];
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
  public actions = ['Attack', 'Run', 'Wander', 'Hide'];

  public totalErr = 100;
  constructor(private fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.dynamicForm = this.fb.group({
      inputs: new FormControl(null, [Validators.required]),
      outputs: new FormControl(null, [Validators.required]),
      hiddenLayers: new FormControl(null, [Validators.required]),
      hiddenNodes: new FormControl(null, [Validators.required]),
      learnRate: new FormControl(null, [Validators.required]),
      iterations: new FormControl(null, [Validators.required])
    });
    this.LEARN_RATE = .15;
    this.INPUT_NEURONS = 4;
    this.HIDDEN_LAYERS = 1;
    this.HIDDEN_NEURONS = 3;
    this.OUTPUT_NEURONS = 4;

    // this.trainNetwork();
    // this.testNetwork();
  }

  smallRandom(): number {
    return (Math.random() * (0.50 - (-0.500)) - 0.500);
  }

  assignRandomWeights(): void {
    for (let i = 0; i < this.INPUT_NEURONS + 1; i++) {
      this.weightsInputToHidden.push([]);
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        this.weightsInputToHidden[i].push([]);
        this.weightsInputToHidden[i][h] = this.smallRandom(); // (h + 1) + '_' + (i === this.INPUT_NEURONS ? 'b' : (i + 1));
      }
    }

    for (let l = 0; l < this.HIDDEN_LAYERS - 1; l++) {
      for (let i = 0; i < this.HIDDEN_NEURONS + 1; i++ ) {
        this.weightsHiddenToHidden.push([]);
        for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
          this.weightsHiddenToHidden[i].push([]);
          this.weightsHiddenToHidden[i][h] = this.smallRandom();
        }
      }
      this.hiddenLayerWeights.push(JSON.parse(JSON.stringify(this.weightsHiddenToHidden)));
      this.weightsHiddenToHidden = [];
    }

    for (let i = 0; i < this.HIDDEN_NEURONS + 1; i++ ) {
      this.weightsHiddenToOutput.push([]);
      for (let h = 0; h < this.OUTPUT_NEURONS; h++) {
        this.weightsHiddenToOutput[i].push([]);
        this.weightsHiddenToOutput[i][h] = this.smallRandom();
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
    this.hiddenLayersCalc = [];
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

    this.hiddenLayersCalc.push(JSON.parse(JSON.stringify(this.hidden)));
    let innerHidden = [];
    for (let l = 0; l < this.HIDDEN_LAYERS - 1; l++) {
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        sum = 0;
        for (let i = 0; i < this.HIDDEN_NEURONS; i++) {
          sum += this.hiddenLayersCalc[l][i] * this.hiddenLayerWeights[l][i][h];
        }

        /* Add in Bias*/
        sum += this.hiddenLayerWeights[l][this.HIDDEN_NEURONS][h];
        innerHidden.push(this.sigmoid(sum));
      }
      this.hidden = [];
      this.hiddenLayersCalc.push(JSON.parse(JSON.stringify(innerHidden)));
      this.hidden.push(...innerHidden);
      innerHidden = [];
    }
    const hiddenPop = this.hiddenLayersCalc.pop();
    if (this.hidden[0] !== hiddenPop[0]) {
      console.log('hiddenPop', hiddenPop);
      console.log('hidden', this.hidden);
    }

    /* Calculate the hidden to output layer */
    for (let h = 0; h < this.OUTPUT_NEURONS; h++) {
      sum = 0;
      for (let i = 0; i < this.HIDDEN_NEURONS; i++) {
        sum += this.hidden[i] * this.weightsHiddenToOutput[i][h];
      }
      /* Add in Bias*/
      sum += this.weightsHiddenToOutput[this.HIDDEN_NEURONS][h];
      this.actual[h] = this.sigmoid(sum);
    }
  }

  backPropagate(): void {
    this.hiddenErrorLayers = [];
    /* Calculate the error of the output layer */
    for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
      this.errOutput[o] = (this.target[o] - this.actual[o]) * this.sigmoidDerivative(this.actual[o]);
    }

    /* Calculate the hidden layer error*/
    const errorOutputToHidden = [];
    const errorHiddenToHidden = [];
    for (let l = this.HIDDEN_LAYERS - 1; l >= 0; l--) {
      if (l === this.HIDDEN_LAYERS - 1) {
        /* The Output to Hidden*/
        for (let h = 0; h < this.HIDDEN_NEURONS ; h++) {
          errorOutputToHidden[h] = 0;
          for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
            errorOutputToHidden[h] += this.errOutput[o] * this.weightsHiddenToOutput[h][o];
          }
          errorOutputToHidden[h] *= this.sigmoidDerivative(this.hidden[h]);
        }
        this.hiddenErrorLayers.splice(0, 0, [...errorOutputToHidden]);
      } else {
        /* The Hidden to Hidden*/
        for (let h = 0; h < this.HIDDEN_NEURONS ; h++) {
          errorHiddenToHidden[h] = 0;
          for (let o = 0; o < this.HIDDEN_NEURONS; o++) {
            errorHiddenToHidden[h] +=  this.hiddenErrorLayers[0][h] * this.hiddenLayerWeights[l][h][o];
          }
          errorHiddenToHidden[h] *= this.sigmoidDerivative(this.hiddenLayersCalc[0][h]);
        }
        this.hiddenErrorLayers.splice(0 , 0, [...errorHiddenToHidden]);
      }
    }

    /* Update the weights for the output layer */
    for (let o = 0; o < this.OUTPUT_NEURONS; o++) {
      for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
        this.weightsHiddenToOutput[h][o] += (this.LEARN_RATE * this.errOutput[o] * this.hidden[h]);
      }
      /* Update the Bias*/
      this.weightsHiddenToOutput[this.HIDDEN_NEURONS][o] += (this.LEARN_RATE * this.errOutput[o]);
    }

    /* Update the weights for the hidden layers*/
    for (let l = this.HIDDEN_LAYERS - 1; l >= 0; l--) {
      if (l > 0) {
        /* Hidden to Hidden*/
        for (let o = 0; o < this.HIDDEN_NEURONS; o++) {
          for (let h = 0; h < this.HIDDEN_NEURONS; h++) {
            this.hiddenLayerWeights[l - 1][h][o] += (this.LEARN_RATE * this.hiddenErrorLayers[l][o] * this.hiddenLayersCalc[l - 1][h]);
          }
          /* Update the Bias */
          this.hiddenLayerWeights[l - 1][this.HIDDEN_NEURONS][o] += (this.LEARN_RATE * this.hiddenErrorLayers[l][o]);
        }
      } else {
        /* The Hidden to Input*/
        for (let o = 0; o < this.HIDDEN_NEURONS; o++) {
          for (let h = 0; h < this.INPUT_NEURONS; h++) {
            this.weightsInputToHidden[h][o] += (this.LEARN_RATE * this.hiddenErrorLayers[l][o] * this.inputs[h]);
          }
          /* Update the Bias */
          this.weightsInputToHidden[this.INPUT_NEURONS][o] += (this.LEARN_RATE * this.hiddenErrorLayers[l][o]);
        }
      }
    }
  }

  trainNetwork(): void {
    this.assignRandomWeights();

    let err = 0;
    for (let i = 0; i < 150000; i++) {
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
      if (err < .0005) {
        break;
      }

      this.backPropagate();
    }
    this.totalErr = err;
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
        console.log('i', i);
        // console.log('Samples', this.samples[i]);
        console.log('target', this.target);
        console.log('actual', this.actual);
      } else {
        // console.log(`Sample ${i} is correct`);
        // console.log('actual', this.actual);
      }
    }
  }

  disableButton(): boolean {
    this.dynamicForm.updateValueAndValidity();
    return !this.dynamicForm.valid;
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

