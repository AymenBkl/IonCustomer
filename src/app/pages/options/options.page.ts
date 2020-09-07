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
  selectedDrinks : any[] = [];
  Size : any ;
  ismeal : boolean;
  constructor(private modalCntrl : ModalController,
              private navParams : NavParams,
              public platform : Platform) { 
  }

  ngOnInit() {
    this.ismeal = this.navParams.data.meal;
    this.drinks = this.navParams.data.drinks;
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
    const data = {size : this.Size , drinks : this.selectedDrinks}
    await this.modalCntrl.dismiss(data);
  }

  add(item) {
    const i = this.selectedDrinks.indexOf(item);
    if (i == -1){
      this.selectedDrinks.push(item);
    }
    else {
      this.selectedDrinks.splice(i,1);
    }

    console.log(this.selectedDrinks);
  }
  

}
