import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { GoogleMapService } from '../../services/google-map.service';
import { NavController } from "@ionic/angular";

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
  mode : any ;
  deliverTime : any;
  delivryTime : any;
  hours : any;
  min : any;
  homePrice : any;
  distance : any;
  constructor(public platform : Platform,
              private navCntrl : NavController,
              private router : ActivatedRoute,
              private googleMaps : GoogleMapService) { }

  ngOnInit() {
    this.getDataFromCarte();
  }

  back() : void {
    this.navCntrl.back();
  }

  getDataFromCarte() {
    this.totalPrice = Number(this.router.snapshot.paramMap.get('totalPrice'));
    this.resAdress = this.router.snapshot.paramMap.get('resAddress');
    this.homeDeliviry = this.router.snapshot.paramMap.get('duration');
    this.address = this.router.snapshot.paramMap.get('homeAddress');
    this.deliverTime = this.router.snapshot.paramMap.get('time');
    this.mode = this.router.snapshot.paramMap.get('mode');
    this.min = this.router.snapshot.paramMap.get('min');
    this.hours = this.router.snapshot.paramMap.get('hours');
    this.homePrice = this.router.snapshot.paramMap.get('homeprice');
    this.distance = this.router.snapshot.paramMap.get('distnace');

  }

  calculateDistance() {
    this.googleMaps.calculateDistance(this.resAdress,this.address);
    let homeDeliviry = JSON.parse(localStorage.getItem("homeAddresse"));
    if (homeDeliviry != null) {
      let estimated = "";
      const days = Math.floor(homeDeliviry.duration / 86400);
      const hours = Math.floor(homeDeliviry.duration / 3600) % 24;
      let minutes = Math.floor(homeDeliviry.duration / 60) % 3600;
      this.distance = homeDeliviry.distance;
      this.address = homeDeliviry.address;
      if (minutes > 45) {
        minutes = 60;
      } else if (minutes > 30) {
        minutes = 45;
      } else if (minutes > 15) {
        minutes = 60;
      } else {
        minutes = 15;
      }
      if (days > 0) {
        estimated += days + " days ";
      }

      if (hours > 0) {
        estimated += hours + " hours ";
      }

      if (minutes > 0) {
        estimated += minutes + " min ";
      }

      this.homeDeliviry = estimated;
      this.CalculatePrice();
    }
  }

  CalculatePrice() {
    this.totalPrice -= Number(this.homePrice);
    const fixedPriceForMeters = 0.00005;
    this.homePrice = (fixedPriceForMeters*this.distance).toFixed(2);
    this.totalPrice += Number(this.homePrice);
  }

  onSubmit()  {
    this.navCntrl.navigateForward(["/payments",{address : this.address,time : this.delivryTime,mode : this.mode,homePrice : this.homePrice,estimated : this.homeDeliviry}]);
  }

}
