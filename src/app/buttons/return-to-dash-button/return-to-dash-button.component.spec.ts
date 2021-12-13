import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnToDashButtonComponent } from './return-to-dash-button.component';

describe('ReturnToDashButtonComponent', () => {
  let component: ReturnToDashButtonComponent;
  let fixture: ComponentFixture<ReturnToDashButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReturnToDashButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReturnToDashButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
