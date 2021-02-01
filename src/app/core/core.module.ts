import { NgModule } from '@angular/core';
import {CoreRoutingModule} from './core-routing.module';
import {HomeComponent} from './home/home.component';

@NgModule({
  declarations: [
    CoreRoutingModule.components,
    HomeComponent
  ],
  imports: [
    CoreRoutingModule
  ],
  exports: [
    HomeComponent
  ]
})
export class CoreModule { }
