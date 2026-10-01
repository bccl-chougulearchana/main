import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AutheticationService } from './authetication.service';
import { CommonService } from '../../core/services/common.service';

const CHECK_INTERVAL = 1000; // 1 sec
const STORE_KEY = 'lastAction';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {

  // private router = inject(Router);
  private auth = inject(AutheticationService);
  private ngZone = inject(NgZone);
  private sessionTrackingActive = false;
  private sessionExpired = false;
  private intervalRef: any;
  private timeoutMinutes = 15; // default fallback
  constructor(private common: CommonService) {}


startAutoLogout(): void {
  if (this.sessionTrackingActive) return;
  
  this.sessionExpired = false; 
  this.sessionTrackingActive = true;
  this.loadConfigAndStart();
}


stopAutoLogout(): void {
  this.sessionTrackingActive = false;
  if (this.intervalRef) {
    clearInterval(this.intervalRef);
    this.intervalRef = null;
  }
  localStorage.removeItem('lastAction');
  // console.log("stopped");
}

  /** Load timeout from config file before starting the inactivity tracker */
  private loadConfigAndStart(): void {
    this.common.getConfigData().subscribe({
      next: (config: any) => {
     const val = config?.ideal_session_timeout_in_minutes;

        // Convert string → number safely
        const parsed = Number(val);

        // Validate parsed value
        if (!isNaN(parsed) && parsed > 0) {
        this.timeoutMinutes = parsed;
        }

        console.log("⏱ Auto-logout timeout (minutes):", this.timeoutMinutes);

        // Start session tracking AFTER config is loaded
        this.reset();
        this.initListeners();
        this.initInterval();
      },
      error: () => {
        // even if config fails, start with fallback timeout
        this.reset();
        this.initListeners();
        this.initInterval();
      }
    });
  }

  get lastAction(): number {
    return Number(localStorage.getItem(STORE_KEY)) || Date.now();
  }

  set lastAction(value: number) {
    localStorage.setItem(STORE_KEY, value.toString());
  }

  private initListeners(): void {
    this.ngZone.runOutsideAngular(() => {
      const resetFn = () => this.reset();

      window.addEventListener('click', resetFn);
      window.addEventListener('keydown', resetFn);
      window.addEventListener('mousemove', resetFn);
      window.addEventListener('scroll', resetFn);
      window.addEventListener('touchstart', resetFn);
    });
  }

  private initInterval(): void {
    this.ngZone.runOutsideAngular(() => {
      this.intervalRef = setInterval(() => this.check(), CHECK_INTERVAL);
    });
  }
  private stopInterval(): void {
  if (this.intervalRef) {
    clearInterval(this.intervalRef);
    this.intervalRef = null;
  }
}

  private reset(): void {
    this.lastAction = Date.now();
  }

private check(): void {
  if (this.sessionExpired) return;

  const now = Date.now();
  const timeout = this.lastAction + this.timeoutMinutes * 60 * 1000;

  if (now > timeout) {
    this.sessionExpired = true;  
    this.stopInterval();          
    this.ngZone.run(() => {
      console.log('♻️ Session expired – reload Home ONCE');
      this.auth.reloadHome();
    });
  }
}


}
