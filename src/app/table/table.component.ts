import { Component, OnInit } from '@angular/core';
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
  constructor(private route: Router) {

    if (this.route.getCurrentNavigation() && this.route.getCurrentNavigation()!.extras.state)
    this.currentTable = this.route.getCurrentNavigation()!.extras.state!['extras'];
    else this.route.navigate(['/']);
  }

  ngOnInit(): void {

  }
}
