import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private apiUrl =
    'https://gateway.apiportal.ns.nl/reisinformatie-api/api/v3/trips';
  private apiKey = 'b075328075fa4eb5aa27c3e3f639c637'; // Replace with your actual API key

  constructor(private http: HttpClient) {}

  getTrips(fromStation: string, toStation: string): Observable<any> {
    const headers = new HttpHeaders({
      'Ocp-Apim-Subscription-Key': this.apiKey,
    });

    const params = {
      fromStation,
      toStation,
      originWalk: 'false',
      originBike: 'false',
      originCar: 'false',
      destinationWalk: 'false',
      destinationBike: 'false',
      destinationCar: 'false',
      shorterChange: 'false',
      travelAssistance: 'false',
      searchForAccessibleTrip: 'false',
      localTrainsOnly: 'false',
      excludeHighSpeedTrains: 'false',
      excludeTrainsWithReservationRequired: 'false',
      discount: 'NO_DISCOUNT',
      travelClass: '2',
      passing: 'false',
      travelRequestType: 'DEFAULT',
    };

    return this.http.get(this.apiUrl, { headers, params });
  }
}
