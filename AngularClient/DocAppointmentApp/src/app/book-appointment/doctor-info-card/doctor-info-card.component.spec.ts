import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorInfoCardComponent } from './doctor-info-card.component';

describe('DoctorInfoCardComponent', () => {
  let component: DoctorInfoCardComponent;
  let fixture: ComponentFixture<DoctorInfoCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorInfoCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorInfoCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
