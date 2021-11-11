import {Component} from '@angular/core';
import {ThemePalette} from '@angular/material/core';

interface ItemSize {
  value: string;
  viewValue: string;
  number: number;
}
interface RoomType {
  value: string;
  viewValue: string;
}
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
  valWidth = 0;
  valHeight = 0;
  valRoomType = '';
  valPrice = 0;
  quantity = 1;
  sqrFt = 0;
  basePrice = 0;
  discount = 0;
  discount2 = 0;

  roomTypes: RoomType[] = [
    {value: 'accent-1', viewValue: 'Accent'},
    {value: 'antique-2', viewValue: 'Antique'},
    {value: 'boutique-3', viewValue: 'Boutique'},
    {value: 'catwalk-4', viewValue: 'Catwalk'},
    {value: 'contemporary-5', viewValue: 'Contemporary'},
    {value: 'cosmopolitan-6', viewValue: 'Cosmopolitan'},
    {value: 'dapper-7', viewValue: 'Dapper'},
    {value: 'dashing-8', viewValue: 'Dashing'}, 
    {value: 'designer-9', viewValue: 'Designer'},
    {value: 'eligant-10', viewValue: 'Eligant'},
    {value: 'ensemble-11', viewValue: 'Ensemble'},
    {value: 'fresh-12', viewValue: 'Fresh'},
    {value: 'graceful-13', viewValue: 'Graceful'},
    {value: 'icon-14', viewValue: 'Icon'},
    {value: 'palette-15', viewValue: 'Palette'},
    {value: 'runaway-16', viewValue: 'Runaway'},
    {value: 'showcase-17', viewValue: 'Showcase'},
    {value: 'signature-18', viewValue: 'Signature'},
    {value: 'silhouette-19', viewValue: 'Silhouette'},
    {value: 'style-20', viewValue: 'Style'},
    {value: 'upscale-21', viewValue: 'Upscale'},
    {value: 'urban-22', viewValue: 'Urban'},
    {value: 'vibrant-23', viewValue: 'Vibrant'},
    {value: 'vintage-24', viewValue: 'Vintage'},
    {value: 'vogue-25', viewValue: 'Vogue'},
  ];

  updateInputs() {
    console.log(this.valWidth + ' ' + this.valHeight);
    this.sqrFt = ((this.valWidth * this.valHeight) / 144) * this.quantity;
    this.valPrice = ((this.basePrice * (this.discount / 100)) * (this.discount2 / 100)) * this.quantity;
  }
}

