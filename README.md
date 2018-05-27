# - Work in progress -

# Mobile User Authentication with On-Premise LDAP Server / Social Login using IBM Mobile Foundation

User authentication is a fundamental requirement in almost all enterprise mobile apps. For internal mobile apps such as those related to payroll, leave and business travel booking, organizations want to leverage single-sign-on by authenticating users against its on-premise LDAP server. And for apps targeted to end users where enterprise data is not exposed such as, an app for product users that allows them to raise service requests, allowing users to authenticate using their social login such as Facebook login/Google login would be much easier. This code pattern shows how developers can leverage IBM Mobile Foundation service to implement following user authentication mechanisms:
* Enterprise login by connecting to on-premise LDAP server using Secure Gateway.
* Social login such as Google login and Facebook login.

When you have completed this code pattern, you will understand:
* ...
* ...

## Flow

### Login through on-premise LDAP server
<img src="doc/source/images/Architecture_Scenario1.png" alt="Architecture diagram - Login through on-premise LDAP server" width="1024" border="10" />

### Google login
<img src="doc/source/images/Architecture_Scenario2.png" alt="Architecture diagram - Google login" width="1024" border="10" />

### Facebook login
<img src="doc/source/images/Architecture_Scenario3.png" alt="Architecture diagram - Facebook login" width="1024" border="10" />

## Included Components
* [Cloudant NoSQL DB](https://console.ng.bluemix.net/catalog/services/cloudant-nosql-db): A fully managed data layer designed for modern web and mobile applications that leverages a flexible JSON schema.
* [Cloud Object Storage](https://console.bluemix.net/catalog/infrastructure/cloud-object-storage): A highly scalable cloud storage service, designed for high durability, resiliency and security.
* [Mobile Foundation](https://console.bluemix.net/catalog/services/mobile-foundation): A scalable mobile access gateway powered by the market-leading IBM Mobile Foundation Technology. The service offers a comprehensive set of mobile backend capabilities such as, App life cycle, Push, Analytics, Feature Toggle, Security and Authentication and offline synch. 

## Featured Technologies
* [Mobile](https://mobilefirstplatform.ibmcloud.com/): Systems of engagement are increasingly using mobile technology as the platform for delivery.

# Watch the Video

# Steps

# Troubleshooting

Please see instructions for [debugging Android hybrid app using Chrome Developer Tools](https://github.com/IBM/Ionic-MFP-App#debugging-android-hybrid-app-using-chrome-developer-tools) or [troubleshooting guide](https://github.com/IBM/Ionic-MFP-App/blob/master/TROUBLESHOOTING.md) for solutions to some commonly occuring problems.

# References

* ...

# License
[Apache 2.0](LICENSE)
