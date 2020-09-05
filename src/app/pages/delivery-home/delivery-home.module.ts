import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryHomePageRoutingModule } from './delivery-home-routing.module';

import { DeliveryHomePage } from './delivery-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryHomePageRoutingModule
  ],
  declarations: [DeliveryHomePage]
})
export class DeliveryHomePageModule {}
