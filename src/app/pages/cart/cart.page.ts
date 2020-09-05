import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import { Router, NavigationExtras } from "@angular/router";
import { NavController } from "@ionic/angular";
import * as moment from 'moment';
import { DeliveryHomePage } from '../delivery-home/delivery-home.page';

@Component({
    selector: 'app-cart',
    templateUrl: './cart.page.html',
    styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
    haveItems: boolean = false;
    vid: any = '';
    foods: any;
    name: any;
    descritions: any;
    cover: any;
    address: any;
    time: any;
    totalPrice: any = 0;
    totalItem: any = 0;
    serviceTax: any = 0;
    deliveryCharge: any = 5;
    grandTotal: any = 0;
    serviceCharge: any = 0;
    serviceChargeRate: any = 0;
    deliveryAddress: any = '';
    totalRatting: any = 0;
    coupon: any;
    dicount: any;
    notes: string = ""
    tableNo: string = ""
    currency: any = '';
    minimumOrder: number;

    listCoupons: any[] = [];
    dummyCoupon = Array(10);
    findedList: any;

    list: any[] = [];
    restId: any;
    total: any;
    dummy = Array(10);
    couponCode: string;
    displaySegment : boolean = true;
    delivryTime : any;
    open : any;
    close : any;
    min : any;
    hours : any;

    constructor(
        private api: ApisService,
        private router: Router,
        private util: UtilService,
        private navCtrl: NavController,
        private chMod: ChangeDetectorRef
    ) {
    this.util.getCouponObservable().subscribe((data) => {
      if (data) {
        console.log(data);
        this.coupon = data;
        console.log("coupon", this.coupon);
        console.log(this.totalPrice);
        localStorage.setItem("coupon", JSON.stringify(data));
        this.calculate();
      }
      
    });
        this.getOffers();
        this.getCoupons();
        this.min = new Date().toISOString();
        
  }
  
  ngOnInit() {
    this.currency = localStorage.getItem("selectedCountry") == "IE" ? "€" : "£";
  }
    
	getCoupons() {
        this.api.getOffers().then(data => {
            this.dummyCoupon = [];
            console.log('list=====>', data);
            this.listCoupons = [];
            if (data && data.length) {
                const currnetDate = moment().format('YYYY-MM-DD');
                data.forEach(element => {
                    console.log(moment(element.expire).isAfter(currnetDate));
                    if (element && element.status === 'active' && moment(element.expire).isAfter(currnetDate)) {
                        console.log('yes=>', element);
                        this.listCoupons.push(element);
                    }
                });

            }
        }).catch(error => {
            this.dummyCoupon = [];
            console.log(error);
        });
    }

  getAddress() {
    const add = JSON.parse(localStorage.getItem("deliveryAddress"));
    if (add && add.address) {
      this.deliveryAddress = add.address;
    }
    return this.deliveryAddress;
  }
  getVenueDetails() {
    // Venue Details
    this.api
      .getVenueDetails(this.vid)
      .then(
        (data) => {
          console.log(data);
          if (data) {
            this.name = data.name;
            this.descritions = data.descritions;
            this.cover = data.cover;
            this.address = data.address;
            this.time = data.time;
            this.totalRatting = data.totalRatting;
            this.minimumOrder = data.minimumOrder;
            this.open = data.openTime;
            this.close = data.closeTime;
            
            this.min = this.min.split('T')[0] + "T" + this.open + "Z";
            console.log(this.min);
            let lenght = Number(this.close.split(':')[0]) - Number(this.open.split(':')[0]) + 1;
            this.hours = Array.from(new Array(lenght), (x,i) => i+Number(this.open.split(':')[0]));
            console.log(this.hours);
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

  validate() {
    let notes = sessionStorage.getItem("notes");
    if (notes) {
      this.notes = notes;
    }

    let tableNo = sessionStorage.getItem("tableNo");
    if (tableNo) {
      this.tableNo = tableNo;
    }

    this.api
      .checkAuth()
      .then(async (user) => {
        if (user) {
          const id = await localStorage.getItem("vid");
          console.log("id", id);
          if (id) {
            this.vid = id;
            this.getVenueDetails();
            const foods = await localStorage.getItem("foods");
            if (foods) {
              this.foods = await JSON.parse(foods);
              let recheck = await this.foods.filter((x) => x.quantiy > 0);
              console.log("vid", this.vid);
              console.log("foods", this.foods);
              if (this.vid && this.foods && recheck.length > 0) {
                this.haveItems = true;
                this.calculate();
                this.chMod.detectChanges();
              }
            }
          } else {
            this.haveItems = false;
            this.chMod.detectChanges();
          }
          this.chMod.detectChanges();
          return true;
        } else {
          this.router.navigate(["login"]);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  ionViewWillEnter() {
    this.validate();
  }
  getCart() {
    this.navCtrl.navigateRoot(["tabs/tab1"]);
  }

  updateNotes(index) {
    localStorage.setItem("foods", JSON.stringify(this.foods));
  }

  addQ(index) {
    this.foods[index].quantiy = this.foods[index].quantiy + 1;
    localStorage.setItem("foods", JSON.stringify(this.foods));
    this.calculate();
  }
  removeQ(index) {
    if (this.foods[index].quantiy != 0) {
      this.foods[index].quantiy = this.foods[index].quantiy - 1;
    } else {
      this.foods[index].quantiy = 0;
    }
    localStorage.setItem("foods", JSON.stringify(this.foods));
    this.calculate();
  }

  async calculate() {
    console.log(this.foods);
    let item = this.foods.filter((x) => x.quantiy > 0);
    console.log(item);
    this.totalPrice = 0;
    this.totalItem = 0;
    await item.forEach((element) => {
      this.totalItem = this.totalItem + element.quantiy;
      this.totalPrice =
        this.totalPrice + parseFloat(element.price) * parseInt(element.quantiy);
    });
    this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
    console.log("total item", this.totalItem);
    console.log("=====>", this.totalPrice);
    const tax = (parseFloat(this.totalPrice) * 21) / 100;
    this.serviceTax = 0;
    console.log("tax->", this.serviceTax);
    this.deliveryCharge = 0;
    this.grandTotal =
      parseFloat(this.totalPrice) +
      parseFloat(this.serviceTax) +
      parseFloat(this.deliveryCharge);
    this.grandTotal = this.grandTotal.toFixed(2);
    if (this.coupon && this.coupon.code && this.totalPrice >= this.coupon.min) {
      if (this.coupon.type === "%") {
        console.log("per");
        function percentage(totalValue, partialValue) {
          return (100 * partialValue) / totalValue;
        }
        const totalPrice = percentage(
          parseFloat(this.totalPrice).toFixed(2),
          this.coupon.discout
        );
        console.log("============>>>>>>>>>>>>>>>", totalPrice);
        this.dicount = totalPrice.toFixed(2);
        this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
        console.log("------------>>>>", this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = 0;
        console.log("tax->", this.serviceTax);
        this.deliveryCharge = 0;
        this.grandTotal =
          parseFloat(this.totalPrice) +
          parseFloat(this.serviceTax) +
          parseFloat(this.deliveryCharge);
        this.grandTotal = this.grandTotal.toFixed(2);
      } else {
        console.log("$");
        console.log("per");
        const totalPrice = parseFloat(this.totalPrice) - this.coupon.discout;
        console.log("============>>>>>>>>>>>>>>>", totalPrice);
        this.dicount = this.coupon.discout;
        this.totalPrice = parseFloat(this.totalPrice) - totalPrice;
        console.log("------------>>>>", this.totalPrice);
        this.totalPrice = parseFloat(this.totalPrice).toFixed(2);
        console.log('total item', this.totalItem);
        console.log('=====>', this.totalPrice);
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = 0;
        console.log("tax->", this.serviceTax);
        this.deliveryCharge = 0;
        this.grandTotal =
          parseFloat(this.totalPrice) +
          parseFloat(this.serviceTax) +
          parseFloat(this.deliveryCharge);
        this.grandTotal = this.grandTotal.toFixed(2);
      }
    } else {
      console.log("not satisfied");
      this.coupon = null;
      localStorage.removeItem("coupon");
    }
    console.log("grand totla", this.grandTotal);
    if (this.totalItem === 0) {
      const lng = localStorage.getItem("language");
      const selectedCity = localStorage.getItem("selectedCity");
      const selectedCountry = localStorage.getItem("selectedCountry");
      await localStorage.clear();
      localStorage.setItem("language", lng);
      localStorage.setItem("selectedCity", selectedCity);
      localStorage.setItem("selectedCountry", selectedCountry);
      this.totalItem = 0;
      this.totalPrice = 0;
      this.haveItems = false;
    }
  }

  changeAddress() {
    const navData: NavigationExtras = {
      queryParams: {
        from: "cart",
      },
    };
    this.router.navigate(["choose-address"], navData);
  }
  checkout() {
    if (this.tableNo.trim() == "") {
      this.util.showToast("Please specify Table Number", "danger", "bottom");
      return false;
    }

    if (this.minimumOrder && this.minimumOrder > 0) {
      console.log(this.minimumOrder);
      console.log(this.grandTotal);
      if (this.grandTotal < this.minimumOrder) {
        this.util.showToast(
          "Minimum value should be € " + this.minimumOrder.toFixed(2),
          "danger",
          "bottom"
        );
        return false;
      }
    }

    // return false;

    sessionStorage.setItem("tableNo", this.tableNo);
    sessionStorage.setItem("notes", this.notes);

    const navData: NavigationExtras = {
      queryParams: {
        from: "cart",
      },
    };
    // this.router.navigate(['choose-address'], navData);
    this.router.navigate(["payments"]);
  }

  openCoupon() {
    const navData: NavigationExtras = {
      queryParams: {
        restId: this.vid,
        name: this.name,
        totalPrice: this.totalPrice,
      },
    };
    this.router.navigate(["coupons"], navData);
  }

    getOffers() {
        this.api.getOffers().then(data => {
            this.dummy = [];
            console.log('list=====>', data);
            this.list = [];
            if (data && data.length) {
                const currnetDate = moment().format('YYYY-MM-DD');
                data.forEach(element => {
                    console.log(moment(element.expire).isAfter(currnetDate));
                    if (element && element.status === 'active' && moment(element.expire).isAfter(currnetDate)) {
                        console.log('yes=>', element);
                        this.list.push(element);
                    }
                });
                // this.list = data;
            }
        }).catch(error => {
            this.dummy = [];
            console.log(error);
        });
    }

    claim() {
        this.findedList = null;

        this.listCoupons.map(item => {

            console.log(item)
            if (item.code === this.couponCode) {
                this.findedList = item
            }
        })

        if (this.findedList) {

            if (this.findedList && this.findedList.available && this.findedList.available.length) {
                const data = this.findedList.available.filter(x => x.id === this.restId);
                console.log(data);
                if (data && data.length) {
                    if (this.total >= this.findedList.min) {
                        console.log('ok');
                        this.util.showToast(this.util.translate('Coupon Applied'), 'success', 'bottom');
                        this.util.publishCoupon(this.findedList);
                        this.navCtrl.back();
                    } else {
                        this.util.errorToast(this.util.translate('For claiming this coupon your order required minimum order  of €') + this.findedList.min);
                    }
                } else {
                    this.util.errorToast(this.util.translate('This coupon is not valid for ') + this.name);
                }
            } else {
                this.util.errorToast(this.util.translate('This coupon is not valid for ') + this.name);
            }
        } else {
            this.util.errorToast(this.util.translate('This coupon does not exist '));
        }

    }

    private calculateServiceCharge() {
        this.serviceCharge = (this.serviceChargeRate * this.grandTotal)/100;
        this.grandTotal = +this.serviceCharge + +this.grandTotal;
    }

  switchSegment(order : boolean) : void {
    this.displaySegment = order;
  }

  openDeliveryHome() : void {
    this.navCtrl.navigateForward("/delivery-home");
  }
}
