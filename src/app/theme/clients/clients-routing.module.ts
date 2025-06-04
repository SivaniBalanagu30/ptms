import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { AddClientComponent } from './add-client/add-client.component';
import { ClientViewComponent } from './client-view/client-view.component';
import { ProjectClientAddComponent } from './project-client-add/project-client-add.component';
import { ProjectViewComponent } from '../projects/project-view/project-view.component';

const routes: Routes = [{path:'',component:ClientsListComponent},
{path:'add-client',component:AddClientComponent},
{path:'client-view/:id',component:ClientViewComponent},
{path:'client-view/:id/:view',component:ClientViewComponent},{path:'client-view/:id/:edit',component:ClientViewComponent},
{path:'clientProject-add/:id',component:ProjectClientAddComponent},{path:'project-view/:id/:view',component:ProjectViewComponent},{path:'project-view/:id/:id1/:edit',component:ProjectViewComponent}
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule { }
