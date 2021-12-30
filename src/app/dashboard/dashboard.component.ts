import { Component, OnInit, ElementRef, QueryList, ViewChildren, Renderer2 } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import data from '../../content.json'
import { MatDialog} from '@angular/material/dialog';
import { EditItemDialog } from '../Dialog/EditItemDialog';
import { EditCalculationDialog } from '../Dialog/EditCalculationDialog';
import { NavigationExtras, Router } from '@angular/router';

/* Interfaces */
// items seperated into different groups labeled by room name
// items pulled from storage with caluclated values
interface query {
  id: string;
  roomLabel: string;
  groupName: string;
  groupType: string;
  quantity: number;
  width: number;
  height: number;
  discount: number;
  discount2: number;
  cost?: number;
  price?: number;
    
  sqrFt?: string;
  retailPrice?: number;
  installmentCost?: number;
  fasciaRetail?: number;
  fasciaCost?: number;
  danielsMotorPrice?: number;
}


// used for GroupType selector
interface MaterialGroup {
  tag: string;
  name: string;
}

interface Tables {
  name: string;
  list: Groups[];
}

interface Groups {
  Group: string;
  GroupItems: query[];
  GroupAlterations: ManualCalculations;
  Material: string;
  Color: string;
}

interface ManualCalculations {
  openRollPrice?: number,
  profit?: number
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  /* Arrays */
  pricingTables: Array<Array<number>> = []; // get tables that are linked to each groupType (C, D, E, F, G, H)
  Widths: number[] = [];  // widths defined by the tables
  Heights: number[] = []; // heights defined by the tables
  groupNames: Array<string> = [];  // names of each row group in the table (groups items together to get total calculations).
  queriesArray: Array<Tables> = []; // stores all local data to be used as JSON

  shortenedArray?: Array<Array<Groups>> = undefined; // used to store the items that are shorted

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
  material: string = "";
  color: string = "";
  retailPrice = 0;
  discount = 50.0;
  discount2 = 50.0;
  installmentCost = 0;
  totalCost = 0;
  roomLabel: string = "";
  currentTab = 0; // unlike other models, this one is updated with a function, allowing for the switching of tabs

  // this value is specifically used to pass a value through the table, do not change
  finalFasciaCost = 0;
  finalMotorPrice = 0;
  
  

  ngOnInit() {}

  constructor(public dialog: MatDialog, private renderer: Renderer2, private router: Router) {
    
    try {
      let tableType = data.tables.find(table => table.tag === "GroupC"); // set tableTyle to its default value. TODO: make this a variable, and add to constants page
      
      if (tableType) {  // if tabletype can be found, then set the tables to the tables in the data file
        this.pricingTables = tableType.table.calculations;  
        this.Widths = tableType.table.Widths;
        this.Heights = tableType.table.Heights;  
      }
    } catch (error) {
      console.error("error finding tables: ", error);
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

    // non reset items, such as our static variables, will not be reset, so they will be added here
    this.profitMargin = data.startingVars.profitMargin; // 
    this.costOfInstallation = data.startingVars.costOfInstallation
    
    this.groupNames = []
    
    this.getGroupNames();
    this.groupSort();
    this.groupName = this.groupNames[0]

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
    if (this.currentTab == i ) { this.currentTab = 0; }
    this.queriesArray.splice(i, 1);
    if (this.queriesArray.length == 0) this.queriesArray.push({name: "Table 1", list: []} as Tables)
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

  convertToLocalFormat(storageItems: Tables[]): Tables[] {

    let tables: Tables[] = storageItems.map((tab) => {
      return {
        name: tab.name,
        list: tab.list.map((groups: Groups) => {
          return {
            Group: groups.Group,
            GroupItems: groups.GroupItems.map((items: query, itemIndex: number) => {
              return this.updatePricing(items, itemIndex)
            }),
            Material: groups.Material,
            Color: groups.Color,
            GroupAlterations: {
              openRollPrice: groups.GroupAlterations.openRollPrice,
              profit: groups.GroupAlterations.profit,
            } as ManualCalculations
          } as Groups
        })
      } as Tables;
    });
    return tables;
  }

  convertToStorageFormat() {
    let tables: Tables[] = this.queriesArray.map((tab: Tables) => {
      return {
        name: tab.name,
        list: tab.list.map((groups: Groups) => {
          return {
            Group: groups.Group,
            GroupItems: groups.GroupItems.map((items: query) => {
              return {
                id: items.id,
                roomLabel: items.roomLabel,
                groupName: items.groupName,
                groupType: items.groupType,
                quantity: items.quantity,
                width: items.width,
                height: items.height,
                discount: items.discount,
                discount2: items.discount2,
              } as query
            }),
            Material: groups.Material,
            Color: groups.Color,
            GroupAlterations: {
              openRollPrice: groups.GroupAlterations.openRollPrice,
              profit: groups.GroupAlterations.profit,
            } as ManualCalculations
          } as Groups
        })
      }
    });

    return tables;
  }


  updatePricing(item:query, index: number | null): query {
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
      discount: item.discount,
      discount2: item.discount2,
      installmentCost: installmentCost,
      fasciaRetail: fasciaRetail, 
      fasciaCost: fasciaCost,
      danielsMotorPrice: danielsMotorPrice
    }
  }

  uploadToStorage() { if (this.USE_LOCAL_STORAGE) localStorage.setItem('queries', JSON.stringify(this.convertToStorageFormat())); }

  updateInputs() {
    this.retailPrice = this.calculateRetailPrice(this.valWidth, this.valHeight, this.groupType);
    this.sqrFt = this.calculateSqrFt(this.valWidth, this.valHeight, this.quantity);
    this.valCost = this.calculateCost(this.retailPrice, this.discount, this.discount2, this.quantity);
    this.installmentCost = this.quantity * this.costOfInstallation;
    this.valPrice = this.calculatePrice(this.valCost);
  }

  
  addToList() {
    if ((this.valWidth <= 0 || this.valWidth == null) ||
        (this.valHeight <= 0 || this.valHeight == null) ||
        (this.quantity <= 0 || this.quantity == null) || 
        (this.groupName == undefined || this.groupName == "")) return;
    
    let groupIndex = this.queriesArray[this.currentTab].list.findIndex((group: Groups) => group.Group == this.groupName);

    if (groupIndex == -1) {
      this.queriesArray[this.currentTab].list.push({
        Group: this.groupName,
        GroupItems: [this.updatePricing(({
          id: Date.now() + "_" + 0,
          roomLabel: this.roomLabel,
          groupName: this.groupName,
          groupType: this.groupType,
          width: this.valWidth,
          height: this.valHeight,
          quantity: this.quantity,
          discount: this.discount,
          discount2: this.discount2,
        } as query), 0)],
        Material: this.material,
        Color: this.color,
        GroupAlterations: {
          openRollPrice: undefined,
          profit: undefined,
        } as ManualCalculations
      } as Groups);

    } else {
      this.queriesArray[this.currentTab].list[groupIndex].GroupItems = [...this.queriesArray[this.currentTab].list[groupIndex].GroupItems, 
      this.updatePricing(({
        id: Date.now() + "_" + 0,
        roomLabel: this.roomLabel,
        groupName: this.groupName,
        groupType: this.groupType,
        width: this.valWidth,
        height: this.valHeight,
        quantity: this.quantity,
        discount: this.discount,
        discount2: this.discount2,
      } as query), 0)];
    }


    this.uploadToStorage() // check if you can add to LocalStorage
    this.resetValues(); // reset values
    if (!this.groupNames.includes(this.groupName)) this.groupNames.push(this.groupName);

    this.determineShortenedList(this.currentTab, undefined, true);
  }



  editFromList(groupName: string, id :string) {
    let currentGroup = this.queriesArray[this.currentTab].list.findIndex((group) => group.Group == groupName);
    let currentItem = this.queriesArray[this.currentTab].list[currentGroup].GroupItems.findIndex((item) => item.id == id);

    

    let item = this.queriesArray[this.currentTab].list[currentGroup].GroupItems[currentItem];
  
    if (currentItem == -1) return;
    
    this.dialog.open(EditItemDialog, {width: '90%', data: {
      'room' : item.roomLabel,
      'groupType': item.groupType,
      'groupName': item.groupName,
      'width': item.width,
      'height': item.height,
      'quantity': item.quantity,
      'groupNames': this.groupNames,
      'discount': item.discount,
      'discount2': item.discount2,
    
    }}).afterClosed().subscribe(result => {
        if (result == true) {
          this.queriesArray[this.currentTab].list[currentGroup].GroupItems.splice(currentItem, 1)
          if (this.queriesArray[this.currentTab].list[currentGroup].GroupItems.length == 0) {
            this.queriesArray[this.currentTab].list.splice(currentGroup, 1);
            this.determineShortenedList(this.currentTab, undefined, true);
            this.uploadToStorage();
          }
          
          return
        }
        if (result) {
          let calculateItem = this.updatePricing({
            id: id,
            roomLabel: result.room,
            groupName: result.groupName,
            groupType: result.groupType,
            width: result.width,
            height: result.height,
            quantity: result.quantity,
            discount: result.discount,
            discount2: result.discount2,
          } as query, 0);
          this.queriesArray[this.currentTab].list[currentGroup].GroupItems[currentItem] = calculateItem;
          
          let nextGroup = this.queriesArray[this.currentTab].list.findIndex((group) => group.Group == result.groupName);
          this.queriesArray[this.currentTab].list[nextGroup].GroupItems.push(calculateItem);
          this.queriesArray[this.currentTab].list[currentGroup].GroupItems.splice(currentItem, 1)

          if (this.queriesArray[this.currentTab].list[currentGroup].GroupItems.length == 0) this.queriesArray[this.currentTab].list.splice(currentGroup, 1);
        }

        this.determineShortenedList(this.currentTab, undefined, true);
        this.uploadToStorage();
        
    });
  }

  editCustomCalculation(group: Groups) {
    
    this.dialog.open(EditCalculationDialog, {width: '90%', data: {
      profit: this.totalProfit(group),
      openRollPrice: this.getCleanPrice(group),
    }}).afterClosed().subscribe(result => {
        if (result && this.queriesArray[this.currentTab].list.find((item) => item.Group == group.Group)) {
          this.queriesArray[this.currentTab].list.find((item) => item.Group == group.Group)!.GroupAlterations = result;
          
        }
        this.determineShortenedList(this.currentTab, undefined, true);
        this.uploadToStorage();
    });
  }


  determineShortenedList(tab: number, max?: number, update: boolean = false) {
    const maxOnScreen = max ?? 50;
    let list = this.queriesArray[this.currentTab].list;
    let itemCount: number[] = this.queriesArray[tab].list.map((group) => group.GroupItems.length);
    
    if (typeof this.shortenedArray == 'undefined' || update) {
      let simpleShortenedList: Array<Array<Groups>> = [[]];
      let currentCount = 0;
      let currentIndex = 0;

      for (let i = 0; i < itemCount.length; i++) {
        
        if (currentCount + itemCount[i] <= maxOnScreen || (itemCount[i] > maxOnScreen && (i === 0 || currentCount === 0))) {

          currentCount += itemCount[i];
          if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
          simpleShortenedList[currentIndex].push(list[i]);

        } else {
          currentIndex ++;
          if (simpleShortenedList[currentIndex] == null) simpleShortenedList[currentIndex] = [];
          simpleShortenedList[currentIndex].push(list[i]);
          currentCount = 0;
        }
      }
      this.numOfPages = simpleShortenedList.length;
      this.shortenedArray = simpleShortenedList;
    }
    
    return this.shortenedArray;    
  }

  calculateDanielsMotorPrice(quantity: number) { return (350 * quantity); }
  calculateInstallmentCost(quantity: number) { return this.installmentCost * quantity; }
  calculatePrice(cost: number) { return Math.round((cost + this.installmentCost) * this.profitMargin); }
  calculateSqrFt(width: number, height: number, quantity: number) { return (((width * height) / 144) * quantity).toFixed(2); }
  calculateCost(retailPrice: number, discount: number = this.discount, discount2: number = this.discount2, quantity: number ): number { return ((retailPrice * (discount / 100)) * (discount2 / 100)) * quantity; }
  calculateFasciaCost(fasciaRetail: number, discount: number, discount2: number, quantity: number) { return ((fasciaRetail * (discount / 100)) * (discount2 / 100)) * quantity; }
  
  calculateRetailPrice(valWidth: number, valHeight: number, groupType: string): number {
    let width = 0; 
    let height = 0;
    
    this.Widths.forEach((x, i) => {
      if ( valWidth == 0 || valWidth == undefined) return;

      if ( x  >= valWidth && ( i-1 <= 0 || this.Widths[i-1] < valWidth))
        width = x;
      else if (valWidth > this.Widths[this.Widths.length - 1]) width = this.Widths[this.Widths.length - 1];
    });

    this.Heights.forEach((x, i) => {
      if ( valHeight == 0 || valHeight == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Heights[i-1] < valHeight)) {
        height = x;

      } else if (valHeight > this.Heights[this.Heights.length - 1]) {
        height = this.Heights[this.Heights.length - 1];
        
      }
    });

    const widthIndex = this.Widths.indexOf(width);
    const heightIndex = this.Heights.indexOf(height);
    let table = data.tables.find((item) => item.tag === groupType );

    if (table)
      return table.table.calculations[heightIndex][widthIndex];
    else 
      throw new Error("No table found");
  }

  calculateFasciaRetail(valWidth: number, groupType: string) {
    let width = 0; 
    
    this.Widths.forEach((x, i) => {
      if ( valWidth == 0 || valWidth == undefined) return;
      if ( x  >= valWidth && ( i-1 <= 0 || this.Widths[i-1] < valWidth)) width = x;
    });

    const widthIndex = this.Widths.indexOf(width);
    const fasciaTable: Array<number> = data.tables[0].table.fascia;
    return fasciaTable[widthIndex];
  }

  calculateFinalRetailPrice(group: Groups) { return (this.getCleanPrice(group) * 1.2).toFixed(2); }
  calculatePriceWithMotor(group: Groups) { return (this.finalMotorPrice * 1.2).toFixed(2); }
  calculatePriceWithFascia(group: Groups) { return (this.finalFasciaCost * 1.2).toFixed(2); }

  calculateFinalFasciaPrice(group: Groups) {
    this.finalFasciaCost = ((this.totalFasciaSum(group) * this.profitMargin) + this.getCleanPrice(group));
    return this.finalFasciaCost.toFixed(2);
  }

  calculateFinalMotorPrice(group: Groups) {
    this.finalMotorPrice = this.totalMotorPriceSum(group) + this.finalFasciaCost;
    return this.finalMotorPrice.toFixed(2);
  }


  totalProfit(group: Groups) {
    if (group.GroupAlterations.profit) return group.GroupAlterations.profit;
    return this.totalPriceSum(group) - this.totalCostSum(group) - this.totalInstallmentCostSum(group);
  }

  totalCostSum(group: Groups) {
    let sum = 0;
    group.GroupItems.forEach((item) => {
      sum += item.cost ?? 0;
    });
    return sum;
  }
  
  totalPriceSum(group: Groups) {
    let sum = 0;
    group.GroupItems.forEach((item) => {
      sum += item.price ?? 0;
    });
    this.totalCost = sum;
    return sum;
  }

  totalMotorPriceSum(group: Groups) {
    let sum = 0;
    group.GroupItems.forEach((item) => {
      sum += item.danielsMotorPrice ?? 0;
    });
    return sum;
  }
  
  totalInstallmentCostSum(group: Groups) {
    let sum = 0;
    group.GroupItems.forEach((item) => {
      sum += item.installmentCost ?? 0;
    });
    return sum;
  }

  totalFasciaSum(group: Groups){
    let sum = 0;
    group.GroupItems.forEach((item) => {
      sum += item.fasciaCost ?? 0;
    });
    return sum;
  }

  getGroupNames() {
    this.queriesArray[this.currentTab].list.forEach((element, index) => {
      if (index === 0) { this.groupName = element.Group; }
      if (!this.groupNames.includes(element.Group)) {
        this.groupNames.push(element.Group); 
      }
    }); 
  }

  // use this to change a number (preferably  llar cents),
  //this will allow the value to be decorated with commas, making the numbers easier to read
  numericCommas(x: number | string) {
    let str;
    if (typeof x !== 'string') str = x.toString();
    else str = x;

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
  getCleanPrice(group: Groups) {
    let value = this.totalPriceSum(group);
    let closestValue = value %50;
    let cleanValue = 0.0;
    if (closestValue > 25) {
      cleanValue = value + (50 - closestValue);

    } else {
      cleanValue = value - closestValue;
    }
    if (group.GroupAlterations.openRollPrice) return group.GroupAlterations.openRollPrice;
    return cleanValue;
  }

  groupTypeChange(groupIndex: number, event: any) {
   let value = event.target.value;
   let list = this.queriesArray[this.currentTab].list;
   
   let idArray = list[groupIndex].GroupItems.map(x => x.id);
   let polishedItems = this.queriesArray[this.currentTab].list[groupIndex].GroupItems.map((item) => {

      if (idArray.includes(item.id)) {
        item.groupType = value;
        return this.updatePricing({
          groupType: value,
          groupName: item.groupName,
          width: item.width,
          height: item.height,
          roomLabel: item.roomLabel,
          quantity: item.quantity,
          discount: item.discount,
          discount2: item.discount2,
        } as query, null);
      }
      return item;
    });
    if (polishedItems) this.queriesArray[this.currentTab].list[groupIndex].GroupItems = polishedItems;
    this.uploadToStorage() // check if you can add to LocalStorage
    
  }

  queriesArraySum() { return this.queriesArray[this.currentTab].list.length }

  nextPage() {
    this.currentPagination++;
    if (this.currentPagination >= this.numOfPages) this.currentPagination = 0;
  }

  lastPage() {
    this.currentPagination--;
    if (this.currentPagination < 0) this.currentPagination = this.numOfPages-1;
  }

  itemIsAvailable(value: any) {
    let items = value ?? '{}';
    let data;
    
    if (items.type == 'csv') {
      console.log("CSV FILE FOUND: loading data")
      setTimeout(() => {
        data = items.data;
        data.shift();
        let itemsArray: Groups[] = data.map((x: any, i: number) => {
          console.log("=> seperating values")
          return {
            Group: x.groupName,
            GroupItems: [{
              id: Date.now() + "_" + i,
              roomLabel: x.roomLabel,
              groupType: x.groupType,
              groupName: x.groupName,
              width: x.width,
              height: x.height,
              quantity: x.quantity,
              discount: 50,
              discount2: 50,
            }],
            Material: "",
            Color: "",
            GroupAlterations: {
              openRollPrice: undefined,
              profit: undefined,
            }
          } as Groups;
        })
        console.log("=> data loaded: " + itemsArray.length + " items available")
        itemsArray.forEach((item,i) => {
          console.log("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=> adding to array", i)
          let itemIndex = this.queriesArray[this.currentTab].list.findIndex((x) => x.Group == item.Group);
          
          if (itemIndex == -1) this.queriesArray[this.currentTab].list.push(item);
          else this.queriesArray[this.currentTab].list[itemIndex].GroupItems.push(...item.GroupItems);
        }) 
        console.log("=> determine shortened list")
        this.determineShortenedList(this.currentTab, undefined, true);
        console.log("=> push to local storage")
        this.uploadToStorage()
        console.log("=> complete!")
        // location.reload();

      }, 1000);
    }
  }

  exportItems() {
    let extras = this.queriesArray[this.currentTab].list.map(x => {
      return {
        modelName: x.Group,
        material: x.Material,
        color: x.Color,
        reverseRollPrice: this.getCleanPrice(x),
        withFasciaPrice: this.totalFasciaSum(x),
        fasciaWithMotorPrice: this.totalMotorPriceSum(x),
      }
    });

    this.router.navigate(['/export'], {
      state: {
        extras: extras,
      }
    } );
  }

  updateGroupData(group: Groups, event: any) {
    let groupIndex = this.queriesArray[this.currentTab].list.findIndex((x) => x.Group == group.Group);
    if (groupIndex == -1) return;
    if (event.target.name == "color") this.queriesArray[this.currentTab].list[groupIndex].Color = event.target.value;
    if (event.target.name == "material") this.queriesArray[this.currentTab].list[groupIndex].Material = event.target.value;
    this.uploadToStorage()

  }
}