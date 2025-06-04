import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableManualEntry]',
})
export class DisableManualEntryDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Check if it's not a special key (e.g., arrows, delete, backspace)
    const allowedKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'];
    if (!event.ctrlKey && !event.metaKey && allowedKeys.indexOf(event.key) === -1) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
  }

  @HostListener('cut', ['$event'])
  onCut(event: ClipboardEvent) {
    event.preventDefault();
  }
}
