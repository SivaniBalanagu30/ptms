import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectClientAddComponent } from './project-client-add.component';

describe('ProjectClientAddComponent', () => {
  let component: ProjectClientAddComponent;
  let fixture: ComponentFixture<ProjectClientAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectClientAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectClientAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
