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
import { LoadingController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';


@Injectable()
export class AuthHandlerProvider {
  securityCheckName = 'UserLogin';
  userLoginChallengeHandler;
  securityCheckNameSocial='socialLogin';
  loginSecurityCheck = null;
  socialLoginChallengeHandler;
  initialized = false;
  username = null;

  isChallenged = false;
  handleChallengeCallback = null;
  loginSuccessCallback = null;
  loginFailureCallback = null;
  googleLoginStatus = null;
  fbLoginStatus = null;
  loader: any;
  

  constructor(public fb: Facebook, public googlePlus: GooglePlus,public loadingCtrl: LoadingController) {
    console.log('--> AuthHandler constructor() called');
  }

  // Reference: https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/authentication-and-security/credentials-validation/javascript/
  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    console.log('--> AuthHandler init() called');
    this.userLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.securityCheckName);
    // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
    this.userLoginChallengeHandler.handleChallenge = this.handleChallenge.bind(this);
    this.userLoginChallengeHandler.handleSuccess = this.handleSuccess.bind(this);
    this.userLoginChallengeHandler.handleFailure = this.handleFailure.bind(this);
    this.socialLoginChallengeHandler = WL.Client.createSecurityCheckChallengeHandler(this.securityCheckNameSocial);
    this.socialLoginChallengeHandler.handleChallenge = this.handleChallenge.bind(this);
    this.socialLoginChallengeHandler.handleSuccess = this.handleSuccess.bind(this);
    this.socialLoginChallengeHandler.handleFailure = this.handleFailure.bind(this);
  }

  setHandleChallengeCallback(onHandleChallenge) {
    console.log('--> AuthHandler setHandleChallengeCallback() called');
    this.handleChallengeCallback = onHandleChallenge;
  }

  setLoginSuccessCallback(onSuccess) {
    console.log('--> AuthHandler setLoginSuccessCallback() called');
    this.loginSuccessCallback = onSuccess;
  }

  setLoginFailureCallback(onFailure) {
    console.log('--> AuthHandler setLoginFailureCallback() called');
    this.loginFailureCallback = onFailure;
  }

  handleChallenge(challenge) {
    console.log('--> AuthHandler handleChallenge called.\n', JSON.stringify(challenge));
    this.isChallenged = true;
    if (challenge.errorMsg !== null && this.loginFailureCallback != null) {
      var statusMsg = 'Remaining attempts = ' + challenge.remainingAttempts + '<br>' + challenge.errorMsg;
      this.loginFailureCallback(statusMsg);
    } else if (this.handleChallengeCallback != null) {
      this.handleChallengeCallback();
    } else {
      console.log('--> AuthHandler: handleChallengeCallback not set!');
    }
  }

  handleSuccess(data) {
    console.log('--> AuthHandler handleSuccess called');
    this.isChallenged = false;
    if (this.loginSuccessCallback != null) {
      this.loginSuccessCallback();
    } else {
      console.log('--> AuthHandler: loginSuccessCallback not set!');
    }
  }

  handleFailure(error) {
    console.log('--> AuthHandler handleFailure called.\n' + JSON.stringify(error));
    this.isChallenged = false;
    if (this.loginFailureCallback != null) {
      this.loginFailureCallback(error.failure);
    } else {
      console.log('--> AuthHandler: loginFailureCallback not set!');
    }
  }

  // Reference: https://mobilefirstplatform.ibmcloud.com/tutorials/en/foundation/8.0/authentication-and-security/user-authentication/javascript/
  checkIsLoggedIn() {
    console.log('--> AuthHandler checkIsLoggedIn called');
    WLAuthorizationManager.obtainAccessToken('RestrictedData')
    .then(
      (accessToken) => {
        console.log('--> AuthHandler: obtainAccessToken onSuccess');
      },
      (error) => {
        console.log('--> AuthHandler: obtainAccessToken onFailure: ' + JSON.stringify(error));
      }
    );
    WLAuthorizationManager.obtainAccessToken('socialLogin')
    .then(
      (accessToken) => {
        console.log('--> AuthHandler: obtainAccessToken onSuccess');
      },
      (error) => {
        console.log('--> AuthHandler: obtainAccessToken onFailure: ' + JSON.stringify(error));
      }
    );
  }

  login(username, password) {
    console.log('--> AuthHandler login called. isChallenged = ', this.isChallenged);
    this.username = username;
    if (this.isChallenged) {
      this.userLoginChallengeHandler.submitChallengeAnswer({'username':username, 'password':password});
    } else {
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      var self = this;
      WLAuthorizationManager.login(this.securityCheckName, {'username':username, 'password':password})
      .then(
        (success) => {
          console.log('--> AuthHandler: login success');          
          this.loginSecurityCheck = 'UserLogin';
        },
        (failure) => {
          console.log('--> AuthHandler: login failure: ' + JSON.stringify(failure));
          self.loginFailureCallback(failure.errorMsg);
        }
      );
    }
  }

  facebooklogin(){
    this.fb.login(['public_profile', 'user_friends', 'email'])
    .then(res => {
      if(res.status === "connected") {
         
        var accessToken = res.authResponse.accessToken;
        console.log(accessToken);
        this.loader = this.loadingCtrl.create({
          content: 'Signining in. Please wait ...',
          dismissOnPageChange: true
        });
        this.loader.present().then(() => {
          this.loginWithFb(accessToken);
        });
      
    }
  })
  .catch(e => console.log('Error logging into Facebook', e)); 
  }

  loginWithFb(accessToken){
    console.log('--> AuthHandler loginwithfb called ');
    var credentials = { 'token': accessToken, 'vendor': 'facebook' };
    if (this.isChallenged) {
      this.socialLoginChallengeHandler.submitChallengeAnswer(credentials);
    } else {
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      var self = this;
      WLAuthorizationManager.login(this.securityCheckNameSocial, credentials)
      .then(
        (success) => {
          console.log('--> AuthHandler: login success');
          this.loginSecurityCheck = 'socialLogin';
          this.fbLoginStatus = 'connected';
        },
        (failure) => {
          console.log('--> AuthHandler: login failure: ' + JSON.stringify(failure));
          self.loginFailureCallback(failure.errorMsg);
        }
      );
    }
  }

  googlePlusLogin(){
 
    this.googlePlus.login({
      'scopes': '',
      'webClientId': '618106571370-pr9058fhv2efj4635ertkgbn14tda2ha.apps.googleusercontent.com',
      'offline': true
    })
	  .then(res => {        
          console.log(res);
          var accessToken = res.idToken;
          console.log(accessToken);
          this.loader = this.loadingCtrl.create({
            content: 'Signining in. Please wait ...',
            dismissOnPageChange: true
          });
          this.loader.present().then(() => {
            this.loginWithGoogle(accessToken);
          });
         
     
    })
    .catch(e => console.log('Error logging into Google', e)); 
  }
  
  loginWithGoogle(accessToken){
	   console.log('--> AuthHandler loginwithGoogle called ');
    var credentials = { 'token': accessToken, 'vendor': 'google' };
    if (this.isChallenged) {
      this.socialLoginChallengeHandler.submitChallengeAnswer(credentials);
    } else {
      // https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback
      var self = this;
      WLAuthorizationManager.login(this.securityCheckNameSocial, credentials)
      .then(
        (success) => {
          console.log('--> AuthHandler: login success');
          this.loginSecurityCheck = 'socialLogin';
          this.googleLoginStatus = 'connected';
          
        },
        (failure) => {
          console.log('--> AuthHandler: login failure: ' + JSON.stringify(failure));
          self.loginFailureCallback(failure.errorMsg);
        }
      );
    }
	  
	  
  }

 

  logout() {
    console.log('--> AuthHandler logout called');
    WLAuthorizationManager.logout(this.securityCheckName)
    .then(
      (success) => {
        console.log('--> AuthHandler: logout success');
      },
      (failure) => {
        console.log('--> AuthHandler: logout failure: ' + JSON.stringify(failure));
      }
    );
    if(this.googleLoginStatus === 'connected')
    {  
      console.log('--> AuthHandler: logging out from Google');
      this.googlePlus.logout();
    }
    if(this.fbLoginStatus === 'connected')
    {
      console.log('--> AuthHandler: logging out from Facebook');
      this.fb.logout();
    }
    

  }

  getLoginSecurityCheck(){
    return this.loginSecurityCheck;

  }
}
