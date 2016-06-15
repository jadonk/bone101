#!/usr/bin/env node
// From: https://github.com/andris9/Nodemailer

var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yourUser@gmail.com',
        pass: 'yourPass'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Your User <yourUser@gmail.edu>', // sender address
    to: 'anotherUser@gmail.edu', // list of receivers
    subject: 'Test of nodemail', // Subject line
    text: 'Hello world from modemailer', // plaintext body
    html: '<b>Hello world</b><p>Way to go!</p>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});

// Nodemailer is licensed under MIT license 
// (https://github.com/andris9/Nodemailer/blob/master/LICENSE). 
// Basically you can do whatever you want to with it