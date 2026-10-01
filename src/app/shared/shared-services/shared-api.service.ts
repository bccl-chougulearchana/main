import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../../core/modals/appsettings';
import { DelhiAssoStateMAccReqModel, HospitalizationReqModel, MumbaiAssoSavingAccReqModel, ViewPoliciesReqModel } from '../../core/modals/employee-details';

@Injectable({
  providedIn: 'root'
})
export class SharedApiService {

  constructor(private http: HttpClient) { }

  vcoTextFetch() {
    const vcoTextUrl = AppSettings.vcoTextUrl;
    return this.http.get(vcoTextUrl, { responseType: 'text' });
  }

  // homeCarouseApi() {
  //   const url = 'https://dog.ceo/api/breeds/image/random';
  //   return this.http.get(url);
  // }

  // quickLinksLoad(params: any) {
  //   const url = 'https://wsqa.timesgroup.com/timescape/login/jiffyAppsController2.jsp';
  //   return this.http.post(url, params);
  // }

  pollQuestionAnsFetch() {
    const url = AppSettings.API_GETPOLLDETAILS;
    return this.http.post(url, '');
  }

  pollQuestionAnsSubmit(pollId: string, pollSelectedId: string) {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    const url = AppSettings.API_RECORDPOLLRESPONSE;
    const body = new URLSearchParams();
    body.set('pollId', pollId);
    body.set('option', pollSelectedId);
    return this.http.post(url, body, { headers });
  }

  pollSummary() {
    const url = AppSettings.API_GETPOLLSUMMARY;
    return this.http.post(url, '');
  }

  pollStatus(){
    const url = AppSettings.API_CHECKPOLLSTATUS;
    return this.http.post(url, '');
  }
  // pollStatus() {
  //   const token = localStorage.getItem('currentUser');
  //   const authorizationKey = localStorage.getItem('currentUserkey');

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': token || '',
  //     'Authorization-Key': authorizationKey || ''
  //   });

  //   return this.http.post(
  //     AppSettings.API_CHECKPOLLSTATUS,
  //     {},
  //     {
  //       headers,
  //       withCredentials: true
  //     }
  //   );
  // }

  submitStoryForm(formData: FormData): Observable<any> {
    return this.http.post<any>(AppSettings.API_POSTEDSTORIES, formData, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    });
  }

  getPostedStories(): Observable<any> {
    return this.http.post<any[]>(AppSettings.API_GETALLSTORIES, '');
  }
  getalerts(): Observable<any> {
    return this.http.post<any[]>(AppSettings.API_GETALERTS, '');
  }
  getnotices(): Observable<any> {
    return this.http.post<any[]>(AppSettings.API_GETNOTICES, '');
  }

  // getnotices(): Observable<any> {
  //   const token = localStorage.getItem('currentUser');
  //   const authorizationKey = localStorage.getItem('currentUserkey');

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Authorization': token || '',
  //     'Authorization-key': authorizationKey || ''
  //   });

  //   return this.http.post<any>(
  //     AppSettings.API_GETNOTICES,
  //     {},
  //     {
  //       headers,
  //       withCredentials: true
  //     }
  //   );
  // }
  getMyStories(cat: string, owner: string) {
    const params = new HttpParams()
      .set('category', cat)
      .set('ownership', owner);
    return this.http.post<any[]>(AppSettings.API_GETALLOWNERSHIPSTORIES, params);
  }

  getLikeBy(postId: any, action = 'getLikes', cat: string, header: string) {
    const params = new HttpParams()
      .set('postId', postId)
      .set('action', action)
      .set('category', cat)
      .set('header', header)

    return this.http.post<any[]>(AppSettings.API_GETLIKEBY, params);
  }

  postVisit(postId: any, cat: string, header: string, createdBy = 'NA') {
    const params = new HttpParams()
      .set('postId', postId)
      .set('category', cat)
    //  .set('postHeader', header)
    //  .set('createdBy', createdBy || 'NA')

    return this.http.post<any[]>(AppSettings.API_VISIT, params);
  }

  downloadReport(): Observable<any> {
    return this.http.post<any[]>(AppSettings.API_DOWNLOADREPORT, '');
  }
  updateContentStatus(cat: string, fileName: string, newStatus: string, Id: string): Observable<any> {
    const params = new HttpParams()
      .set('category', cat)
      .set('fileName', fileName)
      .set('newStatus', newStatus)
      .set('contentId', Id)
    return this.http.post<any[]>(AppSettings.API_UPDATESTORYSTATUS, params);
  }

  mycompfreq() {
    return this.http.post<any>(AppSettings.API_MY_COMP_FREQ, {});
  }


  viewpolicies(viewPoliciesReq: ViewPoliciesReqModel) {
    const body = new HttpParams()
      .set('frequency', viewPoliciesReq.frequency)
      .set('role', viewPoliciesReq.role)
      .set('status', viewPoliciesReq.status)
      .set('date', viewPoliciesReq.date)
      .toString();
    return this.http.post<any>(AppSettings.API_VIEW_POLICIES, body);
  }

  eurekafile(file: any) {
    return this.http.post<any>(AppSettings.API_TIME_EUREKA_SUBMIT_FILE, file);
  }

  insertfeedback(insertfeedbackReq: any) {
    return this.http.post<any>(AppSettings.API_INSERT_FEEDBACK, insertfeedbackReq);
  }

  alltransactions() {
    return this.http.post<any>(AppSettings.API_ALL_TXN, '');
  }
  gettransmonth() {
    return this.http.post<any>(AppSettings.API_TXN_MNTH, '');
  }

  getmemberbalance() {
    return this.http.post<any>(AppSettings.API_MEMBER_BALANCE, '');
  }

  getransact(mumbaiAssoSavingAcc: MumbaiAssoSavingAccReqModel) {
    const body = new HttpParams()
      .set('fromDate', mumbaiAssoSavingAcc.fromDate)
      .set('toDate', mumbaiAssoSavingAcc.toDate)
      .set('tempSapNo', mumbaiAssoSavingAcc.tempSapNo)
      .toString();
    return this.http.post<any>(AppSettings.API_TRANSACT, body);
  }
  // getransact(mumbaiAssoSavingAcc: MumbaiAssoSavingAccReqModel) {
  //   const body = new HttpParams()
  //     .set('fromDate', mumbaiAssoSavingAcc.fromDate)
  //     .set('toDate', mumbaiAssoSavingAcc.toDate)
  //     .set('tempSapNo', mumbaiAssoSavingAcc.tempSapNo)
  //     .toString();

  //   const token = localStorage.getItem('currentUser');
  //   const authorizationKey = localStorage.getItem('currentUserkey');

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Authorization': token || '',
  //     'Authorization-Key': authorizationKey || ''
  //   });

  //   return this.http.post<any>(
  //     AppSettings.API_TRANSACT,
  //     body,
  //     {
  //       headers,
  //       withCredentials: true
  //     }
  //   );
  // }

  getmembertrans(delhiSociAccState: DelhiAssoStateMAccReqModel) {
    const body = new HttpParams()
      .set('fromDate', delhiSociAccState.fromDate)
      .set('toDate', delhiSociAccState.toDate)
      .toString();
    return this.http.post<any>(AppSettings.API_MEMBER_TRANSACT, body);
  }

  allforms() {
    return this.http.post<any>(AppSettings.API_GET_FILES_LIST, {});
  }

  file(fileName: string) {
    const body = new HttpParams()
      .set('fileName', fileName).toString();
    return this.http.post<any>(AppSettings.API_GET_IMAGE, body);
  }

  getVendorData(search: string): Observable<any> {
    const body = new HttpParams()
      .set('searchText', search)
      .toString();
    return this.http.post<any>(AppSettings.API_VENDOR_LOCATOR, body);
  }

  // getVendorData(search: string): Observable<any> {
  //   const body = new HttpParams()
  //     .set('searchText', search)
  //     .toString();

  //   const token = localStorage.getItem('currentUser');
  //   const authorizationKey = localStorage.getItem('currentUserkey');

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Authorization': token || '',
  //     'Authorization-Key': authorizationKey || ''
  //   });

  //   return this.http.post<any>(
  //     AppSettings.API_VENDOR_LOCATOR,
  //     body,
  //     {
  //       headers,
  //       withCredentials: true
  //     }
  //   );
  // }

  informColleagues(searchString: string): Observable<any> {
    const body = new HttpParams()
      .set('searchText', searchString)
      .toString();
    return this.http.post<any>(AppSettings.API_TIME_LEAVE_INFORM_COLLEAGUES, body)
  }

  getPOData(search: string): Observable<any> {
    const body = new HttpParams()
      .set('searchText', search)
      .toString();
    return this.http.post<any>(AppSettings.API_REQUISITIONER_LOCATOR, body);
  }
  // getPOData(search: string): Observable<any> {
  //   const body = new HttpParams()
  //     .set('searchText', search)
  //     .toString();

  //   const token = localStorage.getItem('currentUser');
  //   const authorizationKey = localStorage.getItem('currentUserkey');

  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Authorization': token || '',
  //     'Authorization-Key': authorizationKey || ''
  //   });

  //   return this.http.post<any>(
  //     AppSettings.API_REQUISITIONER_LOCATOR,
  //     body,
  //     {
  //       headers,
  //       withCredentials: true
  //     }
  //   );
  // }

  hospitalizationSubmitApi(hospitalObj: HospitalizationReqModel) {
    const body = new HttpParams()
      .set('memberId', hospitalObj.memberId)
      .set('hospitalname', hospitalObj.hospitalname)
      .set('patientName', hospitalObj.patientName)
      .set('phoneNumber', hospitalObj.phoneNumber)
      .set('reason', hospitalObj.reason)
      .set('dateofadmission', hospitalObj.dateofadmission)
      .set('recipientsMailId', hospitalObj.recipientsMailId)
      .toString();
    return this.http.post<any>(AppSettings.API_TIME_HOSPITALIZATION, body);
  }


}
