import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-bar',
  templateUrl: './help-bar.component.html',
  styleUrls: ['./help-bar.component.scss']
})
export class HelpBarComponent implements OnInit {
  helpBarIsActive = false;
  
  constructor() { }

  ngOnInit(): void {
  }

  activateHelpBar(event: any) {
    event.preventDefault();
    this.helpBarIsActive = true;
    console.log('help bar is active');
  }

  deactivateHelpBar(event: any) {
    event.preventDefault();
    this.helpBarIsActive = false;
    console.log('help bar is inactive');
  }

  toggleHelpBar(event: any) {
    event.preventDefault();
    this.helpBarIsActive = !this.helpBarIsActive;
    console.log('help bar is toggled');
  }
}
