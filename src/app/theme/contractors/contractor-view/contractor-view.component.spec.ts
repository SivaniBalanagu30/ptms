import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorViewComponent } from './contractor-view.component';

describe('ContractorViewComponent', () => {
  let component: ContractorViewComponent;
  let fixture: ComponentFixture<ContractorViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContractorViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
