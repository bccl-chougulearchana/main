import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map, finalize } from 'rxjs';
import { LoaderService } from '../../shared/shared-services/loader.service'; 
import { CommonService } from '../../core/services/common.service'; 
import { AppSettings } from '../../core/modals/appsettings'; 

@Injectable({
  providedIn: 'root'
})
export class GovernanceCodeService {

  constructor(
    private http: HttpClient,
    private loaderService: LoaderService,
    private commonService: CommonService
  ) {}

  getCheckSCore(): Observable<any> {
    this.loaderService.show();

    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });

    return this.http
      .post<any>(AppSettings.API_CHECK_SCORE, {}, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  getQuizListData(): Observable<any> {
    this.loaderService.show();

    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue
    });

    return this.http
      .post<any>(AppSettings.API_QUIZ_DATA, {}, {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
        finalize(() => this.loaderService.hide())
      );
  }

  submitScoreData(
    quizquesansList: string[],
    startTime: string | null,
    endTime: string | null
  ): Observable<any> {

    this.loaderService.show();

    const auth = this.commonService.gettoken();
    const headers = new HttpHeaders({
      Authorization: auth.value,
      Authorizationkey: auth.keyvalue,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    let params = new HttpParams();
    quizquesansList.forEach(v => {
      params = params.append('optionslist', v);
    });

    params = params
      .append('stime', startTime ?? '')
      .append('etime', endTime ?? '');

    return this.http
      .post<any>(AppSettings.API_SUBMIT_SCORE, params.toString(), {
        headers,
        withCredentials: true,
        observe: 'response'
      })
      .pipe(
        map((res: HttpResponse<any>) => {
          this.updateTokenFromHeaders(res);
          return res.body;
        }),
        finalize(() => this.loaderService.hide())
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