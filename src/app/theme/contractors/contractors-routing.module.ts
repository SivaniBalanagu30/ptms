import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractorsListComponent } from './contractors-list/contractors-list.component';
import { AddContractorComponent } from './add-contractor/add-contractor.component';
import { ContractorViewComponent } from './contractor-view/contractor-view.component';
import { ResourceViewComponent } from '../resources/resource-view/resource-view.component';
const routes: Routes = [{path:'',component:ContractorsListComponent},
{path:'add-vendor',component:AddContractorComponent},
{path:'view-vendor/:id/:view',component:ContractorViewComponent},{path:'view-vendor/:id/:edit',component:ContractorViewComponent},{ path: 'view-resource/:id/:view', component: ResourceViewComponent},{ path: 'view-resource/:id/:id1/:edit', component: ResourceViewComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContractorsRoutingModule { }
