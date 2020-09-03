import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CitiesPageRoutingModule } from "./cities-routing.module";

import { CitiesPage } from "./cities.page";
import { SharedModule } from "src/app/directives/shared.module";
import { NgPipesModule } from "ngx-pipes";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CitiesPageRoutingModule,
    SharedModule,
    NgPipesModule,
  ],
  declarations: [CitiesPage],
})
export class CitiesPageModule {}
