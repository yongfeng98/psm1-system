import { Pipe, PipeTransform } from '@angular/core';
import { EngineServiceService } from './engine-service.service';

@Pipe({
	name: 'sessionSemesterPipe',
	pure: false
})
export class SessionSemesterPipePipe implements PipeTransform {

	constructor(private es:EngineServiceService) {}

	transform(student:any) : any {

		let output = [];
		let session = [];
		let semester = [];

		if(this.es.supervisorStudentSemesterArrayDisplayAllChecked) {
			output = this.es.supervisorStudentArray;
			return output;
		}

		for(var i=0; i<this.es.supervisorStudentSessionArrayChecked.length; i++)  {
			if(this.es.supervisorStudentSessionArrayChecked[i]) {
				session.push(this.es.supervisorStudentSessionArray[i]);
			}
			
		}

		for(var i=0; i<this.es.supervisorStudentSemesterArrayChecked.length; i++)  {
			if(this.es.supervisorStudentSemesterArrayChecked[i]) {
				semester.push(this.es.supervisorStudentSemesterArray[i]);
			}
			
		}

		for(let student of this.es.supervisorStudentArray) {
			if(semester.includes(student.semester) || session.includes(student.session)) {
				output.push(student);
			}
		}

		return output;
	}

}
