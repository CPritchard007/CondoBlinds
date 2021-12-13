import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshStorageComponent } from './refresh-storage.component';

describe('RefreshStorageComponent', () => {
  let component: RefreshStorageComponent;
  let fixture: ComponentFixture<RefreshStorageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefreshStorageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefreshStorageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
