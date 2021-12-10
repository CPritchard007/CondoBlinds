import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: "app-edit-item-dialog",
    templateUrl: "./EditItemDialog.html",
})
export class EditItemDialog {
    
}