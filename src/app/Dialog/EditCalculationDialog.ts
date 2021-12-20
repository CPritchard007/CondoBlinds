import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface DialogData {
    animal: string;
    name: string;
}

interface MaterialGroup {
    tag: string;
    name: string;
}

@Component({
    templateUrl: "./EditCalculationDialog.html",
    styleUrls: ["./EditCalculationDialog.scss"]
    
})
export class EditCalculationDialog {

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

    constructor(@Inject(MAT_DIALOG_DATA) public data: {profit: number, openRollPrice: number}) {

    }

}