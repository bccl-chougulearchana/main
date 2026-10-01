import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppSettings } from '../../core/modals/appsettings';

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

  pollSummary(){
    const url = AppSettings.API_GETPOLLSUMMARY;
    return this.http.post(url, '');
  }

  pollStatus(){
    const url = AppSettings.API_CHECKPOLLSTATUS;
    return this.http.post(url, '');
  }

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

  getMyStories(cat: string, owner: string) {
    const params = new HttpParams()
      .set('category', cat)
      .set('ownership', owner);
    return this.http.post<any[]>(AppSettings.API_GETALLOWNERSHIPSTORIES, params);
  }

  getLikeBy(postId: any , action = 'getLikes', cat: string , header:string) {
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
  updateContentStatus(cat: string, fileName: string, newStatus:string, Id: string): Observable<any> {
     const params = new HttpParams()
      .set('category', cat)
      .set('fileName', fileName)
      .set('newStatus', newStatus)
      .set('contentId', Id)
    return this.http.post<any[]>(AppSettings.API_UPDATESTORYSTATUS, params);
  }

}
