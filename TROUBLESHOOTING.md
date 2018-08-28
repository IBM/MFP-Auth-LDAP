
## Capturing logs from production version of the app on Android

### Use LogCat to see device logs

* [Set `ANDROID_HOME`](https://github.com/IBM/Ionic-MFP-App#76-buildrun-the-ionic-application-on-android-phone). On Mac, this is usually:
```
export ANDROID_HOME=/Users/<username>/Library/Android/sdk
```

* Launch Android Device Monitor as below:
```
$ cd $ANDROID_HOME/tools
$ ./monitor &
```

* Make sure you have [enabled developer options and USB debugging on your Android phone](https://github.com/IBM/Ionic-MFP-App#72-enable-developer-options-and-usb-debugging-on-your-android-phone). Connect your phone to your development machine.

* Select your device from `Devices` view.

* Click on `LogCat` view. All logs from device will get shown.

### See log messages of MyWard app only

* [Find PID](https://stackoverflow.com/questions/6854127/filter-logcat-to-get-only-the-messages-from-my-application-in-android) of MyWard app as below:
```
$ cd $ANDROID_HOME/platform-tools
$ ./adb shell ps|grep org.mycity.myward | cut -c10-15
 30067
```

* Filter log messages based on PID as below:
  - In `LogCat` view, click on the `+` button next to `Saved Filters`.
  - In the `LogCat Message Filter Settings` dialog, specify a name under `Filter Name`, and next to `by PID` specify the PID obtained above.
  - The new filter should get selected under `Saved Filters` and only the log messages specific to MyWard app should get shown in `LogCat` view.
  - To edit the PID at a later time, double click on your filter. This opens up the `LogCat Message Filter Settings` dialog and you can specify the new PID.

## Problems with production version of the app on Android

1) Problem:

If you are using android studio to build the app and on windows, you may face the following issue "Error: Failed to crunch file "C:\CodePattern\LDAP-pattern\IonicMobileApp\pl...."
This is due to the length restriction of the path name in windows.

Solution:

You can either move the project to a directory with a shorter name or add the following line
"buildDir = "C:/tmp/${rootProject.name}/${project.name}" in allprojects in gradle build file.


2) Problem:
You may face the following issue during the execution of the app.
Didn't find class "com.google.android.gms.common.api.Api$zzf" on path: 
DexPathList


Solution:

Please check if you have the latest versions of facebook sdk (4.18.0 is used in this pattern) and gms services(15.0.1 is used in this pattern)

2) Problem:
Google map not showing up when running the application


Solution:

Please check if you setup the Google map API key as mentioned [here](https://github.com/IBM/Ionic-MFP-App/#73-setup-api-keys-for-using-google-maps).

