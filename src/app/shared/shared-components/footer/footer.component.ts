// import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { UtilityService } from '../../shared-services/utility.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  isAtTop = true; // default: fixed at top
  isHomeRoute = false; // for route detection
  isStaticFooter = false;
  constructor(private router: Router, private utility: UtilityService) {}
  ngOnInit() {
    const currentUrl = this.router.url;
  this.isHomeRoute = currentUrl === '/portal/home';
  this.utility.iframeUrl$.subscribe(url => {
    this.isStaticFooter = !!url;
  });

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      const currentUrl = event.urlAfterRedirects;
      this.isHomeRoute = currentUrl === '/portal/home';
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    const atTop = scrollTop === 0;
    const atBottom = windowHeight + scrollTop >= docHeight - 5;

      // ✅ Case 1: On home route
  if (this.isHomeRoute) {
    // If iframe active → always static
    if (this.isStaticFooter) {
      this.isAtTop = false;
      return;
    }

    // If iframe not active → non-static only when at top
    this.isAtTop = atTop;
    return;
  }

  // ✅ Case 2: All other routes → always static
  this.isAtTop = false;
  }
}