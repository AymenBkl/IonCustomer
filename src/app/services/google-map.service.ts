import { Injectable, NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GoogleMapsAPIWrapper, MapsAPILoader } from "@agm/core";
import { Observable } from "rxjs";
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder/ngx";

@Injectable({
  providedIn: "root",
})
export class GoogleMapService extends GoogleMapsAPIWrapper {
  geocoder: Promise<any>;

  place1;
  place2;

  constructor(
    private httpClient: HttpClient,
    private mapsApiLoader: MapsAPILoader,
    private zone: NgZone,
    private nativeGeocoder: NativeGeocoder
  ) {
    super(mapsApiLoader, zone);
    this.geocoder = this.mapsApiLoader
      .load()
      .then(() => new google.maps.Geocoder());
  }

  getLatLan(address: string,place : boolean): Observable<any> {
    return Observable.create((observer) => {
      this.geocoder.then((geocoder) => {
        geocoder.geocode({ address: address }, (results, status) => {
          console.log(results);
          if (status === google.maps.GeocoderStatus.OK) {
            const l1 = results[0].geometry.location.lat();
            const l2 = results[0].geometry.location.lng();
            if (place) {
              this.place1 = new google.maps.LatLng(l1,l2)
            }
            else {
              this.place2 = new google.maps.LatLng(l1,l2)
            }
            observer.next(results[0].geometry.location);
            observer.complete();
          } else {
            console.error("Error - ", results, " & Status - ", status);
            observer.next({});
            observer.complete();
          }
        });
      });
    });
  }

   getAddress(query: string) {
    return new Promise((resolve, reject) => {
        this.geocoder.then(geocoder => {
          geocoder.geocode({ searchText: query }, result => {
            if(result.Response.View.length > 0) {
                if(result.Response.View[0].Result.length > 0) {
                  console.log("lol");
                    resolve(result.Response.View[0].Result);
                } else {
                    reject({ message: "no results found" });
                }
            } else {
                reject({ message: "no results found" });
            }
        }, error => {
            reject(error);
        });
    });
  })
}

calculateDistance(address1 : string,address2 : string)  {
  this.getLatLan(address1,true)
    .subscribe(data => {
      this.getLatLan(address2,false)
        .subscribe(data => {
          let directionsService = new google.maps.DirectionsService();
          var request = {
            origin: this.place1, // LatLng|string
            destination: this.place2, // LatLng|string
            travelMode: google.maps.TravelMode.TWO_WHEELER
        }; 
        directionsService.route(request,(response,status) => {
          console.log(response);
          if (status === 'OK') {
            var result = response.routes[0].legs[0];
            const distance = result.distance.text;
            const duration =  result.duration.text;
            localStorage.setItem("homeAddresse","{address : "+ address2 + ",distance : "+ distance +", duration : "+ duration +" }");
            console.log(result.duration.text,result.distance.text,result.departure_time.text);
          }
        })
          console.log(google.maps.geometry.spherical.computeDistanceBetween(this.place1,this.place2));
          console.log("data maps",data);
        },err => {
          console.log("errr",err);
        })
      console.log("data maps",data);
    },err => {
      console.log("errr",err);
    })
}
}