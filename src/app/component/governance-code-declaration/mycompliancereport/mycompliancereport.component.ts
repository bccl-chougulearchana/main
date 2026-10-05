import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../core/services/common.service';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { AutheticationService } from '../../../services/auth/authetication.service';
import { CommonModule } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-mycompliancereport',
  templateUrl: './mycompliancereport.component.html',
  standalone:true,
  styleUrls: ['./mycompliancereport.component.css'],
  imports:[CommonModule]
})
export class MycompliancereportComponent implements OnInit {
  roleList: any = [];
  totalSubCountData: any=[];
  tempcountlist: Array<totalcountList> = [];
  noofuser: number=0;
  constructor(private commonservice: CommonService, private loaderService: LoaderService, private route: Router, private _service: AutheticationService) { 
    this.commonservice.showHeaderComponents();
  }

  ngOnInit() {
    $("#reportPage").css('display','block')
    $("#viewPage").css('display','none')
    this.checkrolemenu();
    setTimeout(() => {
      $("#govcodeId1").addClass('active');
    }, 100);
  }
  checkrolemenu() {
    this._service.checkrolemenu().subscribe(
      result => {
        this.roleList = result[0].data;
        this.subReportData();
        // role 1 - user ,role 2 - manager
      }),
      (err:any) => {
      }
  }
  govcodetabclick(rolename:any)
  {
      if(rolename == "MY CODE COMPLIANCE")
      {
        this.route.navigate(['/govcodedeclaration/Mycompliancereport']);
      }
      else if(rolename == 'REPORT')
      {
        this.route.navigate(['/govcodedeclaration/mycompliancereport']);
      }
      else if(rolename == "VIEW COMPLIANCE")
      {
        this.route.navigate(['/portal/viewcompliancecode']);
      }
      this.subReportData();
  }

  subReportData()
  {
    this.tempcountlist=[];
    this._service.totalSubordinateCount().subscribe(
      (result:any) => {
        this.totalSubCountData = result[0].data;
        console.log(this.totalSubCountData,'totalSubCountData');
        let tempList = new totalcountList();
        for(var i=0;i<this.totalSubCountData.length;i++)
        {
          tempList = new totalcountList();
          if(tempList.functionHead=="")
          {
            if(tempList.functionHead != this.totalSubCountData[i][2])
            {
              tempList.functions = this.totalSubCountData[i][0];
              tempList.functionHead=this.totalSubCountData[i][2];
              this.noofuser = 0;
             for(var j=0;j<this.totalSubCountData.length;j++)
             {
              var functionhead=this.totalSubCountData[j][2];
              if(tempList.functionHead == functionhead)
              {
                tempList.totalnoofusers = tempList.totalnoofusers + parseInt(this.totalSubCountData[j][5]);
             
              }
              if(this.totalSubCountData[j][3] == 'C')
              {
                tempList.signedOff = tempList.signedOff + parseInt(this.totalSubCountData[j][5]);
              }
              if(this.totalSubCountData[j][4]=='Y')
              {
                tempList.complied= tempList.complied + parseInt(this.totalSubCountData[j][5]);
              }
              if(this.totalSubCountData[j][3] == 'I' && this.totalSubCountData[j][4] == 'N')
              {
                tempList.notsignedOff= tempList.notsignedOff +  parseInt(this.totalSubCountData[j][5]);
              }
              if(this.totalSubCountData[j][4] == 'N' && this.totalSubCountData[j][3] != 'I')
              {
                tempList.notcomplied= tempList.notcomplied + parseInt(this.totalSubCountData[j][5]);
              }
             }
             this.tempcountlist.push(tempList);
             break
            }
          }
         
      
         
        }
      }),
      (err:any) => {
        this.loaderService.hide();
      }
  }
}
export class totalcountList {
  functions: any;
  functionHead: any="";
  totalnoofusers:number=0;
  signedOff:number=0;
  notsignedOff:number=0;
  complied:number=0;
  notcomplied:number=0;
  constructor() {

  }
}
