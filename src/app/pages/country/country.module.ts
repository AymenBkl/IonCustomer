import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { CountryPageRoutingModule } from "./country-routing.module";

import { CountryPage } from "./country.page";
import { SharedModule } from "src/app/directives/shared.module";
import { NgPipesModule } from "ngx-pipes";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountryPageRoutingModule,
    SharedModule,
    NgPipesModule,
  ],
  declarations: [CountryPage],
})
export class CountryPageModule {}
