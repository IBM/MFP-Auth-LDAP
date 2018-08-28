/**
 * Copyright 2017 IBM Corp.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/// <reference path="../../../plugins/cordova-plugin-mfp/typings/worklight.d.ts" />

import { Injectable } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { AuthHandlerProvider } from '../../providers/auth-handler/auth-handler';
import { AlertController } from 'ionic-angular';

@Injectable()
export class MyWardDataProvider {
  data: any = null;
  objectStorageAccess: any = null;
  dataRequest: any = null;
  


  constructor(private transfer: FileTransfer, private authHandler:AuthHandlerProvider,private alertCtrl: AlertController) {
    console.log('--> MyWardDataProvider constructor() called');
  }

  load() {
    console.log('--> MyWardDataProvider loading data from adapter ...');
    return new Promise((resolve, reject) => {
      if (this.data) {
        // already loaded data
        return resolve(this.data);
      }
      // don't have the data yet
	  if (this.authHandler.getLoginSecurityCheck()== 'UserLogin')
	  {      
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin", WLResourceRequest.GET);
	  }
	  else {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin", WLResourceRequest.GET);
	  }
      
      this.dataRequest.send().then(
        (response) => {
          console.log('--> MyWardDataProvider loaded data from adapter\n', response);
          this.data = response.responseJSON;
          if(response.responseJSON.length == 0)
          {
            this.showAlert('Problem List','No problems reported in your area');
          }
          resolve(this.data);
        }, (failure) => {
          console.log('--> MyWardDataProvider failed to load data\n', JSON.stringify(failure));
          reject(failure);
        })
    });
  }

  showAlert(alertTitle, alertMessage) {
    let prompt = this.alertCtrl.create({
      title: alertTitle,
      message: alertMessage,
      buttons: [{
          text: 'Ok',
      }]
    });
    prompt.present();
  }

  getObjectStorageAccess() {
    
    return new Promise((resolve, reject) => {
      if (this.objectStorageAccess) {
        // already loaded data
        return resolve(this.objectStorageAccess);
      }
      // don't have the data yet
	  
	  if (this.authHandler.getLoginSecurityCheck() == 'UserLogin')
	  {
		   this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin/objectStorage", WLResourceRequest.GET);
	  }
	  else {
		   this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin/objectStorage", WLResourceRequest.GET);
	  }
      
      this.dataRequest.send().then(
        (response) => {
          this.objectStorageAccess = response.responseJSON;
          resolve(this.objectStorageAccess);
        }, (failure) => {
          console.log('--> MyWardDataProvider failed to get Object Storage AuthToken from adapter\n', JSON.stringify(failure));
          reject(failure);
        })
    });
  }

  uploadNewGrievance(grievance) {
    return new Promise( (resolve, reject) => {
      console.log('--> MyWardDataProvider: Uploading following new grievance to server ...\n' + JSON.stringify(grievance));
	  if (this.authHandler.getLoginSecurityCheck() == 'UserLogin')
	  {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin", WLResourceRequest.POST);
	  }
	  else {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin", WLResourceRequest.POST);
	  }
     
      this.dataRequest.setHeader("Content-Type","application/json");
      this.dataRequest.send(grievance).then(
        (response) => {
          console.log('--> MyWardDataProvider: Upload successful:\n', response);
          resolve(response)
        }, (failure) => {
          console.log('--> MyWardDataProvider: Upload failed:\n', failure);
          reject(failure)
        })
    });
  }

  uploadImage(fileName, filePath) {
    return new Promise( (resolve, reject) => {
      let serverUrl = this.objectStorageAccess.baseUrl + fileName;
      console.log('--> MyWardDataProvider: Uploading image (' + filePath + ') to server (' + serverUrl + ') ...');
      let options: FileUploadOptions = {
        fileKey: 'file',
        fileName: fileName,
        httpMethod: 'PUT',
        headers: {
          'Authorization': this.objectStorageAccess.authorizationHeader,
          'Content-Type': 'image/jpeg'
        }
      }
      let fileTransfer: FileTransferObject = this.transfer.create();
      fileTransfer.upload(filePath, serverUrl, options) .then((data) => {
        // success
        console.log('--> MyWardDataProvider: Image upload successful:\n', data);
        resolve(data);
      }, (err) => {
        // error
        console.log('--> MyWardDataProvider: Image upload failed:\n', err);
        reject(err);
      })
    });
  }

 


}
