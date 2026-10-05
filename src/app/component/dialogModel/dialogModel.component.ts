import { Component, ViewChild } from '@angular/core';
import { LoaderService } from '../../shared/shared-services/loader.service';
import { DialogModelService } from '../../services/dialog/dialogModelService';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
declare var $: any;

@Component({
    selector: 'app-dialogModel',
    standalone:true,
    templateUrl: './dialogModel.component.html',
    imports:[RouterLink,CommonModule]

})
export class DialogModelComponent {
    message: string = '';
    condition = '';
    page = '';
    quest2travelmessage: any;
    constructor(private loaderService: LoaderService, private dialogModelService: DialogModelService) {

        this.dialogModelService.componentMethodCalled$.subscribe(
            (model: any) => {
                // this.popUpOpen(model.message,model.condition);
                this.popUpNoInternet(model.message, model.condition);
            }
        );
        this.dialogModelService.componentMethodCallSourceServiceError$.subscribe((model: any) => {
            this.popUpOpenServiceError(model.message, model.condition);
        });
    }
    setLoaderOff() {

        this.loaderService.hideNew();
    }

    popUpOpenServiceError(message: any, condition: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;

        var promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                setTimeout(() => {
                    this.loaderService.hide();
                    $("#myModal").modal("show");
                    $("#btnOk").click(function () {
                        window.location.reload();
                    });
                }, 100);
                resolve();
            }, 300);
        });
        return promise;
    }

    // for no internet connection
    popUpNoInternet(message: any, condition: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;

        var promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                setTimeout(() => {
                    this.loaderService.hide();
                    $("#noInternetModal").modal("show");
                }, 1000);
                resolve();
            }, 400);
        });
        return promise;
    }

    popUpOpen(message: any, condition: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;

        var promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                setTimeout(() => {
                    this.loaderService.hide();
                    $("#myModal").modal("show");
                }, 1000);
                resolve();
            }, 400);
        });
        return promise;
    }


    //for page dependentdialogs starts --

    popUpOpen2(message: any, page: any, condition: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;
        this.page = page;

        var promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                setTimeout(() => {
                    this.loaderService.hide();
                    $("#myModal").modal("show");
                }, 1000);
                resolve();
            }, 300);
        });
        return promise;
    }

    dismissModal() {
        $(".modal-backdrop").hide();
    }


    errorPopUpOpen2(message: any, page: any, condition: any, cb: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;
        this.page = page;
        var value = true;
        var promise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                setTimeout(() => {
                    this.loaderService.hide();
                    $("#myModal").modal("show");
                    cb(value);
                }, 1000);
                resolve();
            }, 300);
        });
        return promise;
    }

    popUpOpen_callback2(message: any, page: any, condition: any, cb: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;
        this.page = page;
        var value = true;
        setTimeout(() => {
            setTimeout(() => {
                this.loaderService.hide();
                $("#myModal").modal("show");
                cb(value);

                $("#btnOk").click(() => {
                    this.loaderService.hide();
                    cb(value);
                });
            }, 1000);
        }, 1000);
    }


    //for page dependentdialogs ends --

    //  doAsyncTask(cb) {
    //      var value = true;
    //     setTimeout(() => {
    //         this.condition = 'error';
    //             $("#myModal").modal("show");
    //             $("#btnOk").click(function(){
    //                 alert("The paragraph was clicked.");
    //                 cb(value);
    //             });
    //         }, 1000);
    //     }



    popUpOpen_callback(message: any, condition: any, cb: any) {

        this.loaderService.show();
        this.message = message;
        this.condition = condition;
        var value = true;
        setTimeout(() => {
            setTimeout(() => {
                this.loaderService.hide();
                $("#myModal").modal("show");
                cb(value);

                $("#btnOk").click(function () {

                    cb(value);
                });
            }, 1000);
        }, 1000);
    }
    popUpOpen_callback_confirm(message: any, page: any, condition: any, cb: any) {
        this.loaderService.show();
        this.message = message;
        this.condition = condition;
        this.page = page;
        var value = true;
        setTimeout(() => {
            setTimeout(() => {
                this.loaderService.hide();
                $("#myModal1").modal("show");
                $("#btnConfirmOk").click(function () {
                    cb(true);
                });
                $("#btnConfirmBack").click(function () {
                    cb(false);
                })
            }, 1000);
        }, 1000);
    }












}
