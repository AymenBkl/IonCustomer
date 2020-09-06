import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { NavController } from "@ionic/angular";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-delivery-home',
  templateUrl: './delivery-home.page.html',
  styleUrls: ['./delivery-home.page.scss'],
})
export class DeliveryHomePage implements OnInit {

  address : string ;
  totalPrice : any;
  resAdress : any;
  homeDeliviry : any;
  constructor(public platform : Platform,
              private navCntrl : NavController,
              private router : ActivatedRoute) { }

  ngOnInit() {
    this.getDataFromCarte();
  }

  back() : void {
    this.navCntrl.back();
  }

  getDataFromCarte() {
    this.totalPrice = this.router.snapshot.paramMap.get('totalPrice');
    this.resAdress = this.router.snapshot.paramMap.get('resAddress');
    this.homeDeliviry = this.router.snapshot.paramMap.get('duration');
    this.address = this.router.snapshot.paramMap.get('homeAddress');
    console.log(this.homeDeliviry,this.address);
  }

  

}
