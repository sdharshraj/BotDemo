var builder = require('botbuilder');
var restify = require('restify');
var dialog = require('./dialog');
var schedule = require('node-schedule');
var productData = require('./productData.json');
module.exports = {
    start: function () {
        server = restify.createServer();
        server.listen(process.env.port || process.env.PORT || 3978, function () {
            console.log('listening on 3978');
        });
        var connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
        var bot = new builder.UniversalBot(connector);
        server.use(restify.queryParser());
        server.post('/api/messages', connector.listen());
        bot.dialog('/', dialog);
        bot.dialog('/agent', [
            function (session) {
                var options = {listStyle: builder.ListStyle.button};
                session.send("Sure. I can help you");
                session.sendTyping();
                session.send("Can you please let me know which product you are planning to buy?");
                session.sendTyping();
                builder.Prompts.choice(session, "", productList, options);
            },
            function (session, results, next) {
                console.log(results.response);
                if(results&&results.response){
                    if(results.response.index==0){
                        session.userData.productName=results.response.entity;
                        session.userData.productIndex=results.response.index;
                        builder.Prompts.text(session, "Can you please share your Zip Code?");  
                    }
                    if(results.response.index==1){
                        session.endDialog("****** in progress ********* thankyou.") 
                    }
                    if(results.response.index==2){
                       session.endDialog("****** in progress ********* thankyou.") 
                    }
                    if(results.response.index==3){
                        session.endDialog("****** in progress ********* thankyou.")  
                    } 
                    if(results.response.index==4){
                       session.endDialog("****** in progress ********* thankyou.")   
                    }
                }
                else
                    NotUnderstood(session);
            },
             function (session, results, next) {
                if(results&&results.response){
                    var validZipCode = results.response.match('\\b[0-9]{5,5}\\b');
                    if(validZipCode){
                        productData.product_data.map(function (iData) {
                        if (iData.zip_code === validZipCode[0]) {
                            session.userData.Zip_Code=iData.zip_code;
                            var cards=createAgentListCard(session, iData.ProductList[session.userData.productIndex].AgentDetails);
                            session.send("Thanks. We have below agents who can assist you with buying "+session.userData.productName+".");
                            var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
                            builder.Prompts.text(session, message);
                            }
                        });
                    if(!session.userData.Zip_Code)
                       builder.Prompts.text(session, "Invalid Zip Code. Please enter correct Zip Code");   

                    }
                    else
                      builder.Prompts.text(session, "Please enter correct Zip Code.");    
                }
                else
                    builder.Prompts.text(session, "Please enter correct Zip Code."); 
            },
            function (session, results, next) {
                if(!session.userData.Zip_Code){
                    if(results&&results.response){
                        var validZipCode = results.response.match('\\b[0-9]{5,5}\\b');
                        if(validZipCode){
                            productData.product_data.map(function (iData) {
                            if (iData.zip_code === validZipCode[0]) {
                                session.userData.Zip_Code=iData.zip_code;
                                var cards=createAgentListCard(session, iData.ProductList[session.userData.productIndex].AgentDetails);
                                session.send("Thanks. We have below agents who can assist you with buying "+session.userData.productName+".");
                                var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
                                builder.Prompts.text(session, message);
                                }
                            });
                        if(!session.userData.Zip_Code)
                           builder.Prompts.text(session, "Invalid Zip Code. Please enter correct Zip Code");   

                        }
                        else
                          builder.Prompts.text(session, "Please enter correct Zip Code.");
                    }
                    else
                        builder.Prompts.text(session, "Please enter correct Zip Code."); 
                }
                else
                    next({response:results.response});
            },
            function (session, results, next) {
                if(!session.userData.Zip_Code){
                    if(results&&results.response){
                        var validZipCode = results.response.match('\\b[0-9]{5,5}\\b');
                        if(validZipCode){
                            productData.product_data.map(function (iData) {
                            if (iData.zip_code === validZipCode[0]) {
                                session.userData.Zip_Code=iData.zip_code;
                                var cards=createAgentListCard(session, iData.ProductList[session.userData.productIndex].AgentDetails);
                                session.send("Thanks. We have below agents who can assist you with buying "+session.userData.productName+".");
                                var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
                                builder.Prompts.text(session, message);
                                }
                            });
                        if(!session.userData.Zip_Code)
                            var msg="Sorry. You entered an invalid Zipcode. Incase, you are not sure, Please call our helpdesk 1800 123 4567. Thank you."
                            session.userData={};
                            session.endConversation(msg);    

                        }
                        else
                        var msg="Sorry. You entered an invalid Zipcode. Incase, you are not sure, Please call our helpdesk 1800 123 4567. Thank you."
                        session.userData={};
                        session.endConversation(msg);  

                    }
                    else
                        var msg="Sorry. You entered an invalid Zipcode. Incase, you are not sure, Please call our helpdesk 1800 123 4567. Thank you."
                        session.userData={};
                        session.endConversation(msg);  
            }
            else
                next({response:results.response});
        },
         function (session, results, next) {
            if(results&&results.response){
                var agentDetails=results.response.split(" ");
                session.userData.agentName=agentDetails[1]+" "+agentDetails[2];
                var res = results.response.match(/Call/gi);
                var res1 = results.response.match(/call/gi);
                if(res||res1){
                    session.send("Sure");
                    builder.Prompts.text(session,"Can you please let me know your contact number and preferred date and time?");
                }
                else{
                     session.userData={};
                     session.endConversation("Thanks for reaching out to us. Have a Good Day! "); 
                    }
             }
            else
                NotUnderstood(session);
         },
          function (session, results, next) {
            if(results&&results.response){
                session.sendTyping();
                session.send("Thankyou");
                session.send(session.userData.agentName+" will call you back on your number at your preferred time.");
                session.endConversation("You can connect with us @ toll free number 1800 123 4567 at any time for any further assistance. Have a great day!");
            }
            else
                NotUnderstood(session);
         }
        ]);
        function NotUnderstood(session, args) {
          session.endDialog("Sorry i could not understand.");
        }
        function createAgentListCard(session, agentList){
            var cards = [];
            for (var i = 0; i < agentList.length; i++) {
                var card = new builder.HeroCard(session);
                card.title(agentList[i].Name);
                card.text(agentList[i].Address+", "+agentList[i].City+", "+agentList[i].State+"-"+agentList[i].Zipcode+", "+agentList[i].Email+", "+agentList[i].PhoneNumber+".");
                card.buttons([builder.CardAction.postBack(session, "Call "+agentList[i].Name, "Call "+agentList[i].Name)]);
                cards.push(card);
            }
            return cards;
        }

        var productList=[
        'Business Owner Package',
        'Commerical Package Policy',
        'General Liability',
        'Cyber Liability',
        'Commercial Crime'
 ]
    }
}
