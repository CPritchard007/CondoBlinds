import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";


@Component({
    templateUrl: "./EditCalculationDialog.html",
    styleUrls: ["./EditCalculationDialog.scss"]
})
export class EditCalculationDialog {

    constructor(@Inject(MAT_DIALOG_DATA) public data: {profit?: number, openRollPrice?: number }) {

    }

}