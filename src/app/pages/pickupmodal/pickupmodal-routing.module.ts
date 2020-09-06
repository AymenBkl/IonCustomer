import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PickupmodalPage } from './pickupmodal.page';

const routes: Routes = [
  {
    path: '',
    component: PickupmodalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PickupmodalPageRoutingModule {}
