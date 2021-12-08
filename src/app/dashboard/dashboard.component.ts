import { Component, Input, OnInit, Output, SimpleChanges, EventEmitter, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import data from '../../content.json'
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RemoveItemDialog } from '../Dialog/RemoveItemDialog';
import { WarningDialog } from '../Dialog/warningDialog';
import { MatPaginator } from '@angular/material/paginator';
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
  @Input() onFinalDataInport: Array<QueryStore> = []; // import data from other components, allowing the user to upload a CSV file

  
  /* Arrays */
  pricingTables: Array<Array<number>> = []; // get tables that are linked to each groupType (C, D, E, F, G, H)
  Widths: number[] = [];  // widths defined by the tables
  Heights: number[] = []; // heights defined by the tables
  groupNames: Array<string> = [];  // names of each row group in the table (groups items together to get total calculations).

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

  

  /* static variables */
  USE_LOCAL_STORAGE = true;
  costOfInstallation = 47;
  profitMargin = 1.35;

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

  queriesArray: Array<Tables> = []; // stores all local data to be used as JSON
  currentPagination = 0;
  numOfPages = 0;
  

  ngOnInit() { }  // is required but is never used

  // when the user uploads a CSV file, this function is called to update the table
  ngOnChanges(changes: SimpleChanges) {
    
    setTimeout(() => { // since this only shows that the file is being uploaded, it is necessary to wait for the file to be uploaded
      //(there is no calculation for the time to wait, so one second is needed at the moment) TODO: find a better way to do this
    
      if (this.onFinalDataInport) { // only on file change can enter
        let items = this.onFinalDataInport ?? []; // if the file is empty, the array will be undefined, so this will prevent that
        items.shift(); // remove the first item, which is the header
            
        let itemsArray: query[] = this.onFinalDataInport.map((x, i) => { // convert the array from localStorage to a format that has all calculated values
          return this.updatePricing(x, i);
        })
        
        this.queriesArray[this.currentTab].list.push(...itemsArray) // add the new items to the current tab
        this.uploadToStorage() // update local storage
      }
    }, 1000);
  }

  ngAfterViewInit() {
   
  }

  constructor(public dialog: MatDialog) {
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
    console.log(this.determineShortenedList())
  }
  //TODO: not saving data
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
  calculateDanielsMotorPrice(quantity: number) {
    return (350 * quantity);
  }

  calculateFasciaCost(fasciaRetail: number, discount: number, discount2: number, quantity: number) {
    return ((fasciaRetail * (discount / 100)) * (discount2 / 100)) * quantity;
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

  calculateInstallmentCost(quantity: number) {
    
    return this.installmentCost * quantity;
  }
  calculatePrice(cost: number) {
    return Math.round((cost + this.installmentCost) * this.profitMargin);  
  }
  calculateSqrFt(width: number, height: number, quantity: number) {
    return (((width * height) / 144) * quantity).toFixed(2);
  }

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
        console.log("width", width);
        
      }
    });

    this.Heights.forEach((x, i) => {
      if ( valHeight == 0 || valHeight == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Heights[i-1] < valHeight)) {
        height = x;

      } else if (valHeight > this.Heights[this.Heights.length - 1]) {
        height = this.Heights[this.Heights.length - 1];
        console.log("height", height);
        
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

  calculateCost(retailPrice: number, discount: number = this.discount, discount2: number = this.discount2, quantity: number ): number {
    return ((retailPrice * (discount / 100)) * (discount2 / 100)) * quantity;
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
  numericCommas(x: number) {
    let cost = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return "$ " + cost;
  }

  // this is run after the user enters a new value, every new value, the application will recalculate
  // all the values that are needed
  updateInputs() {
    console.log("updateInputs", this.valWidth, this.valHeight, this.groupType);
    
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

  
  removeFromList( id :string, event: any) {
    if (!event.ctrlKey) { // check if the user is holding ctrl, which bypasses the warning
      const dialogRef = this.dialog.open(RemoveItemDialog); // open dialog
      dialogRef.afterClosed().subscribe(result => { // get data that was entered
        if (!result) return;
        this.queriesArray[this.currentTab].list = this.queriesArray[this.currentTab].list.filter(x => x.id != id); // remove item from list
        this.uploadToStorage()
      });
    }
  }

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
    this.queriesArray.splice(i, 1);
    this.uploadToStorage()
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
    
    this.uploadToStorage()

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
      if (a.name == '') return 1;
      return a.name > b.name ? -1 : 1;
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

  uploadToStorage() {
    if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.convertToStorageFormat()));
  }

  queriesArraySum() {
    return this.queriesArray[this.currentTab].list.length
  }

  determineShortenedList() {
    const maxOnScreen = 50;

    let sortedList = this.groupListItems(this.queriesArray[this.currentTab].list);
    let itemCount: number[] = sortedList.map(item => {
      return item.value.length;
    });
    console.log("determinedShortendList", sortedList, "itemCount", itemCount);
    let simpleShortenedList: Array<Array<Group>> = [[]];
    
    let currentCount = 0;
    let currentIndex = 0;

    for (let i = 0; i < itemCount.length; i++) {
      console.log("currentCount", currentCount,"currentIndex", currentIndex, "itemCount[i]", itemCount[i], "maxOnScreen", maxOnScreen);
      if (currentCount + itemCount[i] <= maxOnScreen || (itemCount[i] > maxOnScreen && currentCount === 0)) {
        console.log("fits within maxOnScreen or is greater by iteself");
        currentCount += itemCount[i];
        if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
        simpleShortenedList[currentIndex].push(sortedList[i]);
      } else {
        console.log("currentCount is too large")
        currentIndex ++;
        if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
        simpleShortenedList[currentIndex].push(sortedList[i]);
        currentCount = 0;
      }
    }
    this.numOfPages = simpleShortenedList.length;
    return simpleShortenedList;
  }

  nextPage() {
    this.currentPagination++;
    if (this.currentPagination >= this.numOfPages) this.currentPagination = 0;
  }
  lastPage() {
    this.currentPagination--;
    if (this.currentPagination < 0) this.currentPagination = this.numOfPages;
  }
}