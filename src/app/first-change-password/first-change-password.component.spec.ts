import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstChangePasswordComponent } from './first-change-password.component';

describe('FirstChangePasswordComponent', () => {
  let component: FirstChangePasswordComponent;
  let fixture: ComponentFixture<FirstChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FirstChangePasswordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
