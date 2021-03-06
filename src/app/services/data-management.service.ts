import { Injectable } from '@angular/core';
import { SessionStorageService } from 'ngx-store';
import { DataMonitoringService } from './httpRequest/data-monitoring.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagementService {

  constructor(
    private sessionStorageService: SessionStorageService,
    private dmService: DataMonitoringService
  ) { }

  /** 
   * Date formatting 
   */
  formattingDate(date: Date): string {
    console.log(date);
    function pad2(n) { return n < 10 ? '0' + n : n }

    var parsedDate = [
      date.getFullYear().toString(),
      pad2(date.getMonth() + 1),
      pad2(date.getDate()),
      pad2(date.getHours()),
      pad2(date.getMinutes()),
      pad2(date.getSeconds())
    ];

    var result: string =  parsedDate[0] + '/' + parsedDate[1] + '/' + parsedDate[2] + ' '
      + parsedDate[3] + ':' + parsedDate[4] + ':' + parsedDate[5];

    console.log(result);
    return result;
  }

  /**
   * Temperature unit change function
   */
  CelsiusToFahr(C_data: any): any {
    var result: any = [];
    for (var i = 0; i < C_data.length; i++) {
      result.push(Math.floor(C_data[i] * 1.8 + 32));
    }
    return result;
  }

  FahrenheitToCels(F_data: any): any {
    var result: any = [];
    for (var i = 0; i < F_data.length; i++) {
      result.push(Math.floor((F_data[i] - 50) * 0.5556));
    }
    return result;
  }

  /**
   * get current latlng function
   */
  getCurrentLatlng(cb) {
    navigator.geolocation.getCurrentPosition((currentLatlng) => {
      cb({ latitude: currentLatlng.coords.latitude, longitude: currentLatlng.coords.longitude });
    })
  }

  /**
   * get current address function
   */
  getCurrentAddress(cb) {
    this.getCurrentLatlng((currentLatlng) => {
      this.dmService.latlngToAddress(currentLatlng.latitude, currentLatlng.longitude, (address) => {
        cb({ currentLatlng: currentLatlng, address: address });
      })
    })
  }

  /**
   * return minimum index and value
   */
  min(array: any): any {
    var min = array[0];
    var minidx = 0;
    for (var i = 1; i < array.length; i++) {
      if (min > array[i]) {
        min = array[i];
        minidx = i;
      }
    }
    return { idx: minidx, value: min };
  }

  /**
   * calculate distance function
   */
  getDistances(from: any, to: any): any {
    var result: any = [];

    for (var i = 0; i < to.length; i++) {
      var lat = from.latitude - to[i].latitude;
      var lng = from.longitude - to[i].longitude;
      result.push(lat * lat + lng * lng);
    }
    console.log('Distances: ', result);
    return result;
  }

  /** 
   * get Chart data 
   */
  getChartData(data: any): any {
    var chartData: any = {};

    for (var key in data[0]) {
      chartData[key] = { data: [], label: '' };
    }

    for (var i = 0; i < data.length; i++) {
      for (var key in data[i]) {
        chartData[key]['data'].push(data[i][key]);
        chartData[key]['label'] = key;
      }
    }

    return chartData;
  }


  /**
   * extract specified number data
   */
  extractDataTo(num: number, data: any): any {
    if (num > data.length || num == 0) return null;
    else {
      var result: any = [];
      var numOfDistance: number = Math.floor(data.length / num);

      for (var i = numOfDistance - 1; i < data.length; i += numOfDistance) {
        if (num == 0) break;

        result.push(data[i]); num--;
      }
      return result;
    }
  }


  /**
   * get the nearest sensor's data
   */
  getNearestSensorData(cb) {
    this.getCurrentAddress((currentAddress) => {

      var currentTime: Date = new Date();
      var payload = {
        nsc: this.sessionStorageService.get('userInfo').nsc,
        ownership: 1,
        start_tsp: new Date(new Date(currentTime.getTime()).setDate(currentTime.getDate() - 2)),
        end_tsp: currentTime,
        num_of_retransmission: 0,
        list_of_unsuccessful_serials: [],
        tlv: {
          nation: currentAddress.address.results[0].address_components[7].short_name,
          state: currentAddress.address.results[0].address_components[6].short_name,
          city: currentAddress.address.results[0].address_components[4].short_name
        }
      }

      this.dmService.HAV(payload, (result) => {

        // callback
        if (result != null) {
          /** Finding the nearest sensor */
          var tlv: any = result.payload.tlv;
          var distances: any = this.getDistances(currentAddress.currentLatlng, tlv);
          var selectedMac: string = tlv[this.min(distances).idx]['mac'];
          var nearestSensorData: any = [];

          for (var i = 0; i < tlv.length; i++) {
            if (tlv[i]['mac'] == selectedMac)
              nearestSensorData.push(tlv[i]);
          }
          cb(nearestSensorData);
        }
        else cb(null);
      });
    });
  }

}
