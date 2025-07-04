import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Goals } from './goals';

describe('Goals', () => {
  let component: Goals;
  let fixture: ComponentFixture<Goals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Goals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Goals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
