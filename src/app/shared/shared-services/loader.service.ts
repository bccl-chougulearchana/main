import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { LoaderState } from './loader'
@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loading = new BehaviorSubject<boolean>(false);
  loading$ = this.loading.asObservable();

    private loaderSubject = new Subject<LoaderState>();
    private loaderSubjectNew = new Subject<LoaderState>();

    loaderState = this.loaderSubject.asObservable();
    
    loaderStateNew = this.loaderSubjectNew.asObservable();
  show() {
    setTimeout(() => this.loading.next(true));
  }

  hide() {
    setTimeout(() => this.loading.next(false));
  }
  hideNew() {
        this.loaderSubjectNew.next(<LoaderState>{show: false});
    }
}
