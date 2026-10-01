import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../core/services/common.service';
import { CommonModule } from '@angular/common';
import { UtilityService } from '../../shared/shared-services/utility.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-service-desk',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-desk.component.html',
  styleUrl: './service-desk.component.scss'
})
export class ServiceDeskComponent implements OnInit{
 loginId: any = '';
 pageTitle = '';
  serviceDeskList: any[] = [];

  constructor(private common: CommonService, private utility: UtilityService, private router: Router) {}

  ngOnInit(): void {
    this.loginId = localStorage.getItem("portalId");
    this.loadConfig();
  }

  loadConfig() {
    this.common.helpdeskConfig().subscribe({
      next: (res) => {
        this.pageTitle = res?.serviceDeskConfig?.pageTitle || '';
        this.serviceDeskList = res?.serviceDesk?.filter(
          (item: any) => item.visible
        );
      },
      error: (err) => {
        console.error('Failed to load Service Desk config', err);
      }
    });
  }

  
openLinkTest(item: any) {
  if (!item) {
    return;
  }

  const route = typeof item.route === 'string' ? item.route.trim() : '';

  if (route) {
    this.utility.setIframeUrl(null);
    this.router.navigateByUrl(route);
    return;
  }

  let url = item.url;
  let openInIframe = item.internalExternalCon;
  let applName = item.quickName;

  if (!url || url.trim() === '') {
    console.warn('Empty URL — skipping navigation.');
    return;
  }

  let finalUrl = url;

  // ✅ Only add tdata if quickName (applName) is present
  if (applName && applName.trim() !== '') {

    // 👇 Shape matches your earlier decoding:
    // usr_reference, usr_application, usr_email
    const tdataObj = {
      applName: applName || '',
      loginId: this.loginId || ''
    };

    // Base64 encode
    const encoded = btoa(JSON.stringify(tdataObj));

    // Extra safety: URL-encode the base64 (because of + / =)
    const safeEncoded = encodeURIComponent(encoded);

    finalUrl = `${url}${url.includes('?') ? '&' : '?'}tdata=${encoded}`;
  }
// console.log(finalUrl);
  if (openInIframe) {
    // 🔹 Open inside main layout’s iframe
    this.utility.setIframeUrl(finalUrl);
  } else {
    // 🔹 Open externally in a new tab
    window.open(finalUrl, '_blank');
  }
}


}
