import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorsListComponent } from './contractors-list.component';

describe('ContractorsListComponent', () => {
  let component: ContractorsListComponent;
  let fixture: ComponentFixture<ContractorsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractorsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
