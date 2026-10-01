import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AutheticationService } from '../../../services/auth/authetication.service';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../core/services/common.service';
@Component({
  selector: 'app-forgot-pass',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './forgot-pass.component.html',
  styleUrl: './forgot-pass.component.scss'
})
export class ForgotPassComponent {

  safeSrc!: SafeResourceUrl;
  load = true;
  loadcount: number = 0;
  //   // "forgotPasswordBaseUrl":"https://transmutesanction.timesgroup.com/",  // add in /assets/configdata/appconfig.json




  constructor(
    private _service: CommonService, private sanitizer: DomSanitizer) {
    this._service.getConfigData().subscribe((res:any): void => {
      if (res != null && res != undefined && res.forgotPasswordBaseUrl != null && res.forgotPasswordBaseUrl != undefined) {
        let forgotPasswordBaseUrl = res.forgotPasswordBaseUrl;

        this.safeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(forgotPasswordBaseUrl);

      }
    }, error => {
      //hander error here.
    }
    );



  }



  onload(evt: any) {

    if (evt.target.src != '') {
      if (this.load) {
        // $('.itiFrame').removeClass("active");

        this.load = false;


      }
      else {


        // $('.itiFrame').addClass("active");
        this.load = false;

      }

    }
  }
  ngOnInit() { }

}
