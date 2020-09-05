import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NavController } from "@ionic/angular";

@Component({
  selector: 'app-delivery-home',
  templateUrl: './delivery-home.page.html',
  styleUrls: ['./delivery-home.page.scss'],
})
export class DeliveryHomePage implements OnInit {

  constructor(public platform : Platform,
              private navCntrl : NavController) { }

  ngOnInit() {
  }

  back() : void {
    this.navCntrl.back();
  }

}
