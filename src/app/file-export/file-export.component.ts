import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'file-export',
  templateUrl: './file-export.component.html',
  styleUrls: ['./file-export.component.scss']
})
export class FileExportComponent implements OnInit {

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
  }

  download() {
    let content = JSON.stringify(localStorage.getItem('queries') ?? '[]');
    console.log(content);
    let blob = new Blob([content], {type: 'application/json'});
    console.log(blob.text());    
    let url = this.sanitizer.sanitize(SecurityContext.URL, this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(blob)));

    let button = document.createElement('a');
    if (url)
    button.href = url;
    button.download = 'data.json';
    button.click();
  }
}
