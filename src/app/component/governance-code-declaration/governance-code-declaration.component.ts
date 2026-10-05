import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
declare var $: any;
import { DomSanitizer } from "@angular/platform-browser";
import { CommonService } from '../../core/services/common.service';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { AutheticationService } from '../../services/auth/authetication.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-governance-code-declaration',
  templateUrl: './governance-code-declaration.component.html',
  standalone: true,
  imports: [RouterOutlet,CommonModule,ReactiveFormsModule,FormsModule],
  styleUrls: ['./governance-code-declaration.component.css']
})
export class GovernanceCodeDeclarationComponent implements OnInit {
  empDetail: any
  startPage: boolean = false;
  compliancePage: boolean = false;
  openCommonNewUrl: any;
  roleList: any = [];
  roleIDvalue: any;
  constructor(private commonservice: CommonService, private loaderService: LoaderService, private route: Router,
    private _service: AutheticationService,
    public sanitizer: DomSanitizer, private router: Router) {
    this.commonservice.showHeaderComponents();
  }

  ngOnInit() {
    this.getEmpDetails();
    this.startPage = true;
  }

  getEmpDetails() {
    this.empDetail = this.commonservice.getEmpDetails();
  }
  Continue() {
    $('#confirm_Policy').modal('show');
  }
  readPolicy() {
    $('#confirm_Policy').modal('hide');
    this.startPage = false;
    //this.compliancePage=true;  checkrolemenu() {
    this._service.checkrolemenu().subscribe(
      (result: any) => {
        this.roleIDvalue = result[0].roleId;
        if (this.roleIDvalue == 1) {
          this.router.navigate(['/portal/govdeclarationmycompliancecode']);
        }
        else if (this.roleIDvalue == 2) {
          this.router.navigate(['/portal/viewcompliancecode']);
        }
      });

  }
  cancelBox() {
    $('#confirm_Policy').modal('hide');
  }
  commonRedirect(eValue: any) {
    this.openCommonNewUrl = eValue;

    this._service.getConfigData().subscribe(
      (res: any) => {
        if (eValue == 'GP') {
          this.openCommonNewUrl = res.GiftPolicy;
        }
        else if (eValue == 'WBP') {
          this.openCommonNewUrl = res.WhistleBlowerPolicy;
        }
        else if (eValue == 'PIT') {
          this.openCommonNewUrl = res.ENILCodePIT;
        }
        else if (eValue == 'CBP') {
          this.openCommonNewUrl = res.COEBP;
        }
        else if (eValue == 'COE') {
          this.openCommonNewUrl = res.COE;
        }
        else if (eValue == 'BCE') {
          this.openCommonNewUrl = res.BCOE;
        }
        else if (eValue == 'POSH') {
          this.openCommonNewUrl = res.POSHPolicy;
        }
        window.open(this.openCommonNewUrl, '_blank');
      }
    )
  }
  openGCodeVideoIframe() {
    this._service.getConfigData().subscribe(
      (res: any) => {
        var videoSource = res.GuidetoCodedeclaration;
        $("#GCodeVideo").attr("src", videoSource);
        $("#GCodeVideo")[0].play();

        $("#showGCodeVideo").modal("show");
        $("#showGCodeVideo").unbind("shown.bs.modal");
        $("#showGCodeVideo").on("shown.bs.modal", function () {
        });
        $("#showGCodeVideo").unbind("hidden.bs.modal");
        $("#showGCodeVideo").on("hidden.bs.modal", function () {
          $("#GCodeVideo")[0].pause();
          $("#GCodeVideo").attr("src", "");
        },
        );


      });
  }
}
