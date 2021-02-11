import { NgModule } from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';
import {HomeComponent} from './home/home.component';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
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
  exports: [
    HomeComponent
  ]
})
export class CoreModule { }
