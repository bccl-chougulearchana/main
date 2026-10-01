import { Component, ViewChild, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

declare var require: any;
declare var $: any;

@Component({
  selector: 'app-errorexit',
  templateUrl: './errorexit.component.html',
  styleUrls: ['./error-exit.component.css']

})
export class ErrorExitComponent  implements OnInit {
 
  errorMsg:string ='';
  constructor( private route: ActivatedRoute) {
  }

  ngOnInit() {

    this.route.params.subscribe(params => {
      let val = params['val'];
      val= val.trim();

      if(val == '1' || val == undefined || val == '' || val == null){
        this.errorMsg = 'You are not authorised to access this application.';
      } else {
        this.errorMsg = 'You session has expired, please click on the link to access the application.';
      }
    });
  }
}