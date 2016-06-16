# azureAD-angular-nodejs
Integrating Azure Active Directory with angular.js client side and node.js server side

This sandbox application shows a basic integration of Azure Active Directory using angular.js on the client side and node.js on the server side.

This project assumes you have a general working knowledge of node.js and already have it installed.

To run this application you will need an azure account (free one is available)

Step 1: register this application in your Active Directory in the Azure portal.

Step 2: edit the client and server configuration with your tenantId and clientId where indicated

**In client/angularApp.js**
```
  adalProvider.init({
    tenant: "<<tenantId>>",
    clientId: "<<clientId>>",
    anonymousEndpoints: []
  }, $httpProvider);
```

**In server/app.js**
```
var options = {
  // The URL of the metadata document for your app.
  // MS will put the keys for token validation into the JWT token from the URL found in the jwks_uri key of the metadata object.
  // replace <<tenantId>> with your tenantId, ex: mycompany.onmicrosoft.com
  // or you can use your tenantId GUID
  identityMetadata: "https://login.microsoftonline.com/<<tenantId>>/v2.0/.well-known/openid-configuration",
  // the audience is the application clientId in azure. it gets checked against the JWT token .aud property typically
  audience: "<<clientId>>"
};
```
Step 3: run `npm install` from the base project directory

Step 4: run `node app` from the server directory

The default address of the application is localhost:3000

Login should redirect you to Azure AD for login. A successful login will redirect you back to the page you were on.

The /open route is an unauthenticated route with public data
The /secure route is secured by the AAD login and verifies the token. This app doesn't do a real world example of authentication. As long as the token can be properly decoded we consider that as a valid authentication for this example.

this example was only tested for angular 1.3.13 but should work up to the latest 1.x version. Probably won't work with Angular 2.0 and was written with node 5.5.0
