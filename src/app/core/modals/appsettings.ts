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
  public static API_INSERTINITIALANWSER = AppSettings.apitimep_1 +"/disclosure/insertInitialAnswer";
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

}

