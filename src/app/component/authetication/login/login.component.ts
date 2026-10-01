import { Component, HostListener, OnDestroy } from '@angular/core';
// import { UiDirectivesModule } from '../../../../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonService } from '../../../core/services/common.service';
import { Router } from '@angular/router';
import { AutheticationService } from '../../../services/auth/authetication.service';
import { Subject, takeUntil } from 'rxjs';
import { ForgotPassComponent } from '../forgot-pass/forgot-pass.component';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { CommonDialogService } from '../../../shared/shared-services/common-dialog.service';
import { AutoLogoutService } from '../../../services/auth/auto-logout.service';
import { UtilityService } from '../../../shared/shared-services/utility.service';
import * as CryptoJS from 'crypto-js';
// import { PasswordValidatorDirective } from "../../../shared/shared-directives/password.directive";

export function strictEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim();
    if (!value) return null; // empty handled by required validator

    // ❌ Forbid anything not in allowed set
    // ✅ Allowed → a-z, A-Z, 0-9, @ . _ -
    const forbiddenChars = /[^a-zA-Z0-9@._-]/;
    if (forbiddenChars.test(value)) {
      return { invalidChars: true };
    }

    // ✅ General email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(value)) {
      return { invalidEmailFormat: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiDirectivesModule, ForgotPassComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnDestroy {
  loginForm!: FormGroup;
   helpdesk = "tgit.helpdesk@timesofindia.com"
  previousUrl = '';
  invalidChars = '| ~ !  ? + ` < >  / ; : \ " { } [ ] # $ ^ & * = ';
  showPopup = false;
  destroy$ = new Subject<boolean>();
 deviceType :any;
   showCheckbox :any;
   adminList= [];
   allowedDomains: string[] = ['timesofindia.com'];
  constructor(
    private fb: FormBuilder,
    private service: AutheticationService,
    private commonservice: CommonService,
    private _router: Router,
     private autoLogout: AutoLogoutService,
    private loader: LoaderService,
    private dialog: CommonDialogService,
    private utility: UtilityService
  ) {
    this.loginForm = this.fb.group({
      emailid: ['', [strictEmailValidator(), Validators.maxLength(99)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      checked: [false]
    });
  }


ngOnInit(): void {
  this.deviceType = this.getDeviceType();
  this.showCheckbox = ['mobile', 'tablet'].includes(this.deviceType);
  //   if(this.service.isCheckLogin()){
  //    this.checkAlreadyLogin();
  // }
  this.checkAlreadyLogin();

  this.commonservice.getConfigData().subscribe((config: any) => {
    this.adminList = config?.admin || [];
    this.allowedDomains = config?.allowedDomains || [];
  });
}

checkAlreadyLogin(): void {
  this.loader.show();

  this.service.chkAlreadyLogin()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
         this.loader.hide();
        if (res === true || res === 'true') {
          this.autoLogout.startAutoLogout();

          this._router.navigate(['/portal/home'], {
            replaceUrl: true,
            state: { fromLogin: true }
          });
        }
       
      },
      error: () => this.loader.hide()
    });
}

// checkAlreadyLogin(){
//   this.loader.show();
//   this.service.chkAlreadyLogin().pipe(takeUntil(this.destroy$)).subscribe({
//       next: (res: any) => {
//         // console.log(res);
//         if(res === true || res === 'true'){
//           this.autoLogout.startAutoLogout();
//           // this._router.navigate(['/portal/home']);
//           this._router.navigate(['/portal/home'], {
//             state: { fromLogin: true }
//           });
//         } 
//         this.loader.hide();
//       },error: () => {
//         this.loader.hide();
//         // this.dialog.alert('Login failed. Please Try again.');
//       }
//     }); 
// }

getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;

  if (width <= 767) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
}
@HostListener('window:resize')
onResize() {
  this.deviceType = this.getDeviceType();
 this.showCheckbox = (this.deviceType === 'mobile' || this.deviceType === 'tablet');

}

openPopup() {
  this.showPopup = true;
}

onPopupClosed() {
  this.showPopup = false;
}

  login(): void {
    this.loader.show();
    this.service.clearPreviousLogin();
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      const arr = ['emailid', 'password'];
      arr.forEach(f => {
        // console.log(f, '=>', this.loginForm.get(f)?.value);
      });
      arr.forEach(key => {
        const control = this.loginForm.get(key);
        if (control && control.enabled) {
          if (!control.value && control.errors?.['uploadFailed'] !== true) {
            control.setErrors({ ...(control.errors || {}), uploadFailed: true });
            control.markAsTouched();
          } else if (control.value && control.hasError('uploadFailed')) {
            // remove uploadFailed error if value exists
            const { uploadFailed, ...rest } = control.errors || {};
            control.setErrors(Object.keys(rest).length ? rest : null);
          }
        }
      });
      this.loader.hide();
      // Find first invalid control
      const firstInvalidControl = Object.keys(this.loginForm.controls).find(key => {
        const control = this.loginForm.get(key);
        return control && control.invalid && control.enabled;
      });
      this.dialog.alert('Please fill all required fields.', 'ALERT')
        .then(() => {
          if (firstInvalidControl) {
            const element = document.querySelector(
              `[formControlName="${firstInvalidControl}"]`
            ) as HTMLElement;

            if (element) {
              element.focus();
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        });
        this.loader.hide();
      return; // stop here if invalid
    }

    const user = this.loginForm.value;
    user.emailid = user.emailid.toLowerCase(); 
    const domain = user.emailid?.split('@')[1];
    if (!domain || !this.allowedDomains
      .map(d => d.toLowerCase())
      .includes(domain.toLowerCase())){
      this.dialog.alert('Please enter your official Email ID');
       this.loader.hide();
      return
    }
    user.checked = user.checked ? 'true' : 'false';
    user.checked = this.deviceType ===  'desktop' ? 'true' : user.checked;
    // if(this.deviceType ===  'desktop'){
    //   user.checked = 'true';
    // }
    this.service.login(user).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result: any) => {
        // console.log(result);

        if (
          result?.status === 'success' &&
          result?.message !== 'Invalid Emailid or Password' 
        ) {
          if(result.status === 'success' && Object.keys(result.data).length === 0){
            this.loader.hide();
            this.dialog.alert('You are not authorized to access this Application');
            return
          }

          // const keepSignedIn = user.checked === 'true';
          // if (keepSignedIn) {
          //   this.autoLogout.stopAutoLogout();
          // } else {
          //   this.autoLogout.startAutoLogout();
          // }
          this.autoLogout.startAutoLogout();
          const emailId = result.data.emailId.toLowerCase();
          const isAdmin = this.adminList.some(
            (adminEmail: string) => adminEmail.toLowerCase() === emailId
          );
          this.commonservice.setEmpDetails(result.data);
          this.utility.setempData(result.data);
          localStorage.setItem('emp', CryptoJS.AES.encrypt(JSON.stringify(result.data), 'SECRET_KEY').toString());
          localStorage.setItem('portalId', result.data.portalId);
          localStorage.setItem('emailId', result.data.emailId);
          localStorage.setItem('isCheckLoginCall', user.checked);
        
          this.utility.setAdminState(isAdmin); // ✅ store admin flag
           this._router.navigate(['/portal/home'], {
            state: { fromLogin: true }
          });
        } else {
             this.loader.hide();
          if(result[0].message ){
            this.dialog.alert(result[0].message);
          } else{
            this.dialog.alert('Please enter valid Email ID and Password.');
          }
        }
        this.loader.hide();
      },
      error: () => {
        this.loader.hide();
        this.dialog.alert('Login failed. Please Try again.');
      }
    });
  }




  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
