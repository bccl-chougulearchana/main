import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
declare var $: any;
import { DomSanitizer } from "@angular/platform-browser";
declare var html2pdf: any;
import { CommonModule, DatePipe } from '@angular/common';
import { CommonService } from '../../../core/services/common.service';
import { LoaderService } from '../../../shared/shared-services/loader.service';
import { saveAs } from 'file-saver'
import { DialogModelComponent } from '../../dialogModel/dialogModel.component';
import { AutheticationService } from '../../../services/auth/authetication.service';
@Component({
  selector: 'app-governance-declaration-mycompliancecode',
  templateUrl: './governance-declaration-mycompliancecode.component.html',
  standalone:true,
  styleUrls: ['./governance-declaration-mycompliancecode.component.css'],
  imports:[CommonModule,RouterOutlet,DialogModelComponent],
   providers: [DatePipe]
})
export class GovernanceDeclarationMycompliancecodeComponent implements OnInit {
  
  @ViewChild(DialogModelComponent) dialogBox!: DialogModelComponent;
  startPage: boolean = true
  codecompliancequizPage: boolean = false;
  sucessEmptyList: boolean = true;
  empDetail: any
  roleList: any = [];
  temproleList: any = [];
  categoryList = [];
  listData: any = [];
  submittedlistData: any = [];
  templistData: any = [];
  menulistData: any = [];
  tempmenulistData: any = [];
  uniquemenuList: any[];
  uniqueTempList: any = [];
  uniquemenuListdata: Array<uniqueData> = [];
  uniqueMenuData: any = [];
  selectedCategory: any;
  // menuNameValueList: Array<menuData> = [];
  // templist: any = [];


  PreviousShow: boolean = false;
  NextShow: boolean = true;
  finalsubmitShow: boolean = false;
  selectedListOfACOC: any = [];
  questionOfACOC: any = [];

  pageNo: any;
  currentPageValue: any;
  unansweredList: any = [];
  viewUploadFile: any = null;
  viewAttachmentName: string = "";
  AttachmentValidExtension: string[] = ["PNG", "PDF", "JPG", "JPEG"];
  fileAttachmentError: string = "";
  InvalidAttachmentFileError = "Invalid file extension. Valid file extensions are jpg, jpeg, png, pdf.";
  downloadAttach: string = "";
  dataListValue: any = []
  isoptionClick: boolean = false;
  notratedlist: any = [];
  fileUploadName: any;
  iApplyNotAplicable: boolean = false;
  notApplicableText: any;
  counterValue: any = [];
  categoryName: string;
  noCategoryFound: boolean = false;
  countervalueSave: any;
  counterValueSubmit: any;
  editedCategoryText: any;
  roleIDvalue:any;
  idvalue: any;
  constructor(private commonservice: CommonService, private loaderService: LoaderService, private route: Router, private _service: AutheticationService,
    public sanitizer: DomSanitizer, private datePipe: DatePipe,) {
    this.commonservice.showHeaderComponents();
    this.uniquemenuList = []
     this.categoryName = ''
  
  }

  ngOnInit() 
  {
    this.getEmpDetails();
    this.checkrolemenu();
    this.viewchklist();
    this.startPage = false;
    this.codecompliancequizPage = true;
    $(".InsideSecDiv").css('display', 'none');
      setTimeout(() => {
        $("#govcodeId0").addClass('active');
      }, 100);
  }
  getEmpDetails() {
    this.empDetail = this.commonservice.getEmpDetails();
    
  }
  checkrolemenu() {
    this._service.checkrolemenu().subscribe(
      (result:any) => {
        this.temproleList=[];
        this.roleList = result[0].data;
        this.temproleList = result[0].data;
        this.roleIDvalue=  result[0].roleId;
        // role 1 - user ,role 2 - manager
        console.log(this.roleList,'roleList');
        console.log(this.temproleList,'temproleList')
        console.log(this.roleIDvalue,'roleIDvalue')
        for(var k=0;k<this.roleList.length;k++)
        {
          if(this.roleIDvalue == 1)
          {
            if(this.roleList[k][2] == "REPORT")
            this.temproleList.splice(k,1)
            console.log(this.temproleList,'temproleList')
          }
          else if(this.roleIDvalue == 2)
          {
            this.temproleList = this.roleList;
            console.log(this.temproleList,'temproleList')
          }
        }
      })
  }

  govcodetabclick(rolename:any)
  {
      if(rolename == "MY CODE COMPLIANCE")
      {
       
        this.route.navigate(['/govcodedeclaration/mycompliancecode']);
      }
      else if(rolename == 'REPORT')
      {
      
        this.route.navigate(['/govcodedeclaration/mycompliancereport']);
      }
      else if(rolename == "VIEW COMPLIANCE")
      {
       
        this.route.navigate(['/governance-code-declaration/viewcompliancecode']);
      }
  }
 viewchklist() {
  this.loaderService.show();
  this.listData = [];

  this._service.viewchklist().subscribe((result: any) => {
    this.loaderService.show();
    this.listData = result[0].data;
    console.log(this.listData, 'this.listData[m][3]');
    this.templistData = result[0].data;

    if (this.listData.length > 0) {
      this.NextShow = true;
      this.PreviousShow = false;
      this.uniquemenuList = [];
      this.uniqueMenuData = [];

      for (var m = 0; m < this.listData.length; m++) {
        this.menulistData.push(this.listData[m][10]);

        if (this.uniquemenuList.indexOf(this.menulistData[m]) === -1) {
          let uniquedataofcategory = new uniqueData();
          uniquedataofcategory.value = this.uniquemenuList.length;
          uniquedataofcategory.text = this.menulistData[m];

          this.uniquemenuListdata.push(uniquedataofcategory);
          this.uniquemenuList.push(this.menulistData[m]);
        }

        this.selectedCategory = this.uniquemenuListdata[0].text;

        if (this.listData[m][10] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[m]);
        }

        this.pageNo = 0;

        setTimeout(() => {
          for (var k = 0; k < this.uniqueMenuData.length; k++) {
            this.notApplicableText = this.uniqueMenuData[k][1];

            if (this.notApplicableText.includes('Report NA') == true) {
              $("#notApplicable" + k).show();
            } else {
              $("#notApplicable" + k).hide();
            }

            if (this.uniqueMenuData[k][3] == 'NA') {
              $('#RemarksText' + k).val("");
            } else {
              $('#RemarksText' + k).val(this.uniqueMenuData[k][3]);
            }

            if (this.uniqueMenuData[k][9] == 'C') {
              $("#savesublater" + this.pageNo).hide();
              this.finalsubmitShow = false;
              $("#submitlatertext").show();
            } else {
              $("#savesublater" + this.pageNo).show();
              $("#submitlatertext").hide();
            }

            if (this.uniqueMenuData[k][8] == 'YES' && this.uniqueMenuData[k][4].toLowerCase() == "na") {
              $('.attachFileIcon' + k).show();
            } else if (this.uniqueMenuData[k][14] != "") {
              $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
              $('.DownloadFileIcon' + k).show();
              $('.deleteFileIcon' + k).show();
              $('.attachFileIcon' + k).hide();
            }

            if (this.uniqueMenuData[k][2] == 'Yes') {
              $('#ocaWtypeSecYesD' + k).prop('checked', true);
            } else if (this.uniqueMenuData[k][2] == 'No') {
              $('#ocaWtypeSecNoE' + k).prop('checked', true);
            } else if (this.uniqueMenuData[k][2] == 'NA') {
              $('#ocaWtypeSecNotapplicableF' + k).prop('checked', true);
            }
          }
          this.loaderService.hide();
        }, 100);
      }
    }
  });
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
        if (this.listData[n][10] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      setTimeout(() => {
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

          if(this.uniqueMenuData[k][9] == 'C')
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

          if (this.uniqueMenuData[k][8] == 'YES'
            && this.uniqueMenuData[k][4].toLowerCase() == "na") {
            $('.attachFileIcon' + k).show();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] == "")
          // else if(this.uniqueMenuData[a][4] !='NA')
          {
            $('.deleteFileIcon' + k).show();
            $('.DownloadFileIcon' + k).hide();
            $('.attachFileIcon' + k).hide();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] != "") {
            $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
            $('.DownloadFileIcon' + k).show();
            $('.deleteFileIcon' + k).show();
            $('.attachFileIcon' + k).hide();
          }
        }
        //console.log(this.uniqueMenuData, 'this.uniqueMenuData')
        this.loaderService.hide();
      }, 100);
    }

  }
  getCurrentPageDataondropDown(currentMenu:any) {
    this.uniqueMenuData = [];
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][10] == currentMenu) {
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
  getCurrentPageData(currentMenu:any) {
    this.uniqueMenuData = [];
    console.log(this.listData, 'this.listData on curr page')
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][10] == currentMenu) {
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
      if (this.uniqueMenuData[a][8] == 'YES'
        && this.uniqueMenuData[a][4].toLowerCase() == "na") {
        $('.attachFileIcon' + a).show();
      }
      else if (this.uniqueMenuData[a][4] != 'NA' && this.uniqueMenuData[a][14] == "")
      // else if(this.uniqueMenuData[a][4] !='NA')
      {
        $('.deleteFileIcon' + a).show();
        $('.DownloadFileIcon' + a).hide();
        $('.attachFileIcon' + a).hide();
      }
      else if (this.uniqueMenuData[a][4] != 'NA' && this.uniqueMenuData[a][14] != "") {
        $('#attachFile' + a).val("codedeclaration_" + this.uniqueMenuData[a][4]);
        $('.DownloadFileIcon' + a).show();
        $('.deleteFileIcon' + a).show();
        $('.attachFileIcon' + a).hide();
      }


    }
  }
  // currentData() {
  //   for (var i = 0; i < this.templist.length; i++) {
  //     if (($("#ocaWtypeSecYesD" + i).is(':checked'))) {
  //       this.templist[i][2] = 'Y'
  //     }
  //     else if (($("#ocaWtypeSecNoE" + i).is(':checked'))) {
  //       this.templist[i][2] = 'N'
  //     }
  //     else if (($("#ocaWtypeSecNotapplicableF" + i).is(':checked'))) {
  //       this.templist[i][2] = 'NA'
  //     }
  //     this.templist[i][3] = $("#RemarksText" + i).val();
  //   }
  // }
  NextClick() {
    this.loaderService.show();
    var currentMenu = $('select#menuFilter option:selected').text();
    this.getCurrentPageData(currentMenu)
    this.pageNo = $('select#menuFilter option:selected').next().val();
    // this.currentPageValue = $('select#menuFilter option:selected').val();

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
        if (this.listData[n][10] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      setTimeout(() => {
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

          if(this.uniqueMenuData[k][9] == 'C')
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

          if (this.uniqueMenuData[k][8] == 'YES'
            && this.uniqueMenuData[k][4].toLowerCase() == "na") {
            $('.attachFileIcon' + k).show();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] == "")
          // else if(this.uniqueMenuData[a][4] !='NA')
          {
            $('.deleteFileIcon' + k).show();
            $('.DownloadFileIcon' + k).hide();
            $('.attachFileIcon' + k).hide();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] != "") {
            $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
            $('.DownloadFileIcon' + k).show();
            $('.deleteFileIcon' + k).show();
            $('.attachFileIcon' + k).hide();
          }
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
        if (this.listData[n][10] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      console.log(this.uniqueMenuData, ' this.uniqueMenuData prev')
      setTimeout(() => {
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

          if(this.uniqueMenuData[k][9] == 'C')
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


          if (this.uniqueMenuData[k][8] == 'YES'
            && this.uniqueMenuData[k][4].toLowerCase() == "na") {
            $('.attachFileIcon' + k).show();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] == "")
          // else if(this.uniqueMenuData[a][4] !='NA')
          {
            $('.deleteFileIcon' + k).show();
            $('.DownloadFileIcon' + k).hide();
            $('.attachFileIcon' + k).hide();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] != "") {
            $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
            $('.DownloadFileIcon' + k).show();
            $('.deleteFileIcon' + k).show();
            $('.attachFileIcon' + k).hide();
          }
        }
        this.loaderService.hide();
      }, 100);
    }
  }
  complianceTabClick() {
    $("#compliancetabId").addClass('activeLink')
    $("#reportstabId").removeClass('activeLink')

  }
  reportsTabClick() {
    $("#compliancetabId").removeClass('activeLink')
    $("#reportstabId").addClass('activeLink')

  }
  optionsclick(selectedquestion:any, optionValue:any, selectedCategoryValue:any, feedbackId:any) {
    this.isoptionClick = true;
    this.uniqueMenuData = [];
    console.log(selectedquestion, 'selectedquestion')
    console.log(optionValue, 'optionValue')
    console.log(selectedCategoryValue, 'selectedCategoryValue')
    // let tempQuesOptionsList = new selectedItemList();
    this.selectedCategory = selectedCategoryValue;
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][10] == selectedCategoryValue) {
        this.uniqueMenuData.push(this.listData[n]);
      }
    }
    for (var a = 0; a < this.uniqueMenuData.length; a++) {
      var attachment = $('#attachFile' + a).val();
      if (this.uniqueMenuData[a][0] == selectedquestion) {
        this.uniqueMenuData[a][2] = optionValue;
        this.uniqueMenuData[a][7] = feedbackId;
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
        this.listData[n][7] = feedbackId;
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
      $("#uploadDocumentTextSubmit").css("display", "none");
      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#answerAllText").css("display", "none");
      $("#uploadDocumentTextSave").css("display", "none");
      $("#remarksPopupText").css("display", "none");
      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      this.loaderService.hide();
      return
    }
    this.getCurrentPageData(category);
    var answer = {
      feedback: [] as string[]
    };
    this.countervalueSave = 0
    this.uniquemenuList = [];
    this.menulistData = [];
    for (var a = 0; a < this.listData.length; a++) {
      this.menulistData.push(this.listData[a][10]);
      if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
        this.countervalueSave = 1
        this.uniquemenuList.push(this.menulistData[a]);
      }
      else {
        this.countervalueSave++;
      }

      // var  attachment ="NA"
      if (this.listData[a][4] != "NA") {
        var attachment = this.listData[a][4]

        if (attachment.includes('codedeclaration_') == true) {
          attachment = this.listData[a][4]
        }
        else {
          attachment = "codedeclaration_" + this.listData[a][4];
        }
      }
      else {
        attachment = "NA"
      }

      var userAttachmentName = "NA";
      if (attachment == "" || attachment == undefined  || attachment == 'NA') {
        if (this.listData[a][4] == 'NA') {
          userAttachmentName = "NA";
        }
      }
      else {
        attachment = attachment.split("_")[1] + "_" + attachment.split("_")[2];
        // attachment = this.listData[a][4];
        userAttachmentName = attachment;
      }

      if (this.listData[a][3] == "") {
        this.listData[a][3] = "NA"
      }
      if (this.listData[a][8].toLowerCase() == 'yes' && this.listData[a][4] == 'NA' && this.listData[a][2] != 'Not Rated') {
        this.editedCategoryText = this.listData[a][10];
        $("#unanswered").modal("show");
        $("#uploadDocumentTextSave").css("display", "block")
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#remarksPopupText").css("display", "none");

        // this.dialogBox.popUpOpen2('Please attach supporting document for ' 
        // + this.listData[a][10] + ' with Question No. '+ this.countervalueSave, 'leave', 'error2');
        this.loaderService.hide();
        return;
      }
      var selectedValue = this.listData[a][2]
      var complianceValue = this.listData[a][11]
      if (selectedValue == 'No' && complianceValue == 'No' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][10]
        // this.dialogBox.popUpOpen2('Please enter Remarks for category ' + this.listData[a][10] + ' of question No. ' + this.countervalueSave, 'leave', 'error2');
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'Yes' && complianceValue == 'Yes' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][10]
        // this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][10] + ' of question No. ' + this.countervalueSave, 'leave', 'error2');
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'NA' && complianceValue == 'NA' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        this.editedCategoryText = this.listData[a][10]
        //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][10] +  'of question No. ' + this.countervalueSave, 'leave', 'error2');
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#unanswered").modal("show");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }

      var data =
        this.listData[a][2] + "," + this.listData[a][3] + "," + this.listData[a][7] + ","
        + this.listData[a][0] + "," + userAttachmentName
      answer.feedback.push(data);
      console.log(answer, '----');
    }
    this._service.codeDeclarationSubmit(answer, 'Save').subscribe(
      (result:any) => {
        if (result[0].data == true) {
          this.getsubmittedData(category, 'Save')
        }
      })
  }

  getsubmittedData(category:any, modeOfsave:any) {
    this.loaderService.show();
    this._service.viewchklist().subscribe(
      (result:any) => {
        this.listData = result[0].data;
        // setTimeout(() => {
        this.uniqueMenuData = [];
        for (var m = 0; m < this.listData.length; m++) {
          if (this.listData[m][10] == category) {
            this.uniqueMenuData.push(this.listData[m]);
          }
        }
        console.log(this.uniqueMenuData, 'uniqueMenuData')
        setTimeout(() => {
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

            if(this.uniqueMenuData[k][9] == 'C')
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

            if (this.uniqueMenuData[k][8] == 'YES'
              && this.uniqueMenuData[k][4].toLowerCase() == "na") {
              $('.attachFileIcon' + k).show();
            }
            // else if (this.uniqueMenuData[k][14] != "") {
            else if (this.uniqueMenuData[k][4] != "NA") {
              $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
              $('.DownloadFileIcon' + k).show();
              $('.deleteFileIcon' + k).show();
              $('.attachFileIcon' + k).hide();
              $('.attachFileIcon' + k).css("display", "none")
            }
            else if (this.uniqueMenuData[k][14] != "") {
              $('.DownloadFileIcon' + k).show();
            }
          }
          this.loaderService.hide();
        }, 100);
      }, (err:any) => {
      });
    $("#unanswered").modal("show");
    if (modeOfsave == 'Save') {
      $("#saveText").css("display", "block")
      $("#submittedText").css("display", "none");
    }
    else if (modeOfsave == 'SignOff') {
      $("#saveText").css("display", "none")
      $("#submittedText").css("display", "block");
    }
    $("#uploadDocumentTextSubmit").css("display", "none");
    $("#atleastOneText").css("display", "none");
    $("#answerAllText").css("display", "none");
    $("#uploadDocumentTextSave").css("display", "none")
    $("#remarksPopupText").css("display", "none")

    this.unansweredList = [];
    $("#unansweredText").css("display", "none");
  }

  FinalSubmit(category:any) {
    this.loaderService.show();
    this.notratedlist = [];
    for (var a = 0; a < this.listData.length; a++) {
      if (this.listData[a][2] == 'Not Rated') {
        this.notratedlist.push('Not Rated')
      }
    }
    if (this.notratedlist.length == this.listData.length) {
      // this.dialogBox.popUpOpen2('Kindly answer all questions.', 'leave', 'information2')
      $("#unanswered").modal("show");
      $("#answerAllText").css("display", "block");
      $("#uploadDocumentTextSubmit").css("display", "none");
      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#uploadDocumentTextSave").css("display", "none");
      $("#remarksPopupText").css("display", "none");
      this.unansweredList = [];
      $("#unansweredText").css("display", "none");
      this.loaderService.hide();
      return
    }
    this.unansweredList = [];
    // this.counterValueSubmit = 0;
    this.countervalueSave=0;
    this.uniquemenuList = [];
    this.menulistData = [];
    this.counterValue = [];
    for (var a = 0; a < this.listData.length; a++) {
      this.menulistData.push(this.listData[a][10]);
      if (this.uniquemenuList.length > 0) {
        if (this.menulistData[this.menulistData.length - 1] != this.uniquemenuList[this.uniquemenuList.length - 1]) {
          if (this.counterValue.length > 0) {
            this.unansweredList.push('Kindly answer question no ' + this.counterValue.toString() + ' in "' + this.categoryName + '".')
            console.log(this.unansweredList, 'unansweredList')
          }

        }
      }

      if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
        this.counterValueSubmit = 1
        // this.countervalueSave=1;
        this.uniquemenuList.push(this.menulistData[a]);
        if (this.menulistData[a] == this.listData[a][10] && this.listData[a][2] == 'Not Rated') {
          this.counterValue = [];
          this.counterValue.push(this.counterValueSubmit)
          // this.counterValue.push(this.countervalueSave)
          this.categoryName = this.listData[a][10]
        }
        else if (this.uniquemenuList[this.uniquemenuList.length - 1] == this.listData[a][10] && this.listData[a][2] != 'Not Rated') {
          this.counterValue = [];
          this.categoryName = this.uniquemenuList[this.uniquemenuList.length - 1]
        }
      }
      else {
        this.counterValueSubmit++;
        // this.countervalueSave++;
        if (this.menulistData[a] == this.listData[a][10] && this.listData[a][2] == 'Not Rated') {
          this.counterValue.push(this.counterValueSubmit)
          // this.counterValue.push(this.countervalueSave)
          this.categoryName = this.listData[a][10]
        }
      }
    }
    if (this.counterValue.length > 0) {
      this.unansweredList.push('Kindly answer question no ' + this.counterValue.toString() + ' in "' + this.uniquemenuList[this.uniquemenuList.length - 1] + '".')
    }
    if (this.unansweredList.length > 0) {
      $("#unanswered").modal("show");
      $("#unansweredText").css("display", "block")

      $("#uploadDocumentTextSubmit").css("display", "none");
      $("#saveText").css("display", "none");
      $("#submittedText").css("display", "none");
      $("#atleastOneText").css("display", "none");
      $("#answerAllText").css("display", "none");
      $("#uploadDocumentTextSave").css("display", "none");
      $("#remarksPopupText").css("display", "none");
      this.loaderService.hide();
      return
    }


    var answer = {
      feedback: [] as string[]
    };
    console.log(this.listData,'this.listData-----------')
    this.countervalueSave = 0
    this.uniquemenuList = [];
    this.menulistData = [];
    for (var a = 0; a < this.listData.length; a++) {
      this.menulistData.push(this.listData[a][10]);
      if (this.uniquemenuList.indexOf(this.menulistData[a]) === -1) {
        this.countervalueSave = 1
        this.uniquemenuList.push(this.menulistData[a]);
      }
      else {
        this.countervalueSave++;
      }

       // var  attachment ="NA"
       if (this.listData[a][4] != "NA") {
        var attachment = this.listData[a][4]

        if (attachment.includes('codedeclaration_') == true) {
          attachment = this.listData[a][4]
        }
        else {
          attachment = "codedeclaration_" + this.listData[a][4];
        }
      }
      else {
        attachment = "NA"
      }

      var userAttachmentName = "NA";
      if (attachment == "" || attachment == undefined  || attachment == 'NA') {
        if (this.listData[a][4] == 'NA') {
          userAttachmentName = "NA";
        }
      }
      else {
        attachment = attachment.split("_")[1] + "_" + attachment.split("_")[2];
        // attachment = this.listData[a][4];
        userAttachmentName = attachment;
      }

      if (this.listData[a][3] == "") {
        this.listData[a][3] = "NA"
      }
      if (this.listData[a][8].toLowerCase() == 'yes' && this.listData[a][4] == 'NA' && this.listData[a][2] != 'Not Rated') {
        this.editedCategoryText = this.listData[a][10];
        $("#unanswered").modal("show");
        $("#uploadDocumentTextSubmit").css("display", "block");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#remarksPopupText").css("display", "none");
        
        // this.dialogBox.popUpOpen2('Please attach supporting document for ' 
        // + this.editedCategoryText + ' with Question No. '+ this.counterValueSubmit, 'leave', 'error2');
        this.loaderService.hide();
        return;
      }
      var selectedValue = this.listData[a][2]
      var complianceValue = this.listData[a][11]
      if (selectedValue == 'No' && complianceValue == 'No' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        // this.dialogBox.popUpOpen2('Please enter Remarks for category ' + this.listData[a][10] + ' of question No. ' + this.counterValueSubmit, 'leave', 'error2');
        this.editedCategoryText = this.listData[a][10];
        $("#unanswered").modal("show");
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'Yes' && complianceValue == 'Yes' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][10] + ' of question No. ' + this.counterValueSubmit, 'leave', 'error2');
        this.editedCategoryText = this.listData[a][10];
        $("#unanswered").modal("show");
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }
      else if (selectedValue == 'NA' && complianceValue == 'NA' && (this.listData[a][3] == 'NA' || this.listData[a][3] == "")) {
        //this.dialogBox.popUpOpen2('Please enter Remarks for category' + this.listData[a][10] +  'of question No. ' + this.counterValueSubmit, 'leave', 'error2');
        this.editedCategoryText = this.listData[a][10];
        $("#unanswered").modal("show");
        $("#uploadDocumentTextSubmit").css("display", "none");
        $("#saveText").css("display", "none");
        $("#submittedText").css("display", "none");
        $("#atleastOneText").css("display", "none");
        $("#answerAllText").css("display", "none");
        $("#uploadDocumentTextSave").css("display", "none");
        this.unansweredList = [];
        $("#unansweredText").css("display", "none");
        $("#remarksPopupText").css("display", "block");
        this.loaderService.hide();
        return;
      }

      var data =
        this.listData[a][2] + "," + this.listData[a][3] + "," + this.listData[a][7] + ","
        + this.listData[a][0] + "," + userAttachmentName
      answer.feedback.push(data);
      console.log(answer, '----');
    }
    this._service.codeDeclarationSubmit(answer, 'SignOff').subscribe(
      (result:any) => {
        if (result[0].data == true) {
          this.getsubmittedData(category, 'SignOff')
        }
      })
  }


  onFileSelectEvent(e:any, index:any) {
    this.viewUploadFile = null;
    this.viewAttachmentName = "";
    this.fileUploadName = e.target.files[0].name;
    if (this.validateFileExtension(e.target.files[0].name)) {
      this.fileAttachmentError = "";
      this.viewUploadFile = e.target.files[0];
      this.viewAttachmentName = this.viewUploadFile.name;
      this.submitAttachment(index);
    }
    else {
      //Assign error message to class.
      this.fileAttachmentError = this.InvalidAttachmentFileError;
    }
    $('.fileSelectBtn').blur();
  }

  getExtensionOfFile(name: string) {
    return name.split(".")[name.split(".").length - 1];
  }

  getFileNameWOExtention(name: string) {
    // return name.split(".")[0];
    var flName = name.substr(0, name.lastIndexOf(".")).replace(/_/g, "-").replace(/\./g, "-");
    return flName;
  }

  validateFileExtension(fileName: string) {
    let fileExtension: string = this.getExtensionOfFile(fileName);
    for (let i = 0; i < this.AttachmentValidExtension.length; i++) {
      if (this.AttachmentValidExtension[i] == fileExtension.toUpperCase())
        return true;
    }
    return false;
  }

  getTimeStampFileName(fileName: string, extension: string) {
    return fileName + Date.now().toString() + "." + extension;
  }

  submitAttachment(index: any) {

    if (this.viewUploadFile != null && this.viewAttachmentName != "") {


      var fileName = "codedeclaration_" + this.getFileNameWOExtention(this.viewUploadFile.name) + "_";
      //+userName[0] + "_";
      // fileName = fileName.replace(".", "");
      fileName = this.getTimeStampFileName(fileName, this.getExtensionOfFile(this.viewUploadFile.name));
      // var newFileName = fileName.replace('codedeclaration_','');
      $("#attachFile" + index).val(fileName);
      this.uniqueMenuData=[];
      for (var n = 0; n < this.listData.length; n++) {
        if (this.listData[n][10] == this.selectedCategory) {
          this.uniqueMenuData.push(this.listData[n]);
        }
      }
      console.log("this.uniqueMenuData", this.uniqueMenuData);
      this.uniqueMenuData[index][4] = fileName;
      setTimeout(() => {
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


          if (this.uniqueMenuData[k][8] == 'YES'
            && this.uniqueMenuData[k][4].toLowerCase() == "na") {
            $('.attachFileIcon' + k).show();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] == "")
          // else if(this.uniqueMenuData[a][4] !='NA')
          {
            $('.deleteFileIcon' + k).show();
            $('.DownloadFileIcon' + k).hide();
            $('.attachFileIcon' + k).hide();
          }
          else if (this.uniqueMenuData[k][4] != 'NA' && this.uniqueMenuData[k][14] != "") {
            $('#attachFile' + k).val("codedeclaration_" + this.uniqueMenuData[k][4]);
            $('.DownloadFileIcon' + k).show();
            $('.deleteFileIcon' + k).show();
            $('.attachFileIcon' + k).hide();
          }
          $('.attachFileIcon' + index).hide();
          $('.deleteFileIcon' + index).show();
          //$('.DownloadFileIcon' + index).show();
          this._service.eurekaSubmitFile(this.viewUploadFile, fileName).subscribe((res:any) => {
            // res = [];
            if (res.length == 0) {
              this.dialogBox.popUpOpen2('There was an error while uploading the file. Please try again!', 'donate', 'error2');
              return false;
            }
            else if (res[0].data == true) {
              return fileName;
            }
            else {
              this.dialogBox.popUpOpen2('Maximum file size (10 MB) exceeded.', 'donate', 'error2');
              return false;
            }
          });
          (err:any) => {
            this.dialogBox.popUpOpen2('There was an error while uploading the file. Please try again!', 'donate', 'error2');
            return false;
          }
        }
      }, 100);
  
    }
    else {
      var fileName = "";
    }
    // return "";
  }

  InputFileName(e:any) {
    e.target.value = null;
  }

  downloadAttachment(item: any, name: any) {
  if (!item) return;

  const agent = window.navigator.userAgent.toLowerCase();
  const fileName = name;

  const toByteArray = (base64: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Uint8Array(byteNumbers);
  };

  if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
    // IE workaround
    const blob = new Blob([toByteArray(item)], { type: 'application/octet-stream' });
    (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
  } else if (agent.indexOf('firefox') > -1) {
    const blob = new Blob([toByteArray(item)], { type: 'application/octet-stream' });
    saveAs(blob, fileName);
  } else {
    const link = document.createElement('a');
    link.href = 'data:application/octet-stream;base64,' + item;
    link.download = fileName;
    link.click();
  }
}
  deleteAttachment(i:any) {
    $('.attachFileIcon' + i).show();
    $('.deleteFileIcon' + i).hide();
    $('.DownloadFileIcon' + i).hide();
    //$('#attachFile' + i).val("");
    $('#attachFile' + i).val(null);
    for (var n = 0; n < this.listData.length; n++) {
      if (this.listData[n][10] == this.selectedCategory) {
        this.uniqueMenuData.push(this.listData[n]);
      }
    }
    this.uniqueMenuData[i][4] = "NA";
    this.uniqueMenuData[i][14] = "";
  }
  dismissModal() {
    $("#unanswered").modal("hide");
  }
}
export class uniqueData {
  value: any;
  text: any;
  constructor() {

  }
}




