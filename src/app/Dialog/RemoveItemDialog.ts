import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

interface DialogData {
    animal: string;
    name: string;
}

@Component({
    selector: "app-remove-item-dialog",
    templateUrl: "./RemoveItemDialog.html",
})
export class RemoveItemDialog{
    
}