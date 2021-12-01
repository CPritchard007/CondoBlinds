import { Component, OnInit } from '@angular/core';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  fileName: string = "";
  data: Object = {};
  dataJson: Object[] = [];
  constructor() { }

  ngOnInit(): void {
  }

  fileSelected(event: any) {
    let file: File = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      this.data = file;
      let lines: string[][] = [];
        
      let reader: FileReader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e: any) => {
        let csv: string = reader.result as string;
        if (csv.match(/[^\r\n]+/g) != null) {
          
        }
      }

      console.log(lines, "lines");
      for (let i = 0; lines.length > i; i++) {
        let line = lines[i];
        console.log("to json");
        this.dataJson.push({
          "Group Id": line[0],
          "Group Name": line[1],
          "Group Type": line[2],
          "Name": line[3],
          "quantity": line[4],
          "Width": line[5],
          "Height": line[6],
        })
      }

      console.log(this.dataJson);
    }
  }
}
