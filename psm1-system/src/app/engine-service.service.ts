import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as CryptoJS from 'crypto-js';
import { combineLatest } from 'rxjs';
import * as moment from 'moment';
import { AngularFireStorage } from '@angular/fire/storage';

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
	sessionStart : any;
	sessionEnd : any;
	semester : any;
	yearArray : any;

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

	applicationSupervisorDomainView : any;

	adminArray : any = [];


	showCreateProposal : boolean = false;
	proposalTitle : any;
	proposalDomain : any;
	proposalSubmissionMethod : any;
	proposalFile : any;
	proposalLoading : boolean = false;

	proposalBackgroundSolution : any;
	proposalObjective : any;
	proposalScope : any;


	supervisorStudentArray : any;
	supervisorStudentSessionArray : any;
	supervisorStudentSemesterArray : any;
	supervisorStudentSessionArrayChecked : any = [];
	supervisorStudentSemesterArrayChecked : any = [];
	supervisorStudentSemesterArrayDisplayAllChecked : boolean = true;

	supervisorProposalArray : any;

	// supervisorWantToComment : boolean = false;
	supervisorCommentProposal : any;
	// supervisorComment : any;

	evaluatorProposalArray : any;
	// evaluatorWantToComment : boolean = false;
	// evaluatorComment : any;
	// evaluatorStatus : any;

	evaluatorCommentProposal : any;


	committeeProposalArray : any;
	proposalSemesterArray : any;

	proposalSemesterArrayChecked : any = [];
	proposalSessionArray : any;
	proposalSessionArrayChecked : any = [];

	assignEva : any;


	committeeProposalDisplayAllChecked : boolean = true;


	studentProposalArray : any;

	adminShowAcademicPage : boolean = true;
	adminShowLecturerPage : boolean = false;

	committeeShowLecturerPage : boolean = true;
	committeeShowProposalPage : boolean = false;
	committeeShowSupervisorPage : boolean = false;
	committeeShowStudentPage : boolean = false;

	lecturerShowStudentPage : boolean = true;
	lecturerShowSupervisorPage : boolean = false;
	lecturerShowEvaluatorPage : boolean = false;

	studentShowApplicationPage : boolean = true;
	studentShowProposalPage : boolean = false;

	constructor(
		private afs:AngularFirestore,
		private _snackBar: MatSnackBar,
		private fireStorage: AngularFireStorage
		) {


		const user = window.localStorage.getItem('user')
		if(user) {
			this.currentUser = JSON.parse(user);
			this.currentRole = window.localStorage.getItem('role');
			console.log(this.currentRole);
			this.loggedIn = !this.loggedIn;



		}

		this.fetchInit();

		let startYear = moment(moment().format('YYYY')).add(1, 'years');

		this.yearArray = [];
		for(var i=0; i<10; i++) {
			this.yearArray.push(startYear.format('YYYY'));
			startYear.subtract(1, 'years');
		}


	}

	fetchInit() {
		Promise.all([this.readAcademicProgram(), this.readLecturer(), this.readStudent(), this.readAdmin()]).then( async (data:any) => {
			console.log('dataLoaded', this.dataLoaded, data);


			if(this.currentRole == 'admin') {
				this.openSnackBar(`Welcome Admin`,'Dismiss');
			}

			if(this.currentRole == 'psm-committee') {
				this.openSnackBar(`Welcome ${this.currentUser.lecturerName}`,'Dismiss');
				await this.readAllApplication();
				await this.readCommitteeProposal();
			}

			if(this.currentRole == 'student') {
				this.openSnackBar(`Welcome ${this.currentUser.fullname}`,'Dismiss');
				await this.readApplication();
				await this.readStudentProposal();
			}

			if(this.currentRole == 'lecturer') {
				this.openSnackBar(`Welcome ${this.currentUser.lecturerName}`,'Dismiss');
				await this.readStudentSupervisor();
				await this.readSupervisorProposal();
				await this.readEvaluatorProposal();
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

	readStudentSupervisor() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-supervisor', ref => ref.where('applicationSupervisor','==',this.currentUser.lecturerId).where('applicationStatus','==','approved')).valueChanges({idField:'applicationId'}).subscribe((applicationArray:any) => {
				this.applicationArray = [];
				this.applicationArray = applicationArray;
				this.supervisorStudentArray = [];

				for(let application of this.applicationArray) {
					for(let student of this.studentArray) {
						if(application.applicationStudent == student.studentId) {
							this.supervisorStudentArray.push(student);
							application.applicationStudent = student;
						}
					}

				}
				this.supervisorStudentSessionArray = []
				this.supervisorStudentSemesterArray = []
				this.supervisorStudentSessionArray = [...new Set(this.supervisorStudentArray.map(x => x.session))];
				this.supervisorStudentSemesterArray = [...new Set(this.supervisorStudentArray.map(x => x.semester))];

				for(let session of this.supervisorStudentSessionArray) {
					this.supervisorStudentSessionArrayChecked.push(false)
				}

				for(let session of this.supervisorStudentSemesterArray) {
					this.supervisorStudentSemesterArrayChecked.push(false)
				}

				resolve(true);
			})
		})
	}


	readStudentProposal() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-proposal', ref => ref.where('proposalStudent','==',this.currentUser.studentId).orderBy('proposalTimestamp','desc')).valueChanges({idField:'proposalId'}).subscribe((proposalArray) => {
				this.studentProposalArray = [];
				this.studentProposalArray = proposalArray;

				resolve(true);
			})
		})
	}

	readSupervisorProposal() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-proposal', ref => ref.where('proposalSupervisor','==',this.currentUser.lecturerId).orderBy('proposalTimestamp','desc')).valueChanges({idField:'proposalId'}).subscribe((proposalArray:any) => {
				this.supervisorProposalArray = [];
				this.supervisorCommentProposal = [];

				for(let proposal of proposalArray) {

					if(!proposal.proposalSupervisorComment) {
						proposal.proposalSupervisorComment = '';	
					}

					this.supervisorCommentProposal.push({...proposal})
					proposal['supervisorWantToComment'] = false;

					for(let student of this.studentArray) {
						if(student.studentId == proposal.proposalStudent) {
							proposal.proposalStudent = student;
						}
					}

					for(let supervisor of this.lecturerArray) {
						if(supervisor.lecturerId == proposal.proposalSupervisor) {
							proposal.proposalSupervisor = supervisor;
						}
					}

					for(let eva1 of this.lecturerArray) {
						if(eva1.lecturerId == proposal.proposalEvaluator1) {
							proposal.proposalEvaluator1 = eva1;
						}
					}

					for(let eva2 of this.lecturerArray) {
						if(eva2.lecturerId == proposal.proposalEvaluator2) {
							proposal.proposalEvaluator2 = eva2;
						}
					}
				}


				this.supervisorProposalArray = proposalArray;

				resolve(true);
			})
		})
	}

	readEvaluatorProposal() {
		return new Promise((resolve:any) => {
			Promise.all([this.readEvaluator1Proposal(), this.readEvaluator2Proposal()]).then((data:any) => {
				this.evaluatorProposalArray = []
				this.evaluatorCommentProposal = [];

				let tmp = []
				tmp = data[0].concat(data[1]);

				for(let proposal of tmp) {

					if(!proposal.evaluatorStatus) {
						proposal.evaluatorStatus = '';	
					}

					if(!proposal.evaluatorComment) {
						proposal.evaluatorComment = '';
					}

					this.evaluatorCommentProposal.push({...proposal})
					proposal['evaluatorWantToComment'] = false;

					for(let student of this.studentArray) {
						if(student.studentId == proposal.proposalStudent) {
							proposal.proposalStudent = student;
						}
					}

					for(let supervisor of this.lecturerArray) {
						if(supervisor.lecturerId == proposal.proposalSupervisor) {
							proposal.proposalSupervisor = supervisor;
						}
					}

					for(let eva1 of this.lecturerArray) {
						if(eva1.lecturerId == proposal.proposalEvaluator1) {
							proposal.proposalEvaluator1 = eva1;
						}
					}

					for(let eva2 of this.lecturerArray) {
						if(eva2.lecturerId == proposal.proposalEvaluator2) {
							proposal.proposalEvaluator2 = eva2;
						}
					}
				}

				this.evaluatorProposalArray = tmp;

				resolve(true);
			})
		})
	}

	readEvaluator1Proposal() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-proposal', ref => ref.where('proposalEvaluator1','==',this.currentUser.lecturerId).orderBy('proposalTimestamp','desc')).valueChanges({idField:'proposalId'}).subscribe((proposalArray:any) => {
				let tmp = []
				for(let proposal of proposalArray) {
					if(proposal.proposalStatus != 'supervisor-pending') {
						tmp.push(proposal);
					}
				}
				resolve(tmp);
			})
		})
	}

	readEvaluator2Proposal() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-proposal', ref => ref.where('proposalEvaluator2','==',this.currentUser.lecturerId).orderBy('proposalTimestamp','desc')).valueChanges({idField:'proposalId'}).subscribe((proposalArray:any) => {
				let tmp = []
				for(let proposal of proposalArray) {
					if(proposal.proposalStatus != 'supervisor-pending') {
						tmp.push(proposal);
					}
				}
				resolve(tmp);
			})
		})
	}


	readCommitteeProposal() {
		return new Promise((resolve:any) => {
			this.afs.collection('student-proposal', ref => ref.orderBy('proposalTimestamp', 'desc')).valueChanges({idField:'proposalId'}).subscribe((proposalArray:any) => {
				this.committeeProposalArray = [];
				this.assignEva = [];

				for(let proposal of proposalArray) {

					if(proposal.proposalEvaluator1) {
						proposal['eva1'] = proposal.proposalEvaluator1
					} else {
						proposal['eva1'] = ''
					}

					if(proposal.proposalEvaluator2) {
						proposal['eva2'] = proposal.proposalEvaluator2
					} else {
						proposal['eva2'] = ''
					}

					this.assignEva.push({...proposal});

					proposal['committeeWantToAssignEvaluator'] = false;

					for(let student of this.studentArray) {
						if(student.studentId == proposal.proposalStudent) {
							proposal.proposalStudent = student;
						}
					}

					for(let supervisor of this.lecturerArray) {
						if(supervisor.lecturerId == proposal.proposalSupervisor) {
							proposal.proposalSupervisor = supervisor;
						}
					}

					for(let eva1 of this.lecturerArray) {
						if(eva1.lecturerId == proposal.proposalEvaluator1) {
							proposal.proposalEvaluator1 = eva1;
						}
					}

					for(let eva2 of this.lecturerArray) {
						if(eva2.lecturerId == proposal.proposalEvaluator2) {
							proposal.proposalEvaluator2 = eva2;
						}
					}
				}

				this.committeeProposalArray = proposalArray;

				this.proposalSessionArray = []
				this.proposalSemesterArray = []
				this.proposalSessionArray = [...new Set(this.committeeProposalArray.map(x => x.proposalStudent.session))];
				this.proposalSemesterArray = [...new Set(this.committeeProposalArray.map(x => x.proposalStudent.semester))];

				for(let session of this.proposalSessionArray) {
					this.proposalSessionArrayChecked.push(false)
				}

				for(let session of this.proposalSemesterArray) {
					this.proposalSemesterArrayChecked.push(false)
				}


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
				semester: this.semester,
				session: this.sessionStart + '/' + this.sessionEnd
			}).then(() => {
				this.registerLoading = !this.registerLoading;
				this.name = '';
				this.username = '';
				this.password = '';
				this.confirmPassword = '';
				this.matricNumber = '';
				this.semester = '';
				this.sessionStart = '';
				this.sessionEnd = '';

				this.registerStudent = !this.registerStudent;
				this.loggedIn = !this.loggedIn;
				this.errorMessage = null;
				this.openSnackBar('Student register successfully.','Dismiss');
			})
		}
	}

	async logIn() {
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

				this.username = '';
				this.password = '';

				return 
			}
		}

		for(let lecturer of this.lecturerArray) {
			const pass = lecturer.lecturerPassword;

			if(this.username === lecturer.lecturerUsername && this.password === CryptoJS.AES.decrypt(pass.trim(), 'psmsystem').toString(CryptoJS.enc.Utf8)) {
				this.loggedIn = !this.loggedIn;
				this.openSnackBar(`Welcome ${lecturer.lecturerName}`,'Dismiss');
				window.localStorage.setItem("user", JSON.stringify(lecturer));
				this.currentUser = lecturer;



				window.localStorage.setItem("role", lecturer.lecturerRole);
				this.currentRole = lecturer.lecturerRole;

				if(lecturer.lecturerRole === 'psm-committee') {
					await this.readAllApplication();
					await this.readCommitteeProposal();
				}

				if(lecturer.lecturerRole == 'lecturer') {
					await this.readStudentSupervisor();
					await this.readSupervisorProposal();
					await this.readEvaluatorProposal();
				}


				this.username = '';
				this.password = '';

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


				await this.readApplication();

				await this.readStudentProposal();

				this.username = '';
				this.password = '';

				return;
			}
		}

		this.openSnackBar('Wrong username or password.','Dismiss');
	}

	logOut() {
		this.currentUser = null;
		this.currentRole = null;
		window.localStorage.removeItem("user");
		this.loggedIn = !this.loggedIn;
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
				this.lecturerUsername = '';
				this.lecturerPassword = '';
				this.lecturerConfirmPassword = '';
				this.lecturerStaffId = '';
				this.lecturerProgram = '';

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


	studentAllowToSubmitProposal() {

		if(this.studentProposalArray) {
			for(let proposal of this.studentProposalArray) {
				if(proposal.proposalStatus.split('-')[1] === 'accepted' || proposal.proposalStatus.split('-')[1] === 'pending') {
					return true;
				}
			}
		}
		return false;
	}

	viewProposalFormPDF() {
		window.open("https://firebasestorage.googleapis.com/v0/b/dctapp-71345.appspot.com/o/Proposal%20Form.pdf?alt=media&token=083a029a-ad85-48c0-9984-73123f969b62", '_blank');
	}

	uploadFile(event:any) {

		const file = event.target.files[0];
		const type = file.type;
		if(type != 'application/pdf') {
			this.openSnackBar('Please Select PDF File Only.','Dismiss');
			(<HTMLInputElement>document.getElementById("uploadFile")).value = "";

		} else {
			this.proposalFile = file;
		}

	}

	uploadProposalToFireStorage(docId:any) {
		return new Promise((resolve:any) => {

			// need to add length at file name

			const filepath = 'student-proposal/' + docId;
			this.fireStorage.upload(filepath, this.proposalFile).then((res:any) => {

				let url = this.fireStorage.ref(filepath).getDownloadURL();

				url.subscribe( (link:any) => {
					resolve(link);
				})
			})


		})
	}

	submitProposal() {

		let proposalSupervisor = '';
		for(let application of this.applicationArray) {
			if(application.applicationStatus === 'approved') {
				proposalSupervisor = application.applicationSupervisor.lecturerId;
			}
		}

		const res = confirm('Select OK to proceed and submit proposal.')
		if(res) {
			this.proposalLoading = true;

			const docId = this.afs.createId();

			if(this.proposalSubmissionMethod === 'online') {

				this.afs.doc(`student-proposal/${docId}`).set({
					proposalStudent : this.currentUser.studentId,
					proposalTimestamp : new Date(Date.now()),
					proposalSemester : this.currentUser.semester,
					proposalSession : this.currentUser.session,
					proposalTitle : this.proposalTitle,
					proposalDomain : this.proposalDomain,
					proposalSupervisor: proposalSupervisor,
					proposalStatus: 'supervisor-pending',
					proposalSubmissionMethod : this.proposalSubmissionMethod,
					proposalBackgroundSolution : this.proposalBackgroundSolution,
					proposalObjective : this.proposalObjective,
					proposalScope : this.proposalScope
				}).then(() => {
					this.openSnackBar('Proposal Submitted.','Dismiss');
					this.proposalLoading = !this.proposalLoading;
					this.showCreateProposal = !this.showCreateProposal;
					this.proposalSubmissionMethod = null;
				})


			} else if(this.proposalSubmissionMethod === 'offline') {

				this.uploadProposalToFireStorage(docId).then((link:any) => {
					this.afs.doc(`student-proposal/${docId}`).set({
						proposalStudent : this.currentUser.studentId,
						proposalTimestamp : new Date(Date.now()),
						proposalSemester : this.currentUser.semester,
						proposalSession : this.currentUser.session,
						proposalURL : link,
						proposalTitle : this.proposalTitle,
						proposalDomain : this.proposalDomain,
						proposalStatus: 'supervisor-pending',
						proposalSubmissionMethod : this.proposalSubmissionMethod,
						proposalSupervisor : proposalSupervisor
					}).then(() => {
						this.openSnackBar('Proposal Submitted.','Dismiss');
						this.proposalLoading = !this.proposalLoading;
						this.showCreateProposal = !this.showCreateProposal;
						this.proposalSubmissionMethod = null;
					})
				})

			}


		}
	}


	viewStudentProposal() {

	}

	viewProposalPDF(url:any) {
		window.open(url, '_blank');
	}


	createSupervisorComment(proposal:any,index:any) {

		const res = confirm('Click OK to proceed and submit comment.');

		if(res) {
			this.afs.doc(`student-proposal/${proposal.proposalId}`).update({
				proposalSupervisorComment: this.supervisorCommentProposal[index].proposalSupervisorComment,
				proposalStatus: 'evaluator-pending'
			}).then(() => {
				this.openSnackBar('Comment Submitted.','Dismiss');
				proposal.supervisorWantToComment = !proposal.supervisorWantToComment
			})
		}

	}


	checkEvaluation(proposal:any) {
		if(proposal.proposalEvaluator1.lecturerId === this.currentUser.lecturerId && proposal.proposalEvaluatorComment1) {
			return true
		}

		if(proposal.proposalEvaluator2.lecturerId === this.currentUser.lecturerId && proposal.proposalEvaluatorComment2) {
			return true
		}

		return false
	}


	createEvaluatorComment(proposal:any,index:any) {
		if(!this.evaluatorCommentProposal[index].evaluatorStatus || !this.evaluatorCommentProposal[index].evaluatorComment) {
			alert('Please complete the required input before submit.')
		}

		const res = confirm('Click OK to proceed and submit evaluation & comment.');
		if(res) {
			if(proposal.proposalEvaluator1.lecturerId == this.currentUser.lecturerId) {
				this.afs.doc(`student-proposal/${proposal.proposalId}`).update({
					proposalEvaluatorComment1 : this.evaluatorCommentProposal[index].evaluatorComment,
					proposalStatus: this.evaluatorCommentProposal[index].evaluatorStatus
				}).then(() => {
					proposal.evaluatorWantToComment = !proposal.evaluatorWantToComment
					this.openSnackBar('Evaluation & Comment Submitted.','Dismiss');
				})
			} else if(proposal.proposalEvaluator2.lecturerId == this.currentUser.lecturerId) {
				this.afs.doc(`student-proposal/${proposal.proposalId}`).update({
					proposalEvaluatorComment2 : this.evaluatorCommentProposal[index].evaluatorComment,
					proposalStatus: this.evaluatorCommentProposal[index].evaluatorStatus
				}).then(() => {
					proposal.evaluatorWantToComment = !proposal.evaluatorWantToComment
					this.openSnackBar('Evaluation & Comment Submitted.','Dismiss');
				})
			}
		}
	}


	assignEvaluator(proposal:any,index:any) {
		if(this.assignEva[index].eva1 == this.assignEva[index].eva2) {
			alert('Evaluator 1 and Evaluator 2 must be different.')
			return;
		}

		const res = confirm('Click OK to proceed and assign evaluators.')
		if(res) {
			this.afs.doc(`student-proposal/${proposal.proposalId}`).update({
				proposalEvaluator1: this.assignEva[index].eva1,
				proposalEvaluator2: this.assignEva[index].eva2,
			}).then(() => {
				this.openSnackBar('Evaluator Recorded.','Dismiss');
			})
		}
	}



	adminTogglePageView(button:any) {
		if(button == 'academic') {
			this.adminShowAcademicPage = true;
			this.adminShowLecturerPage = false;
		} else if(button == 'lecturer') {
			this.adminShowAcademicPage = false;
			this.adminShowLecturerPage = true;
		}
	}

	committeeTogglePageView(button:any) {

		if(button == 'student') {

			this.committeeShowProposalPage = false;
			this.committeeShowSupervisorPage = false;
			this.committeeShowStudentPage = true;
			this.committeeShowLecturerPage = false;

		} else if(button == 'lecturer') {

			this.committeeShowProposalPage = false;
			this.committeeShowSupervisorPage = false;
			this.committeeShowStudentPage = false;
			this.committeeShowLecturerPage = true;

		} else if(button == 'supervisor') {

			this.committeeShowProposalPage = false;
			this.committeeShowSupervisorPage = true;
			this.committeeShowStudentPage = false;
			this.committeeShowLecturerPage = false;

		} else if(button == 'proposal') {

			this.committeeShowProposalPage = true;
			this.committeeShowSupervisorPage = false;
			this.committeeShowStudentPage = false;
			this.committeeShowLecturerPage = false;

		}

	}

	lecturerTogglePageView(button:any) {
		if(button == 'student') {
			this.lecturerShowStudentPage = true;
			this.lecturerShowSupervisorPage = false;
			this.lecturerShowEvaluatorPage = false;
		} else if(button == 'supervisor') {
			this.lecturerShowStudentPage = false;
			this.lecturerShowSupervisorPage = true;
			this.lecturerShowEvaluatorPage = false;
		} else if(button == 'evaluator') {
			this.lecturerShowStudentPage = false;
			this.lecturerShowSupervisorPage = false;
			this.lecturerShowEvaluatorPage = true;
		}
	}

	studentTogglePageView(button:any) {
		if(button == 'application') {
			this.studentShowApplicationPage = true;
			this.studentShowProposalPage = false;
		} else if(button == 'proposal') {
			this.studentShowApplicationPage = false;
			this.studentShowProposalPage = true;
		}
	}

	viewSupervisor() {
		console.log(this.applicationSupervisor);
		
		for(let lec of this.lecturerArray) {
			if(lec.lecturerId == this.applicationSupervisor) {
				this.applicationSupervisorDomainView = lec.lecturerDomain;
			}
		}
		
	}


	openSnackBar(message: string, action: string) {
		this._snackBar.open(message, action, {
			duration: 3000,
			panelClass: ['normal-snackbar']
		});
	}
}
