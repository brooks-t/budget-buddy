import { TestBed } from '@angular/core/testing';

import { FinancialData } from './financial-data';

describe('FinancialData', () => {
  let service: FinancialData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
