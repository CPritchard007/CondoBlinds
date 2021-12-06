import { Component, OnInit, Output, EventEmitter } from '@angular/core';

interface FileItem {
  "Group Name": string,
  "Group Type": string,
  "Name": string,
  "quantity": number,
  "Width": number,
  "Height": number,
}

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @Output() onFinalData = new EventEmitter<FileItem[]>();
  fileName: string = "";
  data: Object = {};
  dataJson: FileItem[] = [];
  
  constructor() { }

  ngOnInit(): void {
  }

  fileSelected(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.data = file;
        
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e: any) => {
        let csv: string = reader.result as string;
        let lineArray: string[] = csv.split(/\r\n|\n/);
        if (lineArray) {
          for (let line of lineArray) {
            if (line) {
              let row: string[] = line.split(',');
              
              let json: FileItem = {
                "Group Name": row[0],
                "Group Type": row[1],
                "Name": row[2],
                "quantity": parseInt(row[3]),
                "Width": parseInt(row[4]),
                "Height": parseInt(row[5]),
              }
              this.dataJson.push(json);
            }
          }
        }
      }
      console.log('HEY THERE',this.dataJson);
      this.onFinalData.emit(this.dataJson);
    }
  }
}
