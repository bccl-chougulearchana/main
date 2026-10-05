import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { map, catchError, finalize } from 'rxjs/operators';
import { AppSettings } from '../../core/modals/appsettings';
import { CommonService } from '../../core/services/common.service';

@Injectable({
  providedIn: 'root'
})

export class OCAService {
 constructor(private http: HttpClient, private commonService: CommonService) {}

 getEnsureCompfreq(){
   const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });

  return this.http.post(AppSettings.API_ENSURE_COMP_FREQ,  {}, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
           this.updateTokenFromHeaders(res);
          return res.body;
        })
      );
}

getViewUserPolicies(freq:any , roleId:any, fromDate:any, todate:any) {
      const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });

  let urlSearchParams: HttpParams = new HttpParams();

  urlSearchParams = urlSearchParams.append('frequency', freq);
  urlSearchParams = urlSearchParams.append('role', roleId);    
  urlSearchParams = urlSearchParams.append('status', "'L','A'");
  urlSearchParams = urlSearchParams.append('fromDate', fromDate);
  urlSearchParams = urlSearchParams.append('toDate', todate);
  let jsonData = urlSearchParams.toString();

  return this.http.post(AppSettings.API_VIEW_USER_POLICIES, jsonData,{
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
           this.updateTokenFromHeaders(res);
          return res.body;
        })
      );
}

setFeedback(answer:any){
      const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });
  let urlSearchParams: HttpParams = new HttpParams();
  
  answer.feedback.forEach((feedback:any) => {
    urlSearchParams = urlSearchParams.append('feedback', feedback);
  });
  let jsonData = urlSearchParams.toString();

  return this.http.post(AppSettings.API_INSERT_FEEDBACK, jsonData,{
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
           this.updateTokenFromHeaders(res);
          return res.body;
        })
      );
}


 eurekaSubmitFile(file: any) {
    return this.http.post<any>(AppSettings.API_TIME_EUREKA_SUBMIT_FILE, file);
  }

 getlistRolesDetails(){
   const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });

  return this.http.post<any>(AppSettings.API_LIST_ROLES, {}, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
           this.updateTokenFromHeaders(res);
          return res.body;
        })
      );
}


 getCompanyListDetails(){
    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });
    return this.http
      .post<any>(AppSettings.API_COMP_LIST, {}, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
      );
}

setDepartmentList(compCode: any) {
    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });
    let params = new HttpParams();
      params = params.append('compCode', compCode);
      let jsonData = params.toString();
     return this.http
      .post<any>(AppSettings.API_DEPT_LIST, jsonData, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
      );
}

setFunctionList(compCode :any,deptCode:any) {
    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });
    const params = new HttpParams()
                .set('compCode', compCode)
                .set('deptCode', deptCode);
  let jsonData = params.toString();


  return this.http
      .post<any>(AppSettings.API_FUNC_LIST, jsonData, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
      );
}

submitdashdata(compCode:any,deptCode:any,functionCode:any,dashgroupdata:any) {
     const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });
    const params = new HttpParams()
    .set('compCode', compCode)
    .set('deptCode', deptCode)
    .set('function', functionCode)
    .set('dates', dashgroupdata);

  let jsonData = params.toString();

  return this.http.post<any>(AppSettings.API_DASHBOARD_SUBMIT, jsonData, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
      );
}

  private updateTokenFromHeaders(res: HttpResponse<any>): void {
    const auth = res.headers.get('Authorization');
    const authKey = res.headers.get('Authorizationkey');

    if (auth && authKey) {
      AppSettings.authorization = auth;
      AppSettings.authorizationkey = authKey;
      this.commonService.updatetoken(auth, authKey);
    }
  }
}