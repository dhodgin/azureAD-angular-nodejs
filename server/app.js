var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + "/../client"));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

// disable caching
app.disable("etag");

var options = {
  // The URL of the metadata document for your app.
  // MS will put the keys for token validation into the JWT token from the URL found in the jwks_uri key of the metadata object.
  // replace <<tenantId>> with your tenantId, ex: mycompany.onmicrosoft.com
  // or you can use your tenantId GUID
  identityMetadata: "https://login.microsoftonline.com/<<tenantId>>/v2.0/.well-known/openid-configuration",
  // the audience is the application clientId in azure. it gets checked against the JWT token .aud property typically
  audience: "<<clientId>>"
};

var bearerStrategy = new BearerStrategy(options,
  function(req, jwtToken, done) {
    // return the jwtToken as the user for the 2nd argument since this is a sample app
    // we are pretending that the jwt token represents a user object
    var user = jwtToken;
    return done(null, user, jwtToken);
  }
);

passport.use(bearerStrategy);

// do BearerStrategy authorization
function ensureAuthorizedBearer(req, res, next) {
  // inject authorization logic here
  passport.authenticate("oauth-bearer", function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      // no user was retrieved from the JWT
      return res.redirect('/404');
    }
    // create an in memory user that we can return to the client safely
    // in real code you would use properties from the JWT to validate a user in your DB and return that user to the client
    // you probably would want to validate the .aud, and other properties on the JWT for security
    // only validate the .iss property if you are single tenant
    // the issuer is the security token service (STS) that constructs and returns the token,
    // as well as the Azure AD tenant in which the user was authenticated
    // it would be a security risk to just send the entire JWT back to the client decrypted
    req.user = {
      firstName: user.given_name,
      lastName: user.family_name,
      // MS accounts (consumer, live.com) have an email property in the jwt, AD accounts (work, school) do not and instead have a upn property.
      email: user.email || user.upn
    };
    console.log(user);
    next();
  })(req, res, next);
}

// api routes
app.get("/data/open", function(req, res) {
  console.log("GET /data/open");
  res.send({
    msg: "This is your unsecured data"
  });
});

// this route is secured with ensureAuthorizedBearer middleware function
app.get("/data/secure", ensureAuthorizedBearer, function(req, res) {
  console.log("GET /data/secure");
  res.send({
    msg: "This is your secured data using the BearerStrategy",
    user: req.user
  });
});

// when a route is not found on the server, send client side angular app
// routes are first checked server side and then angular is initialized and routes client side are checked
// angular will handle a 404 response
app.get("*", function(req, res, next) {
  console.log("Route not found, loading Angular");
  res.sendFile(path.join(__dirname, "/../client/views/index.html"));
});

// 500 error handling
app.use(function(err, req, res, next) {
  console.log("500 error:", err.stack);
  res.status(500).send({
    message: err.message,
    error: err
  });
});

// default port is 3000, change to suit your needs below
var server = app.listen(3000, function() {
  console.log("Express server listening on port " + server.address().port);
});

module.exports = app;
