import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { EngineServiceService } from './engine-service.service';


import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
	title = 'psm1-system';

	/** Constants used to fill up our data base. */
	COLORS: string[] = [
	'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
	'aqua', 'blue', 'navy', 'black', 'gray'
	];
	NAMES: string[] = [
	'Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack', 'Charlotte', 'Theodore', 'Isla', 'Oliver',
	'Isabella', 'Jasper', 'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'
	];

	displayedColumns: string[] = ['id', 'name', 'progress', 'color'];
	dataSource: MatTableDataSource<UserData>;

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	constructor(public es:EngineServiceService) {
		const users = Array.from({length: 100}, (_, k) => this.createNewUser(k + 1));

			// Assign the data to the data source for the table to render
			this.dataSource = new MatTableDataSource(users);
	}

	ngAfterViewInit() {

		// Create 100 users
		// setInterval(() => {

			

			this.dataSource.paginator = this.paginator;
			this.dataSource.sort = this.sort;

			// console.log(users);
			
		// }, 1000)


		// this.dataSource.paginator = this.paginator;
		// this.dataSource.sort = this.sort;

		// console.log(this.dataSource);
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

	createNewUser(id: number): UserData {
		const name = this.NAMES[Math.round(Math.random() * (this.NAMES.length - 1))] + ' ' +
		this.NAMES[Math.round(Math.random() * (this.NAMES.length - 1))].charAt(0) + '.';

		return {
			id: id.toString(),
			name: name,
			progress: Math.round(Math.random() * 100).toString(),
			color: this.COLORS[Math.round(Math.random() * (this.COLORS.length - 1))]
		};
	}
}
