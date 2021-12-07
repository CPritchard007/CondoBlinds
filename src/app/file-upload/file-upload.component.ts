import { Component, OnInit, Output, EventEmitter } from '@angular/core';

interface FileItem {
  groupName: string;
  groupType: string;
  roomLabel: string;
  quantity: number;
  width: number;
  height: number;
}

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  @Output() onFinalData = new EventEmitter<FileItem[]>();
  @Output() fileSize = new EventEmitter<number>();

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
                groupName: row[0],
                groupType: row[1],
                roomLabel: row[2],
                quantity: parseInt(row[3]),
                width: parseInt(row[4]),
                height: parseInt(row[5]),
              }
              this.dataJson.push(json);
            }
          }
        }
      }
      this.onFinalData.emit(this.dataJson);
      this.fileSize.emit(this.dataJson.length);

    }
  }
}
