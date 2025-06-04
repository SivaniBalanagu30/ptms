import { Component, HostListener, OnInit } from '@angular/core';
import  {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { HttpService } from 'src/app/services/http-service/http.service';
import { StaticDataEntity } from 'src/app/shared/static-data';
import { Router } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DatePipe } from '@angular/common';
import { NotificationService } from 'src/app/services/notification-service/notification.service';
import { isBlank, validateAllFormFields } from 'src/app/shared/utils/utils';
import { ToastService } from 'src/app/services/toast.service';
import { PageReloadService } from 'src/app/services/auto-reload/page-reload.service';

export interface Resource{
  item_text:String,
  item_id:String
}
@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  addProjectForm:FormGroup;
  clientList;
  dropdownSettings:IDropdownSettings = {};
  resources:Resource[] = [];
  allResources = [];
  selectedResources =[];
  resoucesList=[];
  allManagers = [];
  constructor(private inactivityService: PageReloadService,private toast: ToastService, private fb: FormBuilder, private notificationService: NotificationService, 
    private httpservice: HttpService, private router: Router, private readonly piper: DatePipe,) { 
    this.addProjectForm=this.fb.group({
      clientName:['',Validators.required],
      projectName:['',Validators.required],
      projectManager:['',Validators.required],
      timeApprover:['',Validators.required],
      sow:['',Validators.required],
      startDate:['',Validators.required],
      endDate:  ['',Validators.required],
      projectId: [''],
      milestones: this.fb.array([
        // this.newProject()
      ]),
      weeklyWorkHoursLimit: this.fb.array([
        // this.fb.control('')
      ])
    
    })
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:keydown', ['$event'])

  onUserActivity(event: Event) {
    this.inactivityService.resetInactivityTimer();
  }

  ngOnInit(): void {
    this.inactivityService.startInactivityTimer();
    this.getClientList();
    this.getResources();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      itemsShowLimit: 6,
      allowSearchFilter: true,
      enableCheckAll:false
    };
   // this.resources = [{item_id:'1',item_text:'Prem Giri'},{item_id:'2',item_text:'Prem Giri'},{item_id:'3',item_text:'Prem Giri'}]
   this.getAllManagers();
  }

  getResources(){
    this.httpservice.doGet(StaticDataEntity.getallResources).subscribe((result: any) => {
      this.allResources = result;
      this.resources = result.map((project: any) => ({ item_id:project.id,item_text: project.first_name + ' ' +  project.middle_name + '' + project.last_name }));
    })
  }
  getAllManagers(){
    this.httpservice.doGet("allManagers").subscribe((data)=>{
      this.allManagers = data;
    })
  }
  stopManualEntry(event: KeyboardEvent) {
    const key = event.key;
    if (key === "Backspace" || key === "Delete") {
    } else {
      event.preventDefault();
    }
  }
  newProject() : FormGroup {
    return this.fb.group({
      milestoneName:['',Validators.required],
      estimatedHours:['',Validators.required],
      milestoneStartDate:[null],
      milestoneEndDate:[null]
    })

  }

  milestones(): FormArray {
    return this.addProjectForm.get("milestones") as FormArray
  }
  addMilestone(): void {
      const control = this.addProjectForm.controls.milestones as FormArray;
      control.push(this.newProject())
 
  }

  removeMilestone(i: number): void {
    this.milestones().removeAt(i);
  }

 

  getClientList(){
    this.httpservice.doGet(StaticDataEntity.clientsList).subscribe((result: any) => {
      this.clientList = result
    })
  }

  onItemSelect(selectedItem){
    this.allResources.forEach((resource)=>{
      if(selectedItem.item_id == resource.id){
        this.selectedResources.push(resource);
      }
    })
    this.weeklyWorkHoursLimit.push(this.fb.control('',Validators.required));

  }
  onItemDeSelect(deselectItem) {
    const index = this.selectedResources.findIndex((item) => item.id === deselectItem.item_id);
    if (index !== -1) {
      const deselectedResource = this.selectedResources[index];
      this.selectedResources.splice(index, 1);
      const resourceIndex = this.resoucesList.findIndex((item) => item.id === deselectedResource.id);
      if (resourceIndex !== -1) {
        this.resoucesList.splice(resourceIndex, 1);
        
      }
    }
    const control = <FormArray>this.addProjectForm.controls['weeklyWorkHoursLimit'];
    control.removeAt(index);
  }
  

  onWorkHoursLimitChange(value: string, elementId: string) {
    this.resoucesList.push({"resource_id":elementId,"work_hour_limit":value});
  }
 

  
  addProject(){
    if(this.addProjectForm.valid){
      let j = 0;
    let tempContact = {};
    let contactArray = [];
    let formContacts = this.addProjectForm.value.milestones;
    for (j = 0; j < formContacts.length; j++) {
      tempContact['milestone_name'] = formContacts[j]['milestoneName'];
      tempContact['estimated_hours'] = Number(formContacts[j]['estimatedHours']);
      tempContact['start_date'] = formContacts[j]['milestoneStartDate'] ? this.piper.transform(formContacts[j]['milestoneStartDate'], 'yyyy-MM-dd') : null;
      tempContact['end_date'] = formContacts[j]['milestoneEndDate'] ? this.piper.transform(formContacts[j]['milestoneEndDate'], 'yyyy-MM-dd') : null;
      if(this.addProjectForm.value.milestones.length == 0){
        contactArray = this.addProjectForm.value.milestones;
      }else{
        contactArray.push(tempContact);
      }
    }
    let form = this.addProjectForm.value
    let payload = {
      "client_id": form.clientName,
      "project_name":form.projectName,
      "task_order_executed": form.sow == "Yes" ? true : false,
      "start_date":this.piper.transform(form.startDate, 'yyyy-MM-dd'),
      "end_date": this.piper.transform(form.endDate, 'yyyy-MM-dd'),
      "project_manager_id": form.projectManager,
      "time_approver_id": form.timeApprover,
      "project_description": form.clientName,
      "milestones": contactArray,
      "resources": this.resoucesList,
      "project_id":form.projectId
    }
    this.httpservice.doPost(StaticDataEntity.addProject, payload).subscribe((result: any) => {
      if (result.message) {
        // this.notificationService.showSucessNotification('', result['message']);
        this.toast.showSuccess("success", "Success", result['message']);
        this.router.navigate(['/project-list']);
      } else if (result.errorMessage) {
        // this.notificationService.showErrorNotification("Error", result.errorMessage);
        this.toast.showError("error", "Error", result.errorMessage);
      }
    }, (error) => {
      if (error.status === 400) {
        // this.notificationService.showWarningNotification("Error", error.error.detail);
        this.toast.showWarning("warn","Warning", error.error.detail);
      }
    });
  } else {
    validateAllFormFields(this.addProjectForm);
  }
}
  newEndDate(date){
    return new Date(date);
  }
  newMilestoneEndDate(date){
    if (!isBlank(date)) {
      return new Date(date);
    } else {
      return null;
    }
  }
  get weeklyWorkHoursLimit(){
    return this.addProjectForm.get('weeklyWorkHoursLimit') as FormArray;
  } 

}
