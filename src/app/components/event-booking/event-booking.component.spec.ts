import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBookingComponent } from './event-booking.component';

describe('EventBookingComponent', () => {
  let component: EventBookingComponent;
  let fixture: ComponentFixture<EventBookingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventBookingComponent]
    });
    fixture = TestBed.createComponent(EventBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
