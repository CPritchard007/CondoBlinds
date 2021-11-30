import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import data from '../../content.json'
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RemoveItemDialog } from '../Dialog/RemoveItemDialog';
import { WarningDialog } from '../Dialog/warningDialog';
/* Interfaces */
interface RoomType {
    value: string;
    viewValue: string;
}

interface query {
    roomLabel: string;
    // roomType: string;
    width: number;
    height: number;
    cost: number;
    price: number;
    quantity: number;
    sqrFt: string;
    retailPrice: number;
    discount: number;
    discount2: number;
    installmentCost: number;
}
interface tables {
  name: string;
  list: query[];
}



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  /* Arrays */
  pricingTables: Array<Array<number>>;
  Widths: number[];
  Heights: number[];

  /* static variables */
  USE_LOCAL_STORAGE = true;
  costOfInstallation = 47;
  profitMargin = 1.35;

  /* Variables */
  /* all are linked with inputs, or calculated by the calculator */
  valWidth; 
  valHeight;
  valRoomType = ""; 
  valCost = 0;
  valPrice = 0;
  quantity = 1;
  sqrFt = "";
  retailPrice = 0;
  discount = 50.0;
  discount2 = 50.0;
  installmentCost = 0;

  totalCost = 0;
  cleanCost = 0;

  roomLabel: string = "";
  roomTypes: Array<RoomType> = [];
  queriesArray: Array<tables> = []; //=> contains data from localstorage, as well as to be used to
                                    // calculate sums of multiple rows

  currentTab = 0; //=> keeps the current tab stored to be requested later

  ngOnInit() { }

  constructor(public dialog: MatDialog) {

    this.Widths = data.Widths;
    this.Heights = data.Heights;

    this.valWidth = this.Widths[0];
    this.valHeight = this.Heights[0];
    this.pricingTables = data.pricingTable; // set the pricing tables

    // assure that all values are set to default; as defined by the json file
    this.resetValues();
    // fi the LocalStorage is disabled, then the app will reset once the application is refreshed
    if (this.USE_LOCAL_STORAGE) {
      this.queriesArray = [{name: "table 1", list: []}]; //set default data for application
      let localStorageData = localStorage.getItem('queries'); // get data from localStorage
      if (localStorageData) { // if there is data stored before, pull it...
        this.queriesArray = JSON.parse(localStorageData); // scrape the data for the objects we
                              // already have, and add them to the queryArray
      }
    }
    // non reset items, such as our static variables, will not be reset, so they will be added here
    this.profitMargin = data.startingVars.profitMargin; // 
    this.costOfInstallation = data.startingVars.costOfInstallation
    
  }

  // use this to change a number (preferably dollar cents),
  //this will allow the value to be decorated with commas, making the numbers easier to read
  numericCommas(x: number) {
    let cost = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "$ " + cost;
  }

  // this is run after the user enters a new value, every new value, the application will recalculate
  // all the values that are needed
  updateInputs() {
    
    this.retailPrice = this.pricingTables[this.valHeight][this.valWidth];
    this.sqrFt = (((this.Widths[this.valWidth] * this.Heights[this.valHeight]) / 144) * this.quantity).toFixed(2);
    this.valCost = ((this.retailPrice * (this.discount / 100)) * (this.discount2 / 100)) * this.quantity;
    this.installmentCost = this.quantity * this.costOfInstallation;
    console.log(this.valCost, this.installmentCost, this.profitMargin);
    this.valPrice = Math.round((this.valCost + this.installmentCost) * this.profitMargin);  
    
  }

  addToList() {
    try { /*this allows for me to stop the application from crashing if the user is to add a new input
            when there is not already a Tab present in the application. If this is the case, it will open
            a modal to warn the user (timed for 1 second)*/

      /* try to push the new item to the table */
      this.queriesArray[this.currentTab].list.push({
        roomLabel: this.roomLabel,
        width: this.valWidth,
        height: this.valHeight,
        sqrFt: this.sqrFt,
        cost: this.valCost,
        price: this.valPrice,
        quantity: this.quantity,
        retailPrice: this.retailPrice,
        discount: this.discount,
        discount2: this.discount2,
        installmentCost: this.installmentCost});
    } catch (error) {
      if (error instanceof TypeError) { // if the current tab does not exist
        const timer = 2000; // number of ms before the modal closes
        let dialogRef = this.dialog.open(WarningDialog, { // create a new modal dialog with the instance of Warning Dialog
                                                      // which can be found in the dialog folder. this will just warn the user.
          width: '50%', // width of the modal
          data: {}
        });
        dialogRef.afterOpened().subscribe( _ => {
          setTimeout(() => {
            dialogRef.close();

          }, timer); /* once the modal is opened, the app starts a timer, which will count down to 0.
                      this is where the app will eventually closr the modal*/
        });

      }
    }
    
    if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.queriesArray)); // check if you can add to LocalStorage
    this.resetValues(); // reset values
  }

  removeFromList( i :number, event: any) {
    if (!event.ctrlKey) { // check if the user is holding ctrl, which bypasses the warning
      const dialogRef = this.dialog.open(RemoveItemDialog); // open dialog
      dialogRef.afterClosed().subscribe(result => { // get data that was entered
        if (!result) return;
        this.queriesArray[this.currentTab].list.splice(i, 1);
        if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.queriesArray));
      });
    }
  }

  resetValues() {

    this.USE_LOCAL_STORAGE = data.USE_LOCAL_STORAGE;

    // this.costOfInstallation = data.startingVars.costOfInstallation;
    // this.profitMargin = data.startingVars.profitMargin;
    this.valRoomType = data.startingVars.roomType;
    this.roomLabel = data.startingVars.roomLabel;
    this.valWidth = data.startingVars.width;
    this.valHeight = data.startingVars.height;
    this.discount = data.startingVars.discount * 100;
    this.discount2 = data.startingVars.discount2 * 100;
    this.quantity = data.startingVars.quantity;

    data.roomType.forEach((element, i) => {
      this.roomTypes.push({value: element.value+(i+1), viewValue: element.viewValue});
    });
    
    this.updateInputs(); // calculate the dynamic variables from the reset values
  }
  /* calculate the sum of each item in the array */
  getFullSum(list: query[]) {
    let price = 0;

    /* if there is no items in the array, than the query is out of date, and will be automatically reset */
    try { 
      list.forEach(element => {
        price += element.price;
      });
    } catch (error) {
      console.log(error);
      if (error instanceof TypeError) {
        window.localStorage.removeItem('queries')
        window.location.reload();
      }
    }
    // save total cost to a accessable variable
    this.totalCost = price;

    // return number in numeric form
    return this.numericCommas(this.totalCost);
  }

    /* this is triggered when the tab is changed, this will assure the user cannot change to the same tab */
  tabChange(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.index === this.currentTab) return;
    this.currentTab = tabChangeEvent.index;
  }
    /* allow the user to add new tabs, the naming format is default */
  createTab() {
    this.queriesArray.push({name: "table " + (this.queriesArray.length + 1), list: []});
    if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.queriesArray));
  }
    /* remove tab from list */
    /** TODO: add dialog */
  closeTab(i: number) {
    console.log(i);
    console.log(this.queriesArray);
    this.queriesArray.splice(i, 1);
    if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.queriesArray));
  }

  /* once the user clicks on the edit button, hide the button and show the input that contains changes the tab name */
  openEditPannel (event: any) {
      let button = event.target;
      let input = button.parentElement.parentElement.childNodes[1];
      button.style.display = "none";
      input.style.display = "flex";
      
  }

  // once the user clicks on the checkmark, the tabs name is then changed, and added to the localstorage
  updateTabName(event: any) {
    let button = event.target;
    let input = button.parentElement.childNodes[0];
    let tabName = input.value;
    this.queriesArray[this.currentTab].name = tabName;
    if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.queriesArray));
    console.log(input.value);
    console.log(this.queriesArray);
    button.parentElement.style.display = "none";
    button.parentElement.parentElement.childNodes[0].childNodes[0].style.display = "flex";
    
  }
  // round the price to the nearest $50, then remove $0.01 from it to give it the american price feel
  getCleanPrice() {
    let value = this.totalCost;
    let closestValue = value%50;
    let cleanValue = 0.0;
    if (closestValue > 25) {
      cleanValue = value + (50 - closestValue);

    } else {
      cleanValue = value - closestValue;
    }
    this.cleanCost = Math.max(cleanValue - 0.01,0);
    return this.numericCommas(this.cleanCost);
  }
}
