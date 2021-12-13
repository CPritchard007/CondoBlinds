import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpBarComponent } from './help-bar.component';

describe('HelpBarComponent', () => {
  let component: HelpBarComponent;
  let fixture: ComponentFixture<HelpBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
