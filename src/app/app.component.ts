import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Data } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import {filter, map} from 'rxjs/operators';
import { UpdateService } from './update-service.service';

export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'calculatorApp';
  items!: any[];
  isUpdate: boolean = false;
  fileHref?: SafeHtml;
  
  constructor(updates: SwUpdate, private sanitizer: DomSanitizer) {}

  itemIsAvailable(value: any) {
    this.items = value ?? '{}';
  }
  
}

