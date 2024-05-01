import { TestBed } from '@angular/core/testing';

import { AppointmentManagementService } from './appointments-management.service';

describe('AppointmentManagementService', () => {
  let service: AppointmentManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppointmentManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
