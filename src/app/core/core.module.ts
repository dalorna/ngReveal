import { NgModule } from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';
import {HomeComponent} from './home/home.component';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    CoreRoutingModule.components,
    HomeComponent
  ],
  imports: [
    CoreRoutingModule,
    CommonModule
  ],
  exports: [
    HomeComponent
  ]
})
export class CoreModule { }
