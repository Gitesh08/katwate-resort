import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NearbyAttractionsComponent } from './nearby-attractions.component';

describe('NearbyAttractionsComponent', () => {
  let component: NearbyAttractionsComponent;
  let fixture: ComponentFixture<NearbyAttractionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NearbyAttractionsComponent]
    });
    fixture = TestBed.createComponent(NearbyAttractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
