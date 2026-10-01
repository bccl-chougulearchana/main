// import { HttpInterceptorFn } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { inject } from '@angular/core';
// import { catchError, throwError } from 'rxjs';
// import { HttpErrorResponse } from '@angular/common/http';
// import { UtilityService } from '../../shared/shared-services/utility.service';

// export const errorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const utility = inject(UtilityService);
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
       
//       switch (error.status) {
//         case 404:
//           router.navigate(['/errorpage/404']);
//           break;

//         case 403:
//           router.navigate(['/errorpage/403']);
//           break;

//         case 500:
//           router.navigate(['/errorpage/500']);
//           break;
        
//         case 503:
//           router.navigate(['/errorpage/503']);
//           break;

//         case 0:
//             if (!router.url.startsWith('/error')) {
//                 router.navigate(['/errorpage/500']);
//             }
            
//             break;

//         // default:
//         //  utility.setIframeUrl('/errorpages/under-maintenance.html');
//       }

//       return throwError(() => error);
//     })
//   );
// };
