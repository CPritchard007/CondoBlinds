import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';
import { Data } from '@angular/router';


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
 

  itemIsAvailable(value: any[]) {

    this.items = value ?? [];
    
  }

}

