import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
// import * as CryptoJS from 'crypto-js';

export const isObject = (value: any): boolean => {
	return value && value.constructor === Object;
};
export const validateAllFormFields = (formGroup: any): void => {
	// This code also works in IE 11
	Object.keys(formGroup.controls).forEach((field) => {
		const control = formGroup.get(field);
		if (control instanceof FormControl) {
			const value: any = control.value;
			const errors: any = control.errors;
			if (value != undefined && typeof value === 'string') {
				control.setValue(value.replace(/ +/g, ' '));
			}
			control.markAsDirty();
			control.markAsTouched();
			if (isObject(errors)) {
				control.setErrors({ ...errors });
			}

		} else if (control instanceof FormGroup) {
			validateAllFormFields(control);
		} else if (control instanceof FormArray) {
			validateAllFormFields(control);
		}
	});
};
export const trimValidator: ValidatorFn = (control: FormControl) => {
	if (isBlank(control.value) && control.value?.trim().length === 0) {
	  return {
		'trimError': { value: 'control has leading whitespace' }
	  };
	}
	return null;
  };
export const takeUntilDestroyed = (componentInstance: OnDestroy) => <T>(observable: Observable<T>) => {
	const subjectPropertyName = '__takeUntilDestroySubject__';
	const originalOnDestroy = componentInstance.ngOnDestroy;
	const componentSubject = (componentInstance[subjectPropertyName] as Subject<any>) || new Subject();

	componentInstance.ngOnDestroy = (...args) => {
		originalOnDestroy.apply(componentInstance, args);
		componentSubject.next(true);
		componentSubject.complete();
	};

	return observable.pipe(takeUntil<T>(componentSubject));
};
export const isBlank = (value: any): boolean => {
	return isNil(value) || (isObject(value) && Object.keys(value).length === 0) || value.toString().trim() === '';
};
export const isNil = (value: any): value is null | undefined => {
	return value === null || value === 'null' || value === 'undefined' || typeof value === 'undefined';
};

export function getActualDate(date) {
	if (date instanceof Date) {
		return date;
	} else {
		date = date.substring(0, 10).split('-');
		date = date[1] + '/' + date[0] + '/' + date[2];
		return new Date(date);
	}
}
export const getLocalTime = (value: any): any => {
	var date = new Date(value),
		mnth = ('0' + (date.getMonth() + 1)).slice(-2),
		day = ('0' + date.getDate()).slice(-2);
	return [ day, mnth, date.getFullYear() ].join('-');
};
export function noWhitespaceValidator(control: FormControl) {
	const isSpace = (control.value || '').match(/\s/g);
	return isSpace ? {'whitespace': true} : null;
}
export function customResizeEventDispatch(value?: number) {
	setTimeout(() => {
		window.dispatchEvent(new Event('resize'));
	}, value ? value : 500);
}
export function valueGreater(controlName: string, anotherControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const anotherControl = formGroup.controls[anotherControlName];
      

        // set error on matchingControl if validation fails
        if (Number(control.value) < Number(anotherControl.value)) {
            anotherControl.setErrors({ invalidCutoff: true });
        } else {
            anotherControl.setErrors(null);
        }
	}
}
export function valueLesser(controlName: string, anotherControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const anotherControl = formGroup.controls[anotherControlName];
      

        // set error on matchingControl if validation fails
        if ((!isBlank(Number(control.value))) && (!isBlank(anotherControl.value)) && (Number(control.value) >= Number(anotherControl.value))) {
			anotherControl.setErrors({ invalidCutoff: true });
        } else {
            anotherControl.setErrors(null);
        }
	}
}
export function checkMinDate(value) {
	if (new Date(value).getTime() < new Date().getTime()) {
		return new Date();
	} else {
		value = value.substring(0, 10).split('-');
		value = value[1] + '/' + value[0] + '/' + value[2];
		return new Date(value);
	}

}
// export function encryptObject(object) {
// 	return encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(object), 'secret key 123').toString());
// }
// export function decryptObject(encryptedObject) {
// 	let deData = CryptoJS.AES.decrypt(decodeURIComponent(encryptedObject), 'secret key 123');
// 	return JSON.parse(deData.toString(CryptoJS.enc.Utf8));
// }
export function parseDateToStringWithFormat(date: Date): string {
	let result: string;
	let dd = date.getDate().toString();
	let mm = (date.getMonth() + 1).toString();
	let hh = date.getHours().toString();
	let min = date.getMinutes().toString();
	let sec = date.getSeconds().toString();
	dd = dd.length === 2 ? dd : "0" + dd;
	mm = mm.length === 2 ? mm : "0" + mm;
	hh = hh.length === 2 ? hh : "0" + hh;
	min = min.length === 2 ? min : "0" + min;
	sec = sec.length === 2? sec : "0" + sec;
	result = [date.getFullYear(), '-', mm, '-', dd, ' ', hh, ':', min, ':', sec].join('');
  //   2022-09-12 16:15:25
	return result;
  }