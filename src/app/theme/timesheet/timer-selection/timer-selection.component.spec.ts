import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimerSelectionComponent } from './timer-selection.component';

describe('TimerSelectionComponent', () => {
  let component: TimerSelectionComponent;
  let fixture: ComponentFixture<TimerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimerSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimerSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
