import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import swal from "sweetalert2";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import { NavController } from "@ionic/angular";
import {
  PayPal,
  PayPalPayment,
  PayPalConfiguration,
} from "@ionic-native/paypal/ngx";
import {ActivatedRoute} from '@angular/router' 
import * as moment from "moment";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-payments",
  templateUrl: "./payments.page.html",
  styleUrls: ["./payments.page.scss"],
})
export class PaymentsPage implements OnInit {
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 5;
  grandTotal: any = 0;
  deliveryAddress: any;
  venueFCM: any = "";
  vid: any = "";
  coupon: any;
  dicount: any;
  payKey: any = "";
  address : any;
  mode : any;
  deliverytime;
  extraCharge : any;
  homeDelivery : any;
  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private payPal: PayPal,
    private activtedRouter : ActivatedRoute
  ) {}

  async ngOnInit() {
    const foods = await JSON.parse(localStorage.getItem("foods"));
    let recheck = await foods.filter((x) => x.quantiy > 0);
    console.log(recheck);
    const add = JSON.parse(localStorage.getItem("deliveryAddress"));
    this.vid = localStorage.getItem("vid");
    this.api
      .getVenueUser(this.vid)
      .then(
        (data) => {
          console.log("venue", data);
          if (data && data.fcm_tokens) {
            this.venueFCM = data.fcm_tokens;
            console.log("vencueFCM: " + this.venueFCM);
          }
        },
        (error) => {
          this.util.errorToast(this.util.translate("Something went wrong"));
          this.router.navigate(["tabs"]);
        }
      )
      .catch((error) => {
        this.util.errorToast(this.util.translate("Something went wrong"));
        this.router.navigate(["tabs"]);
        console.log(error);
      });
    if (add && add.address) {
      this.deliveryAddress = add;
    }
    this.coupon = JSON.parse(localStorage.getItem("coupon"));
    console.log("COUPON===================", this.coupon);
    console.log("ADDRESS===================", this.deliveryAddress);
    this.calculate(recheck);
    this.getData();
    this.createOrder();
  }

  async calculate(foods) {
    console.log(foods);
    let item = foods.filter((x) => x.quantiy > 0);
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
    this.serviceTax = tax.toFixed(2);
    console.log("tax->", this.serviceTax);
    this.deliveryCharge = 0;
    this.grandTotal = parseFloat(this.totalPrice);
    this.grandTotal = this.grandTotal.toFixed(2);
    console.log("grand totla", this.grandTotal);
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
        this.serviceTax = tax.toFixed(2);
        console.log("tax->", this.serviceTax);
        this.deliveryCharge = 0;
        this.grandTotal = parseFloat(this.totalPrice);
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
        const tax = (parseFloat(this.totalPrice) * 21) / 100;
        this.serviceTax = tax.toFixed(2);
        console.log("tax->", this.serviceTax);
        this.deliveryCharge = 0;
        this.grandTotal = parseFloat(this.totalPrice);
        this.grandTotal = this.grandTotal.toFixed(2);
      }
    } else {
      console.log("not satisfied");
      this.coupon = null;
      localStorage.removeItem("coupon");
    }
  }
  placeOrder() {
    console.log("place order");
    swal
      .fire({
        title: this.util.translate("Are you sure?"),
        text: this.util.translate(
          "Orders once placed cannot be cancelled and are non-refundable"
        ),
        icon: "question",
        showCancelButton: true,
        backdrop: false,
        background: "white",
        confirmButtonText: this.util.translate("Yes"),
        cancelButtonText: this.util.translate("cancel"),
      })
      .then((data) => {
        console.log(data);
        if (data && data.value) {
          console.log("go to procesed");
          this.createOrder();
        }
      });
  }

  // For Testing Generate Credit Card American Express
  // https://developer.paypal.com/developer/creditCardGenerator/
  payWithPaypal() {
    swal
      .fire({
        title: this.util.translate("Are you sure?"),
        text: this.util.translate(
          "Orders once placed cannot be cancelled and are non-refundable"
        ),
        icon: "question",
        showCancelButton: true,
        backdrop: false,
        background: "white",
        confirmButtonText: this.util.translate("Yes"),
        cancelButtonText: this.util.translate("cancel"),
      })
      .then((data) => {
        console.log(data);
        if (data && data.value) {
          console.log("go to procesed");
          this.payPal
            .init({
              PayPalEnvironmentProduction: environment.paypal.production,
              PayPalEnvironmentSandbox: environment.paypal.sandbox,
            })
            .then(
              () => {
                this.payPal
                  .prepareToRender(
                    "PayPalEnvironmentSandbox",
                    new PayPalConfiguration({})
                  )
                  .then(
                    () => {
                      const payment = new PayPalPayment(
                        this.grandTotal,
                        "USD",
                        "Food Delivery",
                        "sale"
                      );
                      this.payPal.renderSinglePaymentUI(payment).then(
                        (res) => {
                          console.log(res);
                          this.payKey = res.response.id;
                          this.paypalOrder();
                        },
                        (error: any) => {
                          console.log("error", error);
                          this.util.showToast(error, "danger", "bottom");
                          // Error or render dialog closed without being successful
                        }
                      );
                    },
                    (error: any) => {
                      console.log("error", error);
                      this.util.showToast(error, "danger", "bottom");
                      // Error in configuration
                    }
                  );
              },
              (error: any) => {
                console.log("error", error);
                this.util.showToast(error, "danger", "bottom");
                // Error in initialization, maybe PayPal isn't supported or something else
              }
            );
        }
      });
  }

  degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    console.log(lat1, lon1, lat2, lon2);
    const earthRadiusKm = 6371;
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }
  async createOrder() {
    this.util.show("creating order");
    this.api
      .checkAuth()
      .then(
        async (data: any) => {
          console.log(data);
          if (data) {
            // not from saved address then create new and save

            const addressId = this.util.makeid(10);
            const newAddress = {
              id: addressId,
              uid: data.uid,
              address: this.address,
              lat: "0",
              lng: "0",
              title: "home",
              house: "--",
              landmark: "--",
            };
            await this.api
              .addNewAddress(data.uid, addressId, newAddress)
              .then(
                (data) => {
                  this.deliveryAddress = newAddress;
                  this.deliveryAddress.id = addressId;
                },
                (error) => {
                  console.log(error);
                }
              )
              .catch((error) => {
                console.log(error);
              });

            const foods = await JSON.parse(localStorage.getItem("foods"));
            let recheck = await foods.filter((x) => x.quantiy > 0);
            console.log("ordered food", recheck);
            let id = this.util.makeid(10);
            await localStorage.removeItem("foods");
            await localStorage.removeItem("vid");
            await localStorage.removeItem("totalItem");
            const uid = localStorage.getItem("uid");
            const lng = localStorage.getItem("language");
            const selectedCity = localStorage.getItem("selectedCity");
            const selectedCountry = localStorage.getItem("selectedCountry");
            await localStorage.clear();
            localStorage.setItem("uid", uid);
            localStorage.setItem("language", lng);
            localStorage.setItem("selectedCity", selectedCity);
            localStorage.setItem("selectedCountry", selectedCountry);
            const param = {
              uid: data.uid,
              userId: data.uid,
              orderId: this.vid,
              vid: id,
              order: JSON.stringify(recheck),
              time: moment().format("llll"),
              address: this.deliveryAddress,
              total: this.totalPrice,
              grandTotal: this.grandTotal,
              deliverTime:this.deliverytime,
              mode : this.mode,
              homeDeliver : this.homeDelivery,
              serviceTax: 0,
              deliveryCharge: this.extraCharge == 0 ? 0 : this.extraCharge,
              status: "created",
              restId: this.vid,
              table: sessionStorage.getItem("tableNo"),
              notes: sessionStorage.getItem("notes"),
              // driverId: this.drivers[0].uid,
              // dId: this.drivers[0].uid,
              paid: "cod",
              appliedCoupon: this.coupon ? true : false,
              couponId: this.coupon ? this.coupon.id : "NA",
              coupon: this.coupon ? JSON.stringify(this.coupon) : "NA",
              dicount: this.coupon ? this.dicount : 0,
            };
            console.log("sent", param);
            this.api
              .createOrder(id, param)
              .then(
                async (data) => {
                  this.util.hide();

                  if (this.venueFCM && this.venueFCM.length !== 0) {
                    this.api
                      .sendNotifications(
                        "A new order has been placed.",
                        "Order Placed",
                        this.venueFCM
                      )
                      .subscribe(
                        (data) => {
                          console.log("send notifications", data);
                        },
                        (error) => {
                          console.log(error);
                        }
                      );
                  }
                  swal.fire({
                    title: this.util.translate("Success"),
                    text: "Your order was created successfully",
                    icon: "success",
                    backdrop: false,
                  });

                  this.navCtrl.navigateRoot(["tabs/tab2"]);
                  console.log(data);
                },
                (error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  this.router.navigate(["tabs"]);
                }
              )
              .catch((error) => {
                this.util.hide();
                this.util.errorToast(
                  this.util.translate("Something went wrong")
                );
                this.router.navigate(["tabs"]);
                console.log(error);
              });
          } else {
            this.util.hide();
            this.util.errorToast(this.util.translate("Session expired"));
            this.router.navigate(["login"]);
          }
        },
        (error) => {
          this.util.hide();
          this.util.errorToast(this.util.translate("Session expired"));
          this.router.navigate(["login"]);
        }
      )
      .catch((error) => {
        this.util.hide();
        this.util.errorToast(this.util.translate("Session expired"));
        this.router.navigate(["login"]);
        console.log(error);
      });
  }

  async paypalOrder() {
    this.util.show("creating order");
    this.api
      .checkAuth()
      .then(
        async (data: any) => {
          console.log(data);
          if (data) {
            // not from saved address then create new and save
            if (!this.deliveryAddress.id || this.deliveryAddress.id === "") {
              const addressId = this.util.makeid(10);
              const newAddress = {
                id: addressId,
                uid: data.uid,
                address: this.deliveryAddress.address,
                lat: this.deliveryAddress.lat,
                lng: this.deliveryAddress.lng,
                title: "home",
                house: "",
                landmark: "",
              };
              await this.api
                .addNewAddress(data.uid, addressId, newAddress)
                .then(
                  (data) => {
                    this.deliveryAddress.id = addressId;
                  },
                  (error) => {
                    console.log(error);
                  }
                )
                .catch((error) => {
                  console.log(error);
                });
            }
            const foods = await JSON.parse(localStorage.getItem("foods"));
            let recheck = await foods.filter((x) => x.quantiy > 0);
            console.log("ordered food", recheck);
            let id = this.util.makeid(10);
            await localStorage.removeItem("foods");
            await localStorage.removeItem("vid");
            await localStorage.removeItem("totalItem");
            const uid = localStorage.getItem("uid");
            const lng = localStorage.getItem("language");
            const selectedCity = localStorage.getItem("selectedCity");
            const selectedCountry = localStorage.getItem("selectedCountry");
            await localStorage.clear();
            localStorage.setItem("uid", uid);
            localStorage.setItem("language", lng);
            localStorage.setItem("selectedCity", selectedCity);
            localStorage.setItem("selectedCountry", selectedCountry);
            const param = {
              uid: data.uid,
              userId: data.uid,
              orderId: id,
              vid: this.vid,
              order: JSON.stringify(recheck),
              time: moment().format("llll"),
              address: this.deliveryAddress,
              deliverTime:this.deliverytime,
              mode : this.mode,
              total: this.totalPrice,
              grandTotal: this.grandTotal,
              serviceTax: this.serviceTax,
              deliveryCharge: this.extraCharge,
              status: "accepted",
              restId: this.vid,
              paid: "paypal",
              paykey: this.payKey,
              appliedCoupon: this.coupon ? true : false,
              couponId: this.coupon ? this.coupon.id : "NA",
              coupon: this.coupon ? JSON.stringify(this.coupon) : "NA",
              dicount: this.coupon ? this.dicount : 0,
            };
            console.log("sent", param);
            this.api
              .createOrder(id, param)
              .then(
                async (data) => {
                  this.util.hide();
                  if (this.venueFCM && this.venueFCM.length !== 0) {
                    this.api
                      .sendNotifications(
                        "A new order has been placed.",
                        "Order Placed",
                        this.venueFCM
                      )
                      .subscribe(
                        (data) => {
                          console.log("send notifications", data);
                        },
                        (error) => {
                          console.log(error);
                        }
                      );
                  }
                  swal.fire({
                    title: this.util.translate("Success"),
                    text: this.util.translate("Your is created succesfully"),
                    icon: "success",
                    backdrop: false,
                  });
                  this.navCtrl.navigateRoot(["tabs/tab2"]);
                  console.log(data);
                },
                (error) => {
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                  this.router.navigate(["tabs"]);
                }
              )
              .catch((error) => {
                this.util.hide();
                this.util.errorToast(
                  this.util.translate("Something went wrong")
                );
                this.router.navigate(["tabs"]);
                console.log(error);
              });
          } else {
            this.util.hide();
            this.util.errorToast(this.util.translate("Session expired"));
            this.router.navigate(["login"]);
          }
        },
        (error) => {
          this.util.hide();
          this.util.errorToast(this.util.translate("Session expired"));
          this.router.navigate(["login"]);
        }
      )
      .catch((error) => {
        this.util.hide();
        this.util.errorToast(this.util.translate("Session expired"));
        this.router.navigate(["login"]);
        console.log(error);
      });
  }

  openStripe() {
    this.router.navigate(["stripe-payments"]);
  }

  getData() {
    this.address = this.activtedRouter.snapshot.paramMap.get('address');
    this.deliverytime = this.activtedRouter.snapshot.paramMap.get('time');
    this.mode = this.activtedRouter.snapshot.paramMap.get('mode');
    this.extraCharge = this.activtedRouter.snapshot.paramMap.get('homePrice');
    this.homeDelivery = this.activtedRouter.snapshot.paramMap.get('estimated');
  }
}
