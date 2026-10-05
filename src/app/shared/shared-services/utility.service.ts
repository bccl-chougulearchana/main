import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { SharedApiService } from './shared-api.service';
import { AppSettings } from '../../core/modals/appsettings';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private cache: any = null; // Cached API data
  private cacheTime: number = 0; // Timestamp in milliseconds
  // private cacheDuration = 30 * 60 * 1000; // 30 minutes in ms
  // private cacheDuration = 1 * 60 * 1000; // 1 minute in milliseconds
  private cacheDuration = AppSettings.contentRefreshTimeInMinutes * 60 * 1000;

  private dataSubject = new BehaviorSubject<any>(null); // For reactive updates
  data$: Observable<any> = this.dataSubject.asObservable();

   private empDataSubject = new BehaviorSubject<any>(null); 
  empData$: Observable<any> = this.empDataSubject.asObservable();

  private iframeUrlSource = new BehaviorSubject<string | null>(null);
  iframeUrl$ = this.iframeUrlSource.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  isAdmin$ = this.isAdminSubject.asObservable();

  private alertsSubject = new BehaviorSubject<any | null>(null);
  alerts$ = this.alertsSubject.asObservable();

   private alertSubject = new BehaviorSubject<any | null>(null);
  alert$ = this.alertSubject.asObservable();
  
  private notificationsSubject = new BehaviorSubject<any| null>(null);
  notifications$ = this.notificationsSubject.asObservable();

  private notificationSubject = new BehaviorSubject<any| null>(null);
  notification$ = this.notificationSubject.asObservable();

   selectedSociety: string | null = null;
  constructor(private sharedApiService: SharedApiService) { };

  setempData(value: any) {
    this.empDataSubject.next(value);
  }

  getPostedStories() {
    const now = Date.now();
    // console.log('Now', now);
    if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
      this.dataSubject.next(this.cache);
    } else {
      this.sharedApiService.getPostedStories().pipe(tap((data) => {
        this.cache = data;
        this.cacheTime = Date.now();
        this.dataSubject.next(data);
      })).subscribe();
    }
  }

  /** Optional: Force refresh manually */
  refreshHomeCarousel(): void {
    this.cacheTime = 0;
    // this.homeCarouselApi();
  }

  setIframeUrl(url: string | null) {
    this.iframeUrlSource.next(url);
  }

  setAlerts(val:any) {
    this.alertsSubject.next(val);
  }
  getAlerts() {
    return this.alertsSubject.value;
  }
  setAlert(val:any) {
    this.alertSubject.next(val);
  }
  getAlert() {
    return this.alertSubject.value;
  }

  setNotifications(val:any) {
    this.notificationsSubject.next(val);
  }
    getNotifications() {
    return this.notificationsSubject.value;
  }
    setNotification(val:any) {
    this.notificationSubject.next(val);
  }
    getNotification() {
    return this.notificationSubject.value;
  }

  setAdminState(value: boolean) {
    this.isAdminSubject.next(value);
  }

  getAdminState(): boolean {
    return this.isAdminSubject.value;
  }

}
