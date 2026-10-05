import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
declare var $: any;
import { DialogModelComponent } from '../../dialogModel/dialogModel.component';
import { DomSanitizer } from "@angular/platform-browser";
import { CommonModule, DatePipe } from '@angular/common';
import { AutheticationService } from '../../../services/auth/authetication.service';
import { CommonService } from '../../../core/services/common.service';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-viewcompliancecode',
  standalone:true,
  templateUrl: './viewcompliancecode.component.html',
  styleUrls: ['./viewcompliancecode.component.css'],
  imports:[RouterOutlet,DialogModelComponent,CommonModule,ReactiveFormsModule,FormsModule],
  providers: [DatePipe]
})
export class ViewcompliancecodeComponent implements OnInit {
  @ViewChild(DialogModelComponent) dialogBox!: DialogModelComponent;
  startPage: boolean = true
  roleIDvalue:any;
  roleList: any = [];
  listData: any = [];
  templistData: any = [];
  NextShow: boolean = true;
  PreviousShow: boolean = false;
  uniquemenuList: any[] = [];
  uniqueMenuData: any = [];
  menulistData: any = [];
  uniquemenuListdata: Array<uniqueData> = [];
  selectedCategory: any;
  notApplicableText: any;
  pageNo: any;
  finalsubmitShow: boolean = false;
  codecompliancequizPage: boolean = false;
  idvalue: any;
  userfeedbackList: any=[];
  tempuserfeedbackList:any=[];
  userfeedbackStatus: string='';
  NRstatus: boolean = false;
  userFdk: any;
  countervalueSave: any;
  notratedlist: any = [];
  unansweredList: any = [];
  counterValue: any = [];
  counterValueSubmit: any;
  categoryName: string='';
  editedCategoryText: any;
  NCdata:any;
  viewNCDetails: boolean = false;
  selectedDuration: any;
  selectedName: any;
  selectedQuestion:any;
  selectedRemarks:any;
  currYear: number=0;
  constructor(private commonservice: CommonService, private loaderService: LoaderService, private route: Router, private _service: AutheticationService,
    public sanitizer: DomSanitizer, private datePipe: DatePipe) {
      this.commonservice.showHeaderComponents();
     }

  ngOnInit() {
    $("#viewPage").css('display','block')
    $("#reportPage").css('display','none')
    this.checkrolemenu();
    this.startPage = false;
    this.viewapprvchklist();
    this.codecompliancequizPage = true;
    $(".InsideSecDiv").css('display', 'none');
      setTimeout(() => {
        $("#govcodeId0").addClass('active');
      }, 100);
  }
  checkrolemenu() {
    this._service.checkrolemenu().subscribe(
      result => {
        this.roleList = result[0].data;
        this.roleIDvalue = result[0].roleId;
        $(".QuizQuestionMainDivNC").css('display','none');
        // role 1 - user ,role 2 - manager
      }),
      (err:any) => {
      }
  }
  viewapprvchklist() {
    
    this.loaderService.show();
    this.listData = [];
    this._service.viewApproverchklist().subscribe(
        (result:any) => {
        this.loaderService.show();
        this.listData = result[0].data;
        if(result[0].data2.length > 0)
        {
          this.NRstatus = true;
         
        }
        else
        {
          this.NRstatus = false;
        }
      
        console.log(this.listData, 'this.listData')
        this.templistData = result[0].data;
        if (this.listData.length > 0) {

          this.NextShow = true;
          this.PreviousShow = false
          this.uniquemenuList = [];
          this.uniqueMenuData = [];

          for (var m = 0; m < this.listData.length; m++) 
          {
            this.menulistData.push(this.listData[m][12]);
            if (this.uniquemenuList.indexOf(this.menulistData[m]) === -1) {

              let uniquedataofcategory = new uniqueData()
              uniquedataofcategory.value = this.uniquemenuList.length;
              uniquedataofcategory.text = this.menulistData[m]

              this.uniquemenuListdata.push(uniquedataofcategory);
              this.uniquemenuList.push(this.menulistData[m]);
            }
            this.selectedCategory = this.uniquemenuListdata[0].text;
            if (this.listData[m][12] == this.selectedCategory) {
              this.uniqueMenuData.push(this.listData[m]);
            }
          }
            this.pageNo = 0


            setTimeout(async () => {
              console.log(this.uniqueMenuData.length,'this.uniqueMenuData.length');
              for (var k = 0; k < this.uniqueMenuData.length; k++) {
                $("#showNRcheckbox" + k).css('display','none');
                $("#showAllcheckbox" + k).css('display','block');
                this.notApplicableText = this.uniqueMenuData[k][1];
                if (this.notApplicableText.includes('Report NA') == true) {
                  $("#notApplicable" + k).show();
                }
                else {
                  $("#notApplicable" + k).hide();
                }
                if (this.uniqueMenuData[k][3] == 'NA') {
                  $('#RemarksText' + k).val("")
                }
                else {
                  $('#RemarksText' + k).val(this.uniqueMenuData[k][3])
                }
                if(this.uniqueMenuData[k][14] == 'C')
                {
                  $("#savesublater" + this.pageNo).hide()
                  this.finalsubmitShow=false;
                  $("#submitlatertext").show();
                }
                else
                {
                  $("#savesublater" + this.pageNo).show()
                  $("#submitlatertext").hide();
                }
                if (this.uniqueMenuData[k][2] == 'Yes') {
                  $('#ocaWtypeSecYesD' + k).prop('checked', true);

                }
                else if (this.uniqueMenuData[k][2] == 'No') {
                  $('#ocaWtypeSecNoE' + k).prop('checked', true);
                }
                else if (this.uniqueMenuData[k][2] == 'NA') {
                  $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);

                }
                var questionNo = this.uniqueMenuData[k][0]
                console.log(questionNo,'questionNo');
                await this._service.viewUserFeedBack(questionNo).then(
                   (result:any) => {
                    console.log(result,'result getdatabyquestionId')
                    this.userfeedbackList=result[0].data;
                    let countvalue=0;
                    let avalue=0;
                    console.log(this.userfeedbackList,'userfeedbackList');
                    for(var m=0;m<this.userfeedbackList.length;m++)
                    {
                      if(countvalue == 1)
                      {
                        break;
                      }
                      if(this.userfeedbackList[m][2] == 'Not Rated')
                      {
                        this.userFdk = 'Not Rated'
                        countvalue = 1;
                        avalue=1;
                      }
                      else if(this.userfeedbackList[m][1] != 'Not Rated')
                      {
                        if(this.userfeedbackList[m][1] ==  this.userfeedbackList[m][2])
                        {
                          this.userFdk = 'Non Complied'
                          countvalue = 1;
                        }
                        else
                        {
                          this.userFdk = 'Complied'
                        }
                      }
                      if(this.userFdk == 'Not Rated' && this.uniqueMenuData[k][14] != 'C')
                      {
                        $("#showNRcheckbox" + k).css('display','block');
                        $("#showAllcheckbox" + k).css('display','none');
                      }
                      else
                      {
                        $("#showNRcheckbox" + k).css('display','none');
                        $("#showAllcheckbox" + k).css('display','block');
                        $("#RemarksText" + k).css('pointer-events','all')
                      }
                      if(avalue == 1)
                      {
                        $('#savesublater' + this.pageNo).prop('disabled', true);
                        $('#btn_savesubmitfinal').prop('disabled', true);
                        $("#btn_savesubmitfinal" + k).css('pointer-events','none')
                      }
                      if(this.NRstatus == true)
                      {
                        $("#substatus" + k).css('display','block');
                        $("#substatus" + k).text('Not Rated');
                        $('#btn_savesubmitfinal').prop('disabled', true);        //for not-rated
                        $("#btn_savesubmitfinal" + k).css('pointer-events','none') //for not-rated
                        if($('#showNRcheckbox' + k).css('display') == 'block')
                        {
                          $("#RemarksText" + k).css('pointer-events','none')
                        }
                        else if($('#showAllcheckbox' + k).css('display') == 'block')
                        {
                          $("#RemarksText" + k).css('pointer-events','All')
                        }
                      }
                      else
                      {
                        if(this.userFdk == 'Non Complied')
                        {
                          $("#substatus" + k).css('display','none');
                          $("#noncompliedstatus" + k).css('display','block');
                        }
                        else
                        {
                          $("#substatus" + k).css('display','block');
                          $("#substatus" + k).text(this.userFdk);
                          $("#noncompliedstatus" + k).css('display','none');
                        }
                      }
                        break;
                      }
                  });
                
              }
              this.loaderService.hide();
            }, 100);
          
        }
      }),
      (err:any) => {
        this.loaderService.hide()
      }
  }
  // noncompliedClick(qtNo)
  // {
  //   // $("#NonCompliedPopID").modal("show");
  //   $(".QuizQuestionMainDivComp").css('display','none');
  //   $(".QuizQuestionMainDivNC").css('display','block');
  //   this.codecompliancequizPage=true;
  //   // this.viewNCDetails=false;
  //     this._service.viewNCUsers(qtNo).subscribe(
  //       result => {
  //         this.NCdata = result[0].data;
  //        console.log(this.NCdata,'NCdata--------------')
  //       this.selectedDuration= this.NCdata[0][7];
  //       this.currYear = parseInt(this.selectedDuration.substring(7)) + 1;
  //       console.log(this.currYear,'this.currYear')
  //       setTimeout(async () => {
  //         for (var k = 0; k < this.NCdata.length; k++) {
  //           this.notApplicableText = this.NCdata[k][13];
  //           if (this.notApplicableText.includes('Report NA') == true) {
  //             $("#notApplicable" + k).show();
  //           }
  //           else {
  //             $("#notApplicable" + k).hide();
  //           }
  
  //           if (this.NCdata[k][4] == 'NA') {
  //             $('#RemarksTextNC' + k).val("")
  //           }
  //           else {
  //             $('#RemarksTextNC' + k).val(this.NCdata[k][4])
  //           }
  
  //           if (this.NCdata[k][10] == 'Yes') {
  //             $('#ocaWtypeSecYesDNC' + k).prop('checked', true);
  //           }
  //           else if (this.NCdata[k][10] == 'No') {
  //             $('#ocaWtypeSecNoENC' + k).prop('checked', true);
  //           }
  //           else if (this.NCdata[k][10] == 'NA') {
  //             $('#ocaWtypeSecNotapplicableFNC' + k).prop('checked', true);
  //           }
  //         }
  //         this.loaderService.hide();
  //       }, 100);
  //       }),
  //       err => {
  //       }

  // }

  // back()
  // {
  //   $(".QuizQuestionMainDivComp").css('display','block');
  //   $(".QuizQuestionMainDivNC").css('display','none');
  //   this.viewapprvchklist();
  // }

  dismissModal() {
    $('#unanswered').modal('hide');
    // this.employee.fromdate='';
    // this.employee.todate='';
  }
 
  govcodetabclick(rolename:any,Idvalue:any)
  {
    this.idvalue=Idvalue;
      if(rolename == "MY CODE COMPLIANCE")
      {
        this.route.navigate(['/portal/mycompliancecode']);
        this.idvalue=0
      }
      else if(rolename == 'REPORT')
      {
        this.route.navigate(['/portal/mycompliancereport']);
        this.idvalue=1
      }
      else if(rolename == "VIEW COMPLIANCE")
      {
        this.route.navigate(['/portal/viewcompliancecode']);
        this.idvalue=0;
      }
   
  }

  getCurrentPageDataondropDown(currentMenu:any) {
    this.uniqueMenuData = [];
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][12] == currentMenu) {
        this.uniqueMenuData.push(this.listData[n]);
      }
    }
    // setTimeout(() => {
    for (var a = 0; a < this.uniqueMenuData.length; a++) {
      // $('#RemarksText' + a).val(this.uniqueMenuData[a][3])
      this.uniqueMenuData[a][3] = $('#RemarksText' + a).val()
      console.log(this.uniqueMenuData[a][3], 'this.uniqueMenuData[a][3]');
    }
    // }, 100);

  }

  NextClick() {
    this.loaderService.show();
    var currentMenu = $('select#menuFilter option:selected').text();
    this.getCurrentPageData(currentMenu)
    this.pageNo = $('select#menuFilter option:selected').next().val();
    this.uniqueMenuData = [];
    var selectedMenu = $('select#menuFilter option:selected').next().text();
    var lastCategoryValue = $("#menuFilter option:last").text()
    this.selectedCategory = selectedMenu;
    $('#menuFilter').val(this.pageNo).attr("selected", "selected");
    if (selectedMenu != undefined) {
      this.PreviousShow = true;
      if (selectedMenu == lastCategoryValue) {
        this.NextShow = false;
        this.finalsubmitShow = true;
      }
      else {
        this.NextShow = true;
        this.finalsubmitShow = false;
      }
       for (var n = 0; n < this.listData.length; n++) {
        if (this.listData[n][12] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      setTimeout(async () => {
       
        console.log(this.uniqueMenuData.length,'this.uniqueMenuData.length')
        for (var k = 0; k < this.uniqueMenuData.length; k++) {
          this.notApplicableText = this.uniqueMenuData[k][1];
          if (this.notApplicableText.includes('Report NA') == true) {
            $("#notApplicable" + k).show();
          }
          else {
            $("#notApplicable" + k).hide();
          }
          if (this.uniqueMenuData[k][3] == 'NA') {
            $('#RemarksText' + k).val("")
          }
          else {
            $('#RemarksText' + k).val(this.uniqueMenuData[k][3])
          }

          if(this.uniqueMenuData[k][14] == 'C')
          {
            $("#savesublater" + this.pageNo).hide()
            this.finalsubmitShow=false;
            $("#submitlatertext").show();
          }
          else
          {
            $("#savesublater" + this.pageNo).show()
            $("#submitlatertext").hide();
          }


          if (this.uniqueMenuData[k][2] == 'Yes') {
            $('#ocaWtypeSecYesD' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'No') {
            $('#ocaWtypeSecNoE' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'NA') {
            $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);
          }
        
          var questionNo = this.uniqueMenuData[k][0]
          console.log(questionNo,'questionNo');
          await this._service.viewUserFeedBack(questionNo).then(
             (result:any) => {
              console.log(result,'result getdatabyquestionId')
              this.userfeedbackList=result[0].data;
              let countvalue=0;
              let avalue=0;
              console.log(this.userfeedbackList,'userfeedbackList');
              for(var m=0;m<this.userfeedbackList.length;m++)
              {
                if(countvalue == 1)
                {
                  break;
                }
                if(this.userfeedbackList[m][1] == 'Not Rated')
                {
                  this.userFdk = 'Not Rated'
                  countvalue = 1;
                  avalue=1;
                }
                else if(this.userfeedbackList[m][1] != 'Not Rated')
                {
                  if(this.userfeedbackList[m][1] ==  this.userfeedbackList[m][2])
                  {
                    this.userFdk = 'Non Complied'
                    countvalue = 1;
                  }
                  else
                  {
                    this.userFdk = 'Complied'
                  }
                }
                if(this.userFdk == 'Not Rated' && this.uniqueMenuData[k][14] != 'C')
                {
                  $("#showNRcheckbox" + k).css('display','block');
                  $("#showAllcheckbox" + k).css('display','none');
                }
                else
                {
                  $("#showNRcheckbox" + k).css('display','none');
                  $("#showAllcheckbox" + k).css('display','block');
                  $("#RemarksText" + k).css('pointer-events','all')
                }
                if(avalue == 1)
                {
                  $('#savesublater' + this.pageNo).prop('disabled', true);
                  $('#btn_savesubmitfinal').prop('disabled', true);
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none')
                }
                if(this.NRstatus == true)
                {
                  $("#substatus" + k).text('Not Rated')
                  $("#substatus" + k).css('display','block');
                  $('#btn_savesubmitfinal').prop('disabled', true);        //for not-rated
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none') //for not-rated
                  if($('#showNRcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','none')
                  }
                  else if($('#showAllcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','All')
                  }
                }
                else
                {
                  if(this.userFdk == 'Non Complied')
                  {
                    $("#substatus" + k).css('display','none');
                    $("#noncompliedstatus" + k).css('display','block');
                  }
                  else
                  {
                    $("#substatus" + k).css('display','block');
                    $("#substatus" + k).text(this.userFdk);
                    $("#noncompliedstatus" + k).css('display','none');
                  }
                }
                  break;
                }
            });
          
        }
        this.loaderService.hide();
      }, 100);
    
    }

  }

  previousClick() {
    this.loaderService.show();
    var currentMenu = $('select#menuFilter option:selected').text();
    this.getCurrentPageData(currentMenu)
    this.pageNo = $('select#menuFilter option:selected').prev().val();
    this.uniqueMenuData = [];
    var selectedMenu = $('select#menuFilter option:selected').prev().text();
    var firstCategoryValue = $("#menuFilter option:first").text()
    if (selectedMenu != undefined) {
      if (selectedMenu == firstCategoryValue) {
        this.PreviousShow = false;
      }
      else {
        this.NextShow = true;
        this.PreviousShow = true;
        this.finalsubmitShow = false;
      }
      this.selectedCategory = selectedMenu;
      $('#menuFilter').val(this.pageNo).attr("selected", "selected");
      for (var n = 0; n < this.listData.length; n++) {
        if (this.listData[n][12] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      console.log(this.uniqueMenuData, ' this.uniqueMenuData prev')
      setTimeout(async () => {
        for (var k = 0; k < this.uniqueMenuData.length; k++) {
          this.notApplicableText = this.uniqueMenuData[k][1];
          if (this.notApplicableText.includes('Report NA') == true) {
            $("#notApplicable" + k).show();
          }
          else {
            $("#notApplicable" + k).hide();
          }

          if (this.uniqueMenuData[k][3] == 'NA') {
            $('#RemarksText' + k).val("")
          }
          else {
            $('#RemarksText' + k).val(this.uniqueMenuData[k][3])
          }

          if(this.uniqueMenuData[k][14] == 'C')
          {
            $("#savesublater" + this.pageNo).hide()
            this.finalsubmitShow=false;
            $("#submitlatertext").show();
          }
          else
          {
            $("#savesublater" + this.pageNo).show()
            $("#submitlatertext").hide();
          }
          
          if (this.uniqueMenuData[k][2] == 'Yes') {
            $('#ocaWtypeSecYesD' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'No') {
            $('#ocaWtypeSecNoE' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'NA') {
            $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);
          }

          var questionNo = this.uniqueMenuData[k][0]
          console.log(questionNo,'questionNo');
          await this._service.viewUserFeedBack(questionNo).then(
             (result:any) => {
              console.log(result,'result getdatabyquestionId')
              this.userfeedbackList=result[0].data;
              let countvalue=0;
              let avalue=0;
              console.log(this.userfeedbackList,'userfeedbackList');
              for(var m=0;m<this.userfeedbackList.length;m++)
              {
                if(countvalue == 1)
                {
                  break;
                }
                if(this.userfeedbackList[m][1] == 'Not Rated')
                {
                  this.userFdk = 'Not Rated'
                  countvalue = 1;
                  avalue=1;
                }
                else if(this.userfeedbackList[m][1] != 'Not Rated')
                {
                  if(this.userfeedbackList[m][1] ==  this.userfeedbackList[m][2])
                  {
                    this.userFdk = 'Non Complied'
                    countvalue = 1;
                  }
                  else
                  {
                    this.userFdk = 'Complied'
                  }
                }
              
                if(avalue == 1)
                {
                  $('#savesublater' + this.pageNo).prop('disabled', true);
                  $('#btn_savesubmitfinal').prop('disabled', true);
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none')
                }
                if(this.userFdk == 'Not Rated' && this.uniqueMenuData[k][14] != 'C')
                {
                  $("#showNRcheckbox" + k).css('display','block');
                  $("#showAllcheckbox" + k).css('display','none');
                }
                else
                {
                  $("#showNRcheckbox" + k).css('display','none');
                  $("#showAllcheckbox" + k).css('display','block');
                  $("#RemarksText" + k).css('pointer-events','all')
                }
                if(this.NRstatus == true)
                {
                  $("#substatus" + k).text('Not Rated')
                  $("#substatus" + k).css('display','block');
                  $('#btn_savesubmitfinal').prop('disabled', true);        //for not-rated
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none') //for not-rated
                  if($('#showNRcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','none')
                  }
                  else if($('#showAllcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','All')
                  }
                }
                else
                {
                  if(this.userFdk == 'Non Complied')
                  {
                    $("#substatus" + k).css('display','none');
                    $("#noncompliedstatus" + k).css('display','block');
                  }
                  else
                  {
                    $("#substatus" + k).css('display','block');
                    $("#substatus" + k).text(this.userFdk);
                    $("#noncompliedstatus" + k).css('display','none');
                  }
                }
                  break;
                }
            });
        }
        this.loaderService.hide();
      }, 100);
    }
  }

  optionsclick(selectedquestion:any, optionValue:any, selectedCategoryValue:any, feedbackId:any) {
    this.uniqueMenuData = [];
    console.log(selectedquestion, 'selectedquestion')
    console.log(optionValue, 'optionValue')
    console.log(selectedCategoryValue, 'selectedCategoryValue')
    // let tempQuesOptionsList = new selectedItemList();
    this.selectedCategory = selectedCategoryValue;
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][12] == selectedCategoryValue) {
        this.uniqueMenuData.push(this.listData[n]);
      }
    }
    for (var a = 0; a < this.uniqueMenuData.length; a++) {
      if (this.uniqueMenuData[a][0] == selectedquestion) {
        this.uniqueMenuData[a][2] = optionValue;
        this.uniqueMenuData[a][6] = feedbackId;
        if($('#RemarksText' + a).val() == "")
        {
          this.uniqueMenuData[a][3] = "NA";
        }
        else
        {
          this.uniqueMenuData[a][3] = $('#RemarksText' + a).val();
        }
        break;
      }
    }
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][0] == selectedquestion) {
        this.listData[n][2] = optionValue;
        this.listData[n][6] = feedbackId;
        // this.listData[n][3] = $('#RemarksText' + n).val();
        if($('#RemarksText' + a).val() == "")
        {
          this.uniqueMenuData[a][3] = "NA";
        }
        else
        {
          this.uniqueMenuData[a][3] = $('#RemarksText' + a).val();
        }
        console.log(this.listData[n],'this.listData[n]')
        break;
      }
    }
    console.log(this.uniqueMenuData, 'uniqueMenuData optionclick');
  }

  ondropdownChange(eventValue:any) {
    this.loaderService.show();
    var selectedEvent = eventValue.target.options[eventValue.target.options.selectedIndex].text
    this.pageNo = eventValue.target.selectedIndex
    var currentMenu = $('select#menuFilter option:selected').text();
    this.getCurrentPageDataondropDown(this.selectedCategory)
    var lastCategoryValue = $("#menuFilter option:last").text()
    var firstCategoryValue = $("#menuFilter option:first").text()
    if (selectedEvent != undefined) {
      this.PreviousShow = true;
      this.NextShow = true;
      if (selectedEvent == lastCategoryValue) {
        this.PreviousShow = true;
        this.NextShow = false;
        this.finalsubmitShow = true;
      }
      else if (selectedEvent == firstCategoryValue) {
        this.PreviousShow = false;
        this.NextShow = true;
        this.finalsubmitShow = false;
      }
      else {
        this.PreviousShow = true;
        this.NextShow = true;
        this.finalsubmitShow = false;
      }
      this.uniqueMenuData = [];
      this.selectedCategory = selectedEvent;
      console.log(this.listData, 'listData ondropdown')
      for (var n = 0; n < this.listData.length; n++) {
        if (this.listData[n][12] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      setTimeout(async () => {
        console.log(this.uniqueMenuData, 'uniqueMenuData')
        for (var k = 0; k < this.uniqueMenuData.length; k++) {
          this.notApplicableText = this.uniqueMenuData[k][1];
          if (this.notApplicableText.includes('Report NA') == true) {
            $("#notApplicable" + k).show();
          }
          else {
            $("#notApplicable" + k).hide();
          }
          if (this.uniqueMenuData[k][3] == 'NA') {
            $('#RemarksText' + k).val("")
          }
          else {
            $('#RemarksText' + k).val(this.uniqueMenuData[k][3])
          }

          if(this.uniqueMenuData[k][14] == 'C')
          {
            $("#savesublater" + this.pageNo).hide()
            this.finalsubmitShow=false;
            $("#submitlatertext").show();
          }
          else
          {
            $("#savesublater" + this.pageNo).show()
            $("#submitlatertext").hide();
          }


          if (this.uniqueMenuData[k][2] == 'Yes') {
            $('#ocaWtypeSecYesD' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'No') {
            $('#ocaWtypeSecNoE' + k).prop('checked', true);
          }
          else if (this.uniqueMenuData[k][2] == 'NA') {
            $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);
          }

          var questionNo = this.uniqueMenuData[k][0]
          console.log(questionNo,'questionNo');
          await this._service.viewUserFeedBack(questionNo).then(
             (result:any) => {
              console.log(result,'result getdatabyquestionId')
              this.userfeedbackList=result[0].data;
              let countvalue=0;
              let avalue=0;
              console.log(this.userfeedbackList,'userfeedbackList');
              for(var m=0;m<this.userfeedbackList.length;m++)
              {
                if(countvalue == 1)
                {
                  break;
                }
                if(this.userfeedbackList[m][1] == 'Not Rated')
                {
                  this.userFdk = 'Not Rated'
                  countvalue = 1;
                  avalue=1;
                }
                else if(this.userfeedbackList[m][1] != 'Not Rated')
                {
                  if(this.userfeedbackList[m][1] ==  this.userfeedbackList[m][2])
                  {
                    this.userFdk = 'Non Complied'
                    countvalue = 1;
                  }
                  else
                  {
                    this.userFdk = 'Complied'
                  }
                }
                if(this.userFdk == 'Not Rated' && this.uniqueMenuData[k][14] != 'C')
                {
                  $("#showNRcheckbox" + k).css('display','block');
                  $("#showAllcheckbox" + k).css('display','none');
                }
                else
                {
                  $("#showNRcheckbox" + k).css('display','none');
                  $("#showAllcheckbox" + k).css('display','block');
                  $("#RemarksText" + k).css('pointer-events','all')
                }
                if(avalue == 1)
                {
                  $('#savesublater' + this.pageNo).prop('disabled', true);
                  $('#btn_savesubmitfinal').prop('disabled', true);
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none')
                }
                if(this.NRstatus == true)
                {
                  $("#substatus" + k).text('Not Rated');
                  $("#substatus" + k).css('display','block');
                  $('#btn_savesubmitfinal').prop('disabled', true);        //for not-rated
                  $("#btn_savesubmitfinal" + k).css('pointer-events','none') //for not-rated
                  if($('#showNRcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','none')
                  }
                  else if($('#showAllcheckbox' + k).css('display') == 'block')
                  {
                    $("#RemarksText" + k).css('pointer-events','All')
                  }
                }
                else
                {
                  if(this.userFdk == 'Non Complied')
                  {
                    $("#substatus" + k).css('display','none');
                    $("#noncompliedstatus" + k).css('display','block');
                  }
                  else
                  {
                    $("#substatus" + k).css('display','block');
                    $("#substatus" + k).text(this.userFdk);
                    $("#noncompliedstatus" + k).css('display','none');
                  }
                }
                  break;
                }
            });
          
        }
        this.loaderService.hide();
      }, 100);
    }

  }

  getCurrentPageData(currentMenu:any) {
    this.uniqueMenuData = [];
    console.log(this.listData, 'this.listData on curr page')
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][12] == currentMenu) {
        this.uniqueMenuData.push(this.listData[n]);
      }
    }
    for (var a = 0; a < this.uniqueMenuData.length; a++) {
      this.notApplicableText = this.uniqueMenuData[a][1];
      if (this.notApplicableText.includes('Report NA') == true) {
        $("#notApplicable" + a).show();
      }
      else {
        $("#notApplicable" + a).hide();
      }
      if ($('#RemarksText' + a).val() != "") {
        this.uniqueMenuData[a][3] = $('#RemarksText' + a).val();
      }
      else {
        this.uniqueMenuData[a][3] = "NA";
      }
    }
  }

  saveNSubmit(category:any) {
    this.loaderService.show();
    this.notratedlist = [];
    for (var a = 0; a < this.listData.length; a++) {
      if (this.listData[a][2] == 'Not Rated') {
        this.notratedlist.push('Not Rated')
      }
    }
    if (this.notratedlist.length == this.listData.length) {
      // this.dialogBox.popUpOpen2('Kindly answer atleast one  question.', 'leave', 'information2')
      $("#unanswered").modal("show");
      $("#atleastOneText").css("display", "block")
      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#answerAllText").css("display", "none");
      $("#remarksPopupText").css("display", "none");
      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      this.loaderService.hide();
      return
    }
    this.getCurrentPageData(category);
    var answer = {
      feedback: [] as string []
    };
    this.countervalueSave = 0
    this.uniquemenuList = [];
    this.menulistData = [];
    for (var a = 0; a < this.listData.length; a++) {
      this.menulistData.push(this.listData[a][12]);
      if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
        this.countervalueSave = 1
        this.uniquemenuList.push(this.menulistData[a]);
      }
      else {
        this.countervalueSave++;
      }

      if (this.listData[a][3] == "") {
        this.listData[a][3] = "NA"
      }
    
      var selectedValue = this.listData[a][2]
      var complianceValue = this.listData[a][13]
      if (selectedValue == 'No' && complianceValue == 'No' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][12]
        // this.dialogBox.popUpOpen2('Please enter Remarks for category ' + this.listData[a][12] + ' of question No. ' + this.countervalueSave, 'leave', 'error2');

        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'Yes' && complianceValue == 'Yes' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][12]
        // this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][12] + ' of question No. ' + this.countervalueSave, 'leave', 'error2');
      
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'NA' && complianceValue == 'NA' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][12]
        //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][12] +  'of question No. ' + this.countervalueSave, 'leave', 'error2');
      
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }

      var data =
        this.listData[a][2] + "," + this.listData[a][3] + "," + this.listData[a][6] + ","
        + this.listData[a][0] + "," + "NA" + ","+ "NA" + "," + this.roleIDvalue
      answer.feedback.push(data);
      console.log(answer, '----');
    }
    this._service.approverDeclarationSubmit(answer, 'Save').subscribe(
      (result:any) => {
        if (result[0].data == true) {
          this.getsubmittedData(category, 'Save')
        }
      }),
      (err:any) => {
        this.loaderService.hide();
      }
  }

  getsubmittedData(category:any, modeOfsave:any) {
    this.loaderService.show();
    this._service.viewApproverchklist().subscribe(
      (result:any) => {
        this.listData = result[0].data;
        // setTimeout(() => {
        this.uniqueMenuData = [];
        console.log(this.uniqueMenuData,'uniqueMenuData');
        for (var m = 0; m < this.listData.length; m++) {
          if (this.listData[m][12] == category) {
            this.uniqueMenuData.push(this.listData[m]);
          }
        }
        console.log(this.uniqueMenuData, 'uniqueMenuData')
        setTimeout(async () => {
          for (var k = 0; k < this.uniqueMenuData.length; k++) {
            this.notApplicableText = this.uniqueMenuData[k][1];
            if (this.notApplicableText.includes('Report NA') == true) {
              $("#notApplicable" + k).show();
            }
            else {
              $("#notApplicable" + k).hide();
            }
            if (this.uniqueMenuData[k][3] == 'NA') {
              $('#RemarksText' + k).val("")
            }
            else {
              $('#RemarksText' + k).val(this.uniqueMenuData[k][3])
            }
            if (this.uniqueMenuData[k][2] == 'Yes') {
              $('#ocaWtypeSecYesD' + k).prop('checked', true);
            }
            else if (this.uniqueMenuData[k][2] == 'No') {
              $('#ocaWtypeSecNoE' + k).prop('checked', true);
            }
            else if (this.uniqueMenuData[k][2] == 'NA') {
              $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);
            }
            if(this.uniqueMenuData[k][14] == 'C')
            {
              $("#savesublater" + this.pageNo).hide()
              this.finalsubmitShow=false;
              $("#submitlatertext").show();
            }
            else
            {
              $("#savesublater" + this.pageNo).show()
              $("#submitlatertext").hide();
            }
            var questionNo = this.uniqueMenuData[k][0]
            console.log(questionNo,'questionNo');
            await this._service.viewUserFeedBack(questionNo).then(
               (result:any) => {
                console.log(result,'result getdatabyquestionId')
                this.userfeedbackList=result[0].data;
                let countvalue=0;
                let avalue=0;
                console.log(this.userfeedbackList,'userfeedbackList');
                for(var m=0;m<this.userfeedbackList.length;m++)
                {
                  if(countvalue == 1)
                  {
                    break;
                  }
                  if(this.userfeedbackList[m][1] == 'Not Rated')
                  {
                    this.userFdk = 'Not Rated'
                    countvalue = 1;
                    avalue=1;
                  }
                  else if(this.userfeedbackList[m][1] != 'Not Rated')
                  {
                    if(this.userfeedbackList[m][1] ==  this.userfeedbackList[m][2])
                    {
                      this.userFdk = 'Non Complied'
                      countvalue = 1;
                    }
                    else
                    {
                      this.userFdk = 'Complied'
                    }
                  }
                  if(this.userFdk == 'Not Rated' && this.uniqueMenuData[k][14] != 'C')
                  {
                    $("#showNRcheckbox" + k).css('display','block');
                    $("#showAllcheckbox" + k).css('display','none');
                  }
                  else
                  {
                    $("#showNRcheckbox" + k).css('display','none');
                    $("#showAllcheckbox" + k).css('display','block');
                    $("#RemarksText" + k).css('pointer-events','all')
                  }
                  if(avalue == 1)
                  {
                    $('#savesublater' + this.pageNo).prop('disabled', true);
                    $('#btn_savesubmitfinal').prop('disabled', true);
                    $("#btn_savesubmitfinal" + k).css('pointer-events','none')
                  }
                  if(this.NRstatus == true)
                  {
                    $("#substatus" + k).text('Not Rated');
                    $("#substatus" + k).css('display','block');
                    $('#btn_savesubmitfinal').prop('disabled', true);        //for not-rated
                    $("#btn_savesubmitfinal" + k).css('pointer-events','none') //for not-rated
                    if($('#showNRcheckbox' + k).css('display') == 'block')
                    {
                      $("#RemarksText" + k).css('pointer-events','none')
                    }
                    else if($('#showAllcheckbox' + k).css('display') == 'block')
                    {
                      $("#RemarksText" + k).css('pointer-events','All')
                    }
                  }
                  else
                  {
                    if(this.userFdk == 'Non Complied')
                    {
                      $("#substatus" + k).css('display','none');
                      $("#noncompliedstatus" + k).css('display','block');
                    }
                    else
                    {
                      $("#substatus" + k).css('display','block');
                      $("#substatus" + k).text(this.userFdk);
                      $("#noncompliedstatus" + k).css('display','none');
                    }
                  }
                    break;
                  }
              });
          }
          this.loaderService.hide();
        }, 100);
      }, (err:any) => {
      }),
      (err:any) => {
        this.loaderService.hide();
      };
    $("#unanswered").modal("show");
    if (modeOfsave == 'Save') {
      $("#saveText").css("display", "block")
      $("#submittedText").css("display", "none");
    }
    else if (modeOfsave == 'SignOff') {
      $("#saveText").css("display", "none")
      $("#submittedText").css("display", "block");
    }
    $("#atleastOneText").css("display", "none");
    $("#answerAllText").css("display", "none");
    $("#remarksPopupText").css("display", "none")

    this.unansweredList = [];
    $("#unansweredText").css("display", "none");
  }

 FinalSubmit(category: any): void {
  this.loaderService.show();
  this.notratedlist = [];

  for (var a = 0; a < this.listData.length; a++) {
    if (this.listData[a][2] == 'Not Rated') {
      this.notratedlist.push('Not Rated');
    }
  }

  if (this.notratedlist.length == this.listData.length) {
    // this.dialogBox.popUpOpen2('Kindly answer all questions.', 'leave', 'information2')
    $("#unanswered").modal("show");
    $("#answerAllText").css("display", "block");

    $("#saveText").css("display", "none");
    $("#submittedText").css("display", "none");
    $("#atleastOneText").css("display", "none");
    $("#remarksPopupText").css("display", "none");

    this.unansweredList = [];
    $("#unansweredText").css("display", "none");
    this.loaderService.hide();

    return;
  }

  this.unansweredList = [];
  // this.counterValueSubmit = 0;
  this.countervalueSave = 0;
  this.uniquemenuList = [];
  this.menulistData = [];
  this.counterValue = [];

  for (var a = 0; a < this.listData.length; a++) {
    this.menulistData.push(this.listData[a][12]);

    if (this.uniquemenuList.length > 0) {
      if (
        this.menulistData[this.menulistData.length - 1] !=
        this.uniquemenuList[this.uniquemenuList.length - 1]
      ) {
        if (this.counterValue.length > 0) {
          this.unansweredList.push(
            'Kindly answer question no ' +
              this.counterValue.toString() +
              ' in "' +
              this.categoryName +
              '".'
          );

          console.log(this.unansweredList, 'unansweredList');
        }
      }
    }

    if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
      this.counterValueSubmit = 1;
      // this.countervalueSave=1;
      this.uniquemenuList.push(this.menulistData[a]);

      if (
        this.menulistData[a] == this.listData[a][12] &&
        this.listData[a][2] == 'Not Rated'
      ) {
        this.counterValue = [];
        this.counterValue.push(this.counterValueSubmit);
        // this.counterValue.push(this.countervalueSave)
        this.categoryName = this.listData[a][12];
      } else if (
        this.uniquemenuList[this.uniquemenuList.length - 1] ==
          this.listData[a][12] &&
        this.listData[a][2] != 'Not Rated'
      ) {
        this.counterValue = [];
        this.categoryName =
          this.uniquemenuList[this.uniquemenuList.length - 1];
      }
    } else {
      this.counterValueSubmit++;
      // this.countervalueSave++;
      if (
        this.menulistData[a] == this.listData[a][12] &&
        this.listData[a][2] == 'Not Rated'
      ) {
        this.counterValue.push(this.counterValueSubmit);
        // this.counterValue.push(this.countervalueSave)
        this.categoryName = this.listData[a][12];
      }
    }
  }

  if (this.counterValue.length > 0) {
    this.unansweredList.push(
      'Kindly answer question no ' +
        this.counterValue.toString() +
        ' in "' +
        this.uniquemenuList[this.uniquemenuList.length - 1] +
        '".'
    );
  }

  if (this.unansweredList.length > 0) {
    $("#unanswered").modal("show");
    $("#unansweredText").css("display", "block");

    $("#saveText").css("display", "none");
    $("#submittedText").css("display", "none");
    $("#atleastOneText").css("display", "none");
    $("#answerAllText").css("display", "none");
    $("#remarksPopupText").css("display", "none");

    this.loaderService.hide();

    return;
  }

  var answer = {
    feedback: [] as string[]
  };

  console.log(this.listData, 'this.listData-----------');

  this.countervalueSave = 0;
  this.uniquemenuList = [];
  this.menulistData = [];

  for (var a = 0; a < this.listData.length; a++) {
    this.menulistData.push(this.listData[a][12]);

    if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
      this.countervalueSave = 1;
      this.uniquemenuList.push(this.menulistData[a]);
    } else {
      this.countervalueSave++;
    }

    if (this.listData[a][3] == "") {
      this.listData[a][3] = "NA";
    }

    if (
      this.listData[a][8].toLowerCase() == 'yes' &&
      this.listData[a][4] == 'NA' &&
      this.listData[a][2] != 'Not Rated'
    ) {
      this.editedCategoryText = this.listData[a][12];
      $("#unanswered").modal("show");

      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#answerAllText").css("display", "none");

      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      $("#remarksPopupText").css("display", "none");

      this.loaderService.hide();

      return;
    }

    var selectedValue = this.listData[a][2];
    var complianceValue = this.listData[a][13];

    if (
      selectedValue == 'No' &&
      complianceValue == 'No' &&
      (this.listData[a][3] == 'NA' || this.listData[a][3] == '')
    ) {
      // this.dialogBox.popUpOpen2('Please enter Remarks for category ' + this.listData[a][12] + ' of question No. ' + this.counterValueSubmit, 'leave', 'error2');
      this.editedCategoryText = this.listData[a][12];
      $("#unanswered").modal("show");

      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#answerAllText").css("display", "none");

      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      $("#remarksPopupText").css("display", "block");

      this.loaderService.hide();

      return;
    } else if (
      selectedValue == 'Yes' &&
      complianceValue == 'Yes' &&
      (this.listData[a][3] == 'NA' || this.listData[a][3] == '')
    ) {
      //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][12] + ' of question No. ' + this.counterValueSubmit, 'leave', 'error2');
      this.editedCategoryText = this.listData[a][12];
      $("#unanswered").modal("show");

      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#answerAllText").css("display", "none");

      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      $("#remarksPopupText").css("display", "block");

      this.loaderService.hide();

      return;
    } else if (
      selectedValue == 'NA' &&
      complianceValue == 'NA' &&
      (this.listData[a][3] == 'NA' || this.listData[a][3] == '')
    ) {
      //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][12] +  'of question No. ' + this.counterValueSubmit, 'leave', 'error2');
      this.editedCategoryText = this.listData[a][12];
      $("#unanswered").modal("show");

      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#answerAllText").css("display", "none");

      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      $("#remarksPopupText").css("display", "block");

      this.loaderService.hide();

      return;
    }

    var data =
      this.listData[a][2] +
      "," +
      this.listData[a][3] +
      "," +
      this.listData[a][6] +
      "," +
      this.listData[a][0] +
      "," +
      "NA" +
      "," +
      "NA" +
      "," +
      this.roleIDvalue;

    answer.feedback.push(data);
    console.log(answer, '----');
  }

  this._service.codeDeclarationSubmit(answer, 'SignOff').subscribe(
    (result: any) => {
      if (result[0].data == true) {
        this.getsubmittedData(category, 'SignOff');
      }
    }
  );
}

}
export class uniqueData {
  value: any;
  text: any;
  constructor() {

  }
}
