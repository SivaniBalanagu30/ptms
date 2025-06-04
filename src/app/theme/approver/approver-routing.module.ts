import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApproversListComponent } from './approvers-list/approvers-list.component';
import { AdminListComponent } from './admin-list/admin-list.component';

const routes: Routes = [
  {path:'admin',component:AdminListComponent},
  {path:'approver',component:ApproversListComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApproverRoutingModule { }
