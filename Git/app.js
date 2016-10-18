
var builder = require('botbuilder');
var restify = require('restify');
var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);

var server = restify.createServer();

var model = process.env.model || 'https://api.projectoxford.ai/luis/v1/application?id=190fafbe-d8f5-49f6-a99e-1ad118fd018c&subscription-key=7578d6cd34194eaea0d031145fa1e8aa';
var recognizer = new builder.LuisRecognizer(model);

var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

var olayData = require('./OlayProduct.json');
server.listen(3978, function() {
    console.log('server %s is listening on %s',server.name, server.url);
})

server.post('/api/messages',connector.listen());

bot.dialog('/', dialog);

dialog.matches('Greet', [greet]);
dialog.onDefault(builder.DialogAction.send('not understood'));

function greet(session, args, next) {
    session.send("hello buddy!");
}
dialog.matches('Product', [
    function (session, args, next) {
            builder.Prompts.choice(session, 'Which type of product do you want?', productTypes);
    },
    function (session, results) {
        if (results.response) {
             if(results.response.entity == 'Day Moisturiser' || results.response.entity == 'Night Moisturiser'){
                   session.dialogData.property = null;
					var cards = olayData.Products.map(function(Products){
                        if(Products.Type == results.response.entity)
                        return createCard(session, Products)
                    });
                  var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
             }
                else if(results.response.entity == 'Sun Protection' ){
                    builder.Prompts.choice(session, 'What spf value cream you want?',sunProtectionTypes);
                }
                else{
                    session.endDialog('Sorry..some error occured.');
                }
                session.send(message);
            } else {
            session.endDialog('Sorry i did not understand.');
        }
    },
    function(session, results){
        if(results.response.entity == 'Above spf 15'){
                   session.dialogData.property = null;
					var cards = olayData.Products.map(function(Products){
                        if(Products.SPFValue > 15 && Products.Type == "Sun Protection")
                        return createCard(session, Products)
                    });
            var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
        }
        else if(results.response.entity == 'Spf 15 or below'){
                   session.dialogData.property = null;
					var cards = olayData.Products.map(function(Products){
                        if(Products.SPFValue <= 15 && Products.Type == "Sun Protection")
                        return createCard(session, Products)
                    });
             var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
       }
       session.send(message);
    }
    
]);
var pid = "";
dialog.matches('LocateStore',[
    function harsh(session, args, next){
        pid = session.message.text;
        builder.Prompts.text(session,'Please provide your Zip code.');
    },
    function(session, results) {
        var zipCode = results.response.match(/[0-9]{6}/);
        if(zipCode){
           var zipPidFlag = false;
            if(pid.match(/pid/)){
                var message = " ";
                var index = 0;
					var cards = olayData.Products.map(function(Products){
                        if(Products.ProductId == pid && Products.Pin == zipCode ){
                            console.log(Products.ProductId + " " + Products.Pin)
                            index++;
                            zipPidFlag = true;
                           return message += index +". " + Products.Location +"  ||  Quntity: "+ Products.Quantity + " \n ";
                        }
                    });
                    if(index > 0){
                        session.send(message);
                    }
                    else{
                        session.send("Sorry.. there is no shop for the particular product in your location.")
                    }
                }
                else{
                    var message = " ";
                    var index = 0;
                        var cards = olayData.Products.map(function(Products){
                            if(Products.Pin == zipCode){
                                index++;
                            return message += index +". " + Products.Location +"  ||  Quntity: "+ Products.Quantity + " \n ";
                            }
                        });
                         if(index > 0){
                        session.send(message);
                    }
                    else{
                        session.send("Sorry.. there is no Olay shop near your location.")
                    }
                }
            }
            else{
                session.send('invalid Pin code. Please enter 6 digit Pin code.');
            }
    }
]);


function createCard(session, items){
	var card = new builder.HeroCard(session);
	card.title(items.Type);
    card.subtitle(items.Name);
	card.images([builder.CardImage.create(session, items.ImagePath)]);
	card.tap(new builder.CardAction.openUrl(session, items.URL));
    card.buttons([new builder.CardAction.openUrl(session,items.URL,'  Buy it Online  ')
                  ,new builder.CardAction.imBack(session,items.ProductId, '  Buy it offline  ')
                  ,new builder.CardAction.openUrl(session,items.URL,'  See more details  ')]
                 );
    
	return card;
}

var productTypes = [
    'Day Moisturiser',
    'Night Moisturiser',
    'Sun Protection'
]

var sunProtectionTypes = [
    'Above spf 15',
    'Spf 15 or below'
]

