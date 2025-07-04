import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Income } from './income';

describe('Income', () => {
  let component: Income;
  let fixture: ComponentFixture<Income>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Income]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Income);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
