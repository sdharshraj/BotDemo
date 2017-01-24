var restify = require('restify');
var builder = require('botbuilder');
require('dotenv').config();
var prompts = require('./prompt.js');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var model = process.env.LUIS_MODEL || 'https://api.projectoxford.ai/luis/v2.0/apps/3dcfa27b-b653-47ca-aea6-74ce2eefa692?subscription-key=0daebd916b8d442583b4057e958b5e7b&verbose=true';
var recognizer = new builder.LuisRecognizer(model);

var intentDialog = new builder.IntentDialog({ recognizers: [recognizer] })
module.exports = intentDialog
    .matches('Hello', hello)
    .matches('Help',helpOption)
function hello(session, args, next) {
    session.send(prompts.userWelcomeMessage);
    next();
}

function helpOption(session, args, next) {
    builder.Prompts.choice(session, 'I can help you with the the following things: Please choose one', serviceType);
}

 server.post('/api/messages', function (req, res) {
    // Process posted notification
    var address = JSON.parse(req.body.address);
    var notification = req.body.notification;
    var params = req.body.params;

    // Send notification as a proactive message
    bot.beginDialog(address, '/notify', { msgId: notification, params: params });
    res.status(200);
    res.end();
});

bot.dialog('/notify', function (session, args) {
    // Deliver notification to the user.
    session.endDialog(args.msgId, args.params);
});


