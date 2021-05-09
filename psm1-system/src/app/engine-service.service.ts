import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CryptoJS from 'crypto-js';
import { combineLatest } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class EngineServiceService {

	currentUser : any;
	// currentRole : any = 'admin'
	// currentRole : any = 'psm-committee'
	// currentRole : any = 'student'
	currentRole : any = ''


	loggedIn : boolean = false;
	registerStudent : boolean = false;
	registerLoading : boolean = false;

	username : any;
	password : any;
	confirmPassword : any;
	name : any;
	matricNumber : any;

	errorMessage : any = '';

	studentArray : any = [];

	dataLoaded : boolean = false;

	showCreateAcademicProgram : boolean = false;
	programArray : any = []
	programCode : any;
	programName : any;
	editProgram : any;

	showCreateLecturer : boolean = false;
	lecturerArray : any = []
	lecturerName : any;
	lecturerUsername : any;
	lecturerPassword : any;
	lecturerConfirmPassword : any;
	lecturerStaffId : any;
	lecturerProgram : any;
	editLecturer : any;

	// showCreateCommittee : boolean = false;
	// committeeArray : any = []
	// committeeProgram : any;
	// committeeLecturer : any;
	// editCommittee : any;


	showApplySupervisor : boolean = false;
	applicationArray : any;
	applicationSupervisor : any;

	adminArray : any = [];

	constructor(
		private afs:AngularFirestore,
		private _snackBar: MatSnackBar
	) {

		// window.localStorage.removeItem("user");

		const user = window.localStorage.getItem('user')
		if(user) {
			this.currentUser = JSON.parse(user);
			this.currentRole = window.localStorage.getItem('role');
			console.log(this.currentRole);
			this.loggedIn = !this.loggedIn;



		}

		this.fetchInit();

		// combineLatest().subscribe(() => {

		// })


	}

	fetchInit() {
		Promise.all([this.readAcademicProgram(), this.readLecturer(), this.readStudent(), this.readAdmin()]).then( async (data:any) => {
			console.log('dataLoaded', this.dataLoaded, data);

			if(this.currentRole == 'psm-committee') {
				await this.readAllApplication();
			}

			if(this.currentRole == 'student') {
				await this.readApplication();
			}

			this.dataLoaded = true;
		})
	}

	readAdmin() {
		return new Promise((resolve:any) => {
			this.afs.collection('admin').valueChanges({idField:'adminId'}).subscribe((adminArray:any) => {
				this.adminArray = [];
				this.adminArray = adminArray

				resolve(true);
			})
		})
	}

	readStudent() {
		return new Promise((resolve:any) => {
			this.afs.collection('student').valueChanges({idField:'studentId'}).subscribe((studentArray:any) => {
				this.studentArray = [];
				this.studentArray = studentArray;

				resolve(true);
			})
		})
	}

	validRegistration() {
		console.log('check registration');

		if(this.username == null || this.username.includes(' ') || this.username == '') {
			this.errorMessage = 'Username cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.password == null || this.password.includes(' ') || this.password == '') {
			this.errorMessage = 'Password cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.password != this.confirmPassword) {
			this.errorMessage = 'Wrong confirm password.'
			console.log(this.errorMessage);
			return false
		}

		if(this.name == null || this.name == '') {
			this.errorMessage = 'Full name cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.matricNumber == null || this.matricNumber.includes(' ') || this.matricNumber == '') {
			this.errorMessage = 'Matric number cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		for(let student of this.studentArray) {
			if(student.username == this.username) {
				this.errorMessage = 'Username exist. Please reenter username.'
				console.log(this.errorMessage);
				return false;
			}
		}

		return true;

	}

	register() {
		console.log('register');

		this.registerLoading = true;

		if(this.validRegistration()) {
			this.afs.collection('student').add({
				fullname: this.name,
				username: this.username,
				password: CryptoJS.AES.encrypt(this.password.trim(), 'psmsystem').toString(),
				matricNumber: this.matricNumber,
			}).then(() => {
				this.registerLoading = !this.registerLoading;
				this.name = '';
				this.username = '';
				this.password = '';
				this.confirmPassword = '';
				this.matricNumber = '';
				this.registerStudent = !this.registerStudent;
				this.loggedIn = !this.loggedIn;
				this.errorMessage = null;
				this.openSnackBar('Student register successfully.','Dismiss');
			})
		}
	}

	logIn() {
		console.log('log in')

		// const pass = 'U2FsdGVkX18OZ7o8wVMKPfg30s16zkKeVz6kuc7c9wY='
		// console.log(CryptoJS.AES.decrypt(pass.trim(), 'psmsystem').toString(CryptoJS.enc.Utf8))

		for(let admin of this.adminArray) {
			const pass = admin.password;

			if(this.username === admin.username && this.password === CryptoJS.AES.decrypt(pass.trim(), 'psmsystem').toString(CryptoJS.enc.Utf8)) {
				this.loggedIn = !this.loggedIn;
				this.openSnackBar(`Welcome Admin`,'Dismiss');
				window.localStorage.setItem("user", JSON.stringify(admin));
				window.localStorage.setItem("role", 'admin');
				this.currentUser = admin;
				this.currentRole = 'admin';

				return 
			}
		}

		for(let lecturer of this.lecturerArray) {
			const pass = lecturer.lecturerPassword;

			if(this.username === lecturer.lecturerUsername && this.password === CryptoJS.AES.decrypt(pass.trim(), 'psmsystem').toString(CryptoJS.enc.Utf8)) {
				this.loggedIn = !this.loggedIn;
				this.openSnackBar(`Welcome Admin`,'Dismiss');
				window.localStorage.setItem("user", JSON.stringify(lecturer));
				this.currentUser = lecturer;



				window.localStorage.setItem("role", lecturer.lecturerRole);
				this.currentRole = lecturer.lecturerRole;

				if(lecturer.lecturerRole === 'psm-committee') {
					this.readAllApplication()
				}

				return 
			}
		}


		for(let student of this.studentArray) {
			const pass = student.password;

			if(this.username === student.username && this.password === CryptoJS.AES.decrypt(pass.trim(), 'psmsystem').toString(CryptoJS.enc.Utf8)) {
				this.loggedIn = !this.loggedIn;
				this.openSnackBar(`Welcome ${student.fullname}`,'Dismiss');
				window.localStorage.setItem("user", JSON.stringify(student));
				window.localStorage.setItem("role", 'student');
				this.currentUser = student;
				this.currentRole = 'student';


				this.readApplication()

				return;
			}
		}

		this.openSnackBar('Wrong username or password.','Dismiss');
	}

	logOut() {
		this.currentUser = null;
		this.currentRole = null;
		window.localStorage.removeItem("user");
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

	validLecturer() {
		console.log('check lecturer');

		if(this.lecturerUsername == null || this.lecturerUsername.includes(' ') || this.lecturerUsername == '') {
			this.errorMessage = 'Username cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.lecturerPassword == null || this.lecturerPassword.includes(' ') || this.lecturerPassword == '') {
			this.errorMessage = 'Password cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.lecturerPassword != this.lecturerConfirmPassword) {
			this.errorMessage = 'Wrong confirm password.'
			console.log(this.errorMessage);
			return false
		}

		if(this.lecturerName == null || this.lecturerName == '') {
			this.errorMessage = 'Full name cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		if(this.lecturerStaffId == null || this.lecturerStaffId.includes(' ') || this.lecturerStaffId == '') {
			this.errorMessage = 'Matric number cannot be empty.'
			console.log(this.errorMessage);
			return false
		}

		for(let lecturer of this.lecturerArray) {
			if(lecturer.lecturerUsername == this.lecturerUsername) {
				this.errorMessage = 'Username exist. Please reenter username.'
				console.log(this.errorMessage);
				return false;
			}
		}

		return true;

	}

	createLecturer() {
		console.log('create lecturer');
		if(this.validLecturer()) {
			this.afs.collection('lecturer-list').add({
				lecturerName: this.lecturerName,
				lecturerUsername: this.lecturerUsername,
				lecturerPassword: CryptoJS.AES.encrypt(this.lecturerPassword.trim(), 'psmsystem').toString(),
				lecturerStaffId: this.lecturerStaffId,
				lecturerProgram: this.lecturerProgram,
				lecturerDomain: '-',
				lecturerRole: 'lecturer'
			}).then(() => {
				this.lecturerName = '';
				this.showCreateLecturer = !this.showCreateLecturer;
				this.errorMessage = null;
				this.openSnackBar('Lecturer Created','Dismiss');
			})
		}
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

	assignCommittee(lecturer) {
		const res = confirm(`Are you sure to assign ${lecturer.lecturerName} as PSM Committee?`);
		if(res) {
			this.afs.doc(`lecturer-list/${lecturer.lecturerId}`).update({
				lecturerRole:'psm-committee'
			}).then(() => {
				this.openSnackBar('Lecturer Updated','Dismiss');
			})
		}
	}

	unassignCommittee(lecturer) {
		const res = confirm(`Are you sure to remove ${lecturer.lecturerName} as PSM Committee?`);
		if(res) {
			this.afs.doc(`lecturer-list/${lecturer.lecturerId}`).update({
				lecturerRole:'lecturer'
			}).then(() => {
				this.openSnackBar('Lecturer Updated','Dismiss');
			})
		}
	}








	readAllApplication() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-supervisor', ref => ref.where('applicationStatus','==','pending').orderBy('applicationTimestamp','desc')).valueChanges({idField:'applicationId'}).subscribe((applicationArray:any) => {
				this.applicationArray = [];
				this.applicationArray = applicationArray;

				for(let application of this.applicationArray) {

					for(let lecturer of this.lecturerArray) {
						if(application.applicationSupervisor == lecturer.lecturerId) {
							application.applicationSupervisor = lecturer;
						}	
					}

					for(let student of this.studentArray) {
						if(application.applicationStudent == student.studentId) {
							application.applicationStudent = student;
						}	
					}


				}
				resolve(true);
			})
		})
	}




	readApplication() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-supervisor', ref => ref.where('applicationStudent','==',this.currentUser.studentId).orderBy('applicationTimestamp','desc')).valueChanges({idField:'applicationId'}).subscribe((applicationArray:any) => {
				this.applicationArray = [];
				this.applicationArray = applicationArray;

				if(this.lecturerArray) {
					for(let application of this.applicationArray) {
						for(let lecturer of this.lecturerArray) {
							if(application.applicationSupervisor == lecturer.lecturerId) {
								application.applicationSupervisor = lecturer;
							}	
						}
					}
				}
				resolve(true);
			})
		})
	}

	applySupervisor() {

		this.afs.collection('student-supervisor').add({
			applicationSupervisor: this.applicationSupervisor,
			applicationStatus: 'pending',
			applicationStudent: this.currentUser.studentId,
			applicationTimestamp: new Date(Date.now())
		}).then(() => {
			this.showApplySupervisor = !this.showApplySupervisor;
			this.openSnackBar('Application Recorded.','Dismiss');
		})
	}

	studentAllowToApplySupervisor() {

		if(this.applicationArray) {
			for(let application of this.applicationArray) {
				if(application.applicationStatus === 'pending' || application.applicationStatus === 'approved') {
					return true;
				}
			}
		}
		
		return false;
	}

	viewGeneralAgreement() {
		window.open("https://firebasestorage.googleapis.com/v0/b/dctapp-71345.appspot.com/o/GENERAL%20AGREEMEN1.pdf?alt=media&token=651a299b-2d3a-4bc5-8115-abbf7b9b6dba", '_blank');
	}


	deleteStudent(student:any) {
		const res = confirm(`Are you sure to remove ${student.fullname} ?`)
		if(res) {
			this.afs.doc(`student/${student.studentId}`).delete().then(() => {
				this.openSnackBar('Student Deleted.','Dismiss');
			})
		}
	}


	approveApplication(application) {
		const res = confirm('Are you sure to APPROVE the application?');
		if(res) {
			this.afs.doc(`student-supervisor/${application.applicationId}`).update({
				applicationStatus: 'approved'
			}).then(() => {
				this.openSnackBar('Application Approved.','Dismiss');
			})
		}
		

	}

	rejectApplication(application) {
		const res = confirm('Are you sure to REJECT the application?');
		if(res) {
			this.afs.doc(`student-supervisor/${application.applicationId}`).update({
				applicationStatus: 'rejected'
			}).then(() => {
				this.openSnackBar('Application Rejected.','Dismiss');
			})
		}
		

	}





	openSnackBar(message: string, action: string) {
    	this._snackBar.open(message, action, {
    		duration: 5000
    	});
 	}
}
