import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationExtras } from "@angular/router";
import { ModalController,NavParams } from '@ionic/angular';

import {
  NavController,
  AlertController,
  PopoverController,
} from "@ionic/angular";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import { Router } from "@angular/router";
import { MenuComponent } from "src/app/components/menu/menu.component";
import { OptionsPage } from '../options/options.page';
import { min } from 'moment';

@Component({
  selector: "app-category",
  templateUrl: "./category.page.html",
  styleUrls: ["./category.page.scss"],
})
export class CategoryPage implements OnInit {
  @ViewChild("content", { static: false }) private content: any;
  id: any;
  name: any;
  descritions: any;
  cover: any = "";
  address: any;
  ratting: any;
  time: any;
  open : any;
  close : any;
  totalRatting: any;
  dishPrice: any;
  cusine: any[] = [];
  foods: any[] = [];
  dummyFoods: any[] = [];
  categories: any[] = [];
  dummy = Array(50);
  veg: boolean = true;
  totalItem: any = 0;
  totalPrice: any = 0;
  deliveryAddress: any = "";
  currency: any = "";
  extras = [];
  catDrinkid : any;
  drinkFoods : any[] = [];
  addons : any[] = [];
  addonsid : any;
  private allergenInfoImage: any = "";

  constructor(
    private route: ActivatedRoute,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private alertController: AlertController,
    private router: Router,
    private popoverController: PopoverController,
    private modalCntrl : ModalController,
  ) {}

  ngOnInit() {
    this.currency = "€";
    this.route.queryParams.subscribe((data) => {
      console.log("data=>", data);
      if (data.hasOwnProperty("id")) {
        this.id = data.id;
        this.getVenueDetails();
      } else {
        this.navCtrl.navigateRoot(["tabs"]);
      }
    });

  }

  getAddress() {
    const address = JSON.parse(localStorage.getItem("deliveryAddress"));
    if (address && address.address) {
      this.deliveryAddress = address.address;
    }
    return this.deliveryAddress;
  }

  getVenueDetails() {
    // Venue Details
    this.api
      .getVenueDetails(this.id)
      .then(
        (data) => {
          console.log(data);
          if (data) {
            this.name = data.name;
            this.descritions = data.descritions;
            this.cover = data.cover;
            this.allergenInfoImage = data.allergenInfoImage;
            this.address = data.address;
            this.ratting = data.ratting ? data.ratting : 0;
            this.totalRatting = data.totalRatting ? data.totalRatting : 2;
            this.dishPrice = data.dishPrice;
            this.time = data.time;
            this.cusine = data.cusine;
            this.open = data.openTime;
            this.close = data.closeTime;
            /*const vid = localStorage.getItem('vid');
        console.log('id', vid, this.id);
        if (vid && vid !== this.id) {
          this.getCates();
          this.getFoods();
          this.changeStatus();
          this.totalItem = parseInt(localStorage.getItem('totalItem'));
          this.totalPrice = parseFloat(localStorage.getItem('totalPrice'));
          this.presentAlertConfirm();
          return false;
        } else if (vid && vid === this.id) {
          this.categories = JSON.parse(localStorage.getItem('categories'));
          this.foods = JSON.parse(localStorage.getItem('foods'));
          this.dummyFoods = JSON.parse(localStorage.getItem('dummyItem'));
          this.calculate();
          this.changeStatus();
        } else {*/
            this.getCates();
            this.changeStatus();
            // }
          }
        },
        (error) => {
          console.log(error);
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((error) => {
        console.log(error);
        this.util.errorToast(this.util.translate("Something went wrong"));
      });

  }

  checkCatesDrink() {
    this.categories.forEach(cat => {
      if (cat.name == "After Dinner Drinks"){
        this.catDrinkid = cat.id;
      }
      else if (cat.name == "Wines"){
        this.addonsid = cat.id;
        console.log("iiiiiiiid",this.addonsid);

      }
    });
  }

  
  getCates() {
    this.api
      .getVenueCategories(this.id)
      .then(
        (cate) => {
          /** here im testing by name so when you get the type of category test by type */
          console.log("caates",cate);

          if (cate) {
            cate = cate.sort(function (a, b) {
              try {
                if (a.date_added < b.date_added) return -1;
                else return 1;
              } catch (Exception) {
                return -1;
              }
            });
            this.categories = cate;
            this.checkCatesDrink();
            this.getFoods();
          }
        },
        (error) => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }

  getFoods() {
    this.api
      .getFoods(this.id)
      .then(
        (foods) => {
          console.log(foods);
          if (foods) {
            // if()
            this.dummy = [];
            this.foods = [];
            this.dummyFoods = [];
            foods = foods.sort(function (a, b) {
              try {
                if (a.date_added == null) a.date_added = 0;
                if (b.date_added == null) b.date_added = 0;
                if (a.date_added < b.date_added) return -1;
                else return 1;
              } catch (Exception) {
                return -1;
              }
            });
            foods.forEach((element) => {
              
              if (element && element.status === true) {
                let info = {
                  cid: {
                    id: element.cid.id,
                  },
                  cover: element.cover,
                  subcategory: element.subcategory,
                  desc: element.desc,
                  id: element.id,
                  name:
                    element && element.variation
                      ? element.name + " (Regular)"
                      : element.name,
                  price: element.price,
                  ratting: element.ratting,
                  uid: element.uid,
                  veg: element.veg,
                  quantiy: 0,
                  notes: "",
                  totalRatting: element.totalRatting ? element.totalRatting : 0,
                };
                this.foods.push(info);
                this.dummyFoods.push(info);
                if (element.cid.id === this.catDrinkid){
                  this.drinkFoods.push(info);

                }
                else if (element.cid.id === this.addonsid){
                  this.addons.push(info);
                }
                if (
                  element &&
                  element.variation &&
                  element.small &&
                  element.small > 0
                ) {
                  let info = {
                    cid: {
                      id: element.cid.id,
                    },
                    subcategory: element.subcategory,

                    cover: element.cover,
                    desc: element.desc,
                    id: element.id,
                    name: element.name + " (small)",
                    price: element.small,
                    ratting: element.ratting,
                    uid: element.uid,
                    veg: element.veg,
                    quantiy: 0,
                    notes: "",

                    totalRatting: element.totalRatting
                      ? element.totalRatting
                      : 0,
                  };
                  this.foods.push(info);
                  this.dummyFoods.push(info);
                  if (element.cid.id === this.catDrinkid){
                    this.drinkFoods.push(info);

                  } else if (element.cid.id === this.addonsid){
                    this.addons.push(info);
                  }
  
                }

                if (
                  element &&
                  element.variation &&
                  element.medium &&
                  element.medium > 0
                ) {
                  let info = {
                    cid: {
                      id: element.cid.id,
                    },
                    subcategory: element.subcategory,

                    cover: element.cover,
                    desc: element.desc,
                    id: element.id,
                    name: element.name + " (medium)",
                    price: element.medium,
                    ratting: element.ratting,
                    uid: element.uid,
                    veg: element.veg,
                    quantiy: 0,
                    notes: "",

                    totalRatting: element.totalRatting
                      ? element.totalRatting
                      : 0,
                  };
                  this.foods.push(info);
                  this.dummyFoods.push(info);
                  if (element.cid.id === this.catDrinkid){
                    this.drinkFoods.push(info);

                  }
                  else if (element.cid.id === this.addonsid){
                    this.addons.push(info);
                  }
                  }

                if (
                  element &&
                  element.variation &&
                  element.large &&
                  element.large > 0
                ) {
                  let info = {
                    cid: {
                      id: element.cid.id,
                    },
                    subcategory: element.subcategory,

                    cover: element.cover,
                    desc: element.desc,
                    id: element.id,
                    name: element.name + " (large)",
                    price: element.large,
                    ratting: element.ratting,
                    uid: element.uid,
                    veg: element.veg,
                    quantiy: 0,
                    notes: "",

                    totalRatting: element.totalRatting
                      ? element.totalRatting
                      : 0,
                  };
                  this.foods.push(info);
                  this.dummyFoods.push(info);
                  if (element.cid.id === this.catDrinkid){
                    this.drinkFoods.push(info);

                  }
                  else if (element.cid.id === this.addonsid){
                    this.addons.push(info);
                  }
                  }
              }
            });
            console.log("myfoods", this.foods);
            console.log("dummy foods",this.foods);
            console.log("drink",this.drinkFoods);

            if (!this.foods.length || this.foods.length === 0) {
              this.util.errorToast(this.util.translate("No Foods found"));
              this.navCtrl.back();
              return false;
            }
          }
        },
        (error) => {
          console.log(error);
          this.dummy = [];
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }

  back() {
    this.navCtrl.navigateRoot(["tabs"]);
  }

  getCusine(cusine) {
    return cusine.join("-");
  }
  add(index,catename) {
    if (this.checkTime()){
    this.api
      .checkAuth()
      .then((user) => {
        if (user) {
          const vid = localStorage.getItem("vid");
          if (vid && vid !== this.id) {
            this.presentAlertConfirm();
            return false;
          }
          this.createModal(index,catename);
          console.log(this.foods[index]);
          
        } else {
          this.router.navigate(["login"]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      this.util.errorToast("The restaurant is open from "+ this.open + " to " + this.close);

    }

  }

  statusChange() {
    console.log("status", this.veg);
    this.changeStatus();
  }
  calculate() {
    var extratotal = this.extras.reduce(function(prev, cur) {
      return prev + cur;
    }, 0);
    this.dummy = [];
    console.log("khaliiii", this.dummy);
    console.log(this.foods);
    let item = this.foods.filter((x) => x.quantiy > 0);
    console.log(item);
    this.totalPrice = 0;
    this.totalItem = 0;
    item.forEach((element) => {
      this.totalItem = this.totalItem + element.quantiy;
      this.totalPrice +=
         parseFloat(element.price) * parseInt(element.quantiy) + parseFloat(extratotal);
        console.log(this.totalPrice);
        console.log(parseFloat(extratotal))
    });
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    console.log("total item", this.totalItem);
    if (this.totalItem === 0) {
      this.totalItem = 0;
      this.totalPrice = 0;
    }
  }

  async setData() {
    const vid = localStorage.getItem("vid");
    console.log("leaving the planet", vid, this.id);
    console.log("total item", this.totalItem);

    if (vid && vid === this.id && this.totalPrice > 0) {
      localStorage.setItem("vid", this.id);
      await localStorage.setItem("foods", JSON.stringify(this.foods));
      localStorage.setItem("drinkFoods",JSON.stringify(this.drinkFoods));
      localStorage.setItem("Addons",JSON.stringify(this.addons));
      localStorage.setItem("categories", JSON.stringify(this.categories));
      localStorage.setItem("dummyItem", JSON.stringify(this.dummyFoods));
      localStorage.setItem("totalItem", this.totalItem);
      localStorage.setItem("totalPrice", this.totalPrice);
    } else if (!vid && this.totalItem > 0) {
      localStorage.setItem("vid", this.id);
      localStorage.setItem("drinkFoods",JSON.stringify(this.drinkFoods));
      localStorage.setItem("Addons",JSON.stringify(this.addons));

      await localStorage.setItem("foods", JSON.stringify(this.foods));
      localStorage.setItem("categories", JSON.stringify(this.categories));
      localStorage.setItem("dummyItem", JSON.stringify(this.dummyFoods));
      localStorage.setItem("totalItem", this.totalItem);
      localStorage.setItem("totalPrice", this.totalPrice);
    } else if (this.totalItem == 0) {
      this.totalItem = 0;
      this.totalPrice = 0;
    }
  }
  async ionViewWillLeave() {
    await this.setData();
  }
  changeStatus() {
    this.foods = this.dummyFoods.filter((x) => x.veg === this.veg);
  }
  addQ(index) {
    if (this.checkTime()){
    this.foods[index].quantiy = this.foods[index].quantiy + 1;
    this.calculate();
    } else {
      this.util.errorToast("The restaurant is open from "+ this.open + " to " + this.close);
    }
  }
  removeQ(index) {
    if (this.checkTime()){
    
    if (this.foods[index].quantiy !== 0) {
      this.foods[index].quantiy = this.foods[index].quantiy - 1;
    } else {
      this.foods[index].quantiy = 0;
    }
    this.calculate();
  }
  else {
    this.util.errorToast("The restaurant is open from "+ this.open + " to " + this.close);
  }
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.util.translate("Warning"),
      message: this.util.translate(
        `you already have item's in cart with different restaurant`
      ),
      buttons: [
        {
          text: this.util.translate("Cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel: blah");
          },
        },
        {
          text: this.util.translate("Clear cart"),
          handler: () => {
            console.log("Confirm Okay");
            localStorage.removeItem("vid");
            localStorage.removeItem("categories");
            localStorage.removeItem("dummyItem");
            localStorage.removeItem("foods");
            this.totalItem = 0;
            this.totalPrice = 0;
          },
        },
      ],
    });

    await alert.present();
  }

  viewCart() {
    console.log("viewCart");
    this.setData();
    this.navCtrl.navigateRoot(["tabs/tab3"]);
  }

  async presentPopover(ev: any) {
    if (this.categories.length <= 0) {
      return false;
    }
    const popover = await this.popoverController.create({
      component: MenuComponent,
      event: ev,
      componentProps: { data: this.categories },
      mode: "ios",
    });
    popover.onDidDismiss().then((data) => {
      console.log(data.data);
      if (data && data.data) {
        const yOffset = document.getElementById(data.data.id).offsetTop;
        const yHOffset = document.getElementById(data.data.id).offsetHeight;

        console.log(yOffset + " : " + yHOffset);
        this.content.scrollToPoint(0, yOffset, 1000);
      }
    });
    await popover.present();
  }

  openDetails() {
    const navData: NavigationExtras = {
      queryParams: {
        id: this.id,
      },
    };
    this.router.navigate(["rest-details"], navData);
  }

  get allergenInfo() {
    return this.allergenInfoImage;
  }

  async createModal(index,catename)  {
    let meal : boolean;
    if (catename === "A La Carte"){
      meal = true;
    }
    else {
      meal = false;
    }
    const modal = await this.modalCntrl.create({
      component : OptionsPage,
      componentProps : {
        "meal" : meal,
        "drinks" : this.drinkFoods,
        "addons" : this.addons
      }
    });

    modal.onDidDismiss()
          .then(data => {
            if (data.data != null){
              this.extras.push(Number(data.data.size.extra));
              this.getSelectedFoodIndex(data.data.drinks);
              this.getSelectedFoodIndex(data.data.addons);
              this.foods[index].quantiy = this.foods[index].quantiy + 1;
              this.calculate();
              console.log(data.data.size);
            }
          },
          err => {
            console.log(err);
          });
    return await modal.present();
  }

  checkTime() : boolean {
    let now: string;
    now = new Date().toString().split(' ')[4];
    let hours = now.split(':')[0];
    let minutes = now.split(':')[1];
    if (now < this.close && now > this.open){
      return true;
    }
    else  {
      return false;
    }
  }

  getSelectedFoodIndex(selectedDrinks : []) {
    selectedDrinks.forEach(drink => {
      this.addQ(this.foods.indexOf(drink));
    });
  }
}
