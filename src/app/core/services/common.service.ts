import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Observable, tap } from 'rxjs';
import { UtilityService } from '../../shared/shared-services/utility.service';


@Injectable({
  providedIn: 'root'
})
export class CommonService {
  Cryptokey = CryptoJS.enc.Utf8.parse('bcctoi1521bl1234');
  Cryptoiv = CryptoJS.enc.Utf8.parse('bcctoi1521bl1234');
  private config: any | null = null;
  constructor(private http: HttpClient, private utility: UtilityService) { }

  private withCacheBuster(url: string): string {
    return `${url}?t=${new Date().getTime()}`;
  }

  updatetoken(user: string | null, userkey: string | null) {
    
    localStorage.setItem('currentUser', user!);
    localStorage.setItem('currentUserkey', userkey!);

  }
  employeedetails(data: any) {
    if (data) {
      sessionStorage.setItem('TOIID', data.timescapeUserOID);
      sessionStorage.setItem('parentName', data.empFullName);
      sessionStorage.setItem('emailId', data.emailId);
    }
  }
  gettoken() {
    let user: any = {};
    user.value = localStorage.getItem('currentUser');
    user.keyvalue = localStorage.getItem('currentUserkey');
    user.emailID = sessionStorage.getItem('emailId');
    user.TOIID = sessionStorage.getItem('TOIID');
    return user;
  }
  getIsAdmin(): boolean {
    let isAdmin = false;
  this.utility.isAdmin$.subscribe(value => {
    isAdmin = value;
  });
    return isAdmin? true : false
  }

  updateemployeedetails(signedin: any) {
    if (signedin == "true") {
      sessionStorage.setItem('signedin', signedin);
    }
    else {
      sessionStorage.setItem('signedin', '');
    }
  }
  setEmpDetails(empdetail: any) {
    //var empdetail1="sjfghj";
    // var empdetails = this.CryptoEncrypt(empdetail);
    // localStorage.removeItem("empdetails");
    var empdetails = this.CryptoEncrypt(JSON.stringify(empdetail));
    
    localStorage.setItem('empdetails', empdetails!);
  }
  // getEmail(){
  //   return sessionStorage.getItem('emailId');
  // }
  // getPortalId(){
  //   return sessionStorage.getItem('portalId');
  // }

  CryptoEncrypt(textCipher: string) {
    try {
      var encrypted = CryptoJS.AES
        .encrypt(textCipher, this.Cryptokey, { iv: this.Cryptoiv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
      return encrypted.toString().replace(/\//g, ",,").replace(/\+/g, "~");
    } catch (error) {
      return JSON.stringify(error)
    }
  }

  //Use :  this.sharedService.CryptoDecrypt("text-to-decrypt");
  CryptoDecrypt(textEncypted: string) {

    textEncypted = textEncypted.replace(/,,/g, "/").replace(/~/g, "+");

    var decrypted = CryptoJS.AES.decrypt(textEncypted, this.Cryptokey, { iv: this.Cryptoiv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  getEmpDetails() {
    try {
      var empdetail = localStorage.getItem('empdetails');
      if (empdetail != null) {
        empdetail = this.CryptoDecrypt(empdetail);
        var result = JSON.parse(empdetail);
        return result;
      }
    } catch (error) {
      JSON.stringify(error)
    }
  }
  //  ------------------------- QuickLinks -------------------------- 

  quicklinkConfig(): Observable<any> {
    return this.http.get(this.withCacheBuster('asset/configdata/quickLinks.json'));
  }

  //  ------------------------- Header --------------------------
  headerConfig(): Observable<any> {
    return this.http.get(this.withCacheBuster('asset/configdata/headerconfig.json'));
  }

  //  ------------------------- QuickLinks -------------------------- 
  getConfigData(): Observable<any> {
    return this.http.get(this.withCacheBuster('asset/configdata/appconfig.json'));
  }
  
  helpdeskConfig(): Observable<any> {
    return this.http.get(this.withCacheBuster('asset/configdata/helpdesk.json'));
  }

   loadConfig(): Observable<any> {
    return this.http
      .get(this.withCacheBuster('asset/configdata/appconfig.json'))
      .pipe(tap(cfg => this.config = cfg));
  }

  getFunConfig(): Observable<any> {
    return this.http
      .get(this.withCacheBuster('asset/configdata/funlevityconfig.json'))
      .pipe(tap(cfg => this.config = cfg));
  }

  isSessionCheckEnabled(): boolean {
    return !!this.config?.sessionCheck;
  }

}
