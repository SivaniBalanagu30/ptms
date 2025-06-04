import { Component, EventEmitter, Input, Output } from "@angular/core";
import * as moment from "moment";
// import { isBlank } from "../../utils/utils";
import  * as _ from 'lodash';
import { isBlank } from "src/app/shared/utils/utils";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'app-timer-selection',
  templateUrl: './timer-selection.component.html',
  styleUrls: ['./timer-selection.component.css']
})
export class TimerSelectionComponent {
    @Input() placeholder;
    @Input() min;
    @Input() max;
    @Input() timeInfo;
    @Input() dropdownControl: FormControl;
    @Input() disabled: boolean;
    @Input() required: boolean;
    searchTime:string = "";
    originalFilteredHours: string[] = [];
    @Input() selectedStartTime:any; // Input to receive the selected start time
    @Input() selectedEndTime:any;
    @Input() row:any;
    @Input() selectedMealEndTime:any;


    @Output() readonly dropdownValue: EventEmitter<any> = new EventEmitter();
    @Input() dropdownData: string[]; // Input property to receive the dropdown options

    dropdownForm: FormGroup;
    dayaHours = [];
    filteredHours = [];
    filteredHoursData = [];
    add12AM:boolean=false;
    constructor() {
    }
    setTimer() {
        if(!isBlank(this.min)) {
            this.filteredHoursData = []
            this.dayaHours = this.someFunction();
            this.filteredHours = _.drop(this.dayaHours, _.indexOf(this.dayaHours, this.min, 0));
            this.filteredHours.push("12:00 AM (Next Day)")

        } else {
            this.filteredHoursData = []
            this.filteredHours =this.someFunction();
            this.filteredHours.push("12:00 AM (Next Day)")
        }
        if(!isBlank(this.max)){
          this.filteredHoursData = []
          this.dayaHours = this.someFunction();
          this.filteredHours = _.drop(this.dayaHours, _.indexOf(this.dayaHours, this.min, 0));
          this.filteredHours = _.take(this.filteredHours, _.lastIndexOf(this.dayaHours, this.max) + 1);

        }
        this.originalFilteredHours = [...this.filteredHours];
    }
    ngOnInit() {
        if(!isBlank(this.min)) {
            this.dayaHours = this.someFunction();
            this.filteredHours = _.drop(this.dayaHours, _.indexOf(this.dayaHours, this.min, 0));
            // this.filteredHours.push("12:00 AM")
            this.filteredHours.push("12:00 AM (Next Day)")
            
        } else {
            
            this.filteredHours =this.someFunction();
            this.filteredHours.push("12:00 AM (Next Day)")  
        }
        //Store times in originalFilteredHours initially.
        // this.originalFilteredHours = [...this.filteredHours];

    }
    
    //Filter times in dropdown on search
    filterTime() {
      this.searchTime = this.searchTime.replace(/[^AMP:\d\s]|(?<=\s)\s+|^ /gi, '');
        if(this.selectedMealEndTime && this.selectedStartTime) {
            const currentDate = new Date();
            const selectedMealEndTime = new Date(`${currentDate.toDateString()} ${this.selectedMealEndTime}`);
          
          const filtered = this.originalFilteredHours.filter((time) => {
            const timeDate =  new Date(`${currentDate.toDateString()} ${time}`);
            return time.includes(this.searchTime) && timeDate > selectedMealEndTime || time.includes(this.searchTime) && time == "12:00 AM (Next Day)";
          });
          
          this.filteredHours = filtered;
        }else if (this.selectedStartTime) {
            const currentDate = new Date();
            const selectedStartTime = new Date(`${currentDate.toDateString()} ${this.selectedStartTime}`);
          const filtered = this.originalFilteredHours.filter((time) => {
            const timeDate =  new Date(`${currentDate.toDateString()} ${time}`);
            return time.includes(this.searchTime) && timeDate > selectedStartTime || time.includes(this.searchTime) && time === "12:00 AM (Next Day)";
          });
          
          this.filteredHours = filtered;
        }
        else if(this.row !== 0 && this.selectedEndTime){
            const currentDate = new Date();
            const selectedEndTime = new Date(`${currentDate.toDateString()} ${this.selectedEndTime}`);
          
          const filtered = this.originalFilteredHours.filter((time) => {
            const timeDate =  new Date(`${currentDate.toDateString()} ${time}`);
            return time.includes(this.searchTime) && timeDate >= selectedEndTime;
          });
      
          this.filteredHours = filtered;
        }else{
            const filtered = this.originalFilteredHours.filter((time) =>
            time !== "12:00 AM (Next Day)" && time.includes(this.searchTime)
          );
          this.filteredHours = filtered;
        }
      }
      

    trackByFn(index: number, option) {
        return `${index}___${option}`;
    }
    getHours(step, yourTime) {
        if (!step) {
            return [];
        }
        const slotArray = [];
        const startMinutes = yourTime ? this.howManyMinutesPassed(yourTime) : 0;
        const parsedSlotSize = parseInt(step.toString(), 10);


        for (let i = startMinutes; i <= 24 * 60; i += parsedSlotSize) {
            slotArray.push({
                time: this.convertMinutesToTimeFormat(i),
                minutes: i,
            });
        }

        return [...slotArray];
    }
    setParentValue(value) {
    this.dropdownValue.emit(value)
    }
    howManyMinutesPassed(time) {
        const [hour, minutes] = time.split(':').map((value) => parseInt(value, 10));
        return hour * 60 + minutes;
    }

    public convertMinutesToTimeFormat(mins) {
        let h: string | number = Math.floor(mins / 60);
        let m: string | number = mins % 60;
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        return `${h}:${m}:00`;
    }


    formatTime(time) {

        const H = +time.substr(0, 2);
        const h = H % 12 || 12;
        const ampm = (H < 12 || H === 24) ? " AM" : " PM";
        return h + time.substr(2, 3) + ampm;

    }
    someFunction () {
        return [].concat(...Array.from(Array(24), (_, hour) => ([
            moment({hour}).format('hh:mm A'),
            moment({ hour, minute: 15 }).format('hh:mm A'),
            moment({ hour, minute: 30 }).format('hh:mm A'),
            moment({ hour, minute: 45 }).format('hh:mm A')
          ])))
    }
    isFirstFieldFilled(option:any):boolean {
      const firstField = option.value.ts_start_time;
      return !!firstField; // Check if the first field has a value
    }
  
      isSecondFieldFilled(option: any): boolean {
      const secondField = option.value.meal_start_time;
      return !!secondField; // Check if the second field (meal_start_time) has a value
    }
}