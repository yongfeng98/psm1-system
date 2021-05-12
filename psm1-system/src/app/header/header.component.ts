import { Component, OnInit } from '@angular/core';
import { EngineServiceService } from '../engine-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor(public es:EngineServiceService) { }

  ngOnInit(): void {
  }

}
