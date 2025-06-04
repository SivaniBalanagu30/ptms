import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproversListComponent } from './approvers-list.component';

describe('ApproversListComponent', () => {
  let component: ApproversListComponent;
  let fixture: ComponentFixture<ApproversListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproversListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproversListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
