import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';


import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';

import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderBarComponent } from './header-bar/header-bar.component';
import { NumericCommasPipe } from './numeric-commas.pipe';
import { HelpBarComponent } from './buttons/help-bar/help-bar.component';
import { RemoveItemDialog } from './Dialog/RemoveItemDialog';
import { EditItemDialog } from './Dialog/EditItemDialog';
import { FileUploadComponent } from './buttons/file-upload/file-upload.component';
import { FileExportComponent } from './buttons/file-export/file-export.component';
import { RefreshStorageComponent } from './buttons/refresh-storage/refresh-storage.component';
import { NotesButtonComponent } from './buttons/notes/notes.component';

import { RouterModule } from '@angular/router';
import { NotesComponent } from './notes-component/notes-component.component';
import { ReturnToDashButtonComponent } from './buttons/return-to-dash-button/return-to-dash-button.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderBarComponent,
    NumericCommasPipe,
    HelpBarComponent,
    RemoveItemDialog,
    EditItemDialog,
    FileUploadComponent,
    FileExportComponent,
    RefreshStorageComponent,
    NotesComponent,
    NotesButtonComponent,
    ReturnToDashButtonComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatDialogModule,
    MatSidenavModule,
    MatSelectModule,
    MatPaginatorModule,
    DragDropModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    RouterModule.forRoot([
      { path: '', component: DashboardComponent },
      { path: 'notes', component: NotesComponent },
    ]),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
