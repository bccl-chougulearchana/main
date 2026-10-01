import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
// import { UiDirectivesModule } from '../../projects/bccl-library/src/public-api';
import { UiDirectivesModule } from 'toi-libraries'
import { LoaderService } from './shared/shared-services/loader.service';
import { CommonDialogService } from './shared/shared-services/common-dialog.service';
import { CommonModule } from '@angular/common';
import { AutoLogoutService } from './services/auth/auto-logout.service';
// import { AnalyticsService } from './core/services/analytics.service';
import { CommonService } from './core/services/common.service';
import { UtilityService } from './shared/shared-services/utility.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, UiDirectivesModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'timescapenu';
    private destroy$ = new Subject<void>();
  constructor(
    public loaderService: LoaderService,
    private logout: AutoLogoutService,
    private router: Router,
    private dialogService: CommonDialogService,
    // private analytics: AnalyticsService,
    private commonservice: CommonService,
    private utility: UtilityService,
    vcr: ViewContainerRef,
  ) {
    this.dialogService.setViewContainerRef(vcr);

  }
  
  ngOnInit(): void {

    // 🔹 Admin setup (runs once)
    const emailId = localStorage.getItem('emailId');
    if (emailId) {
      this.commonservice.getConfigData().subscribe(config => {
        const isAdmin = config.admin.includes(emailId);
        this.utility.setAdminState(isAdmin);
      });
    }

    // 🔹 AUTO LOGOUT START / STOP (ONLY ON NAVIGATION END)
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.router.url.startsWith('/portal')) {
          this.logout.startAutoLogout();   // ✅ guarded inside service
        } else {
          this.logout.stopAutoLogout();    // ✅ important
        }

      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}