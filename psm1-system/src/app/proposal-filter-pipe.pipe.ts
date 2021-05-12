import { Pipe, PipeTransform } from '@angular/core';
import { EngineServiceService } from './engine-service.service';

@Pipe({
	name: 'proposalFilterPipe',
	pure: false
})
export class ProposalFilterPipePipe implements PipeTransform {

	constructor(private es:EngineServiceService) {}

	transform(proposal:any) : any {

		let output = [];
		let session = [];
		let semester = [];

		if(this.es.committeeProposalDisplayAllChecked) {
			output = this.es.committeeProposalArray;
			return output;
		}

		for(var i=0; i<this.es.proposalSessionArrayChecked.length; i++)  {
			if(this.es.proposalSessionArrayChecked[i]) {
				session.push(this.es.proposalSessionArray[i]);
			}
			
		}

		for(var i=0; i<this.es.proposalSemesterArrayChecked.length; i++)  {
			if(this.es.proposalSemesterArrayChecked[i]) {
				semester.push(this.es.proposalSemesterArray[i]);
			}
			
		}

		for(let proposal of this.es.committeeProposalArray) {
			if(semester.includes(proposal.proposalStudent.semester) || session.includes(proposal.proposalStudent.session)) {
				output.push(proposal);
			}
		}

		return output;
	}

}
