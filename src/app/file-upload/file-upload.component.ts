import { Component, OnInit } from '@angular/core';



interface FileItem {
  "Group Id": number,
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
                "Group Id": parseInt(row[0]),
                "Group Name": row[1],
                "Group Type": row[2],
                "Name": row[3],
                "quantity": parseInt(row[4]),
                "Width": parseInt(row[5]),
                "Height": parseInt(row[6]),
              }
              this.dataJson.push(json);
            }
          }
        }
      }
      console.log(this.dataJson);
    }
  }
}
