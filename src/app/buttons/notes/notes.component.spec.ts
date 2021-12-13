import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesButtonComponent } from './notes.component';

describe('NotesComponent', () => {
  let component: NotesButtonComponent;
  let fixture: ComponentFixture<NotesButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
