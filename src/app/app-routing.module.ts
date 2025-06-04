import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DefaultComponent } from './layout/default/default.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { AllPermissionGuard } from './guard/admin.guard';
import { FirstChangePasswordComponent } from './first-change-password/first-change-password.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: "resetPassword", component: ForgotPasswordComponent },
  { path: "firstChangePassword", component: FirstChangePasswordComponent },
  {
    path: '',
    component: DefaultComponent,
    children: [

      {
        path: 'dashboard',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/dashboard/dashboard.module')
          .then(user => user.DashboardModule),
        data: {
          role: ['Admin', 'Resource', 'Approver']
        }
      },
      {
        path: 'resources-list',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/resources/resources.module')
          .then(user => user.ResourcesModule),
        data: {
          role: ['Admin']
        }
      },
      {
        path: 'vendors-list',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/contractors/contractors.module')
          .then(user => user.ContractorsModule),
        data: {
          role: ['Admin']
        }
      },
      {
        path: 'clients-list',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/clients/clients.module')
          .then(user => user.ClientsModule),
        data: {
          role: ['Admin']
        }
      },
      {
        path: 'project-list',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/projects/projects.module')
          .then(user => user.ProjectsModule),
        data: {
          role: ['Admin','Resource','Approver']
        }
      },
      {
        path: 'approvers-list',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/approver/approver.module')
          .then(user => user.ApproverModule),
        data: {
          role: ['Admin', 'Approver']
        }
      },
      {
        path: 'myTimeSheet',
        canActivate: [AllPermissionGuard],
        loadChildren: () => import('./theme/timesheet/timesheet.module')
          .then(user => user.TimesheetModule),
        data: {
          role: ['Admin', 'Resource', 'Approver']
        }
      },
      { path: 'profile', component: ProfileComponent },

    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
