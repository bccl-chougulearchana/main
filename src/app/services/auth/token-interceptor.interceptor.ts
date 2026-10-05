import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { catchError, throwError, window } from 'rxjs';
import { Router } from '@angular/router';
import { AutheticationService } from './authetication.service';
import { UtilityService } from '../../shared/shared-services/utility.service';


export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const common = inject(CommonService);
  const auth = inject(AutheticationService);

  if (req.url.includes('/login')) {
    return next(req);
  }
  
  const tokenData = common.gettoken();  
  const token = tokenData?.value;
  const authKey = tokenData?.keyvalue;
  
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `${token}`,
        ...(authKey && { Authorizationkey: authKey }),
      },
      withCredentials: true
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // if (error.status === 401 || error.status === 400 || error.status === 406 ) {
      //     auth.reloadHome();
      // } 
      return throwError(() => error);
    })
  );

};