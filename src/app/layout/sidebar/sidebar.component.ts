import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  role;
  roleStatus: Boolean;
  menuList = [{
    name: 'Dashboard',
    path: 'dashboard',
    icon: 'fa fa-home'
  }, {
    name: 'Resources',
    path: 'resources-list',
    icon: 'fa-solid fa-user-tie'
  },
  {
    name: 'Vendors',
    path: 'vendors-list',
    icon: 'fa-sharp fa-solid fa-handshake'
  }, {
    name: 'Clients',
    path: 'clients-list',
    icon: 'fa-solid fa-users'
  },
  {
    name: 'Projects',
    path: 'project-list',
    icon: 'fa-solid fa-diagram-project'
  },
  {
    name: 'Time Approver',
    path: 'approvers-list/admin',
    icon: 'fa-solid fa-clock'
  },
  {
    name: 'Admin Approvals',
    path: 'approvers-list/approver',
    icon: 'fa-solid fa-user-tie'
  },
  {
    name: 'Timesheets',
    path: 'myTimeSheet',
    icon: 'fa fa-file-text-o'
  },
  ]
  menuListForAdmin = [{
    name: 'Dashboard',
    path: 'dashboard',
    icon: 'fa fa-home'
  }, {
    name: 'Resources',
    path: 'resources-list',
    icon: 'fa-solid fa-user-tie'
  },
  {
    name: 'Vendors',
    path: 'vendors-list',
    icon: 'fa-sharp fa-solid fa-handshake'
  }, {
    name: 'Clients',
    path: 'clients-list',
    icon: 'fa-solid fa-users'
  },
  {
    name: 'Projects',
    path: 'project-list',
    icon: 'fa-solid fa-diagram-project'
  },
  {
    name: 'Admin Approvals',
    path: 'approvers-list/approver',
    icon: 'fa-solid fa-user-tie'
  },
  {
    name: 'Timesheets',
    path: 'myTimeSheet',
    icon: 'fa fa-file-text-o'
  },
  ]

  menuListforResources = [{
    name: 'Dashboard',
    path: 'dashboard',
    icon: 'fa fa-home'
  },
  {
    name: 'Projects',
    path: 'project-list',
    icon: 'fa-solid fa-diagram-project'
  }, {
    name: 'Timesheets',
    path: 'myTimeSheet',
    icon: 'fa fa-file-text-o'
  },

  ]
  menuListforApprovers = [{
    name: 'Dashboard',
    path: 'dashboard',
    icon: 'fa fa-home'
  },
  {
    name: 'Projects',
    path: 'project-list',
    icon: 'fa-solid fa-diagram-project'
  }, {
    name: 'Time Approver',
    path: 'approvers-list/admin',
    icon: 'fa-solid fa-users'
  },
  {
    name: 'Timesheets',
    path: 'myTimeSheet',
    icon: 'fa fa-file-text-o'
  },

  ]
  constructor(private router: Router) { }

  ngOnInit(): void {

    this.role = localStorage.getItem('role');
    let timeApprover = localStorage.getItem('timeApprover');
    if (this.role == 'Admin' && timeApprover === 'true') {
      this.roleStatus = true;
    } else {
      this.roleStatus = false;
    }

  }
  isActive(path: string): boolean {
    return this.router.url === '/' + path;
  }

}
