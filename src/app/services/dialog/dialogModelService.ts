import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({providedIn:'root'})
export class DialogModelService {
  
  private componentMethodCallSource = new Subject<any>();
  private componentMethodCallSourceServiceError = new Subject<any>();
  
  // Observable string streams
  componentMethodCalled$ = this.componentMethodCallSource.asObservable();
  componentMethodCallSourceServiceError$ = this.componentMethodCallSourceServiceError.asObservable();


  // Service message commands
  callComponentMethod(model:any)  {
    this.componentMethodCallSource.next(model);    
  }

  showServiceErrorModal(model:any)
  {
    this.componentMethodCallSourceServiceError.next(model);
  }

}
