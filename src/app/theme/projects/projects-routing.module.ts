import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectListComponent } from './project-list/project-list.component';
import { AddProjectComponent } from './add-project/add-project.component';
import { ProjectViewComponent } from './project-view/project-view.component';
import { MyProjectsComponent } from './my-projects/my-projects.component';

const routes: Routes = [{path:'',component:ProjectListComponent},
{path:'add-project',component:AddProjectComponent},
{path:'project-view/:id/:view',component:ProjectViewComponent},
{path:'project-view/:id/:edit',component:ProjectViewComponent},
{path:'my-projects',component:MyProjectsComponent},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
