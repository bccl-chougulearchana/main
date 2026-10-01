import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[libTextSpecial]',
    standalone: true
})
export class TextSpecialDirective {
    constructor(private el: ElementRef<HTMLInputElement>) { }

    @HostListener('input')
    onInput(): void {
        const input = this.el.nativeElement;

        // 1. Allow letters, spaces, and selected special characters
        let cleaned = input.value.replace(/[^a-zA-Z0-9 ()\-@&!]/g, '');

        // 2. Remove leading spaces
        cleaned = cleaned.replace(/^\s+/, '');

        // 3. Replace multiple spaces with single space
        cleaned = cleaned.replace(/\s{2,}/g, ' ');

        // Update value only if changed
        if (input.value !== cleaned) {
            input.value = cleaned;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
}
