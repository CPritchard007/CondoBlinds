import { Component, OnInit } from '@angular/core';

interface RoomType {
    value: string;
    viewValue: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  constructor() { }
  
  ngOnInit() { }
  
  valWidth = 0;
  valHeight = 0;
  valRoomType = '';
  valCost = 0;
  valPrice = 0;
  quantity = 1;
  sqrFt = 0;
  retailPrice = 0;
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
    this.valCost = ((this.retailPrice * (this.discount / 100)) * (this.discount2 / 100)) * this.quantity;

    if (this.valWidth >= 97) {
      this.retailPrice = 1216;
    } else if (this.valWidth >= 91) {
      this.retailPrice = 1149;
    } else if (this.valWidth >= 85) {
      this.retailPrice = 1081;
    } else if (this.valWidth >= 79) {
      this.retailPrice = 1013;
    } else if (this.valWidth >= 73) {
      this.retailPrice = 946;
    } else if (this.valWidth >= 67) {
      this.retailPrice = 878;
    } else if (this.valWidth >= 61) {
      this.retailPrice = 810;
    } else if (this.valWidth >= 55) {
      this.retailPrice = 742;
    } else if (this.valWidth >= 49) {
      this.retailPrice = 675;
    } else if (this.valWidth >= 43) {
      this.retailPrice = 607;
    } else if (this.valWidth >= 37) {
      this.retailPrice = 539;
    } else if (this.valWidth >= 31) {
      this.retailPrice = 471;
    } else {
      this.retailPrice = 404;
    }
  }
}
