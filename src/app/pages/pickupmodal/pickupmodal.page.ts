import { Component, OnInit } from '@angular/core';
import {ModalController}  from '@ionic/angular';

@Component({
  selector: 'app-pickupmodal',
  templateUrl: './pickupmodal.page.html',
  styleUrls: ['./pickupmodal.page.scss'],
})
export class PickupmodalPage implements OnInit {

  time : boolean;
  mode : boolean;
  constructor(private modalCntrl : ModalController) { }

  ngOnInit() {
    this.time = true;
    this.mode = true;
  }

  changeTime(value : boolean) {
    this.time = value;
  }

  segmentChanged(ev: any) {
    this.mode = ev.detail.value;
  }

  async onSubmit() {
    const data = {mode : this.mode,time : this.time}
    await this.modalCntrl.dismiss(data);
  }
 
}
