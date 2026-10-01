import {  HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, throwError } from 'rxjs';
import { AppSettings } from '../../core/modals/appsettings';
import * as CryptoJS from 'crypto-js';
import { CommonService } from '../../core/services/common.service';
import { UtilityService } from '../../shared/shared-services/utility.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../shared/shared-services/loader.service';



@Injectable({
  providedIn: 'root'
})
export class AutheticationService {

  constructor( private common : CommonService, private http: HttpClient, private utility : UtilityService, private router: Router,private loaderService: LoaderService) { }
auth: any = {};
  private withCacheBuster(url: string): string {
    return `${url}?t=${new Date().getTime()}`;
  }

  getConfigData(): Observable<any> {
    return this.http.get(this.withCacheBuster('asset/configdata/appconfig.json'));
  }
   login(userdata: any): Observable<any> {
    let urlSearchParams = new HttpParams()
      .set('emailid', userdata.emailid)
      .set('password', userdata.password)
      .set('deviceid', 'timescapenu')
      .set('ipaddress', 'asdaiplelosdasd')
      .set('checkedin', userdata.checked);

    const jsonData = urlSearchParams.toString();
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(AppSettings.API_TIMELOGIN, jsonData, {
      headers,
      withCredentials: true,
      observe: 'response'
    }).pipe(
      map((res: HttpResponse<any>) => {
        const body = res.body;
        if (body?.[0]?.status === 'success' && body?.[0]?.data1) {
          let variable = res.headers.get('Authorization');
          let variable1 = res.headers.get('Authorizationkey');
          AppSettings.authorization = variable;
          AppSettings.authorizationkey = variable1;
                  const token = res.headers.get('authorization');
        const tokenKey = res.headers.get('authorizationkey');

        if (token && tokenKey) {
          this.common.updatetoken(token, tokenKey);

          // store if needed
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('authKey', tokenKey);
        }
          this.common.updatetoken(variable, variable1);
          const keyStr = userdata.emailid.substring(0, 8) + 'bccl1234';
          const Cryptokey = CryptoJS.enc.Utf8.parse(keyStr);
          const Cryptoiv = CryptoJS.enc.Utf8.parse(keyStr);

          try {
            const decrypted = CryptoJS.AES.decrypt(body[0].data1, Cryptokey, {
              iv: Cryptoiv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
            });

            const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decryptedText);
          } catch (e) {
            console.error('Decryption failed:', e);
            throw new Error('Invalid encrypted payload');
          }
        } else {
          return body;
        }
      }),
      catchError(err => {
        console.error('Login failed', err);
        return throwError(() => err);
      }),
      finalize(() => {})
    );
  }

chkAlreadyLogin(): Observable<boolean>{
  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  return this.http.post<boolean>(AppSettings.API_ALREADY_LOGIN, '', {headers})
}

customLogin(userdata: any): Observable<any> {
  const params = new HttpParams()
    .set('emailId', userdata.emailId)
    .set('reference', userdata.reference)
    .set('checkedin', userdata.checked);

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  });
  return this.http.post<any>(
    AppSettings.API_CUSTOM_LOGIN,
    params.toString(),
    {
      headers,
      withCredentials: true,
      observe: 'response'
    }
  ).pipe(
    map((res: HttpResponse<any>) => {
      const body = res.body;

      if (body?.[0]?.status === 'success' && body?.[0]?.data1) {
        // ✅ tokens from headers
        const token = res.headers.get('authorization');
        const tokenKey = res.headers.get('authorizationkey');

        if (token && tokenKey) {
          this.common.updatetoken(token, tokenKey);

          // store if needed
          sessionStorage.setItem('authToken', token);
          sessionStorage.setItem('authKey', tokenKey);
        }

        // ✅ Crypto key/iv
        const keyStr = userdata.emailId.substring(0, 8) + 'bccl1234';
        const Cryptokey = CryptoJS.enc.Utf8.parse(keyStr);
        const Cryptoiv = CryptoJS.enc.Utf8.parse(keyStr);

        try {
          // ✅ decrypt encrypted payload
          const decrypted = CryptoJS.AES.decrypt(body[0].data1, Cryptokey, {
            iv: Cryptoiv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });

          const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
          const result = JSON.parse(decryptedText);

          return result; // ✅ return decrypted object
        } catch (e) {
          console.error('Decryption failed:', e);
          throw new Error('Invalid encrypted payload');
        }
      }

      return body; 
    }),
    catchError(err => {
      console.error('Login failed', err);
      return throwError(() => err);
    }),
    finalize(() => {
      // this.loaderService.hide();
    })
  );
}


  
logout() {
  localStorage.clear();
  sessionStorage.clear();
this.utility?.setIframeUrl?.(null);
  const headers = new HttpHeaders({ 'Accept': 'application/json'});
  return this.http.post( AppSettings.API_TIMELOGOUT,{},{ headers, withCredentials: true });
}


  // clearPreviousLogin() {
  //   localStorage.removeItem("currentUser");
  //   localStorage.removeItem("currentUserkey");
  //   localStorage.removeItem("signedin");
  //   localStorage.removeItem("companyCode");
  //   localStorage.removeItem("deptGroup");
  //   localStorage.removeItem("joiningDate");
  //   localStorage.removeItem("designation");
  //   localStorage.removeItem("loginData");
  //   localStorage.removeItem("empdetails");
  //   localStorage.removeItem("empfullname");
  //   localStorage.removeItem("pagetitle");
  //   localStorage.removeItem("isCheckLoginCall");
  //   localStorage.removeItem("showWebPunch");
  //   localStorage.removeItem("showLaunchpad");
  //   localStorage.removeItem("portalId");
  //   localStorage.removeItem("emailId");
  //   localStorage.removeItem("UserOID");
  //   localStorage.removeItem('isAdmin');
  //   sessionStorage.removeItem('authToken');
  //   localStorage.removeItem('currentUser');
  //   localStorage.removeItem('currentUserkey');
  //   this.utility?.setIframeUrl?.(null);

  // }
  //   clearAuthDATA(){
  //   sessionStorage.removeItem('reference');
  //   sessionStorage.removeItem('TOIID');
  //   sessionStorage.removeItem('authToken');
  //   sessionStorage.removeItem('authKey');
  //   sessionStorage.removeItem('emailId');
  //   sessionStorage.removeItem('parentName');
  //   sessionStorage.removeItem('signedin');
  //   sessionStorage.removeItem('isProcessor');
  //   localStorage.removeItem('authToken');
  //   localStorage.removeItem('currentUser');
  //   localStorage.removeItem('currentUserkey');
  // }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('currentUser');
    if(token){
      return true
    } else {
      return false
    }
    // return token != null;
  }
//   reloadHome(): void {
//       if (this.router.url === '/portal/home' && this.utility.getReloadState()) {
//         window.location.reload();
//          setTimeout(()=> {
//         this.utility.setReloadState(false);
//       }, 100);
//       } else {
//         this.router.navigate(['/portal/home']);
//       }
// }
reloadInProgress = false;

  reloadHome(): void {
    if (this.reloadInProgress) return;

    this.reloadInProgress = true;

    if (this.router.url === '/portal/home'){
      window.location.reload();
    } else {
      this.router.navigate(['/portal/home']);
    }
  }

  resetReloadLock(): void {
    this.reloadInProgress = false;
  }

  isCheckLogin(): boolean{
    return localStorage.getItem('isCheckLoginCall') === 'true'
  }

// logout() {
//   localStorage.clear();
//   sessionStorage.clear();
//   this.utility?.setIframeUrl?.(null);
// }

  clearPreviousLogin() {
  localStorage.clear();
  sessionStorage.clear();
    this.utility?.setIframeUrl?.(null);
  }
    clearAuthDATA(){
  localStorage.clear();
  sessionStorage.clear();
  }

 checkrolemenu() {
  this.loaderService.show();

  this.auth = this.common.gettoken();

  const headers = new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue
  });

  return this.http.post<any>(
    AppSettings.API_CHECK_ROLEMENU,
    {},
    {
      headers,
      withCredentials: true,
      observe: 'response'
    }
  ).pipe(
    map(response => {
      this.loaderService.hide();

      const authorization = response.headers.get('Authorization');
      const authorizationkey = response.headers.get('Authorizationkey');

      AppSettings.authorization = authorization;
      AppSettings.authorizationkey = authorizationkey;

      if (authorization && authorizationkey) {
        this.common.updatetoken(authorization, authorizationkey);
      }

      return response.body;
    })
  );
}

viewchklist() {
  this.loaderService.show();
  this.auth = this.common.gettoken();

  const headers = new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue,
  });

  return this.http
    .post(AppSettings.API_VIEW_LIST, {}, {
      headers,
      withCredentials: true,
      observe: 'response', // needed so you can read response headers, like before
    })
    .pipe(
      map((response: HttpResponse<any>) => {
        this.loaderService.hide();

        const authToken = response.headers.get('Authorization');
        const authKey = response.headers.get('Authorizationkey');

        AppSettings.authorization = authToken;
        AppSettings.authorizationkey = authKey;

        if (authToken != null && authKey != null) {
          this.common.updatetoken(authToken, authKey);
        }

        return response.body; // HttpClient already parses JSON — this replaces response.json()
      })
    );
}
codeDeclarationSubmit(answer:any, action:any) {
  this.loaderService.show();
  this.auth = this.common.gettoken();

  const headers = new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue,
  });

  let urlSearchParams: HttpParams = new HttpParams();

  answer.feedback.forEach((feedback:any) => {
    urlSearchParams = urlSearchParams.append('datalist', feedback);
  });
  urlSearchParams = urlSearchParams.append('action', action);

  const jsonData = urlSearchParams.toString();

  return this.http
    .post(AppSettings.API_DECLARATION_FEEDBACK, jsonData, {
      headers,
      withCredentials: true,
      observe: 'response',
    })
    .pipe(
      map((response: HttpResponse<any>) => {
        this.loaderService.hide();

        const authToken = response.headers.get('Authorization');
        const authKey = response.headers.get('Authorizationkey');

        AppSettings.authorization = authToken;
        AppSettings.authorizationkey = authKey;

        if (authToken != null && authKey != null) {
          this.common.updatetoken(authToken, authKey);
        }

        return response.body;
      })
    );
}
eurekaSubmitFile(file:any, fileName = "") {
  console.log(file, 'fileeeeeeeeeeeeee');
  this.loaderService.show();
  this.auth = this.common.gettoken();

  const headers = new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue,
    Accept: '*/*',
  });

  const formData: FormData = new FormData();
  if (fileName === "") {
    formData.append("file", file);
  } else {
    formData.append("file", file, fileName);
  }

  return this.http
    .post(AppSettings.API_TIME_EUREKA_SUBMIT_FILE, formData, {
      headers,
      withCredentials: true,
      observe: 'response',
    })
    .pipe(
      map((response: HttpResponse<any>) => {
        this.loaderService.hide();
        // console.log(response);
        //     let variable=response.headers.get('Authorization');

        //  AppSettings.authorization = variable;
        //  let variable1=response.headers.get('Authorizationkey');

        //   AppSettings.authorizationkey = variable1;
        //     if(variable!=null && variable1!=null){
        //   this.commonservice.updatetoken(variable,variable1);
        // }
        return response.body;
      })
    );
}
totalSubordinateCount() {
  this.loaderService.show();
  this.auth = this.common.gettoken();

  const headers = new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue,
  });

  return this.http
    .post(AppSettings.API_SUBORDINATE_REPORT_TOTALCOUNT, {}, {
      headers,
      withCredentials: true,
      observe: 'response',
    })
    .pipe(
      map((response: HttpResponse<any>) => {
        this.loaderService.hide();

        const authToken = response.headers.get('Authorization');
        const authKey = response.headers.get('Authorizationkey');

        AppSettings.authorization = authToken;
        AppSettings.authorizationkey = authKey;

        if (authToken != null && authKey != null) {
          this.common.updatetoken(authToken, authKey);
        }

        return response.body;
      })
    );
}
viewApproverchklist() {
  this.loaderService.show();
  const headers = this.buildAuthHeaders();

  return this.http
    .post(AppSettings.API_APPROVER_LIST, {}, { headers, withCredentials: true, observe: 'response' })
    .pipe(map((response: HttpResponse<any>) => this.handleAuthResponse(response)));
}
private buildAuthHeaders(extra: { [key: string]: string } = {}): HttpHeaders {
  this.auth = this.common.gettoken();
  return new HttpHeaders({
    Authorization: this.auth.value,
    Authorizationkey: this.auth.keyvalue,
    ...extra,
  });
}

private handleAuthResponse(response: HttpResponse<any>): any {
  this.loaderService.hide();

  const authToken = response.headers.get('Authorization');
  const authKey = response.headers.get('Authorizationkey');

  AppSettings.authorization = authToken;
  AppSettings.authorizationkey = authKey;

  if (authToken != null && authKey != null) {
    this.common.updatetoken(authToken, authKey);
  }

  return response.body;
}
viewUserFeedBack(questionNo:any) {
  // this.loaderService.show();
  const headers = this.buildAuthHeaders();

  let urlSearchParams: HttpParams = new HttpParams();
  urlSearchParams = urlSearchParams.append('questionNum', questionNo);

  const jsonData = urlSearchParams.toString();

  return this.http
    .post(AppSettings.API_VIEW_USER_FDBK, jsonData, { headers, withCredentials: true, observe: 'response' })
    .pipe(
      map((response: HttpResponse<any>) => {
        // this.loaderService.hide();

        const authToken = response.headers.get('Authorization');
        const authKey = response.headers.get('Authorizationkey');

        AppSettings.authorization = authToken;
        AppSettings.authorizationkey = authKey;

        if (authToken != null && authKey != null) {
          this.common.updatetoken(authToken, authKey);
        }

        return response.body;
      })
    )
    .toPromise();
}
approverDeclarationSubmit(answer:any, action:any) {
  this.loaderService.show();
  const headers = this.buildAuthHeaders();

  let urlSearchParams: HttpParams = new HttpParams();
  answer.feedback.forEach((feedback:any) => {
    urlSearchParams = urlSearchParams.append('datalist', feedback);
  });
  urlSearchParams = urlSearchParams.append('action', action);

  const jsonData = urlSearchParams.toString();

  return this.http
    .post(AppSettings.API_APPROVER_DECLARATION_FEEDBACK, jsonData, { headers, withCredentials: true, observe: 'response' })
    .pipe(map((response: HttpResponse<any>) => this.handleAuthResponse(response)));
}
}
