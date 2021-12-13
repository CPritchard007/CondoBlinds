import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'refresh-storage',
  templateUrl: './refresh-storage.component.html',
  styleUrls: ['./refresh-storage.component.scss']
})
export class RefreshStorageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  refreshStorage() {
    localStorage.setItem('queries', '')
    location.reload()
  }
}
