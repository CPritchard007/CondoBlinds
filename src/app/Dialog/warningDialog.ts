import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: "warning-dialog",
    templateUrl: "./WarningDialog.html",
})
export class WarningDialog {
    constructor(
        public dialogRef: MatDialogRef<WarningDialog>) { }
}