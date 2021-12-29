import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

interface TableItems {
  modelName: string,
  material: string,
  color: string,
  reverseRollPrice: number,
  withFasciaPrice: number,
  fasciaWithMotorPrice: number,
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  currentTable: TableItems[] = [];
  url: any;
  hidden: boolean = false;

  
  @ViewChild('editImage') imageRef!: ElementRef; 
  
  constructor(private route: Router, private renderer: Renderer2) {
    
    if (this.route.getCurrentNavigation() && this.route.getCurrentNavigation()!.extras.state)
    this.currentTable = this.route.getCurrentNavigation()!.extras.state!['extras'];
    else this.route.navigate(['/']);
  }

  ngOnInit(): void {
    
  }

  onAddNewImage(event: any) {
    console.log(event);
    if (!event.target.files[0] || event.target.files.length == 0) return;
    let filetype = event.target.files[0].type;
    if (filetype.match(/image\/*/) == null) return;
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (e: any) => {
      this.url = e.target.result;
      
      let element = this.imageRef.nativeElement;
      element.style.backgroundImage = `url(${this.url})`;
      this.hidden = !this.hidden;

    };

  }
}
