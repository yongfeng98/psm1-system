import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class EngineServiceService {

	dataLoaded : boolean = false;

	showCreateAcademicProgram : boolean = false;
	programArray : any = []
	programCode : any;
	programName : any;
	editProgram : any;

	showCreateLecturer : boolean = false;
	lecturerArray : any = []
	lecturerName : any;
	editLecturer : any;

	showCreateCommittee : boolean = false;
	committeeArray : any = []
	committeeProgram : any;
	committeeLecturer : any;
	editCommittee : any;

	constructor(
		private afs:AngularFirestore,
		private _snackBar: MatSnackBar
	) {

		Promise.all([this.readAcademicProgram(), this.readLecturer(), this.readCommittee()]).then((data:any) => {
			console.log('dataLoaded', this.dataLoaded, data);
			this.dataLoaded = true;
		})
	}

	readAcademicProgram() {
		return new Promise((resolve:any) => {
			this.afs.collection('academic-program').valueChanges({idField:'programId'}).subscribe((programArray:any) => {
				this.programArray = [];
				this.editProgram = [];

				for(let program of programArray) {
					this.editProgram.push({...program});
					program['edit'] = false;
					this.programArray.push(program)	
				}
				resolve(true);
			})
		})
	}

	createAcademicProgram() {
		console.log('create academic program');
		this.afs.collection('academic-program').add({
			programCode: this.programCode,
			programName: this.programName
		}).then(() => {
			this.programCode = '';
			this.programName = '';
			this.showCreateAcademicProgram = !this.showCreateAcademicProgram;
			this.openSnackBar('Academic Program Created','Dismiss');
		})
	}

	editAcademicProgram(index:any) {
		console.log('edit academic program');
		this.afs.doc(`academic-program/${this.editProgram[index].programId}`).update(this.editProgram[index]).then(() => {
			this.openSnackBar('Academic Program Edited','Dismiss');
		})
	}

	deleteAcademicProgram(program:any) {
		const res = confirm(`Are you sure to delete ${program.programName} ?`)
		if(res) {
			console.log('delete academic program');
			this.afs.doc('academic-program/'+program.programId).delete().then(() => {
				this.openSnackBar('Academic Program Deleted','Dismiss');
			})
		}
		
	}





	readLecturer() {
		return new Promise((resolve:any) => {
			this.afs.collection('lecturer-list').valueChanges({idField:'lecturerId'}).subscribe((lecturerArray:any) => {
				this.lecturerArray = [];
				this.editLecturer = [];

				for(let lecturer of lecturerArray) {
					this.editLecturer.push({...lecturer});
					lecturer['edit'] = false;
					this.lecturerArray.push(lecturer)	
				}
				resolve(true);
			})
		})
	}

	createLecturer() {
		console.log('create lecturer');
		this.afs.collection('lecturer-list').add({
			lecturerName: this.lecturerName
		}).then(() => {
			this.lecturerName = '';
			this.showCreateLecturer = !this.showCreateLecturer;
			this.openSnackBar('Lecturer Created','Dismiss');
		})
	}

	editLecturerList(index:any) {
		console.log('edit lecturer');
		this.afs.doc(`lecturer-list/${this.editLecturer[index].lecturerId}`).update(this.editLecturer[index]).then(() => {
			this.openSnackBar('Lecturer Edited','Dismiss');
		})
	}

	deleteLecturer(lecturer:any) {
		const res = confirm(`Are you sure to delete ${lecturer.lecturerName} ?`)
		if(res) {
			console.log('delete lecturer');
			this.afs.doc('lecturer-list/'+lecturer.lecturerId).delete().then(() => {
				this.openSnackBar('Lecturer Deleted','Dismiss');
			})
		}
		
	}












	readCommittee() {
		return new Promise((resolve:any) => {
			this.afs.collection('committee-member').valueChanges({idField:'committeeId'}).subscribe((committeeArray:any) => {
				this.committeeArray = [];
				this.editCommittee = [];

				for(let committee of committeeArray) {
					this.editCommittee.push({...committee});
					committee['edit'] = false;
					this.committeeArray.push(committee)	
				}
				resolve(true);
			})
		})
	}

	createCommittee() {
		console.log('create committee');
		this.afs.collection('committee-member').add({
			committeeLecturer: this.committeeLecturer,
			committeeProgram : this.committeeProgram
		}).then(() => {
			this.committeeLecturer = '';
			this.committeeProgram = ''
			this.showCreateCommittee = !this.showCreateCommittee;
			this.openSnackBar('Committee Created','Dismiss');
		})
	}

	editCommitteeMember(index:any) {
		console.log('edit committee');
		this.afs.doc(`committee-member/${this.editCommittee[index].committeeId}`).update(this.editCommittee[index]).then(() => {
			this.openSnackBar('Committee Edited','Dismiss');
		})
	}

	deleteCommittee(committee:any) {
		const res = confirm(`Are you sure to delete ${committee.committeeLecturer} ?`)
		if(res) {
			console.log('delete committee');
			this.afs.doc('committee-member/'+committee.committeeId).delete().then(() => {
				this.openSnackBar('Committee Deleted','Dismiss');
			})
		}
		
	}





	openSnackBar(message: string, action: string) {
    	this._snackBar.open(message, action, {
    		duration: 5000
    	});
 	}
}
