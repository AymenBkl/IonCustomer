import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryHomePage } from './delivery-home.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryHomePageRoutingModule {}
