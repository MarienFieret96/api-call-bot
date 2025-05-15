import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { StationService } from './services/station.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'api-call-bot';

  constructor(private stationService: StationService) {}

  ngOnInit(): void {
    this.stationService.processStations();
  }
}
