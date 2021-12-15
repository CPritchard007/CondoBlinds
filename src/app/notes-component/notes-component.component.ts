import { Component, ElementRef, OnInit, Renderer2, ViewChildren } from '@angular/core';

interface Note {
  title: string;
  document: string;
  color: string;
}
@Component({
  selector: 'app-notes-component',
  templateUrl: './notes-component.component.html',
  styleUrls: ['./notes-component.component.scss']
})
export class NotesComponent implements OnInit {
  @ViewChildren('notes') noteElement!: Array<ElementRef>;

  notes:Note[] = []
  colors = [
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
  ];

  constructor( private renderer: Renderer2) {
    let notes = localStorage.getItem('notes');
    console.log(notes);
    if (notes) {
      this.notes = JSON.parse(notes);
    } else {
      this.notes = [
        {
          title: 'Note 1',
          document: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
          color: this.colors[Math.floor(Math.random() * this.colors.length)]
        }
      ];
    } 
  }

  ngOnInit(): void {
  }

  onUnfocus(event: any, index: number) {
    console.log(event);
    console.log(event.target);
    let notes = this.notes;

    if (event.target.localName === 'h2') {
      notes[index].title = "";
      notes[index].title = event.target.value;}
    if (event.target.localName === 'textarea') {
      notes[index].document = "";
      notes[index].document = event.target.value;}

    localStorage.setItem('notes', JSON.stringify(notes));
  }

  addNote() {
    this.notes.push({
      title: 'New Note',
      document: 'No Content',
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    });
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }

  deleteNote(index: number) {
    this.notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(this.notes));
  }
}
