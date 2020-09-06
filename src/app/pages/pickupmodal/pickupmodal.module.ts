import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PickupmodalPageRoutingModule } from './pickupmodal-routing.module';

import { PickupmodalPage } from './pickupmodal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupmodalPageRoutingModule
  ],
  declarations: [PickupmodalPage]
})
export class PickupmodalPageModule {}
