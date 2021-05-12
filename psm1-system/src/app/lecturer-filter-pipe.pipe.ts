import { Pipe, PipeTransform } from '@angular/core';
import { EngineServiceService } from './engine-service.service';

@Pipe({
	name: 'lecturerFilterPipe',
	pure: false
})
export class LecturerFilterPipePipe implements PipeTransform {

	constructor(private es:EngineServiceService) {}

	transform(lecturer:any, [domain,supervisor]:any): any {

		let output = [];

		for(let lec of lecturer) {
			if(lec.lecturerDomain == domain && lec.lecturerId != supervisor) {
				output.push(lec);
			}
		}

		return output;
	}

}
