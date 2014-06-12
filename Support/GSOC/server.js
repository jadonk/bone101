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
  , MemoryStore = require('connect').session.MemoryStore
  , GitHubStrategy = require('passport-github').Strategy;

var GITHUB_CLIENT_ID = "efc9059ce2616781cb6e"
var GITHUB_CLIENT_SECRET = "4b65e667601ecac03bf8b4d70f0ec73521fece93";

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
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });

// GET /auth/github/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('home');
  });

app.get('/home', function(req, res){
  res.render('home', { user: req.user });
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
