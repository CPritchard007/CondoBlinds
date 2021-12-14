import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild, NgZone, ElementRef, Directive, QueryList, ViewChildren, Renderer2 } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import data from '../../content.json'
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RemoveItemDialog } from '../Dialog/RemoveItemDialog';
import { WarningDialog } from '../Dialog/warningDialog';
import { EditItemDialog } from '../Dialog/EditItemDialog';

/* Interfaces */



// items seperated into different groups labeled by room name
interface Group {
  name: string;
  value: query[];
}
// items pulled from storage with caluclated values
interface query {
    id: string;
    roomLabel: string;
    groupName: string;
    groupType: string;
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
    fasciaRetail: number;
    fasciaCost: number;
    danielsMotorPrice: number;
}
// itens pulled from storage without caluclated values
interface QueryStore {
    groupName: string;
    groupType: string;
    roomLabel: string;
    quantity: number;
    width: number;
    height: number;
}
// get items that are contained in certain tab
interface Tables {
  name: string;
  list: query[];
}

// get tabs related to queries without calculated values
interface StorageTables {
  name: string;
  list: QueryStore[];
}

// used for GroupType selector
interface MaterialGroup {
  tag: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  @ViewChild('editElement') editor!: ElementRef;
  @ViewChildren('tableItems') tableItems!: QueryList<ElementRef>;

  /* Arrays */
  pricingTables: Array<Array<number>> = []; // get tables that are linked to each groupType (C, D, E, F, G, H)
  Widths: number[] = [];  // widths defined by the tables
  Heights: number[] = []; // heights defined by the tables
  groupNames: Array<string> = [];  // names of each row group in the table (groups items together to get total calculations).
  queriesArray: Array<Tables> = []; // stores all local data to be used as JSON

  shortenedArray?: Array<Array<Group>> = undefined; // used to store the items that are shorted

  // allow for itteration through the groupTypes for selector
  MaterialGroups: Array<MaterialGroup> = [
    {
      tag: "GroupC",
      name: "Elite 2016 Group C",
    },
    {
      tag: "GroupD",
      name: "Elite 2016 Group D",
    },
    {
      tag: "GroupE",
      name: "Elite 2016 Group E",
    },
    {
      tag: "GroupF",
      name: "Elite 2016 Group F",
    },
    {
      tag: "GroupG",
      name: "Elite 2016 Group G",
    },
    {
      tag: "GroupH",
      name: "Elite 2016 Group H",
    }
  ];
  paginationOptions = [
    25,
    50,
    75,
    100,
    125,
    150,
    177,
    200,
    225,
    250,
    275,
    300,
    325,
    350,
    375,
    400,
  ]
  currentPagination = 0;
  numOfPages = 0;
  maxItemsInList = 100;


  /* static variables */
  USE_LOCAL_STORAGE = true;
  costOfInstallation = 47;
  profitMargin = 1.35;

  // inport items
  

  /* Variables */
  /* ngModels */
  valWidth = 0; 
  valHeight = 0;
  isFascia: boolean = false;
  valRoomType = ""; 
  groupName: string = "";
  groupType: string = this.MaterialGroups[0].tag;
  valCost = 0;
  valPrice = 0;
  quantity = 1;
  sqrFt = "";
  retailPrice = 0;
  discount = 50.0;
  discount2 = 50.0;
  installmentCost = 0;
  totalCost = 0;
  roomLabel: string = "";
  currentTab = 0; // unlike other models, this one is updated with a function, allowing for the switching of tabs

  // this value is specifically used to pass a value through the table, do not change
  cleanCost = 0;
  finalFasciaCost = 0;
  finalMotorPrice = 0;
  
  editItem: string = '';
  editorItems_ID: string = '';
  editorItems_GroupName: string = "";
  editorItems_GroupType: string = "";
  editorItems_RoomLabel: string = "";
  editorItems_Width: number = 0;
  editorItems_Height: number = 0;
  editorItems_Quantity: number = 0;


  ngOnInit() {}

  constructor(public dialog: MatDialog, private renderer: Renderer2) {
    console.log("constructor");
    
    try {
      let tableType = data.tables.find(table => table.tag === "GroupC"); // set tableTyle to its default value. TODO: make this a variable, and add to constants page
      
      if (tableType) {  // if tabletype can be found, then set the tables to the tables in the data file
        this.pricingTables = tableType.table.calculations;  
        this.Widths = tableType.table.Widths;
        this.Heights = tableType.table.Heights;  
      }
    } catch (error) {
      console.log(error);
    }

    // this.pricingTables = data.tables[this.defaultGroup]; // set the pricing tables

    // assure that all values are set to default; as defined by the json file
    this.resetValues();
    // fi the LocalStorage is disabled, then the app will reset once the application is refreshed
    if (this.USE_LOCAL_STORAGE) {
      this.queriesArray = [{name: "table 1", list: []}]; //set default data for application
      let localStorageData = localStorage.getItem('queries'); // get data from localStorage
      if (localStorageData) { // if there is data stored before, pull it...
        this.queriesArray = this.convertToLocalFormat(JSON.parse(localStorageData));
      }
    }
    /* TODO: create retail price, sqrFt, fascia price, clean price */

    // non reset items, such as our static variables, will not be reset, so they will be added here
    this.profitMargin = data.startingVars.profitMargin; // 
    this.costOfInstallation = data.startingVars.costOfInstallation
    
    this.groupNames =[]
    
    this.getGroupNames();
    this.groupSort();
    this.groupName = this.groupNames[0]

    // console.log(this.queriesArray[this.currentTab].list)
    // console.log(this.determineShortenedList())
  }
    /* this is triggered when the tab is changed, this will assure the user cannot change to the same tab */
  tabChange(tabChangeEvent: MatTabChangeEvent) {
    if (tabChangeEvent.index === this.currentTab) return;
    this.currentTab = tabChangeEvent.index;
    this.groupName = "";
    this.groupNames = [];
    this.getGroupNames();
  }
    /* allow the user to add new tabs, the naming format is default */
  createTab() {
    this.queriesArray.push({name: "table " + (this.queriesArray.length + 1), list: []});
    this.uploadToStorage()
  }
    /* remove tab from list */
    /** TODO: add dialog */
  closeTab(i: number) {
    // this.queriesArray.splice(i, 1);
    console.log(this.queriesArray, i);
    if (this.currentTab == i ) { this.currentTab = 0; }
    this.queriesArray.splice(i, 1);

    this.uploadToStorage()
  }
    // once the user clicks on the checkmark, the tabs name is then changed, and added to the localstorage
  updateTabName(event: any) {
    let button = event.target;
    let input = button.parentElement.childNodes[0];
    let tabName = input.value;
    this.queriesArray[this.currentTab].name = tabName;
      
    this.uploadToStorage()
  
    button.parentElement.style.display = "none";
    button.parentElement.parentElement.childNodes[0].childNodes[0].style.display = "flex";    
  }

  convertToLocalFormat(storageItems: Array<StorageTables>): Tables[] {
    console.log("convertToLocalFormat");
    let polishedTab = []
    let polishedItems: Tables[] = storageItems.map((tab) => {
      polishedTab = this.updateTable(tab.list);
      
      return {name: tab.name, list: polishedTab};
    });
    return polishedItems;
  }

  convertToStorageFormat() {
    let storageTypeItems = this.queriesArray.map(x => {
      return {
        name: x.name,
        list: x.list.map(listItem => {
          return {
            "groupName": listItem.groupName,
            "groupType": listItem.groupType,
            "roomLabel": listItem.roomLabel,
            "quantity": listItem.quantity,
            "width": listItem.width,
            "height": listItem.height,
          }
        })
      }
    });
    return storageTypeItems;
  }

  updateTable(tabList: QueryStore[] | null): query[] {
    console.log("updateTable");
    let updatedTabList: query[] = [];
    if (tabList) {
      updatedTabList = tabList.map((item, itemIndex )=> {
        return this.updatePricing(item, itemIndex);
      });
    }
    return updatedTabList;
  }

  updatePricing(item:QueryStore, index: number | null): query {
      let sqrFt = this.calculateSqrFt(item.width, item.height, item.quantity);
      let retailPrice = this.calculateRetailPrice(item.width, item.height, item.groupType);
      let cost = this.calculateCost(retailPrice, this.discount, this.discount2, item.quantity);
      let price = this.calculatePrice(cost);
      let installmentCost = this.calculateInstallmentCost(item.quantity);
      
      let fasciaRetail = this.calculateFasciaRetail(item.width, item.groupType);
      let fasciaCost = this.calculateFasciaCost(fasciaRetail, this.discount, this.discount2, item.quantity);
      let danielsMotorPrice = this.calculateDanielsMotorPrice(item.quantity);

      return {
        id: Date.now() + "_" + index,
        roomLabel: item.roomLabel,
        groupName: item.groupName,
        groupType: item.groupType,
        width: item.width,
        height: item.height,
        sqrFt: sqrFt,
        retailPrice: retailPrice,
        cost: cost,
        quantity: item.quantity,
        price: price,
        discount: this.discount,
        discount2: this.discount2,
        installmentCost: installmentCost,
        fasciaRetail: fasciaRetail, 
        fasciaCost: fasciaCost,
        danielsMotorPrice: danielsMotorPrice
      }
  }

  uploadToStorage() { if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.convertToStorageFormat())); }

  updateInputs() {
    // console.log("updateInputs", this.valWidth, this.valHeight, this.groupType);
    
    this.retailPrice = this.calculateRetailPrice(this.valWidth, this.valHeight, this.groupType);
    
    this.sqrFt = this.calculateSqrFt(this.valWidth, this.valHeight, this.quantity);

    this.valCost = this.calculateCost(this.retailPrice, this.discount, this.discount2, this.quantity);
    this.installmentCost = this.quantity * this.costOfInstallation;
    
    this.valPrice = this.calculatePrice(this.valCost);
    
  }

  
  addToList() {
    if ((this.valWidth <= 0 || this.valWidth == null) ||
        (this.valHeight <= 0 || this.valHeight == null) ||
        (this.quantity <= 0 || this.quantity == null)) return;
    console.log("addToList");
    try { 
      let item = this.updatePricing({
        roomLabel: this.roomLabel,
        groupName: this.groupName,
        groupType: this.groupType,
        width: this.valWidth,
        height: this.valHeight,
        quantity: this.quantity,
        
      } as QueryStore, null);

      this.queriesArray[this.currentTab].list.push(item);
      this.uploadToStorage() // check if you can add to LocalStorage
      this.shortenedArray = undefined;
    } catch (error) {
      console.log("error", error);
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
    
    this.uploadToStorage() // check if you can add to LocalStorage
    this.resetValues(); // reset values
    if (!this.groupNames.includes(this.groupName)) {
      this.groupNames.push(this.groupName);
    }

    this.groupSort();
  }

  editFromList( id :string, event: any) {
    let currentItem: number = this.queriesArray[this.currentTab].list.findIndex((index) => {
      return index.id == id;
    });

    let element = this.queriesArray[this.currentTab].list[currentItem];
    
    this.editItem = id;

    this.editorItems_ID = id;
    this.editorItems_GroupType = element.groupType ?? "";
    this.editorItems_GroupName = element.groupName;
    this.editorItems_RoomLabel = element.roomLabel;
    this.editorItems_Width = element.width;
    this.editorItems_Height = element.height;
    this.editorItems_Quantity = element.quantity;
    
    if (currentItem == -1) {
      console.error("editFromList", "item not found");  
      return;
    }

    
    
    let elm = this.editor;
    let item = this.tableItems.toArray().find(i => i.nativeElement.id == id);
    console.log("editFromList", item);
    console.log("currentItem", currentItem, "item", this.tableItems.toArray()[currentItem]);

    if (!item) return;
    let itemRect = item.nativeElement.getBoundingClientRect();
    
    console.log("itemRect", itemRect, item);
    this.renderer.setStyle(elm.nativeElement, 'top', itemRect.top + 'px');
    this.renderer.setStyle(elm.nativeElement, 'left', itemRect.left + 'px');
    this.renderer.setStyle(elm.nativeElement, 'width', itemRect.width + 'px');
    this.renderer.setStyle(elm.nativeElement, 'height', itemRect.height + 'px');
    this.renderer.setStyle(elm.nativeElement, 'display', "grid");
    
    
  }

  confirmEditFromList() {
    this.renderer.setStyle(this.editor.nativeElement, 'display', "none");
    let currentItem = this.queriesArray[this.currentTab].list.findIndex((x) => x.id == this.editorItems_ID);
    let item = this.queriesArray[this.currentTab].list[currentItem];

    const itemGroupName = item.groupName
    const editorGroupName = this.editorItems_GroupName; 

    console.log("confirmEditFromList", currentItem, item);
    let newPrice = this.updatePricing({
      roomLabel: this.editorItems_RoomLabel,
      groupName: this.editorItems_GroupName ?? "",
      groupType: this.editorItems_GroupType,
      width: this.editorItems_Width,
      height: this.editorItems_Height,
      quantity: this.editorItems_Quantity,
    } as QueryStore, null);


    newPrice.id = this.editorItems_ID;
    this.queriesArray[this.currentTab].list[currentItem] = newPrice;
    console.log(newPrice);
    this.uploadToStorage()
  }

  determineShortenedList(max?: number, update: boolean = false) {
    const maxOnScreen = max ?? 50;

    let sortedList = this.groupListItems(this.queriesArray[this.currentTab].list);
    let itemCount: number[] = sortedList.map(item => {
      return item.value.length;
    });
    // console.log("determinedShortendList", sortedList, "itemCount", itemCount);
    if (!this.shortenedArray || update) {
      let simpleShortenedList: Array<Array<Group>> = [[]];
      let currentCount = 0;
      let currentIndex = 0;

      for (let i = 0; i < itemCount.length; i++) {
        // console.log("currentCount", currentCount,"currentIndex", currentIndex, "itemCount[i]", itemCount[i], "maxOnScreen", maxOnScreen);
        if (currentCount + itemCount[i] <= maxOnScreen || (itemCount[i] > maxOnScreen && (i === 0 || currentCount === 0))) {
          // console.log("fits within maxOnScreen or is greater by iteself");
          currentCount += itemCount[i];
          if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
          simpleShortenedList[currentIndex].push(sortedList[i]);
        } else {
          currentIndex ++;
          if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
          simpleShortenedList[currentIndex].push(sortedList[i]);
          currentCount = 0;
        }
      }
      this.numOfPages = simpleShortenedList.length;

      this.shortenedArray = simpleShortenedList;
    }
    return this.shortenedArray;
  
  }

  deleteFromList() {
    this.renderer.setStyle(this.editor.nativeElement, 'display', "none");

    let currentItem = this.queriesArray[this.currentTab].list.findIndex((x) => x.id == this.editorItems_ID);
    this.queriesArray[this.currentTab].list.splice(currentItem, 1);
    this.uploadToStorage();
    this.resetValues();
    this.determineShortenedList(this.maxItemsInList, true);
  }
  

  calculateDanielsMotorPrice(quantity: number) { return (350 * quantity); }
  calculateInstallmentCost(quantity: number) { return this.installmentCost * quantity; }
  calculatePrice(cost: number) { return Math.round((cost + this.installmentCost) * this.profitMargin); }
  calculateSqrFt(width: number, height: number, quantity: number) { return (((width * height) / 144) * quantity).toFixed(2); }
  calculateCost(retailPrice: number, discount: number = this.discount, discount2: number = this.discount2, quantity: number ): number { return ((retailPrice * (discount / 100)) * (discount2 / 100)) * quantity; }
  calculateFasciaCost(fasciaRetail: number, discount: number, discount2: number, quantity: number) { return ((fasciaRetail * (discount / 100)) * (discount2 / 100)) * quantity; }
  
  calculateRetailPrice(valWidth: number, valHeight: number, groupType: string): number {
    // console.log("calculateRetailPrice", valWidth, valHeight, groupType);
    let width = 0; 
    let height = 0;
    
    this.Widths.forEach((x, i) => {
      if ( valWidth == 0 || valWidth == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Widths[i-1] < valWidth))  {
        width = x;

      } else if (valWidth > this.Widths[this.Widths.length - 1]) {
        width = this.Widths[this.Widths.length - 1];
        // console.log("width", width);
        
      }
    });

    this.Heights.forEach((x, i) => {
      if ( valHeight == 0 || valHeight == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Heights[i-1] < valHeight)) {
        height = x;

      } else if (valHeight > this.Heights[this.Heights.length - 1]) {
        height = this.Heights[this.Heights.length - 1];
        // console.log("height", height);
        
      }
    });

    const widthIndex = this.Widths.indexOf(width);
    const heightIndex = this.Heights.indexOf(height);

    // console.log("Widths", this.Widths, "Heights", this.Heights, "valWidth", valWidth, "valHeight", valHeight, "width", width, "height", height, "widthIndex", widthIndex, "heightIndex", heightIndex, "tables", this.pricingTables);
    let table = data.tables.find((item) => {
      // console.log("item.tag ", item.tag, "groupType", groupType, "res", item.tag === groupType);
      return item.tag === groupType;
    });
    // console.log("table", table);
    // console.log("table", table, "groupType", groupType);
    if (table) {
      return table.table.calculations[heightIndex][widthIndex];
    } else {
      throw new Error("No table found");
    }
  }

  calculateFasciaRetail(valWidth: number, groupType: string) {
    let width = 0; 
    
    this.Widths.forEach((x, i) => {
      if ( valWidth == 0 || valWidth == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Widths[i-1] < valWidth))  {
        
        width = x;
      }
    });

    const widthIndex = this.Widths.indexOf(width);
    const fasciaTable: Array<number> = data.tables[0].table.fascia;
    return fasciaTable[widthIndex];
  }
  calculateFinalRetailPrice() {
    return this.numericCommas((this.cleanCost * 1.2).toFixed(2));
  }

  calculateFinalFasciaPrice(group:any[]) {
    this.finalFasciaCost = ((this.totalFasciaSum(group) * this.profitMargin) + this.cleanCost);
    return this.numericCommas(this.finalFasciaCost.toFixed(2));
  }
  calculatePriceWithFascia(group:any[]) {
    return this.numericCommas((this.finalFasciaCost * 1.2).toFixed(2));
  }

  calculateFinalMotorPrice(group:any[]) {
    this.finalMotorPrice = this.totalMotorPriceSum(group) + this.finalFasciaCost;
    return this.numericCommas(this.finalMotorPrice.toFixed(2));
  }

  calculatePriceWithMotor(group:any[]) {
    return this.numericCommas((this.finalMotorPrice * 1.2).toFixed(2));
  }

  totalProfit(group: any[]) {
    return this.totalPriceSum(group) - this.totalCostSum(group) - this.totalInstallmentCostSum(group);

  }

  totalCostSum(group: any[]) {
    let sum = 0;
    group.forEach((item) => {
      sum += item.cost;
    });
    return sum;
  }
  
  totalPriceSum(group: any[]) {
    let sum = 0;
    group.forEach((item) => {
      sum += item.price;
    });
    this.totalCost = sum;
    return sum;
  }

  totalMotorPriceSum(group: any[]) {
    let sum = 0;
    group.forEach((item) => {
      sum += item.danielsMotorPrice;
    });
    return sum;
  }
  
  totalInstallmentCostSum(group: any[]) {
    let sum = 0;
    group.forEach((item) => {
      sum += item.installmentCost;
    });
    return sum;
  }

  totalFasciaSum(group: any[]){
    let sum = 0;
    group.forEach((item) => {
      sum += item.fasciaCost;
    });
    return sum;
  }

  getGroupNames() {
    this.queriesArray[this.currentTab].list.forEach((element, index) => {
      if (index === 0) { this.groupName = element.groupName; }
      if (!this.groupNames.includes(element.groupName)) {
        this.groupNames.push(element.groupName);
      }
    });
  }

  // use this to change a number (preferably dollar cents),
  //this will allow the value to be decorated with commas, making the numbers easier to read
  numericCommas(x: number | string) {
    let str;
    if (typeof x !== 'string') 
      str = x.toString();
    else
      str = x

    let cost = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "$ " + cost;
  }

  // this is run after the user enters a new value, every new value, the application will recalculate
  // all the values that are needed

  groupSort () {
    let sortGroups = this.groupNames.sort((a, b) => {
      if (a == '') return 1;
      return a > b ? -1 : 1; 
     });
 
     this.groupNames = sortGroups;
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
  
    this.updateInputs(); // calculate the dynamic variables from the reset values
  }
  /* calculate the sum of each item in the array */
  

  /* once the user clicks on the edit button, hide the button and show the input that contains changes the tab name */
  openEditPannel (event: any) {
      let button = event.target;
      let input = button.parentElement.parentElement.childNodes[1];
      button.style.display = "none";
      input.style.display = "flex";
      
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
    return this.cleanCost
  }

  groupListItems(list: query[]) {
    let listGroups: Group[] = [];
    list.forEach( (li, index) => {
      if (listGroups.length === 0) {
        listGroups.push({name: li.groupName, value: [li]});
      } else {
        let found = false;
        listGroups.forEach( (group, i) => {
          if (group.name === li.groupName) {
            group.value.push(li);
            found = true;
          }
        });
        if (!found) {
          listGroups.push({name: li.groupName, value: [li]});
        }
      }
    });
    let sortedList = listGroups.sort((a,b) => {
      if (a.name == '') return '_' > b.name? 1: -1;
      if (b.name == '') return a.name > '_'? 1: -1;
      return a.name > b.name ? 1 : -1;
    });
    return sortedList;
  }

  groupTypeChange(groupIndex: number, event: any) {
   let value = event.target.value;
   let sortedArray = this.groupListItems(this.queriesArray[this.currentTab].list);
   let idArray = sortedArray[groupIndex].value.map(x => x.id);
   let polishedItems = this.queriesArray[this.currentTab].list.map((item) => {
      if (idArray.includes(item.id)) {
        item.groupType = value;
        return this.updatePricing({
          groupType: value,
          groupName: item.groupName,
          width: item.width,
          height: item.height,
          roomLabel: item.roomLabel,
          quantity: item.quantity,
        } as QueryStore, null);
      }
      return item;
    });
    if (polishedItems) this.queriesArray[this.currentTab].list = polishedItems;
    this.uploadToStorage() // check if you can add to LocalStorage
    
  }

  queriesArraySum() {
    return this.queriesArray[this.currentTab].list.length
  }

  nextPage() {
    this.currentPagination++;
    if (this.currentPagination >= this.numOfPages) this.currentPagination = 0;
  }

  lastPage() {
    this.currentPagination--;
    if (this.currentPagination < 0) this.currentPagination = this.numOfPages-1;
  }

  itemIsAvailable(value: any) {
    console.log("items abailable", value);
    let items = value ?? '{}';
    let data;
    if (items.type == 'json') {
      data = JSON.parse(items.data);
      for (let tableIndex in data) {
        let table = data[tableIndex];
        let isCurrentTable = this.queriesArray.findIndex(x => x.name == table.name);
        let items: query[] = (table.list as QueryStore[]).map((x, i) => {
          return this.updatePricing(x,i);
        });
        if (isCurrentTable == -1) {
          this.queriesArray.push({
            name: table.name,
            list: items
          })
        } else {
          
          this.queriesArray[isCurrentTable].list.push(...items);
        }
      }
    } else if (items.type == 'csv') {
      setTimeout(() => {
        data = items.data;
        data.shift();
        let itemsArray: query[] = data.map((x: any, i: number) => {
          console.log(x.roomLabel, x.width, x.height, x.quantity, x.groupName, x.groupType);
          return this.updatePricing(x,i);
        })
        
        this.queriesArray[this.currentTab].list.push(...itemsArray) // add the new items to the current tab
      }, 1000);
    }
    
    this.uploadToStorage()
  }
}
