## Steps
1. [Use Ionic-MFP-App as a starting point for this project](#step-1-use-ionic-mfp-app-as-a-starting-point-for-this-project)
2. [Support LDAP Login](#step-2-support-ldap-login)
3. [Support Facebook and Google Login](#step-3-support-facebook-and-google-login)
  - 3.1 [Enabling the server](#31-enabling-the-server)
  - 3.2 [Enabling the client](#32-enabling-the-client)


## Step 1. Use Ionic-MFP-App as a starting point for this project

This project builds on top of the app built in https://github.com/IBM/Ionic-MFP-App. In this code pattern, we will enhance the 
app with following user authentication mechanisms:

* Enterprise login by connecting to on-premise LDAP server using Secure Gateway.

* Social login: Google login and Facebook login.

Copy Ionic Mobile app and Mobile Foundation adapters from parent repo as per instructions in 
http://bit-traveler.blogspot.in/2012/08/git-copy-file-or-directory-from-one.html as shown below.

* Create your repo on [Github.com](https://github.com) and add `README.md` file. Clone your new repo.

```
$ git clone https://github.com/<your-username>/<your-new-repo-name>.git
```

* Make a git format-patch for the entire history of the sub-directories that we want as shown below.

```
$ mkdir gitpatches
$ git clone https://github.com/IBM/Ionic-MFP-App.git
$ cd Ionic-MFP-App
$ git format-patch -o ../gitpatches/ --root IonicMobileApp/ MobileFoundationAdapters/
```

We will be using only the MyWardData adapter from this base project.


* Import the patches into your new repository as shown below.

```
$ cd ../<your-new-repo-name>
$ git am ../gitpatches/*
$ git push
```

## Step 2. Support LDAP Login

As the LDAP login is handled completely by the server side adapter, there are not client side changes required. The securitycheck name used in the client side code is 'UserLogin'. The same is maintained in the LDAPLoginAdapter. So the client server communication happens seamlessly. The adapter validates the user credentials with the enterprise login and returns validation result. For more information please refer to this blog - https://mobilefirstplatform.ibmcloud.com/blog/2016/07/17/connecting-to-LDAP-with-ibm-mobilefirst-foundation/

## Step 3. Support Facebook and Google Login

### 3.1 Enabling the server

In this pattern, the 'SocialLogin' security check is responsible for validating the challenge that was sent from the client with the social platform token.
The security check expects to get the JSON response from the app as described:
```
{
  "vendor" : "...",
  "token"  : "..."
}
```
The SocialLoginAdapter available under MobileFoundationAdapters implements this securitycheck.
For more information on the securitycheck implementation please refer to this link - https://mobilefirstplatform.ibmcloud.com/blog/2016/04/06/social-login-with-ibm-mobilefirst-platform-foundation/
Deploy this adapter following the instructions in this repository Readme.

### 3.2 Enabling the client

#### 3.2.1 Add the login buttons in the application login screen

Add the following code in the login.html file post the 'Sign In' Button.
<pre><code>
&lt;div padding&gt;
      &lt;button ion-button block (click)="fbLogin()" icon-start&gt;
        &lt;ion-icon name="logo-facebook"&gt;&1l;/ion-icon&gt;
        Facebook Login
        &lt;/button&gt;
&lt;/div&gt;


&lt;div padding>
      &lt;button ion-button block (click)="googleLogin()" icon-start&gt;
          &lt;ion-icon name="logo-googleplus">&lt;/ion-icon&gt;
        Google Login
      &lt;/button&gt;
    &lt;/div&gt;

</code></pre>

#### 3.2.2 Add the onclick methods

Add the following methods in the login.ts file.


<pre><code>
fbLogin() {

    this.authHandler.facebooklogin();   
  }

googleLogin(){

    this.authHandler.googlePlusLogin();    
  }
</pre></code>

####3.2.3 Add the login methods in the authHandler Provider

Add the following code in the authHandler.ts file post the login method
facebookLogin() method invokes the facebook.login method and receives a token. This token is passed to loginWithFb() method where the  MFP WLAuthorization login API is invoked to validate the credentials using the SocialLogin securitycheck. Similar logic is applied by the google login methods - googlePlusLogin() and  loginWithGoogle().

<pre><code>

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
      'webClientId': 'your-app-webclientid.apps.googleusercontent.com',
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

</code></pre>

#### 3.2.4 Update the Resource Adapter invocation calls

The WLResourceRequest calls in my-ward-data.ts invoke the procedures in MyWardData adapter to get the application data. The application has 2 types of logins - enterprise login or the social login mapped to 2 security checks - UserLogin and SocialLogin. The logged in user would have either cleared the UserLogin security check or the SocialLogin security check but not both, access has to be given to that user.
MyWardData adapter has the respective endpoints which are protected by each of these security checks.

In my-ward-data.ts, replace the WLResourceRequest calls with the following code

load() :

<pre><code>

if (this.authHandler.getLoginSecurityCheck()== 'UserLogin')
	  {      
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin", WLResourceRequest.GET);
	  }
	  else {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin", WLResourceRequest.GET);
	  }

</code></pre> 


getObjectStorageAccess() :
<pre><code>
if (this.authHandler.getLoginSecurityCheck() == 'UserLogin')
	  {
		   this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin/objectStorage", WLResourceRequest.GET);
	  }
	  else {
		   this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin/objectStorage", WLResourceRequest.GET);
	  }


</code></pre>

uploadNewGrievance() :
<pre><code>
if (this.authHandler.getLoginSecurityCheck() == 'UserLogin')
	  {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/userLogin", WLResourceRequest.POST);
	  }
	  else {
		  this.dataRequest = new WLResourceRequest("/adapters/MyWardData/socialLogin", WLResourceRequest.POST);
	  }

</code></pre>

#### 3.2.5 Add the logout functionality

Add the logout icon post the 'add' icon in the home.html file as shown below


<pre><code>

&lt;button ion-button icon-only (click)="reportNewProblem()"&gt;
        &lt;ion-icon name="add"&gt;&lt;/ion-icon&gt;
&lt;/button>
&lt;button ion-button icon-only (click)="logout()"&gt;
        &lt;ion-icon name="log-out"&gt;&lt;/ion-icon&gt;
&lt;/button&gt;

</code></pre>

Add the following logout code in the home.ts file

<pre><code>

logout(){

   
    this.authHandler.logout();
    this.navCtrl.setRoot(LoginPage);
    
    
  }     

</code></pre>

Implement the logout code in authHandler.ts as below

<pre><code>

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
    

</code></pre>
