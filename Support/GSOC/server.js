/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , engines = require('consolidate')
  , app = express()
  , GitHubApi = require("github")
  , MemoryStore = require('connect').session.MemoryStore
  , GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "efc9059ce2616781cb6e"
var GITHUB_CLIENT_SECRET = "4b65e667601ecac03bf8b4d70f0ec73521fece93";

var oauth = require("oauth").OAuth2;
var OAuth2 = new oauth(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, "https://github.com/", "login/oauth/authorize", "login/oauth/access_token");



var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});


var accessToken = "";

var authorization_uri = OAuth2.getAuthorizeUrl({
  redirect_uri: 'http://127.0.0.1:3000/auth/github/callback',
  scope: '"user,repo,gist"'
});

app.configure(function () {
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session(
        {secret:"secret key", store:new MemoryStore()}));
    app.use(express.static(__dirname + '/app'));
    app.use(passport.initialize());
    app.use(passport.session());

    app.engine('html', engines.underscore);

    /*
     Set views directory. DO NOT set this with the same static directory!.
     */
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'html');

    app.set('PORT', 3000);

});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// GET /auth/github
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in GitHub authentication will involve redirecting
//   the user to github.com.  After authorization, GitHubwill redirect the user
//   back to this application at /auth/github/callback

app.get('/auth/github',function(req,res){
   res.writeHead(303, {
     Location: OAuth2.getAuthorizeUrl({
       redirect_uri: 'http://127.0.0.1:3000/auth/github/callback',
       scope: "user,repo,gist"
     })
    });
    res.end();
});

/*app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });*/

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
/*
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('home');
});*/

app.get('/auth/github/callback',function (req, res) {
  var code = req.query.code;
  OAuth2.getOAuthAccessToken(code, {}, function (err, access_token, refresh_token) {
    if (err) {
      console.log(err);
    }
    accessToken = access_token;
    // authenticate github API
    console.log("AccessToken: "+accessToken+"\n");
    github.authenticate({
      type: "oauth",
      token: accessToken
    });
  });
  res.redirect('home');
});



app.get('/home', function(req, res){
  res.render('home');
});



app.post('/BLINKINGTUTORIALS/viewAll', function(req, res){
  console.log("AccessToken: "+accessToken+"\n");

  var IN_name= req.body.TXT_GI_Title;
  var IN_shor = req.body.TXAREA_GI_SD;
  var PRE_name = req.body.TXT_PR_Title;
  var PRE_shor = req.body.TXAREA_PR_SD;
  var HD_name = req.body.TXT_HD_Title;
  var HD_info = req.body.TXAREA_HD_SD;
  var CD_code = req.body.TXAREA_CD_SD;
  var AD_name = req.body.TXT_AD_Title;
  var AD_extra = req.body.TXAREA_AD_SD;

  var one="<html><h3>"+IN_name+"</h3><p>"+IN_shor+"</p>";
  var two="<html><h3>"+PRE_name+"</h3><p>"+PRE_shor+"</p>";
  var three="<html><h3>"+HD_name+"</h3><p>"+HD_info+"</p>";
  var four="<html><code>"+CD_code+"</code>";
  var five="<html><h3>"+AD_name+"</h3><p>"+AD_extra+"</p>";

  var files = {"CARD_IN_01.md": {"content": one},
             "CARD_PRE_01.md":{ "content": two},
             "CARD_HD_01.md": {"content": three},
             "CARD_CD_01.md": {"content": four},
             "CARD_AD_01.md":{ "content": five}
            };
  console.log(files);



    github.gists.create({
      "description": "the description for this gist",
      "public": true,
      "files": files


    }, function(err, rest) {
      console.log(rest);
      console.log(err);
      res.render('BLINKINGTUTORIALS/viewAll');
    });
});

app.get('/BLINKINGTUTORIALS/viewAll', function(req, res){
  res.render('BLINKINGTUTORIALS/viewAll');
});

app.get('/create', function(req, res){
  res.render('create');
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get("/", function (req, res) {
    res.render('index');
});

app.get("/index", function (req, res) {
    res.render('index');
});

app.listen(app.get('PORT'));
console.log('-------------------------------------------');
console.log("Server Port: " + app.get('PORT'));
