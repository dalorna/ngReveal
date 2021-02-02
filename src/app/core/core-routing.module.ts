import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {DrawingCanvasComponent} from './views/drawing-canvas/drawing-canvas.component';
import {HomeComponent} from './home/home.component';
import {RevComponent} from './views/rev/rev.component';
import {NeuralComponent} from './views/neural/neural.component';


const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {path: 'drawing', component: DrawingCanvasComponent},
      {path: 'rev', component: RevComponent},
      {path: 'neural', component: NeuralComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CoreRoutingModule {
  static components = [
    DrawingCanvasComponent,
    RevComponent,
    NeuralComponent
  ];
}
