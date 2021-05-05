import { Component } from '@angular/core';
import { EngineServiceService } from './engine-service.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'psm1-system';

	constructor(public es:EngineServiceService) {}
}
