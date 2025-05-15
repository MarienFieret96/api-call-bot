import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TripService } from './trip.service';
import {
  from,
  of,
  switchMap,
  concatMap,
  delay,
  map,
  toArray,
  bufferCount,
  catchError,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StationService {
  private stationsUrl = 'assets/stations.json'; // Path to stations.json
  private maxApiCallsPerMinute = 75; // Limit to 10 API calls per minute

  constructor(private http: HttpClient, private tripService: TripService) {}

  processStations() {
    this.http
      .get<any>(this.stationsUrl)
      .pipe(
        switchMap((stations) => {
          // Save the initial stations data to local storage
          localStorage.setItem('stations', JSON.stringify(stations));

          const stationKeys = Object.keys(stations);
          const requests = [];

          // Loop over each station
          for (const fromStation of stationKeys) {
            const connections = stations[fromStation]?.connections || [];
            for (const connection of connections) {
              const toStation = connection.station;

              // Create an API call for each fromStation-toStation pair
              const request = this.tripService
                .getTrips(fromStation, toStation)
                .pipe(
                  map((response) => {
                    // Find the minimum plannedDurationInMinutes
                    const durations = response.trips.map(
                      (trip: any) => trip.plannedDurationInMinutes
                    );
                    const minDuration = Math.min(...durations);

                    // Update the connection's duration
                    connection.duration = minDuration;

                    // Save the updated stations data to local storage
                    const updatedStations = JSON.parse(
                      localStorage.getItem('stations') || '{}'
                    );
                    updatedStations[fromStation].connections = connections;
                    localStorage.setItem(
                      'stations',
                      JSON.stringify(updatedStations)
                    );
                  }),
                  catchError((error) => {
                    // Log the error and continue
                    console.error(
                      `Error processing ${fromStation} -> ${toStation}:`,
                      error
                    );
                    return of(null); // Return a null observable to continue the stream
                  })
                );

              requests.push(request);
            }
          }

          // Group requests into batches of 10
          return from(requests).pipe(
            bufferCount(this.maxApiCallsPerMinute), // Group requests into batches of 10
            concatMap((batch, batchIndex) =>
              of(batch).pipe(
                delay(60000), // Delay each batch by 1 minute
                tap(() =>
                  console.log(
                    `${Date.now()}Processing Batch ${batchIndex + 1}:`,
                    batch
                  )
                ), // Log the batch before processing
                switchMap(() =>
                  from(batch).pipe(
                    concatMap((request) => request) // Execute each request in the batch sequentially
                  )
                )
              )
            ),
            toArray(), // Collect all results
            map(() => JSON.parse(localStorage.getItem('stations') || '{}')) // Return the updated stations
          );
        })
      )
      .subscribe({
        next: (updatedStations) => {
          console.log('Final Updated Stations:', updatedStations);
        },
        error: (err) => {
          console.error('An error occurred during processing:', err);
        },
      });
  }
}
