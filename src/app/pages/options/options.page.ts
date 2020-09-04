import { Component, OnInit } from '@angular/core';
import {ModalController,NavParams}  from '@ionic/angular';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit {

  sizes = [
    {val : "Small" , isChecked : false,extra : 0,},
    {val : "Large" , isChecked : false,extra : 0.50}
  ];
  drinks : [];
  Size ;
  ismeal : boolean;
  constructor(private modalCntrl : ModalController,
              private navParams : NavParams,
              private platform : Platform) { 
  }

  ngOnInit() {
    console.log(this.navParams.data.meal);
    this.ismeal = this.navParams.data.meal;
  }

  async dissMiss() {
    await this.modalCntrl.dismiss(null);
  };

  checkedSize(selectedSize) : void {
    console.log(this.sizes);
    this.Size = {val : selectedSize.val,extra : selectedSize.extra };
    this.sizes.forEach(size => {
      if (size.val != selectedSize.val && size.isChecked == true ){
          size.isChecked = false;
          console.log(this.sizes);
      }
    });
  }

  async onSubmit()  {
    const data = {size : this.Size , drinks : this.drinks}
    await this.modalCntrl.dismiss(data);
  }

  

}
