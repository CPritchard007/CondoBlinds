import { HttpClient, HttpRequest } from '@angular/common/http';
import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { GoogleApiService } from 'ng-gapi';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'file-export',
  templateUrl: './file-export.component.html',
  styleUrls: ['./file-export.component.scss']
})
export class FileExportComponent implements OnInit {
  url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTCuAtFap_hfM8npKHth7qM7ogYz2MuuRUes0O_fT6cKxgLLXv_DXIeJpDuHyt_jIe7d6K1uOKpb4BB/pub?output=json'
  constructor(public http: HttpClient) {
    
  }


  ngOnInit(): void {
    
  }


}
