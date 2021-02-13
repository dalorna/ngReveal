import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.scss']
})
export class DynamicComponent implements OnInit {
  public dynamicForm: FormGroup;
  public sampleFormGroup: FormGroup;
  public numSamples = 0;
  public finalOutput = [];
  private _networkTrained = false;
  private iterations = 0;
  private INPUT_NEURONS: number;
  private HIDDEN_NEURONS: number;
  private OUTPUT_NEURONS: number;
  private HIDDEN_LAYERS: number;
  private LEARN_RATE: number;
  private inputSamplesForTraining = [];
  private targetSamplesForTraining = [];

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
  constructor(private fb: FormBuilder, private cd: ChangeDetectorRef) {

  }

  get networkTrained(): boolean { return this._networkTrained; }
  set networkTrained(val) { this._networkTrained = val; }
  get dForm(): any { return this.sampleFormGroup.controls; }
  get iTraining(): FormArray { return this.dForm.inputTrainingArray as FormArray; }
  get oTraining(): FormArray { return this.dForm.outputTrainingArray as FormArray; }

  ngOnInit(): void {
    this.dynamicForm = this.fb.group({
      hiddenLayers: new FormControl(0, [Validators.required, Validators.min(1)]),
      hiddenNodes: new FormControl(0, [Validators.required, Validators.min(1)]),
      numInputs: new FormControl(0, [Validators.required, Validators.min(2)]),
      numOutputs: new FormControl(0, [Validators.required, Validators.min(2)]),
      // learnRate: new FormControl(null, [Validators.required]),
      iterations: new FormControl(100000, [Validators.required]),
    });
    this.sampleFormGroup = this.fb.group({
      inputTrainingArray: new FormArray([]),
      outputTrainingArray: new FormArray([])
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
    this.INPUT_NEURONS = parseInt(this.dynamicForm.get('numInputs').value, 10);
    this.OUTPUT_NEURONS = parseInt(this.dynamicForm.get('numOutputs').value, 10);
    this.HIDDEN_NEURONS = parseInt(this.dynamicForm.get('hiddenNodes').value, 10);
    this.HIDDEN_LAYERS = parseInt(this.dynamicForm.get('hiddenLayers').value, 10);
    this.assignRandomWeights();

    let err = 0;
    this.iterations = parseInt(this.dynamicForm.get('iterations').value, 10);

    for (let i = 0; i < this.iterations; i++) {
      this.inputs = [];
      this.target = [];
      const sampleNumber = Math.floor(Math.random() * this.inputSamplesForTraining.length);

      for (let j = 0; j < this.inputSamplesForTraining[sampleNumber].length; j++) {
        this.inputs.push(parseInt(this.inputSamplesForTraining[sampleNumber][j].value, 10));
      }
      for (let j = 0; j < this.targetSamplesForTraining[sampleNumber].length; j++) {
        this.target.push(parseInt(this.targetSamplesForTraining[sampleNumber][j].value, 10));
      }

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
    this.networkTrained = true;
  }

  testNetwork(): void {
    const activation = [...this.targetSamplesForTraining[0].map(m => m.name)];
    for (let sampleNumber = 0; sampleNumber < this.numSamples; sampleNumber++) {
      this.inputs = [];
      this.target = [];
      for (let j = 0; j < this.inputSamplesForTraining[sampleNumber].length; j++) {
        this.inputs.push(parseInt(this.inputSamplesForTraining[sampleNumber][j].value, 10));
      }
      for (let j = 0; j < this.targetSamplesForTraining[sampleNumber].length; j++) {
        this.target.push(parseInt(this.targetSamplesForTraining[sampleNumber][j].value, 10));
      }

      this.feedForward();

      if (activation[this.target.indexOf(Math.max(...this.target))] !== activation[this.actual.indexOf(Math.max(...this.actual))]) {
        // console.log(`Sample ${sampleNumber} is wrong`);
        // console.log('target', this.target);
        // console.log('actual', this.actual);
        this.finalOutput.push({outcome: 'Wrong', message: activation[this.target.indexOf(Math.max(...this.target))] + ' - ' + activation[this.actual.indexOf(Math.max(...this.actual))]});
      } else {
        // console.log(`Sample ${sampleNumber} is correct: ${ activation [this.actual.indexOf(Math.max(...this.actual))]}`);
        this.finalOutput.push({outcome: 'Correct: ', message: activation[this.actual.indexOf(Math.max(...this.actual))]});
      }
    }
    this.dynamicForm.enable();
  }

  disableButton(): boolean {
    let hasError = false;
    // tslint:disable-next-line:forin
    for (const field in this.dynamicForm.controls) {
      const control = this.dynamicForm.get(field);
      if (control.errors) {
        hasError = true;
        break;
      }
    }
    if (!hasError) {
      for (const group of (this.sampleFormGroup.get('inputTrainingArray') as FormArray).controls)
      {
        // tslint:disable-next-line:forin
        for (const field in (group as FormGroup).controls) {
          const control = group.get(field);
          if (control.errors) {
            hasError = true;
            break;
          }
        }
      }
    }
    if (!hasError) {
      for (const group of (this.sampleFormGroup.get('outputTrainingArray') as FormArray).controls)
      {
        // tslint:disable-next-line:forin
        for (const field in (group as FormGroup).controls) {
          const control = group.get(field);
          if (control.errors) {
            hasError = true;
            break;
          }
        }
      }
    }
    if (!hasError) {
      hasError = !(this.inputSamplesForTraining.length > 0) || !(this.targetSamplesForTraining.length > 0);
    }
    return hasError;
  }

  disableSamplesButton(): boolean {
    let hasError = false;

    if (!hasError) {
      hasError = parseInt(this.dynamicForm.get('numInputs').value, 10) === 0;
    }
    if (!hasError) {
      hasError = parseInt(this.dynamicForm.get('numOutputs').value, 10) === 0;
    }
    if (!hasError) {
      for (const group of (this.sampleFormGroup.get('inputTrainingArray') as FormArray).controls)
      {
        // tslint:disable-next-line:forin
        for (const field in (group as FormGroup).controls) {
          const control = group.get(field);
          if (control.errors) {
            hasError = true;
            break;
          }
        }
      }
    }
    if (!hasError) {
      for (const group of (this.sampleFormGroup.get('outputTrainingArray') as FormArray).controls)
      {
        // tslint:disable-next-line:forin
        for (const field in (group as FormGroup).controls) {
          const control = group.get(field);
          if (control.errors) {
            hasError = true;
            break;
          }
        }
      }
    }
    if (!hasError) {
      hasError = !((this.sampleFormGroup.get('inputTrainingArray') as FormArray).length > 0);
      if (!hasError) {
        hasError = parseInt(this.dynamicForm.get('numInputs').value, 10) !== (this.sampleFormGroup.get('inputTrainingArray') as FormArray).length;
      }
    }
    if (!hasError) {
      hasError = !((this.sampleFormGroup.get('outputTrainingArray') as FormArray).length > 0);
      if (!hasError) {
        hasError = parseInt(this.dynamicForm.get('numOutputs').value, 10) !== (this.sampleFormGroup.get('outputTrainingArray') as FormArray).length;
      }
    }

    return hasError;
  }

  onAddTrainingInput(e): void {
    if (this.iTraining.length < parseInt(this.dynamicForm.get('numInputs').value, 10)) {
      this.iTraining.push(this.fb.group({
        name: ['', Validators.required],
        value: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
      }));
    }
  }

  onRemoveTrainingInput(e): void {
    this.iTraining.removeAt(this.iTraining.length - 1);
  }

  onAddTrainingOutput(e): void {
    if (this.oTraining.length < parseInt(this.dynamicForm.get('numOutputs').value, 10)) {
      this.oTraining.push(this.fb.group({
        name: ['', Validators.required],
        value: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
      }));
    }
  }

  onRemoveTrainingOutput(e): void {
    this.oTraining.removeAt(this.oTraining.length - 1);
  }

  onReset(): void {
    this.dynamicForm.reset();
    this.iTraining.clear();
    this.oTraining.clear();
    this.inputSamplesForTraining = [];
    this.targetSamplesForTraining = [];
    this.numSamples = 0;
    this.totalErr = 100;
    this.networkTrained = false;
    this.finalOutput = [];
  }

  onClear(): void {
    this.inputSamplesForTraining = [];
    this.targetSamplesForTraining = [];
    this.iTraining.clear();
    this.oTraining.clear();
    this.dynamicForm.enable();
    this.numSamples = 0;
    this.totalErr = 100;
    this.networkTrained = false;
    this.finalOutput = [];
  }

  addSamples(): void {
    this.numSamples++;
    const inputTrainingSample = [];
    const outputTrainingSample = [];
    for (const group of (this.sampleFormGroup.get('inputTrainingArray') as FormArray).controls)
    {
      inputTrainingSample.push((group as FormGroup).getRawValue());
    }
    this.inputSamplesForTraining.push(inputTrainingSample);
    for (const group of (this.sampleFormGroup.get('outputTrainingArray') as FormArray).controls)
    {
      outputTrainingSample.push((group as FormGroup).getRawValue());
    }
    this.targetSamplesForTraining.push(outputTrainingSample);

    this.iTraining.clear();
    this.oTraining.clear();
    this.dynamicForm.disable();
  }

  onFileChange(e): void {
    const vm = this;
    const reader = new FileReader();

    const [file] = e.target.files;
    reader.readAsText(file);
    reader.onload = () => {
      document.getElementById('jsonSample').innerHTML = JSON.stringify(JSON.parse(reader.result.toString()), undefined, 1);
      const fileUpload = JSON.parse(reader.result.toString());
      this.LEARN_RATE = fileUpload['LearnRate'];
      vm.dynamicForm.patchValue({
        hiddenLayers: fileUpload['HiddenLayers'],
        hiddenNodes: fileUpload['HiddenNodes'],
        numInputs: fileUpload['NumberInputs'],
        numOutputs: fileUpload['NumberOutputs'],
        iterations: fileUpload['Iterations'],
      });

      this.numSamples = fileUpload['Inputs'].length;
      const inputTrainingSample = [];
      const outputTrainingSample = [];
      for (const group of fileUpload['Inputs'])
      {
        this.inputSamplesForTraining.push(group);
      }
      // this.inputSamplesForTraining.push(inputTrainingSample);
      for (const group of fileUpload['Outputs'])
      {
        this.targetSamplesForTraining.push(group);
      }
      // this.targetSamplesForTraining.push(outputTrainingSample);

      this.iTraining.clear();
      this.oTraining.clear();
      this.dynamicForm.disable();
      e.target.value = '';
      vm.cd.markForCheck();
    };
  }

  downloadTrainedWeightsToJSON(): void {
    // this.weightsInputToHidden
    // this.weightsHiddenToHidden
    // this.weightsHiddenToOutput
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

