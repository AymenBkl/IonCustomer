import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ApisService } from "src/app/services/apis.service";
import { UtilService } from "src/app/services/util.service";
import * as moment from "moment";
import swal from "sweetalert2";
import { NavController } from "@ionic/angular";

import { environment } from "src/environments/environment";
import { HttpHeaders } from "@angular/common/http";

import {
  InAppBrowser,
  InAppBrowserOptions,
} from "@ionic-native/in-app-browser/ngx";

@Component({
  selector: "app-stripe-payments",
  templateUrl: "./stripe-payments.page.html",
  styleUrls: ["./stripe-payments.page.scss"],
})
export class StripePaymentsPage implements OnInit {
  cid: any;
  cards: any[] = [];
  card_token: any;
  totalPrice: any = 0;
  totalItem: any = 0;
  serviceTax: any = 0;
  deliveryCharge: any = 5;
  grandTotal: any = 0;
  deliveryAddress: any;
  venueFCM: any[] = [];
  vid: any = "";
  payKey: any = "";
  coupon: any;
  dicount: any;
  currency: any = "";
  connectAccountId = "";
  commissionRate = 0;

  email = "";

  constructor(
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private navCtrl: NavController,
    private iab: InAppBrowser
  ) {
    this.connectAccountId = localStorage.getItem("connectedAcId");
    const commission = Number(localStorage.getItem("commission"));
    this.commissionRate = commission ? commission : 0;
  }

  getCards() {
    this.api
      .httpGet(
        "https://api.stripe.com/v1/customers/" +
          this.cid +
          "/sources?object=card"
      )
      .subscribe(
        (cards: any) => {
          console.log(cards);
          if (cards && cards.data) {
            this.cards = cards.data;
            this.card_token = this.cards[0].id;
            this.util.hide();
          }
        },
        (error) => {
          this.util.hide();
          console.log(error);
          this.util.hide();
          if (
            error &&
            error.error &&
            error.error.error &&
            error.error.error.message
          ) {
            this.util.showErrorAlert(error.error.error.message);
            return false;
          }
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      );
  }

  cloneCustomerId() {
    this.util.show();
    const customer = {
      customer: this.cid,
    };
    const header = {
      headers: new HttpHeaders()
        .set("Content-Type", "application/x-www-form-urlencoded")
        .set("Authorization", `Bearer ${environment.stripe.sk}`)
        .set("Stripe-Account", this.connectAccountId),
    };
    this.api
      .httpPostWithHeader("https://api.stripe.com/v1/tokens", customer, header)
      .subscribe(
        (data: any) => {
          if (data.id) {
            const customerData = {
              description: "Customer for food app",
              source: data.id,
              email: this.email,
            };
            this.api
              .httpPostWithHeader(
                "https://api.stripe.com/v1/customers",
                customerData,
                header
              )
              .subscribe(
                (customer: any) => {
                  if (customer && customer.id) {
                    this.cid = customer.id;
                    this.payment();
                    this.util.hide();
                  } else {
                    this.util.hide();
                  }
                },
                (error) => {
                  console.error(error);
                  this.util.hide();
                  this.util.errorToast(
                    this.util.translate("Something went wrong")
                  );
                }
              );
          }
        },
        (error) => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      );
  }

  getProfile() {
    this.util.show();
    console.log("loca", localStorage.getItem("uid"));
    this.api
      .getProfile(localStorage.getItem("uid"))
      .then(
        (data: any) => {
          console.log("data", data);
          if (data && data.cid) {
            this.cid = data.cid;
            this.email = data.email;
            this.getCards();
          } else {
            this.util.hide();
          }
        },
        (error) => {
          console.log(error);
          this.util.hide();
          this.util.errorToast(this.util.translate("Something went wrong"));
        }
      )
      .catch((error) => {
        console.log(error);
        this.util.hide();
        this.util.errorToast(this.util.translate("Something went wrong"));
      });
  }

  async ngOnInit() {
    this.currency = localStorage.getItem("selectedCountry") == "IE" ? "€" : "£";
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
    this.calculate(recheck);
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
    this.serviceTax = 0;
    console.log("tax->", this.serviceTax);
    this.deliveryCharge = 0;
    this.grandTotal =
      parseFloat(this.totalPrice) +
      parseFloat(this.serviceTax) +
      parseFloat(this.deliveryCharge);
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
  }

  payment() {
    // Show a confirmation prompt
    swal
      .fire({
        title: this.util.translate("Are you sure?"),
        text: this.util.translate(
          "Orders once placed cannot be cancelled and are non-refundable"
        ),
        icon: "question",
        confirmButtonText: this.util.translate("Yes"),
        cancelButtonText: this.util.translate("cancel"),
        showCancelButton: true,
        backdrop: false,
        background: "white",
      })
      .then((data) => {
        // Construct a 'CREATE PAYMENT INTENT' stripe API call
        if (data && data.value) {
          const amount = Math.round(this.grandTotal * 100);
          const options = {
            amount: amount,
            currency: this.currency == "€" ? "eur" : "gbp",
            payment_method_types: ["card"],
            payment_method_options: {
              card: {
                request_three_d_secure: "any",
              },
            },
            customer: this.cid,
            statement_descriptor: "Direct chare for Ordo",
            confirm: true,
          };
          // Stripe will not accept a 0 value for this, so it must only be included if there is an application fee
          if (this.commissionRate > 0) {
            // I think this is the closest equivalent to toFixed which will produce a number
            // but Math.floor / Math.ceiling may be more appropriate
            options["application_fee_amount"] = Math.round(
              (amount * this.commissionRate) / 100
            );
          }
          const header = {
            headers: new HttpHeaders()
              .set("Content-Type", "application/x-www-form-urlencoded")
              .set("Authorization", `Bearer ${environment.stripe.sk}`)
              .set("Stripe-Account", this.connectAccountId),
          };

          const url = "https://api.stripe.com/v1/payment_intents";
          this.util.show();
          this.api.httpPostWithHeader(url, options, header).subscribe(
            (data: any) => {
              const id = data.id;
              const source = data.source;
              this.util.hide();

              const redirect_url = "https://www.test.com/";
              const options1 = {
                return_url: redirect_url,
              };

              const header1 = {
                headers: new HttpHeaders()
                  .set("Content-Type", "application/x-www-form-urlencoded")
                  .set("Authorization", `Bearer ${environment.stripe.sk}`)
                  .set("Stripe-Account", this.connectAccountId),
              };

              const url =
                "https://api.stripe.com/v1/payment_intents/" + id + "/confirm";
              this.util.show();
              this.api.httpPostWithHeader(url, options1, header1).subscribe(
                (data: any) => {
                  const options: InAppBrowserOptions = {
                    zoom: "no",
                    fullscreen: "yes",
                    hidenavigationbuttons: "no",
                    toolbar: "no",
                    hideurlbar: "yes",
                  };

                  const browser = this.iab.create(
                    data.next_action.redirect_to_url.url,
                    "_blank",
                    {
                      toolbar: "no",
                      hideurlbar: "yes",
                      fullscreen: "yes",
                      location: "no",
                      options,
                    }
                  );

                  browser.on("loadstart").subscribe((event) => {
                    if (event.url.split("?")[0] === redirect_url) {
                      browser.close();
                      const paymentIntent = event.url
                        .split("?")[1]
                        .split("&")[0]
                        .split("=")[1];
                      this.api
                        .httpPostWithHeader(
                          "https://api.stripe.com/v1/payment_intents/" +
                            paymentIntent,
                          {},
                          header
                        )
                        .subscribe(
                          (success: any) => {
                            if (success.status === "succeeded") {
                              this.util.hide();
                              this.createOrder();
                            }
                          },
                          (error) => {
                            console.error(error);
                            this.util.hide();
                            this.util.showErrorAlert(error);
                          }
                        );
                    }
                  });
                  this.util.hide();
                },
                (error) => {
                  this.util.hide();
                  if (
                    error &&
                    error.error &&
                    error.error.error &&
                    error.error.error.message
                  ) {
                    this.util.showErrorAlert(error.error.error.message);
                    return false;
                  }
                  this.util.errorToast("Something went wrong");
                }
              );
            },
            (error) => {
              this.util.hide();
              if (
                error &&
                error.error &&
                error.error.error &&
                error.error.error.message
              ) {
                this.util.showErrorAlert(error.error.error.message);
                return false;
              }
              this.util.errorToast("Something went wrong");
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
              address: "Address Created by Application",
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
              orderId: id,
              vid: this.vid,
              order: JSON.stringify(recheck),
              time: moment().format("llll"),
              address: this.deliveryAddress,
              total: this.totalPrice,
              grandTotal: this.grandTotal,
              serviceTax: this.serviceTax,
              deliveryCharge: 0,
              status: "accepted",
              restId: this.vid,
              paid: "stripe",
              paykey: this.payKey,
              appliedCoupon: this.coupon ? true : false,
              couponId: this.coupon ? this.coupon.id : "NA",
              coupon: this.coupon ? JSON.stringify(this.coupon) : "NA",
              dicount: this.coupon ? this.dicount : 0,
              table: sessionStorage.getItem("tableNo"),
              notes: sessionStorage.getItem("notes"),
            };
            console.log("sent", param);
            this.api
              .createOrder(id, param)
              .then(
                async (data) => {
                  this.util.hide();
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

  ionViewWillEnter() {
    this.getProfile();
  }

  onAdd() {
    this.router.navigate(["add-card"]);
  }
  changeMethod(id) {
    this.card_token = id;
  }
}
