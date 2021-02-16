import { NgModule } from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';
import {HomeComponent} from './home/home.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NeuralService} from './services/neural.service';
@NgModule({
  declarations: [
    CoreRoutingModule.components,
    HomeComponent
  ],
  imports: [
    CoreRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    NeuralService
  ],
  exports: [
    HomeComponent
  ]
})
export class CoreModule { }
