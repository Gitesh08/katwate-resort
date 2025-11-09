import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestTableComponent } from './guest-table.component';

describe('GuestTableComponent', () => {
  let component: GuestTableComponent;
  let fixture: ComponentFixture<GuestTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GuestTableComponent]
    });
    fixture = TestBed.createComponent(GuestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
