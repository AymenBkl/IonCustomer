import { Component, OnInit } from "@angular/core";

import { NavController } from "@ionic/angular";

@Component({
  selector: "app-country",
  templateUrl: "./country.page.html",
  styleUrls: ["./country.page.scss"],
})
export class CountryPage implements OnInit {
  selectedCountry: any;
  constructor(private navCtrl: NavController) {}

  ngOnInit() {
    this.selectedCountry = localStorage.getItem("selectedCountry");
  }

  goNext() {
    console.log("next", this.selectedCountry);
    localStorage.setItem("selectedCountry", this.selectedCountry);
    localStorage.setItem("selectedCity", null);
    this.navCtrl.navigateForward(["/cities"]);
  }
}
