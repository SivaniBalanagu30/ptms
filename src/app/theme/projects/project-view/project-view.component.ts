import { HttpService } from 'src/app/services/http-service/http.service';
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { DatePipe } from '@angular/common';
import { ColumnApi, GridReadyEvent } from 'ag-grid-community';
import { ChangeDetectorRef, Component, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { CustomDatePipe } from 'src/app/shared/datePipe/custom-date.pipe';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';
@Component({
  selector: 'app-project-view',
  templateUrl: './project-view.component.html',
  styleUrls: ['./project-view.component.css']
})
export class ProjectViewComponent implements OnInit {
  projectId;
  projectDetails;
  navigatePathOnBackClick:string = "";
  rowData = [];
  private gridApi: any;
  resourcesColumnDefs: any;
  milestonesColumnDefs: any;
  milestoneForm: FormGroup;
  resouceForm: FormGroup;
  showSaveButton:Boolean = false;
  @ViewChild('projectData') projectModal;
  @ViewChild('milestonesData') milestonesModal;
  @ViewChild('resourceData') resourceModal;

  milestoneStartDate = new Date();
  milestoneEndDate = new Date();
  projectForm: FormGroup;
  allResources;
  selectResource:string = ""
  resourceName;
  resourceID;
  resourceEmail: any;
  resourceNumber: any;
  milistoneType;
  resourceType: any;
  allManagers = [];
  public gridColumnApi: ColumnApi;
  @Output() gridReadyEvent: EventEmitter<GridReadyEvent> = new EventEmitter<GridReadyEvent>();
  projectMode: string;

  constructor(private inactivityService: PageReloadService,private toast: ToastService, private httpservice: HttpService, private fb: FormBuilder,
    private notification: NotificationService, private readonly piper: DatePipe,
    private router: Router, private route: ActivatedRoute, private customDatePipe: CustomDatePipe) {

    this.projectForm = this.fb.group({
      id: [''],
      clientName: [''],
      projectName: ['', Validators.required],
      projectManager: ['', Validators.required],
      timeApprover: ['',Validators.required],
      executed: ['',Validators.required],
      startDate: ['',Validators.required],
      endDate: ['',Validators.required],
      status:['',Validators.required],
      projectId:[""],
    });
    this.milestoneForm = this.fb.group({
      id: null,
      milestoneName: ['', Validators.required],
      startDate: ['',Validators.required],
      endDate: ['',Validators.required],
      estimatedHours: ['',Validators.required]
    });
    this.resouceForm = this.fb.group({
      workHours: ['',Validators.required],
      projectStatus:[''],
      projectAssignedDate:[null, Validators.required]
    })
  }

  onGridReady(event: GridReadyEvent): void {
    this.gridReadyEvent.emit(event);
    this.gridApi = event.api;
    this.gridColumnApi = event.columnApi;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setDomLayout('autoHeight');
    window.onresize = () => {
      this.gridApi.sizeColumnsToFit();
  }
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }

  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.route.params.subscribe(params => {
      this.projectId = params['id'];
    });
    const currentUrl = this.router.url;
    const urlSegments = currentUrl.split('/');
    this.projectMode = urlSegments[4];
    if(urlSegments[1] == 'clients-list'){
      this.navigatePathOnBackClick = `clients-list/client-view/${urlSegments[4]}/edit`
    }else{
      this.navigatePathOnBackClick = urlSegments[1];
    }
    this.getProjectDetails();
    this.getResources();
    this.getAllManagers();

    this.milestonesColumnDefs = [
      { headerName: 'Milestone Name', field: 'milestone_name', tooltipField:'milestone_name', sortable: true, suppressSizeToFit: true, width: 200 },
      {
        headerName: 'Start Date',
        field: 'start_date',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        valueGetter: (params) => {
          const startandEndDate = params.data?.start_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const startandEndDate = params.data?.start_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        } 
      },
      {
        headerName: 'End Date',
        field: 'end_date',
        sortable: true,
        suppressSizeToFit: true,
        width: 150,
        valueGetter: (params) => {
          const startandEndDate = params.data?.end_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        },
        tooltipValueGetter:(params:any)=>{
          const startandEndDate = params.data?.end_date;
          if (startandEndDate) {
            const formattedStartDate = this.customDatePipe.transform(startandEndDate);
            return `${formattedStartDate}`;
          }
          return '';
        } 
      },
      { headerName: 'Estimated hours', field: 'estimated_hours', tooltipField:'estimated_hours', sortable: true, suppressSizeToFit: true, width: 220 },
      {
        headerName: 'Actions',
        field: '',
        sortable: true,
        suppressSizeToFit: true,
        width: 100,
        cellRenderer: (params: any) => {
          return "<i data-toggle='tooltip' data-placement='top' title='Edit milestone' style='cursor: pointer; font-size: 17px;'' class='edit fas fa-file-pen'></i>";
          // return '<i class="fa fa-pencil-square-o" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="Edit Project Milestone"></i>'
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          if (iconName.includes('edit')) {
            let milestoneData = params.data
            this.showMilestoneModal(milestoneData, 'edit')

          }
        }
      }
    ]

    this.resourcesColumnDefs = [
      { headerName: 'First Name', field: 'resource.first_name', tooltipField:'resource.first_name', sortable: true, suppressSizeToFit: true, width: 130 },
      { headerName: 'Last Name', field: 'resource.last_name', tooltipField:'resource.last_name', sortable: true, suppressSizeToFit: true, width: 110 },
      { headerName: 'Resource ID', field: 'resource.resource_number', tooltipField:'resource.resource_number', sortable: true, suppressSizeToFit: true, width: 110 },
      { headerName: 'Email', field: 'resource.email_id', sortable: true, tooltipField:'resource.email_id', suppressSizeToFit: true, width: 170 },
      { headerName: 'Project Assigned Date', field: 'start_date', sortable: true, suppressSizeToFit: true, width: 170,valueGetter: (params) => {
        const projectAssignedDate = params.data?.start_date;
        if (projectAssignedDate) {
          const formattedprojectAssignedDate = this.customDatePipe.transform(projectAssignedDate);
          return `${formattedprojectAssignedDate}`;
        }
        return '';
      },
      tooltipValueGetter:(params:any)=>{
        const projectAssignedDate = params.data?.start_date;
        if (projectAssignedDate) {
          const formattedprojectAssignedDate = this.customDatePipe.transform(projectAssignedDate);
          return `${formattedprojectAssignedDate}`;
        }
        return '';
      } 
    },
      { headerName: 'Work Hours Limit', field: 'work_hour_limit', tooltipField:'work_hour_limit', sortable: true, suppressSizeToFit: true, width: 140 },
      { headerName: 'Resource Status', field: 'resource.status', tooltipField:'resource.status', sortable: true, suppressSizeToFit: true, width: 120, cellRenderer:(params)=>{
        const status = params.value;
        const cellValue = status === 'Active' ? '<span style="color: #3F51B5;">Active</span>' : '<span style="color: red;">Inactive</span>';
        return cellValue;
      }   },
      { headerName: 'Project Status', field: 'status', tooltipField:'status', sortable: true, suppressSizeToFit: true, width: 120, cellRenderer:(params)=>{
        const status = params.value;
        const cellValue = status === 'Assigned' ? '<span style="color:green;">Assigned</span>' : '<span style="color: red;">Unassigned</span>';
        return cellValue;
      }  },

      {
        headerName: 'Actions',
        field: 'status',
        sortable: true,
        suppressSizeToFit: true,
        width: 80,
        cellRenderer: (params: any) => {
          // return '<i class="fa fa-pencil-square-o" style="cursor: pointer; margin-right: 5px;" data-toggle="tooltip" data-placement="top" title="Edit Resource Details"></i>'
          return "<i data-toggle='tooltip' data-placement='top' title='Edit resource' style='cursor: pointer; font-size: 17px;'' class='edit fas fa-file-pen'></i>";
        },
        onCellClicked: (params: any) => {
          const iconName = params.event.target.className;
          if (iconName.includes('edit')) {
            let resourceData = params.data
            this.showResourceModal(resourceData, 'edit')
          }
        }
      }

    ]

  }
  getResources() {
    this.httpservice.doGet(StaticDataEntity.getResourcesForProject.replace(/{id}/g, this.projectId)).subscribe((result: any) => {
      this.allResources = result;
    })
  }

  getAllManagers(){
    this.httpservice.doGet("allManagers").subscribe((data)=>{
      this.allManagers = data;
    })
  }
  getProjectDetails() {
    this.httpservice.doGet(StaticDataEntity.getProjectsByID.replace(/{id}/g, this.projectId)).subscribe((result) => {
      this.projectDetails = result;
    })
  }

 

  showModal(projectData) {
    this.projectModal.show();
    this.projectForm.patchValue({
      id: projectData.project_details?.id,
      projectName: projectData.project_details?.project_name,
      projectManager: projectData.project_details?.project_manager_id,
      timeApprover: projectData.project_details?.time_approver_id,
      executed: projectData.project_details?.task_order_executed,
      startDate: this.piper.transform(projectData.project_details?.start_date, "MM-dd-yyyy"),
      endDate: this.piper.transform(projectData.project_details?.end_date,"MM-dd-yyyy"),
      status: projectData.project_details?.status,
      projectId:projectData.project_details?.project_id,
    })
  }
  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
    } else {
      event.preventDefault();
    }
  }
  hideModal() {
    this.projectModal.hide()
  }
  showMilestoneModal(milestoneDeatils, type) {
    this.milistoneType= type;
    if (type === 'edit') {
      this.milestonesModal.show()
      this.milestoneStartDate = new Date(milestoneDeatils.start_date);
      this.milestoneEndDate = new Date(milestoneDeatils.end_date);
      this.milestoneForm.patchValue({
        id: milestoneDeatils.id,
        milestoneName: milestoneDeatils.milestone_name,
        startDate: milestoneDeatils.start_date,
        endDate: milestoneDeatils.end_date,
        estimatedHours: milestoneDeatils.estimated_hours
      })
    } else {
      // this.milestoneForm.reset();
      this.milestonesModal.show();
    }
  }
  hideMilestoneModal() {
    this.milestoneForm.reset();
    this.milestonesModal.hide()
  }
  updateProject() {
    if(this.projectForm.valid){
      let form = this.projectForm.value;
    let payload = {
      "id": form.id,
      "project_name": form.projectName,
      "task_order_executed": form.executed,
      "start_date": this.piper.transform(form.startDate, "yyyy-MM-dd"),
      "end_date": this.piper.transform(form.endDate, "yyyy-MM-dd"),
      "project_manager_id": form.projectManager,
      "time_approver_id": form.timeApprover,
      "status": form.status,
      'project_id':form.projectId
    }
    this.httpservice.doUpdate(StaticDataEntity.updateProject, payload).subscribe((result) => {
      if (result.message) {
        // this.notification.showSucessNotification('', result.message);
        this.toast.showSuccess("success", "Success", result.message);
        this.hideModal();
        this.getProjectDetails();
      };
      if(result.errorMessage){
        // this.notification.showErrorNotification("Error",result.errorMessage);
        this.toast.showError("error", "Error", result.errorMessage);
      }
    },(error) => {
      if (error.status === 400) {
        // this.notification.showWarningNotification("Error", error.error.detail);
        this.toast.showWarning("warn", "Warning", error.error.detail);
      }
    });
    }else{
      validateAllFormFields(this.projectForm);
    }
  }
  addMilestone() {
    if(this.milestoneForm.valid){
      let form = this.milestoneForm.value;
    let payload = {
      "project_id": this.projectId,
      "milestone_name": form.milestoneName,
      "estimated_hours": form.estimatedHours,
      "start_date":  this.piper.transform(form.startDate, 'yyyy-MM-dd'),
      "end_date":  this.piper.transform(form.endDate, 'yyyy-MM-dd'),
    }
    this.httpservice.doPost(StaticDataEntity.addMilestone, payload).subscribe((result) => {
      if (result.message) {
        // this.notification.showSucessNotification('', result.message);
        this.toast.showSuccess("success", "Success", result.message);
        this.hideMilestoneModal();
        this.getProjectDetails();
        this.milestoneForm.reset();
      };
      if(result.errorMessage){
        // this.notification.showErrorNotification("Error",result.errorMessage);
        this.toast.showError("error", "Error", result.errorMessage);
      }
    })
    }else{
      validateAllFormFields(this.milestoneForm);
    }

  }

  updateMilestone() {
    if(this.milestoneForm.valid){
      let form = this.milestoneForm.value;
      let payload = {
        "id": form.id,
        "milestone_name": form.milestoneName,
        "start_date": this.piper.transform(form.startDate, 'yyyy-MM-dd'),
        "end_date": this.piper.transform(form.endDate, 'yyyy-MM-dd'),
        "estimated_hours": form.estimatedHours,
        "status": 'Active'
  
      }
      this.httpservice.doUpdate(StaticDataEntity.updateMilestone, payload).subscribe((result) => {
        if (result.message) {
          // this.notification.showSucessNotification('', result.message);
          this.toast.showSuccess("success", "Success", result.message);
          this.hideMilestoneModal();
          this.getProjectDetails();
  
        };
        if(result.errorMessage){
          // this.notification.showErrorNotification("Error",result.errorMessage);
          this.toast.showError("error", "Error", result.errorMessage);
        }
      })
    }else{
      validateAllFormFields(this.milestoneForm);
    }

  }
  showResourceModal(data, type) {
    this.resourceType = type;
    if(type === 'add'){
      this.resourceModal.show();
    }else{
      this.resourceModal.show();
      this.resouceForm.patchValue({
        workHours: data.work_hour_limit,
        projectStatus: data.status,
        projectAssignedDate:new Date(data.start_date)
      })
      this.resourceName = data.resource.first_name + ' ' + data.resource.last_name;
      this.resourceID = data.resource.id;
      this.resourceEmail = data.resource.email_id;
      this.resourceNumber = data.resource.resource_number;
    }
  }
  hideResourceModal() {
    this.selectResource = "";
    this.resouceForm.markAsUntouched();
    this.resourceModal.hide();
    this.resouceForm.patchValue({
      workHours: '',
      projectStatus: ''
    });

  }

  saveResource() {
    if(this.resouceForm.valid){
      let payload = {
        "project_id": this.projectId,
        "resource_id": this.resourceID,
        "work_hour_limit": this.resouceForm.get('workHours').value,
        "status": this.resouceForm.get('projectStatus').value,
        "start_date":this.piper.transform(this.resouceForm.get('projectAssignedDate').value,"yyyy-MM-dd"),
      }
      this.httpservice.doPost(StaticDataEntity.assignResource, payload).subscribe((result) => {
        if (result.message) {
          // this.notification.showSucessNotification('', result.message);
          this.toast.showSuccess("success", "Success", result.message);
          this.hideResourceModal();
          this.getProjectDetails();
          this.getResources();
        };
        if(result.errorMessage){
          // this.notification.showErrorNotification("Error",result.errorMessage);
          this.toast.showError("error", "Error", result.errorMessage);
        }
      })
    }else{
      validateAllFormFields(this.resouceForm);
    }
    
  }

  updateResource(){
    if(this.resouceForm.valid){
      let payload = {
        "project_id": this.projectId,
        "resource_id": this.resourceID,
        "work_hour_limit": this.resouceForm.get('workHours').value,
        "status": this.resouceForm.get('projectStatus').value,
        "start_date": this.piper.transform(this.resouceForm.get('projectAssignedDate').value, 'yyyy-MM-dd'),
      }
      this.httpservice.doUpdate(StaticDataEntity.updateProjectResource, payload).subscribe((result) => {
        if (result.message) {
          // this.notification.showSucessNotification('', result.message);
          this.toast.showSuccess("success", "Success", result.message);
          this.hideResourceModal();
          this.getProjectDetails();
        };
        if(result.errorMessage){
          // this.notification.showErrorNotification("Error",result.errorMessage);
          this.toast.showError("error", "Error", result.errorMessage);
        }
      })
    }else{
      validateAllFormFields(this.resouceForm);
    }
  }
  changeResource(event: any) {
    this.showResourceModal('','add');
    this.resourceType === 'add' ;
    const selectedResourceId = event.target.value;
    const selectedResource = this.allResources.find(resource => resource.id === selectedResourceId);

    if (selectedResource) {
      const resourceName = selectedResource.first_name + ' ' + selectedResource.last_name;
      const resourceId = selectedResource.id;
      const resourceEmail = selectedResource.email_id;
      const resourceNumber = selectedResource.resource_number;

      this.resourceName = resourceName;
      this.resourceID = resourceId;
      this.resourceEmail = resourceEmail;
      this.resourceNumber = resourceNumber;

    }
  }
  minEndDate(date){
    if (!isBlank(date)) {
      return new Date(date);
    } else {
      return null;
    }
  }

}










