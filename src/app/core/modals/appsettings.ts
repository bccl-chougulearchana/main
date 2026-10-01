declare var require: any;
import { environment } from "../../../environments/environment";


export class AppSettings {

  // api base url
  public static token: any;
  public static appuser: string;
  public static pagetitle = "Home";
  public static apitime = environment.apiUrl;
  public static apitimep_1 = AppSettings.apitime + "/timescape/api";
  // public static apitimer_1 = AppSettings.apitime + "/timescape_root/contentuploads";

  public static CCCONTENTURL = AppSettings.apitime + "/timescape_root/contentuploads/corporateconnect/";
  public static ECCONTENTURL = AppSettings.apitime + "/timescape_root/contentuploads/employeeconnect/";
  public static LCCONTENTURL = AppSettings.apitime + "/timescape_root/contentuploads/leaderconnect/";
  public static FLCONTENTURL = AppSettings.apitime + "/timescape_root/contentuploads/funlevityconnect/";
  public static NOTICEBOARD = AppSettings.apitime + "/timescape_root/contentuploads/noticeboards/";

  public static authorization: any;
  public static authorizationkey: any;
  public static API_TIMELOGIN = AppSettings.apitimep_1 + "/login/chklogin";
  public static API_CUSTOM_LOGIN = AppSettings.apitimep_1 + "/login/chkuser";
  public static API_ALREADY_LOGIN = AppSettings.apitimep_1 + "/login/checkalreadylogin";
  public static API_TIMELOGOUT = AppSettings.apitimep_1 + "/login/logout";
  public static API_POSTEDSTORIES = AppSettings.apitimep_1 + "/contentupload/savecontent";
  public static API_UPDATESTORYSTATUS = AppSettings.apitimep_1 + "/contentupload/updatecontent";
  public static API_GETALLSTORIES = AppSettings.apitimep_1 + "/contentupload/getcontent";
  public static API_GETALLOWNERSHIPSTORIES = AppSettings.apitimep_1 + "/contentupload/getallcontent";
  public static API_VISIT = AppSettings.apitimep_1 + "/contentupload/visit";
  public static API_VIEW = AppSettings.apitimep_1 + "/contentupload/totalviewscontent";
  public static API_DOWNLOADREPORT = AppSettings.apitimep_1 + "/contentupload/downloadUserLogData";
  public static API_GETLIKEBY = AppSettings.apitimep_1 + "/contentupload/getlikeby";
  public static API_GETALERTS = AppSettings.apitimep_1 + "/contentupload/getalerts";
  public static API_GETNOTICES = AppSettings.apitimep_1 + "/contentupload/getnotices"
  public static vcoTextUrl = AppSettings.apitime + '/timescape_root/vcoupload/quote.properties';
  public static API_VENDOR_LOCATOR = AppSettings.apitime + "/timescape/api/partnerdx/getVendorData";
  public static API_TIME_LEAVE_INFORM_COLLEAGUES = AppSettings.apitime + "/timescape/api/leave/getothercolleagus";
  public static API_REQUISITIONER_LOCATOR = AppSettings.apitime + "/timescape/api/partnerdx/getPOData";
  // ------------------------- Humour Carousel Home ----------------------- 
  // public static humourCarousel = "https://tsweb.timesgroup.com/timescape/homepage/assets/images/corporatehumour//";
  public static humourCarousel = AppSettings.apitime + "/timescape/homepage/assets/images/corporatehumour/";
  // ------------------------- Humour Carousel Home ----------------------- 

  public static contentRefreshTimeInMinutes = 0; //10 minute in milliseconds

  // ------------------------ Poll ------------------------ 
  public static API_GETPOLLDETAILS = AppSettings.apitimep_1 + "/contentupload/getpolldetails";
  public static API_RECORDPOLLRESPONSE = AppSettings.apitimep_1 + "/contentupload/recordpollresponse";
  public static API_GETPOLLSUMMARY = AppSettings.apitimep_1 + "/contentupload/getpollsummary";
  public static API_CHECKPOLLSTATUS = AppSettings.apitimep_1 + "/contentupload/checkpollstatus";
  // ------------------------ Poll ------------------------ 

  // ---------Investment--------------//
  public static API_DISCLOSURELISTROLE = AppSettings.apitimep_1 + '/disclosure/listRoles';
  public static API_GETINITIALQUESTION = AppSettings.apitimep_1 + "/disclosure/getInitialQuestion";
  public static API_INSERTINITIALANWSER = AppSettings.apitimep_1 + "/disclosure/insertInitialAnswer";
  public static API_GETQUESTION = AppSettings.apitimep_1 + "/disclosure/getQuestion";
  public static API_GETANSWER = AppSettings.apitimep_1 + "/disclosure/getAnswer";
  public static API_GETFEEDBACK = AppSettings.apitimep_1 + "/disclosure/getFeedback";
  public static API_INSERTFEEDBACK = AppSettings.apitimep_1 + "/disclosure/insertFeedback";
  public static API_INSERTSTOCKRECORD = AppSettings.apitimep_1 + "/disclosure/insertStockRecord";
  public static API_GETSTOCKDATA = AppSettings.apitimep_1 + "/disclosure/getStockData";
  public static API_GETREALDATA = AppSettings.apitimep_1 + "/disclosure/getRealData";
  public static API_GETUNLISTEDDATA = AppSettings.apitimep_1 + "/disclosure/getUnlistedData";
  public static API_CANCELSTOCKDATA = AppSettings.apitimep_1 + "/disclosure/cancelStockRecord";
  public static API_CANCELREALDATA = AppSettings.apitimep_1 + "/disclosure/cancelRealRecord";
  public static API_CANCELUNLISTEDDATA = AppSettings.apitimep_1 + "/disclosure/cancelUnlistRecord";

  // -----------Investment------------//
  public static noserver = 'Server is not connected';
  public static noresponse = 'No response from server';
  public static badrequest = 'This is a bad request';
  public static unauthorized = 'Server says unauthorized';
  public static forbidden = 'This request is forbidden';
  public static notfound = 'Server says not found';
  public static internalerror = 'Server encountered internal error';

  // ---------------Society Account---------------//
  public static API_TRANSACT = AppSettings.apitime + "/timescape/api/societyaccount/getransact";
  public static API_MEMBER_TRANSACT = AppSettings.apitime + "/timescape/api/societyaccount/getmembertrans";
  public static API_GET_FILES_LIST = AppSettings.apitime + "/timescape/api/societyaccount/allforms";
  public static API_GET_IMAGE = AppSettings.apitime + "/timescape/api/societyaccount/file";
  public static API_ALL_TXN = AppSettings.apitime + "/timescape/api/societyaccount/alltransactions";
  public static API_TXN_MNTH = AppSettings.apitime + "/timescape/api/societyaccount/gettransmonth";
  public static API_MEMBER_BALANCE = AppSettings.apitime + "/timescape/api/societyaccount/getmemberbalance";

  // -----------OCA-----------//
  public static API_LIST_ROLES = AppSettings.apitime + "/timescape/api/oca/listroles";
  public static API_MY_COMP_FREQ = AppSettings.apitime + "/timescape/api/oca/mycompfreq";
  public static API_ENSURE_COMP_FREQ = AppSettings.apitime + "/timescape/api/oca/ensurecompfreq";
  public static API_LIST_MENU = AppSettings.apitime + "/timescape/api/oca/listmenu";
  public static API_VIEW_POLICIES = AppSettings.apitime + "/timescape/api/oca/viewpolicies";
  public static API_VIEW_USER_POLICIES = AppSettings.apitime + "/timescape/api/oca/viewuserpolicies";
  public static API_INSERT_FEEDBACK = AppSettings.apitime + "/timescape/api/oca/insertfeedback";
  public static API_TIME_EUREKA_SUBMIT_FILE = AppSettings.apitime + "/timescape/api/upload/eurekafile";

  //-------------Dashboard--------------//
  public static API_COMP_LIST = AppSettings.apitime + "/timescape/api/oca/dashbcomplist";
  public static API_DEPT_LIST = AppSettings.apitime + "/timescape/api/oca/dashbdeptlist";
  public static API_FUNC_LIST = AppSettings.apitime + "/timescape/api/oca/dashbfunctlist";
  public static API_DASHBOARD_SUBMIT = AppSettings.apitime + "/timescape/api/oca/dashbdata"


  // ---------------------------------- HOSPITALIZATION --------------------------------
  public static API_TIME_HOSPITALIZATION = AppSettings.apitime + "/timescape/api/intimation/send";
  // ---------------------------------- HOSPITALIZATION --------------------------------

  
//-------------------------------------Scholarship--------------------------------------//
  public static API_ADDENTRY = AppSettings.apitimep_1 + '/scholarship/addEntryList';
  public static API_DUBLICATEENTRY = AppSettings.apitimep_1 + '/scholarship/duplicateEntry';
  public static API_UPLOADFILEWITHFORM = AppSettings.apitimep_1 + '/scholarship/uploadFilesWithForm';
  public static API_UPLOADATTACHFILESWITHFORM = AppSettings.apitimep_1 + '/scholarship/uploadAttachFilesWithForm';
  public static API_CHECKSTATUS = AppSettings.apitimep_1 + '/scholarship/viewDetailsByTOID';
  public static API_GENERATECERTIFICATE = AppSettings.apitimep_1 + '/scholarship/generateCertificate';
  public static API_DELETEFILE = AppSettings.apitimep_1 + '/scholarship/deleteFile';
  public static API_DOWNLOADFILE = AppSettings.apitimep_1 + '/scholarship/downloadFile';
  public static API_LISTROLE = AppSettings.apitimep_1 + '/scholarship/listRoles';
  public static API_CHECKPENDINGREQUEST = AppSettings.apitimep_1 + '/scholarship/checkPendingRequest';
  public static API_UPDATEPENDINGREQUEST = AppSettings.apitimep_1 + '/scholarship/updatePendingRequest';
  public static API_SHOWACCEPTEDLIST = AppSettings.apitimep_1 + '/scholarship/showAcceptedList';
  //--------------------------------------Scholarship--------------------------------------

  //=====================================Governance Code-Quiz ======================================================
  public static API_QUIZ_DATA = AppSettings.apitimep_1 + "/codequiz/listquestions";
  public static API_CHECK_SCORE = AppSettings.apitimep_1 + "/codequiz/checkscore";
  public static API_SUBMIT_SCORE = AppSettings.apitimep_1 + "/codequiz/submit";

   //=====================================Governance Code-Declaration ===============================================
  public static API_CHECK_ROLEMENU = AppSettings.apitime + "/timescape/api/codedeclaration/checkrolemenu";
  public static API_VIEW_LIST = AppSettings.apitime + "/timescape/api/codedeclaration/viewchklist";
  public static API_DECLARATION_FEEDBACK = AppSettings.apitime + "/timescape/api/codedeclaration/submit";
  public static API_APPROVER_LIST = AppSettings.apitime + "/timescape/api/codedeclaration/viewapprchklist";
  public static API_VIEW_USER_FDBK = AppSettings.apitime + "/timescape/api/codedeclaration/viewuserfdbk";
  public static API_APPROVER_DECLARATION_FEEDBACK = AppSettings.apitime + "/timescape/api/codedeclaration/submitapprfdbk";
  public static  API_USER_NRFDBK = AppSettings.apitime + "/timescape/api/codedeclaration/usernrfdbk";
  public static API_VIEW_NC_USER = AppSettings.apitime + "/timescape/api/codedeclaration/viewusersnc";
  public static API_SUBORDINATE_REPORT_TOTALCOUNT = AppSettings.apitime + "/timescape/api/codedeclaration/totalcountsubordinate";
}

