import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { AutheticationService } from '../../../services/auth/authetication.service';
import { CommonService } from '../../../core/services/common.service';


@Component({
  selector: 'app-custom-login',
  standalone: true,
  template: ``,
  styles: ``
})
export class CustomLoginComponent implements OnInit {
  reference: string = '';
  user: any = {};
  employee: any;

  constructor(
    private route: ActivatedRoute,
    private common: CommonService,
    private router: Router,
    private api: AutheticationService,
  ) {}

  ngOnInit(): void {
    this.initializeLoginFlow();
  }

  initializeLoginFlow(): void {
    this.api.clearAuthDATA();

    this.route.queryParams.subscribe(params => {
      // 🔐 You will replace this when you get tdata from live:
      const tempData = JSON.parse(atob(params['tdata']));
      const reference = tempData.usr_reference;
      sessionStorage.setItem('reference', reference);
      const appInfo = tempData.usr_application;
      const emailId = tempData.usr_email;

      // 🔄 For now (static testing):
      // const emailId = 'jayant.anantpurkar@timesgroup.com';
      // const reference = 'timescape';
      // const appInfo = 'scholarship';

      // console.log('Email:', emailId);
      // console.log('Reference:', reference);
      // console.log('Application:', appInfo);

      this.reference = reference;
      sessionStorage.setItem('reference', reference);

      if (this.reference === 'timescape') {
        this.customLogin(emailId, appInfo);
      } else {
        this.router.navigate(['/error/1']);
      }
    });
  }

customLogin(emailId: string, appInfo: string): void {
  this.user = {
    checked: 'true',
    emailId: emailId.toLowerCase(),
    reference: this.reference
  };

  this.common.updateemployeedetails(this.user.checked);

  this.api.customLogin(this.user).subscribe({
    next: (response) => {
      // console.log('Login API Response:', response);

      if (response?.status === "success" && appInfo) {
        // Store token headers if needed
        const authToken = response.token;
        
        if (authToken) {
          sessionStorage.setItem('authToken', authToken);
          localStorage.setItem('authToken', authToken);
        }
        try {
          const data =  response.data;
          // console.log('Employee Data:', data);
          this.common.employeedetails(data)
          // ✅ Store data in session and proceed
          // sessionStorage.setItem('employeeData', JSON.stringify(employeeData));
          this.router.navigate(['/toi-education']);
        } catch (e) {
          console.error('Decryption failed:', e);
          this.router.navigate(['/error/1']);
        }

      } else {
        this.router.navigate(['/error/1']);
      }
    },
    error: (err) => {
      console.error('Login failed:', err);
      this.router.navigate(['/error/1']);
    }
  });
}

}
