import { Component, OnInit } from "@angular/core";
import {
  AdMobFree,
  AdMobFreeBannerConfig,
  AdMobFreeInterstitialConfig,
} from "@ionic-native/admob-free/ngx";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { Diagnostic } from "@ionic-native/diagnostic/ngx";
import {
  Geolocation,
  GeolocationOptions,
  Geoposition,
  PositionError,
} from "@ionic-native/geolocation/ngx";
import { Router, NavigationExtras } from "@angular/router";
import { ApisService } from "src/app/services/apis.service";
import { Platform, ModalController, NavController } from "@ionic/angular";
import { UtilService } from "src/app/services/util.service";
import * as moment from "moment";
import { orderBy, uniqBy, filter, includes } from "lodash";
import Swal from "sweetalert2";
declare var google;

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"],
})
export class HomePage implements OnInit {
  plt;
  allRest: any[] = [];
  headerHidden: boolean;
  chips: any[] = [];
  showFilter: boolean;
  lat: any;
  lng: any;
  // address: any;
  dummyRest: any[] = [];
  dummy = Array(50);
  haveLocation: boolean;
  nearme: boolean = false;
  profile: any;
  banners: any[] = [];
  slideOpts = {
    slidesPerView: 1.7,
  };
  cityName: any;
  cityId: any;
  allRestaurants: any = [];
  selectedCategory: string = "";
  currency = "";
  constructor(
    private platform: Platform,
    private androidPermissions: AndroidPermissions,
    private diagnostic: Diagnostic,
    public geolocation: Geolocation,
    private router: Router,
    private api: ApisService,
    private util: UtilService,
    private apis: ApisService,
    public modalController: ModalController,
    private navCtrl: NavController,
    private admobFree: AdMobFree
  ) {
    const currentLng = this.util.getLanguage();
    console.log("current language --->", currentLng);
    this.chips = ["All", "Restaurant", "Pub", "Café", "Bistro", "Other"];
    // ['Ratting 4.0+', 'Fastest Delivery', 'Cost'];
    this.haveLocation = false;
    if (this.platform.is("ios")) {
      this.plt = "ios";
    } else {
      this.plt = "android";
    }
    this.api
      .getBanners()
      .then((data) => {
        console.log(data);
        this.banners = data;
      })
      .catch((error) => {
        console.log(error);
      });
    const city = JSON.parse(localStorage.getItem("selectedCity"));
    console.log(city);
    if (city && city.name) {
      this.cityName = city.name;
      this.cityId = city.id;
      this.getRest();
    }
  }

  addFilter(index) {
    console.log(index);
    this.selectedCategory = index;
    if (index == "All") {
      this.allRest = this.allRestaurants;
    } else {
      let restaurants = [];
      this.allRestaurants.forEach((element) => {
        let _restaurant = includes(element.cusine, index);
        if (_restaurant) restaurants.push(element);
      });

      this.allRest = restaurants;
    }
    // this.allRest =  uniqBy(this.allRest, 'id');
  }
  ionViewWillEnter() {
    this.getLocation();
    this.getProfile();
  }

  // getAddressMy() {
  //   const add = JSON.parse(localStorage.getItem('deliveryAddress'));
  //   if (add && add.address) {
  //     this.address = add.address;
  //     this.lat = add.lat;
  //     this.lng = add.lng;
  //   }
  //   return this.address;
  // }

  getLocation() {
    this.platform.ready().then(() => {
      if (this.platform.is("android")) {
        this.androidPermissions
          .checkPermission(
            this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
          )
          .then(
            (result) => console.log("Has permission?", result.hasPermission),
            (err) =>
              this.androidPermissions.requestPermission(
                this.androidPermissions.PERMISSION.ACCESS_FINE_LOCATION
              )
          );
        this.grantRequest();
      } else if (this.platform.is("ios")) {
        this.grantRequest();
      } else {
        this.geolocation
          .getCurrentPosition({
            maximumAge: 3000,
            timeout: 10000,
            enableHighAccuracy: false,
          })
          .then((resp) => {
            if (resp) {
              console.log("resp", resp);
              this.lat = resp.coords.latitude;
              this.lng = resp.coords.longitude;
              // this.getAddress(this.lat, this.lng);
            }
          })
          .catch((error) => {
            console.log(error);
            this.grantRequest();
          });
      }
    });
  }

  grantRequest() {
    this.diagnostic
      .isLocationEnabled()
      .then(
        (data) => {
          if (data) {
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  console.log("resp", resp);
                  this.lat = resp.coords.latitude;
                  this.lng = resp.coords.longitude;
                  // this.getAddress(this.lat, this.lng);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            this.diagnostic.switchToLocationSettings();
            this.geolocation
              .getCurrentPosition({
                maximumAge: 3000,
                timeout: 10000,
                enableHighAccuracy: false,
              })
              .then((resp) => {
                if (resp) {
                  console.log("ress,", resp);
                  this.lat = resp.coords.latitude;
                  this.lng = resp.coords.longitude;
                  // this.getAddress(this.lat, this.lng);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }
        },
        (error) => {
          console.log("errir", error);
          this.dummy = [];
        }
      )
      .catch((error) => {
        console.log("error", error);
        this.dummy = [];
      });
  }

  ngOnInit() {
    this.currency = localStorage.getItem("selectedCountry") == "IE" ? "€" : "£";
    // add baner
    const bannerConfig: AdMobFreeBannerConfig = {
      id: "ca-app-pub-3940256099942544/6300978111",
      isTesting: false,
      autoShow: true,
    };
    this.admobFree.banner.config(bannerConfig);
    this.admobFree.banner.prepare();
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

  getTime(time) {
    return moment(time).format("mm");
  }

  async presentModal() {
    //   const modal = await this.modalController.create({
    //     component: ChooseAddressPage
    //   });
    //   return await modal.present();
    await this.router.navigate(["choose-address"]);
  }

  nearMe() {
    this.dummy = Array(50);
    this.allRest = [];
    if (this.nearme) {
      this.dummyRest.forEach(async (element) => {
        const distance = await this.distanceInKmBetweenEarthCoordinates(
          this.lat,
          this.lng,
          element.lat,
          element.lng
        );
        console.log("distance", distance);
        // Distance
        if (distance < 10) {
          this.allRest.push(element);
        }
      });
      this.dummy = [];
    } else {
      this.allRest = this.dummyRest;
      this.dummy = [];
    }
  }

  getRest() {
    this.dummy = Array(10);
    this.api
      .getVenues()
      .then(
        (data) => {
          console.log(data);
          if (data && data.length) {
            this.allRest = [];
            data.forEach(async (element) => {
              if (element && element.city === this.cityId) {
                element.time = moment(element.time).format("HH");
                this.allRest.push(element);
                console.log(this.allRest);
                this.allRestaurants.push(element);
                this.dummyRest.push(element);
              }
            });
            this.dummy = [];
          } else {
            this.allRest = [];
            this.dummy = [];
          }
        },
        (error) => {
          console.log(error);
          this.dummy = [];
        }
      )
      .catch((error) => {
        console.log(error);
        this.dummy = [];
      });
  }
  openMenu(item) {
    localStorage.setItem("connectedAcId", item.connectedAcId);
    localStorage.setItem("commission", item.commission);

    if (item && item.status === "close") {
      return false;
    }
    const navData: NavigationExtras = {
      queryParams: {
        id: item.uid,
      },
    };
    this.router.navigate(["category"], navData);
  }

  openOffers(item) {
    const navData: NavigationExtras = {
      queryParams: {
        id: item.restId,
      },
    };
    this.router.navigate(["category"], navData);
  }

  onSearchChange(event) {
    console.log(event.detail.value);

    this.allRest = this.dummyRest.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });
  }

  getCusine(cusine) {
    return cusine.join("-");
  }

  onScroll(event) {
    if (event.detail.deltaY > 0 && this.headerHidden) return;
    if (event.detail.deltaY < 0 && !this.headerHidden) return;
    if (event.detail.deltaY > 80) {
      this.headerHidden = true;
    } else {
      this.headerHidden = false;
    }
  }

  getProfile() {
    if (localStorage.getItem("uid")) {
      this.apis
        .getProfile(localStorage.getItem("uid"))
        .then(
          (data) => {
            console.log(data);
            if (data && data.cover) {
              this.profile = data.cover;
            }
            if (data && data.status === "deactive") {
              localStorage.removeItem("uid");
              this.api.logout().then((data) => {
                console.log(data);
              });
              this.router.navigate(["login"]);
              Swal.fire({
                title: "Error",
                text: "Your are blocked please contact administrator",
                icon: "error",
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: "Need Help?",
                backdrop: false,
                background: "white",
              }).then((data) => {
                if (data && data.value) {
                  this.router.navigate(["inbox"]);
                }
              });
            }
          },
          (err) => {
            console.log("Err", err);
          }
        )
        .catch((e) => {
          console.log("Err", e);
        });
    }
  }

  chipChange(item) {
    this.allRest = this.dummyRest;
    console.log(item);
    if (item === "Fastest Delivery") {
      this.allRest.sort((a, b) => {
        a = new Date(a.time);
        b = new Date(b.time);
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }

    if (item === "Ratting 4.0+") {
      this.allRest = [];

      this.dummyRest.forEach((ele) => {
        if (ele.ratting >= 4) {
          this.allRest.push(ele);
        }
      });
    }

    if (item === "Cost") {
      this.allRest.sort((a, b) => {
        a = a.time;
        b = b.time;
        return a > b ? -1 : a < b ? 1 : 0;
      });
    }
  }
  changeLocation() {
    this.navCtrl.navigateRoot(["cities"]);
  }
}
