import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { EngineServiceService } from './engine-service.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	

	constructor(public es:EngineServiceService) {

	}

	ngAfterViewInit() {

	}

}
