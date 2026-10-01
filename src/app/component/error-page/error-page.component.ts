import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.scss']
})
export class ErrorPageComponent implements OnInit {

  htmlContent: SafeResourceUrl | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
     private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const file = this.route.snapshot.data['file']; 

    this.http.get(`asset/errorpages/${file}`, { responseType: 'text' })
   .subscribe(html => {
        html = html.replace(
      /href="([^"]+\.css)"/g,
      'href="asset/errorpages/$1"'
    );

      this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(html);})
  
  }

  /** Intercept Home link inside the static HTML */
  handleClick(event: any) {
    if (event.target.tagName === 'A') {
      const href = event.target.getAttribute('href');
      
      // Handle your "Home" links here
      if (href === '/' || href === '/home' || href === 'home' || href === '#home') {
        event.preventDefault();
        this.router.navigate(['/portal/home']); 
      }
    }
  }
}
