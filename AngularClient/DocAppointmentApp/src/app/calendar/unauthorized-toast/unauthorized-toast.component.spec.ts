import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizedToastComponent } from './unauthorized-toast.component';

describe('UnauthorizedToastComponent', () => {
  let component: UnauthorizedToastComponent;
  let fixture: ComponentFixture<UnauthorizedToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnauthorizedToastComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizedToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
