import { Directive, ElementRef, HostListener, Input, OnDestroy } from '@angular/core';
import { isBlank } from '../shared/utils/utils';

@Directive({
  selector: '[appAlphaWithSpace]'
})
export class AlphaWithSpaceDirective implements OnDestroy{
  private readonly noSpaceAtStart: RegExp = new RegExp(/^[a-zA-Z0-9][a-zA-Z0-9\s!-\/:-@[-`{-~]*$/);
  private readonly regexWithSpace: RegExp = new RegExp(/^[a-zA-Z ]*$/);
  private readonly regexWithNumber: RegExp = new RegExp(/^[a-zA-Z0-9]*$/);
  private readonly regexNumber: RegExp = new RegExp(/^[0-9]*$/);
  private readonly regexWithNumberDecimal: RegExp = new RegExp(/^\d*\.?\d*$/);
  private readonly specialKeys: Array<string> = [
      'Backspace',
      'Tab',
      'End',
      'Home',
      'Delete',
      'Del',
      'ArrowLeft',
      'Left',
      'ArrowRight',
      'Right'
  ];
  private isSpaceEntered = false;
  @Input('inputType') inputType: string;
  constructor(private readonly el: ElementRef) { }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
      if (this.specialKeys.indexOf(event.key) !== -1 ||
          (event.key === 'a' && event.ctrlKey === true) || // Allow: Ctrl+A
          (event.key === 'c' && event.ctrlKey === true) || // Allow: Ctrl+C
          (event.key === 'v' && event.ctrlKey === true) || // Allow: Ctrl+V
          (event.key === 'x' && event.ctrlKey === true)  // Allow: Ctrl+X
      ) {
          return;
      }
      if (this.inputType === 'alphaWithSpace') {
          if (event.code === 'Space' && this.el.nativeElement.value.length === 0) {
              event.preventDefault();
          } else if (event.code === 'Space' && this.el.nativeElement.value.length > 0) {
              if (this.isSpaceEntered) {
                  event.preventDefault();
              } else {
                  this.isSpaceEntered = true;
              }
          } else {
              this.isSpaceEntered = false;
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithSpace)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'alphaWithDecimal') {
          if (event.code === 'Space' && this.el.nativeElement.value.length === 0) {
              event.preventDefault();
          } else if (event.code === 'Space' && this.el.nativeElement.value.length > 0) {
              if (this.isSpaceEntered) {
                  event.preventDefault();
              } else {
                  this.isSpaceEntered = true;
              }
          } else {
              this.isSpaceEntered = false;
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithNumberDecimal)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'alphaWithNumber') {
          if (event.code === 'Space' && this.el.nativeElement.value.length === 0) {
              event.preventDefault();
          } else if (event.code === 'Space' && this.el.nativeElement.value.length > 0) {
              event.preventDefault();
              this.isSpaceEntered = true;
          } else {
              this.isSpaceEntered = false;
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithNumber)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'strictlyNumber') {
          if (event.code === 'Space' && this.el.nativeElement.value.length === 0) {
              event.preventDefault();
          } else if (event.code === 'Space' && this.el.nativeElement.value.length > 0) {
              event.preventDefault();
              this.isSpaceEntered = true;
          } else {
              this.isSpaceEntered = false;
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexNumber)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'noWhiteSpaceAtBeginning') {
          if (event.code === 'Space' && this.el.nativeElement.value.length === 0) {
              event.preventDefault();
          } else if (event.code === 'Space' && this.el.nativeElement.value.length > 0) {
              if (this.isSpaceEntered) {
                  event.preventDefault();
              } else {
                  this.isSpaceEntered = true;
              }
          } else {
              this.isSpaceEntered = false;
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.noSpaceAtStart)) {
                  event.preventDefault();
              }
          }
      }
  }
  @HostListener('paste', ['$event'])
  onEvent(event) {
      if (this.inputType === 'alphaWithSpace') {
          let pastedText;
          if (window['clipboardData']) {
              pastedText = window['clipboardData'].getData('Text');
          } else {
              pastedText = (event.originalEvent || event).clipboardData.getData('text');
          }
          if (event.type === 'paste') {
              if (!isBlank(pastedText) && !this.regexWithSpace.test(pastedText)) {
                  event.preventDefault();
              }
          } else {
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithSpace)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'alphaWithNumber') {
          let pastedText;
          if (window['clipboardData']) {
              pastedText = window['clipboardData'].getData('Text');
          } else {
              pastedText = (event.originalEvent || event).clipboardData.getData('text');
          }
          if (event.type === 'paste') {
              if (!isBlank(pastedText) && !this.regexWithNumber.test(pastedText)) {
                  event.preventDefault();
              }
          } else {
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithNumber)) {
                  event.preventDefault();
              }
          }
      }
      if (this.inputType === 'alphaWithDecimal') {
          let pastedText;
          if (window['clipboardData']) {
              pastedText = window['clipboardData'].getData('Text');
          } else {
              pastedText = (event.originalEvent || event).clipboardData.getData('text');
          }
          if (event.type === 'paste') {
              if (!isBlank(pastedText) && !this.regexWithNumberDecimal.test(pastedText)) {
                  event.preventDefault();
              }
          } else {
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexWithNumberDecimal)) {
                  event.preventDefault();
              }
          }
      }
      
      if (this.inputType === 'strictlyNumber') {
          let pastedText;
          if (window['clipboardData']) {
              pastedText = window['clipboardData'].getData('Text');
          } else {
              pastedText = (event.originalEvent || event).clipboardData.getData('text');
          }
          if (event.type === 'paste') {
              if (!isBlank(pastedText) && !this.regexNumber.test(pastedText)) {
                  event.preventDefault();
              }
          } else {
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.regexNumber)) {
                  event.preventDefault();
              }
          }
      }
   
      if (this.inputType === 'noWhiteSpaceAtBeginning') {
          let pastedText;
          if (window['clipboardData']) {
              pastedText = window['clipboardData'].getData('Text');
          } else {
              pastedText = (event.originalEvent || event).clipboardData.getData('text');
          }
          if (event.type === 'paste') {
              if (pastedText && !this.noSpaceAtStart.test(pastedText)) {
                  event.preventDefault();
              }
          } else {
              const current: string = this.el.nativeElement.value;
              const next: string = current.concat(event.key);
              if (next && !String(next).match(this.noSpaceAtStart)) {
                  event.preventDefault();
              }
          }
      }
  }
  public ngOnDestroy(): void { }

}
