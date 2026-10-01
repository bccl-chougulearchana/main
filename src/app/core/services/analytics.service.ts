import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // constructor(private router: Router) {
  //   this.router.events.pipe(
  //     filter(event => event instanceof NavigationEnd)
  //   ).subscribe((event: any) => {
  //     gtag('config', 'G-XXXXXXXXXX', {
  //       page_path: event.urlAfterRedirects
  //     });
  //   });
  // }
}
