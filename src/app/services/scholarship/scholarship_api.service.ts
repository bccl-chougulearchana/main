import { inject, Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { map, catchError, finalize } from 'rxjs/operators';
import { LoaderService } from '../../shared/shared-services/loader.service'; 
import { ScholarshipCommonService } from './shared/scholarship_common.service'; 
import { AppSettings } from '../../core/modals/appsettings';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: 'root'
})


export class ScholarshipApiService {

addEntry = AppSettings.API_ADDENTRY;
dublicateEntry = AppSettings.API_DUBLICATEENTRY;
uploadFilesWithForm = AppSettings.API_UPLOADFILEWITHFORM;
checkstatus = AppSettings.API_CHECKSTATUS;
generateCertificate = AppSettings.API_GENERATECERTIFICATE;
deleteFileWithForm = AppSettings.API_DELETEFILE;
downloadFileWithForm = AppSettings.API_DOWNLOADFILE;
uploadAttachFilesWithForm = AppSettings.API_UPLOADATTACHFILESWITHFORM;
checkRole = AppSettings.API_LISTROLE;
checkPendingRequest = AppSettings.API_CHECKPENDINGREQUEST;
updatePendingRequest = AppSettings.API_UPDATEPENDINGREQUEST;
showAcceptedList = AppSettings.API_SHOWACCEPTEDLIST;

private http = inject(HttpClient);

 constructor(private loaderService: LoaderService, private common: ScholarshipCommonService) {}

checkDuplicateEntry(body: HttpParams): Observable<any> {
  const headers = new HttpHeaders({ 
    'Content-Type': 'application/x-www-form-urlencoded' 
  });
  return this.http.post<any>(this.dublicateEntry, body, { headers });
}

submitScholarshipForm(valuesArray: any): Observable<any> {
  return this.http.post(this.addEntry, valuesArray); // adjust the URL accordingly
}


downloadCertificate(body: URLSearchParams): Observable<Blob> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  return this.http.post(this.generateCertificate, body.toString(), {
    headers,
    responseType: 'blob'
  });
}

// uploadAttachments(selectedFiles: any, applicationId?: string): Observable<any> {
//   const formData = new FormData();

//   if (selectedFiles['attachment1']) {
//     formData.append('file1', selectedFiles['attachment1']);
//   }
//   if (selectedFiles['attachment2']) {
//     formData.append('file2', selectedFiles['attachment2']);
//   }
//   if (selectedFiles['attachment3']) {
//     formData.append('file3', selectedFiles['attachment3']);
//   }
//   if (selectedFiles['attachment4']) {
//     formData.append('file4', selectedFiles['attachment4']);
//   }
//   if (selectedFiles['cheque']) {
//     formData.append('attachfile', selectedFiles['cheque']);
//     return this.http.post(this.uploadAttachFilesWithForm, formData);
//   }

//   // ✅ Optional applicationId
//   if (applicationId) {
//     formData.append('applicationId', applicationId  || '' );
//   }

//   return this.http.post(this.uploadFilesWithForm, formData);
// }
uploadAttachments(selectedFiles: any, applicationId?: string): Observable<any> {
  const formData = new FormData();

  if (selectedFiles['attachment1']) formData.append('file1', selectedFiles['attachment1']);
  if (selectedFiles['attachment2']) formData.append('file2', selectedFiles['attachment2']);
  if (selectedFiles['attachment3']) formData.append('file3', selectedFiles['attachment3']);
  if (selectedFiles['attachment4']) formData.append('file4', selectedFiles['attachment4']);
  formData.append('applicationId', applicationId ?? '');
  if (selectedFiles['cheque']) {
    formData.append('attachfile', selectedFiles['cheque']);
    return this.http.post(this.uploadAttachFilesWithForm, formData);
  }

  return this.http.post(this.uploadFilesWithForm, formData);
}

deleteFile(body: URLSearchParams): Observable<any>{
  return this.http.post(this.deleteFileWithForm, body.toString());
}

downloadFile(
  fileName: string,
  type: any = '',
  applicationId: any = '',
  flag :any =''
): Observable<HttpResponse<Blob>> {
  const encodedName = btoa(fileName || '');

  const params = new HttpParams()
    .set('fileName', encodedName)
    .set('type', type ?? '')
    .set('applicationId', applicationId ?? '')
    .set('flag', flag);

  return this.http.get(this.downloadFileWithForm, {
    params,
    responseType: 'blob' as 'json',   // 👈 required cast
    observe: 'response'
  }) as Observable<HttpResponse<Blob>>;  // 👈 final cast fixes typing
}




downloadCheque(fileName: string, type: any = '', applicationId: any = ''): Observable<HttpResponse<Blob>> {
  const encodedName = btoa(fileName || '');

  const params = new HttpParams()
    .set('fileName', encodedName)
    .set('type', type ?? '')
    .set('applicationId', applicationId ?? '');

  return this.http.get(this.downloadFileWithForm, {
    params,
    responseType: 'blob',
    observe: 'response'
  }).pipe(
    // ✅ Intercept and check for JSON error before returning
    map((response: HttpResponse<Blob>) => {
      const blob = response.body!;
      if (!blob) {
        throw new Error('Empty response from server.');
      }

      // Detect JSON (error payload)
      if (blob.type === 'application/json' || blob.type.startsWith('text/')) {
        return new Promise<HttpResponse<Blob>>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorJson = JSON.parse(reader.result as string);
              reject({
                message: errorJson.message || 'File not found.',
                success: false
              });
            } catch {
              reject({ message: 'Unexpected error while downloading the file.', success: false });
            }
          };
          reader.readAsText(blob);
        }) as unknown as HttpResponse<Blob>;
      }

      // ✅ Real file → return response as-is
      return response;
    }),
    catchError((err) => {
      console.error('DownloadFile error:', err);
      return throwError(() => err);
    })
  );
}




 deleteCheque (fileName: string, applicationID:string, controlName: string): Observable<any>{
  const encodedFileName = btoa(fileName);
    const body = new URLSearchParams();
    body.set('fileName', encodedFileName);
    body.set('type', 'attach');
    body.set('applicationID', applicationID);
    body.set('flag', controlName.toUpperCase());

    return this.http.post(this.deleteFileWithForm,
    body.toString());
 }

 checklist() {
   return this.http.post<any[]>(this.checkRole, '');
 }

 getPendingRequest(cycleStartDate:any, year:any, month:any ){
   const params = new HttpParams()
    .set('cycleStartDate', cycleStartDate)
    .set('year', year)
    .set('month', month);
  return this.http.post<any[]>(this.checkPendingRequest, params.toString());
 }

  getAcceptedList(plan:any, cycleStartDate:any, ){
   const params = new HttpParams()
   .set('plan', plan)
    .set('cycleStartDate', cycleStartDate)
  return this.http.post<any[]>(this.showAcceptedList, params.toString());
 }

 updatePending(applicationId:any, status:any, remarks:any, prevStatus:any ){
    const params = new HttpParams()
    .set('applicationId', applicationId)
    .set('status', status)
    .set('schemeCount', "0")
    .set('remarks', remarks || 'NA')
    .set('prevStatus', prevStatus);
  return this.http.post<any[]>(this.updatePendingRequest, params.toString());
 }

  getDetailsByTOID() {
    return this.http.post<any[]>(this.checkstatus, '');
  }


}
