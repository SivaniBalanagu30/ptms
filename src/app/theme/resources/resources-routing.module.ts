import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResourceListComponent } from './resource-list/resource-list.component';
import { AddResourceComponent } from './add-resource/add-resource.component';
import { ResourceViewComponent } from './resource-view/resource-view.component';
import { ContractorViewComponent } from '../contractors/contractor-view/contractor-view.component';

const routes: Routes = [{path:'',component:ResourceListComponent},
{ path: 'add-resource', component: AddResourceComponent },
{ path: 'view-resource/:id/:view', component: ResourceViewComponent },{ path: 'view-resource/:id/:edit', component: ResourceViewComponent }, {path:'vendors-list/view-vendor', component:ContractorViewComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResourcesRoutingModule { }
