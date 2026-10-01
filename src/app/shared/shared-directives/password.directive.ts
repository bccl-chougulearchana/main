import { Directive, ElementRef, Renderer2, OnInit } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
    selector: '[libPasswordNU]',
    standalone: true,
    providers: [
        {
            provide: NG_VALIDATORS,
            useExisting: PasswordValidatorDirective,
            multi: true
        }
    ]
})
export class PasswordValidatorDirective implements Validator, OnInit {
    private toggleButton!: HTMLElement;
    private isVisible = false;
    private shouldValidate = false; // 🔹 only true after blur

    private eyeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" >
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <circle cx="12" cy="12" r="3"></circle>
</svg>`;

    private eyeSlashSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
  <path d="M1 1l22 22"></path>
  <circle cx="12" cy="12" r="3"></circle>
</svg>`;

    constructor(private el: ElementRef<HTMLInputElement>, private renderer: Renderer2) { }

    ngOnInit(): void {
        const input = this.el.nativeElement;
        this.renderer.setAttribute(input, 'type', 'password');

        // Wrap input in a container for positioning
        const wrapper = this.renderer.createElement('div');
        this.renderer.addClass(wrapper, 'lib-password-wrapper');

        const parent = input.parentNode as HTMLElement;
        this.renderer.insertBefore(parent, wrapper, input);
        this.renderer.removeChild(parent, input);
        this.renderer.appendChild(wrapper, input);

        // Create eye button
        this.toggleButton = this.renderer.createElement('button');
        this.renderer.setAttribute(this.toggleButton, 'type', 'button');
        this.renderer.addClass(this.toggleButton, 'lib-password-toggle');
        this.renderer.setProperty(this.toggleButton, 'innerHTML', this.eyeSvg);

        this.renderer.appendChild(wrapper, this.toggleButton);

        // Toggle event
        this.toggleButton.addEventListener('click', () => {
            this.isVisible = !this.isVisible;
            this.renderer.setAttribute(input, 'type', this.isVisible ? 'text' : 'password');
            this.renderer.setProperty(this.toggleButton, 'innerHTML', this.isVisible ? this.eyeSlashSvg : this.eyeSvg);
        });
        input.addEventListener('input', () => {
            const trimmed = input.value.replace(/\s+/g, ''); // remove all spaces
            if (trimmed !== input.value) {
                input.value = trimmed;
                input.dispatchEvent(new Event('input')); // force update to form control
            }
        });

        // 🔹 Validate only on blur
        input.addEventListener('blur', () => {
            this.shouldValidate = true;
            input.dispatchEvent(new Event('input')); // trigger validation
        });

        // 🔹 Reset validation on focus (hide errors until blur again)
        input.addEventListener('focus', () => {
            this.shouldValidate = false;
        });

    }

    validate(control: AbstractControl): ValidationErrors | null {
        return null;
    }

    // validate(control: AbstractControl): ValidationErrors | null {
    //     if (!this.shouldValidate) {
    //         return null; // ✅ skip until blur
    //     }
    //     const value = control.value || '';
    //     const minLength = 9;
    //     const hasNumber = /[0-9]/.test(value);
    //     const hasAlphabet = /[a-zA-Z]/.test(value);
    //     // const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(value);

    //     if (!value) return null;

    //     const errors: string[] = [];

    //     if (value.length < minLength) {
    //         errors.push(`Password must be at least ${minLength} characters long.`);
    //     }
    //     if (!hasNumber) {
    //         errors.push('Password must contain at least one number.');
    //     }
    //     if (!hasAlphabet) {
    //         errors.push('Password must contain at least one alphabet.');
    //     }
    //     // if (!hasSpecial) {
    //     //     errors.push('Password must contain at least one special character.');
    //     // }

    //     return errors.length ? { passwordErrors: errors } : null;
    // }
//     validate(control: AbstractControl): ValidationErrors | null {
//     if (!this.shouldValidate) {
//         return null; // skip until blur
//     }

//     const value = control.value || '';
//     const minLength = 9;
//     const hasNumber = /[0-9]/.test(value);
//     const hasAlphabet = /[a-zA-Z]/.test(value);

//     if (!value) return null;

//     const errors: string[] = [];

//     if (value.length < minLength) {
//         errors.push(`Password must be at least ${minLength} characters long.`);
//     }
//     if (!hasNumber) {
//         errors.push('Password must contain at least one number.');
//     }
//     if (!hasAlphabet) {
//         errors.push('Password must contain at least one alphabet.');
//     }


//     return errors.length ? { passwordErrors: errors } : null;
// }

}
