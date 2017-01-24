var builder = require('botbuilder');
var randomstring = require("randomstring");
var querystring = require('querystring');
var prompts = require('./prompt.js');
var nodemailer = require('nodemailer');
var model = process.env.LUIS_MODEL;
var recognizer = new builder.LuisRecognizer(model)
var intentDialog = new builder.IntentDialog({ recognizers: [recognizer] });
var insuranceData = require('./InsuranceData.json');
var fundInsuranceData = require('./FundInsuranceData.json');
var fundInsuranceData2 = require('./FundInsuranceData2.json');
var cron = require('cron');
var myModule = require('./connector');
var bot=myModule.bot;
var pid = "";
module.exports = intentDialog
    .matches('Greet', [greet, helpOption, authenticate, validateCustomer, validateCustomer1, validateCustomer2, validateOtp, validateOtp1, validateOtp2, policies, service, premiumOperation,FNOLClaim,FNOLClaimValidation])
    .matches('PremiumDueAmount', [premiumAuthentication, authenticate, validateCustomer, validateOtp, premiumDueAmount])
    .matches('PremiumDueDate', [premiumAuthentication, authenticate, validateCustomer, validateOtp, premiumDueDate])
    .matches('LastPaidPremium', [premiumAuthentication, authenticate, validateCustomer, validateOtp, lastPaidPremiumDetails])
    .matches('FundSwitch', [fundSwitch,fundConfirmation])
    .matches('PolicyType',policyType)
    .matches('CoverageInfo',[coverageInfo,coverageInterest,coverageConfirmation])
    .matches('PolicyTermDescription',termDescription,coverageConfirmation)
    .matches('YearlyPremium', [yearlyPremiumInfo, coverageConfirmation, finalConfirmation])
    .matches('No', no)
    .matches('TermType',coverageConfirmation)
    .matches('Yes', [helpOption,authenticate, validateCustomer, validateOtp, policies, service, premiumOperation])
    .matches('None',NotUnderstood)
    .onDefault([NotUnderstood])

    intentDialog.matches("MyAgent",agent);
    function agent(session){
        session.send("hello");
    }
    
function policyType(session, args, next){
    session.userData.mortgage='done';
    var msg="May I know how much is the loan amount you have availed and what is the coverage you are looking for?"
    session.send(msg);
}
function coverageInfo(session, args, next){
    if(session.userData.mortgage=='done'){
     if(args.entities.length==2){
        console.log(args.entities[0].type+" "+args.entities[1].type)
        if(args.entities[0].type=='builtin.money'&& args.entities[1].type=='builtin.number'||args.entities[0].type=='builtin.number'&& args.entities[1].type=='builtin.money'){
            session.userData.premiumAmount=args.entities[1].entity;
            builder.Prompts.text(session, "for how much time, you are looking for");
        }
        else if(args.entities[0].type=='builtin.number'&&args.entities[1].type=='builtin.datetime.duration'){
            session.userData.coverageTime=args.entities[0].entity;
            builder.Prompts.text(session, "Tell me the loan amount you have availed");
        }
         else if(args.entities[0].type=='builtin.number'&&args.entities[1].type=='builtin.number'){
           session.userData.premiumAmount=args.entities[0].entity; 
           session.userData.coverageTime=args.entities[1].entity;
           session.userData.step="CoverageInfo";
           var card = createPolicyTermCard(session)
        // attach the card to the reply message
           var msg = new builder.Message(session).addAttachment(card);
         //  var msg="Ok. That’s great. We have different term products and would want to know if you are interested in Level Term or Reducing Term Policy?";
           builder.Prompts.text(session,msg);
        }  
        }
    else if(args.entities.length==3){
       session.userData.premiumAmount=args.entities[1].entity; 
       session.userData.coverageTime=args.entities[2].entity;
       session.userData.step="CoverageInfo";
      // var msg="Ok. That’s great. We have different term products and would want to know if you are interested in Level Term or Reducing Term Policy?";
       var card = createPolicyTermCard(session)
        // attach the card to the reply message
        var msg = new builder.Message(session).addAttachment(card);
         //  var msg="Ok. That’s great. We have different term products and would want to know if you are interested in Level Term or Reducing Term Policy?";
         //  builder.Prompts.text(session,msg);
       builder.Prompts.text(session,msg);
    }
    else if(args.entities.length==4){
       session.userData.premiumAmount=args.entities[0].entity; 
       session.userData.coverageTime=args.entities[1].entity;
       session.userData.step="CoverageInfo";
       var card = createPolicyTermCard(session)
       var msg = new builder.Message(session).addAttachment(card);
       builder.Prompts.text(session,msg);
    }
    else if(args.entities.length==1){
       session.userData.premiumAmount=args.entities[0].entity;
       builder.Prompts.text(session, "for how much time, you are looking for");  
    }
}
else
NotUnderstood(session);
}

function coverageInterest(session, results, next){
    var res = results.response.match(/difference/gi);
    var res1 = results.response.match(/[0-9]/gi);
    var res2 = results.response.match(/year/gi);
    var res4 = results.response.match(/yr/gi);
    var res3 = results.response.match(/two/gi);
    if(results.response=='level'||results.response=='reducing'){
        next({response:results.response});
    }
    else if(res||res3){
        termDescription(session, next);
    }
    else if(res1||res2||res4){
        session.userData.coverageTime=results.response;
        session.userData.step="CoverageInfo";
        var card = createPolicyTermCard(session)
        var msg = new builder.Message(session).addAttachment(card);
        builder.Prompts.text(session,msg);
    } 
    else{
        NotUnderstood(session);     
    } 
}
function termDescription(session, next){
    if(session.userData.step==='CoverageInfo'){
        var msg="In level term, the coverage will be fixed during the term of the policy whereas in reducing term, the sum assured will reduce based on the outstanding loan.";
        session.send(msg);
    }
    else
        NotUnderstood(session);

}
function yearlyPremiumInfo(session, args, next){
    var msg="Yes. We have limited premium pay option where you can pay premium for 3, 5 or 7 years but the coverage will be for the entire term of the policy.";
    builder.Prompts.text(session, msg);
}
function coverageConfirmation(session, results, next){
if(results&&results.response){
    console.log(results.response);
    var res = results.response.match(/difference/gi);
    var res3 = results.response.match(/two/gi);
    var res1 = results.response.match(/[0-9]/gi);
    var res2 = results.response.match(/year/gi);
    var res4 = results.response.match(/yr/gi);
    if(results.response==='level'||results.response==='reducing'&&session.userData.coverageTime&&session.userData.premiumAmount){
        session.send("Great! Let me help you get this coverage.");
        session.send("I am transferring you to our live agent, please be on line.");
        session.userData={};
        session.endConversation("Thanks for reaching out to us. Have a Good Day!");
    }
    else if(res||res3){
        termDescription(session, next);
    }
    else if(session.userData.coverageTime&&session.userData.premiumAmount&&res1||res2||res4){
        var options = {listStyle: builder.ListStyle.button};
        session.send("Ok. That’s great. We have different term products and would want to know in which policies you are interested");
        builder.Prompts.choice(session, "", termTypes, options);
    }
    else
        NotUnderstood(session);
}
    else
        NotUnderstood(session);
    
}

function finalConfirmation(session, results, next){
    if(results&&results.response){
        session.send("Great! Let me help you get this coverage.");
        session.send("I am transferring you to our live agent, please be on line.");
        session.userData={};
        session.endConversation("Thanks for reaching out to us. Have a Good Day!");
    }
    else
        NotUnderstood(session);
}

function fundSwitch(session, args, next){
   if(session.userData.fundSwitch=='done'){
    var message;
    var message1;
    var cards=[];
    var data={};
    var intent = args.intent;
    var j=0,k=0;
    var oldFund1,oldFund2,oldFund3,oldFund4,newFund3,newFund4,newFund1,newFund2,fundTypeData1,fundTypeData2,fundTypeData3,fundTypeData4;
    var numbers=[];
    var fundType=[];
    for(var i=0;i<args.entities.length;i++){
        if(args.entities[i].type=='builtin.number'){
            numbers[j]= args.entities[i].entity;
            j++;
        }
        else{
           if(args.entities[i].type=='FundType'){
            fundType[k]= args.entities[i].entity;
            k++;
         }
        }
       
       // session.userData.fundType=fundType;
       // session.userData.fundAmount=numbers;
    }
    var newFundType=matchingEntity(fundType);
    if(newFundType.length==2){
      fundInsuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID){
                oldFund1=iData.InvestmentLinkedPolicy[0][newFundType[0]].split("%");
                newFund1=parseInt(oldFund1[0])-parseInt(numbers[0]);
                oldFund2=iData.InvestmentLinkedPolicy[0][newFundType[1]].split("%");
                newFund2=parseInt(oldFund2[0])+parseInt(numbers[0]);
                fundInsuranceData.Customers[0].InvestmentLinkedPolicy[0][newFundType[0]]=newFund1+"%";
                fundInsuranceData.Customers[0].InvestmentLinkedPolicy[0][newFundType[1]]=newFund2+"%";
                if(parseInt(newFund1)<0){
                    message="There is not enough amount in your "+newFundType[0];
                }
                else{
                    data=[
                        {
                            "name":newFundType[0],
                            "value":newFund1+"%"
                        },
                        {
                            "name":newFundType[1],
                            "value":newFund2+"%"
                        }
                    ]
                }
             }
         });
    }
    else if(newFundType.length==3){
           fundTypeData1=newFundType[0];
           fundTypeData2=newFundType[1];
           fundTypeData3=newFundType[2];
           fundInsuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID){
                oldFund1=iData.InvestmentLinkedPolicy[0][fundTypeData1].split("%");
                newFund1=parseInt(oldFund1[0])-parseInt(numbers[0]);
                oldFund2=iData.InvestmentLinkedPolicy[0][fundTypeData2].split("%");
                newFund2=parseInt(oldFund2[0])-parseInt(numbers[1]);
                oldFund3=iData.InvestmentLinkedPolicy[0][fundTypeData3].split("%");
                newFund3=parseInt(oldFund3[0])+parseInt(numbers[0])+parseInt(numbers[1]);
                if(parseInt(newFund1)<0 && newFund2<0){
                    message="There is not enough amount in your "+fundTypeData1+" and "+fundTypeData2;
                } 
               else if(parseInt(newFund1)<0){
                    message="There is not enough amount in your "+fundTypeData1;
                }
               else if(parseInt(newFund2)<0){
                    message="There is not enough amount in your "+fundTypeData2;
                }
                else{
                    data=[
                        {
                            "name":newFundType[0],
                            "value":newFund1+"%"
                        },
                        {
                            "name":newFundType[1],
                            "value":newFund2+"%"
                        },
                        {
                            "name":newFundType[2],
                            "value":newFund3+"%"
                        }
                    ]
                }
             }
         });
        }
        else if(fundType.length==4){
           fundTypeData1=newFundType[0]
           fundTypeData2=newFundType[1]
           fundTypeData3=newFundType[2]
           fundTypeData4=newFundType[3]
           console.log(fundTypeData1+" "+fundTypeData2+" "+fundTypeData3+" "+fundTypeData4);
           fundInsuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID){
                oldFund1=iData.InvestmentLinkedPolicy[0][fundTypeData1].split("%");
                newFund1=parseInt(oldFund1[0])-parseInt(numbers[0]);
                oldFund2=iData.InvestmentLinkedPolicy[0][fundTypeData3].split("%");
                newFund2=parseInt(oldFund2[0])-parseInt(numbers[1]);
                oldFund3=iData.InvestmentLinkedPolicy[0][fundTypeData2].split("%");
                newFund3=parseInt(oldFund3[0])+parseInt(numbers[0]);
                oldFund4=iData.InvestmentLinkedPolicy[0][fundTypeData4].split("%");
                newFund4=parseInt(oldFund4[0])+parseInt(numbers[1]);
                if(parseInt(newFund1)<0 && newFund2<0){
                    message="There is not enough amount in your "+fundTypeData1+" and "+fundTypeData3;
                } 
               else if(parseInt(newFund1)<0){
                    message="There is not enough amount in your "+fundTypeData1;
                }
               else if(parseInt(newFund2)<0){
                    message="There is not enough amount in your "+fundTypeData3;
                }
                else{
                    data=[
                        {
                            "name":newFundType[0],
                            "value":newFund1+"%"
                        },
                        {
                            "name":newFundType[2],
                            "value":newFund2+"%"
                        },
                        {
                            "name":newFundType[1],
                            "value":newFund3+"%"
                        },
                        {
                            "name":newFundType[3],
                            "value":newFund4+"%"
                        }
                    ]
                }
             }
         });
        }
        else
            NotUnderstood(session);
        if(!data)
           session.send(message);
        else{
           var options = {listStyle: builder.ListStyle.button};
           session.send("The revised portfolio holding will be.....");  
           cards=createTransferCard(session, data);
           message1 = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
           session.send(message1);
           session.send("Please Confirm...")
           builder.Prompts.confirm(session, "", options);
       }
}
else
    NotUnderstood(session);
}
function fundConfirmation(session, results, next){
    if(results.response==true){
        var msg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
        session.send(msg);
        askAnything(session);
    }
    else
        no(session);
}

function notification(addr){
    myModule.server.post('/api/messages', function (req, res) {
    // Process posted notification
    var address = JSON.parse(addr);
    var notification = "Hello, mike";

    // Send notification as a proactive message
    var msg = new builder.Message()
        .address(address)
        .text(notification);
    bot.send(msg, function (err) {
        // Return success/failure
        res.status(err ? 500 : 200);
        res.end();
    });
});
}
function greet(session, args, next) {
    session.userData.attempt=1;
    //session.sendTyping();
    session.send(prompts.userWelcomeMessage);
   // var card=createHeroCard(session);
    // var msg = new builder.Message(session).addAttachment(card);
    // var message = new builder.Message()
    //     .address(session.message.address)
    //     .text(msg);
    // bot.send(message);
    // var cronJob = cron.job("* * * * * *", function(){
    //  notification(session.message.address);
    // }); 
    // cronJob.start();
    next();
}


function helpOption(session, args, next) {
    var options = {listStyle: builder.ListStyle.button};
    session.send("I can help you with the the following things");
    builder.Prompts.choice(session, "", serviceType, options);
}

function premiumAuthentication(session, args, next){
    next({response:args.intent});
}
function authenticate(session, results, next) {
    if(results&&results.response){
        if (results.response.index ===0) {
            session.send("How may i help you?");  
        }
        else if(results.response.index === 1){
                if(!session.userData.CID)
                 builder.Prompts.text(session, "I will do it for you, May i know your Customer Id.");  
                else
                 next();
               }
        else if(results.response.index === 2){
                session.beginDailog('/MyAgent');
               }
        else if(results.response==='PremiumDueDate'||results.response==='PremiumDueAmount'||results.response==='LastPaidPremium'){
                     if(!session.userData.CID)
                         builder.Prompts.text(session, "I will do it for you, May i know your Customer Id.");  
                     else
                        next();
                 }
              else
                NotUnderstood(session);
        }
    else
        NotUnderstood(session);
}
function validateCustomer(session, results, next) {                           // ****************************************validate customer
    console.log("customer1");
    if(!session.userData.CID){
        if (results && results.response) {
        var validCustomerId = results.response.match('\\b[Cc]?[0-9]{6,6}\\b');
        if (validCustomerId != null) {
            insuranceData.Customers.map(function (iData) {
                console.log(iData.CustomerID +"===" +validCustomerId[0]);
                if (iData.CustomerID === validCustomerId[0]) {
                    session.userData.CID = iData.CustomerID;
                    session.send("Hello " + iData.FirstName + " " + iData.LastName);
                    sendMail(iData,session);
                    builder.Prompts.text(session, "Before I can share the details with you can I ask for the OTP sent to your registered mobile number ******" + iData.MobileNumber % 10000 + " & registered email id: " + iData.EmailID + " for verification purpose. Please enter the OTP.");
                }
				
				else{
					fundInsuranceData2.Customers.map(function(idata)
					{
					console.log(idata.CustomerID +"===" +validCustomerId[0]);
					if (idata.CustomerID === validCustomerId[0]) {
						session.userData.insuranceType = "FNOL";
                    session.userData.CID = idata.CustomerID;
                    session.send("Hello " + idata.ProducerName );
                    sendMail(idata,session);	
                    builder.Prompts.text(session, "Before I can share the details with you can I ask for the OTP sent to your registered mobile number ******" + iData.MobileNumber % 10000 + " & registered email id: " + idata.EmailID + " for verification purpose. Please enter the OTP.");
                }
						
					});
				
				}
            });
            if(!session.userData.CID)
               builder.Prompts.text(session, "Invalid customer ID. Please enter correct customer ID");    
        }
        else {
            //Need to work on the validation. It is skipping the step to validate. From here it is directly going to next function having customer id null.
            builder.Prompts.text(session, "Invalid customer ID. Please enter correct customer ID");
        }
    } 
    else{
       builder.Prompts.text(session, "Please enter correct customer ID."); 
    }
    }
    else if(!session.userData.verified){
        insuranceData.Customers.map(function (iData) { 
        if (iData.CustomerID === session.userData.CID) {  
         sendMail(iData,session);  
         builder.Prompts.text(session, "Before I can share the details with you can I ask for the OTP sent to your registered mobile number ******" + iData.MobileNumber % 10000 + " & registered email id: " + iData.EmailID + " for verification purpose. Please enter the OTP.");
            }
        });
    }
    else
        next({response:results.response});
    }
function validateCustomer1(session, results, next) {
     console.log("customer2");
    if(session.userData.CID==null){
        if (results && results.response) {
        var validCustomerId = results.response.match('\\b[Cc]?[0-9]{6,6}\\b');
        if (validCustomerId != null) {
            insuranceData.Customers.map(function (iData) {
                if (iData.CustomerID === validCustomerId[0]) {
                    session.userData.CID = iData.CustomerID;
                    session.send("Hello " + iData.FirstName + " " + iData.LastName);
                    sendMail(iData,session);
                    builder.Prompts.text(session, "Before I can share the details with you can I ask for the OTP sent to your registered mobile number ******" + iData.MobileNumber % 10000 + " & registered email id: " + iData.EmailID + " for verification purpose. Please enter the OTP.");
                }
            });
             if(!session.userData.CID)
               builder.Prompts.text(session, "Invalid customer ID. Please enter correct customer ID");  
        }
        else {
            //Need to work on the validation. It is skipping the step to validate. From here it is directly going to next function having customer id null.
            builder.Prompts.text(session, "Invalid customer ID. Please enter correct customer ID");
        }
    } 
    else{
       builder.Prompts.text(session, "Please enter correct customer ID"); 
    }
    }
    else{
         next({ response: results.response });
    }
}
function validateCustomer2(session, results, next) {           
    console.log("customer3");
    if(session.userData.CID==null){
         if (results && results.response) {
        var validCustomerId = results.response.match('\\b[Cc]?[0-9]{6,6}\\b');
        if (validCustomerId != null) {
            insuranceData.Customers.map(function (iData) {
                if (iData.CustomerID === validCustomerId[0]) {
                    session.userData.CID = iData.CustomerID;
                    session.send("Hello " + iData.FirstName + " " + iData.LastName);
                    sendMail(iData,session);
                    builder.Prompts.text(session, "Before I can share the details with you can I ask for the OTP sent to your registered mobile number ******" + iData.MobileNumber % 10000 + " & registered email id: " + iData.EmailID + " for verification purpose. Please enter the OTP.");
                }
            });
             if(!session.userData.CID){
                    var msg="Sorry. You entered wrong Customer ID. Incase, if you don’t know the Customer ID, Please call our helpdesk 1800 123 4567. Thank you."
                    session.send(msg);
                    session.endDialog();  
             }
        }
        else {
            //Need to work on the validation. It is skipping the step to validate. From here it is directly going to next function having customer id null.
        var msg="Sorry. You entered wrong Customer ID. Incase, if you don’t know the Customer ID, Please call our helpdesk 1800 123 4567. Thank you."
        session.send(msg);
        session.endDialog(); 
        }
    } 
    else{
        var msg="Sorry. You entered wrong Customer ID. Incase, if you don’t know the Customer ID, Please call our helpdesk 1800 123 4567. Thank you."
        session.send(msg);
        session.endDialog();  
    }
         
    }
    else{
        next({ response: results.response });
    }
}
function sendMail(customerData,session){
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'sanjeevengg94@gmail.com', // Your email id
            pass: 'sanjeev#5794' // Your password
        }
    });
        var otp=randomstring.generate(6);
        session.userData.otp=otp;
        console.log(otp);
        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"L&A" <L&A@insurance.com>', // sender address
            to: customerData.EmailID, // list of receivers
            subject: 'Request for OTP', // Subject line
            text: 'One time password', // plaintext body
            html: 'Dear '+customerData.FirstName+', You have requested for insurance policy related information.</br>Please enter the below otp code to validate your authorization to access related information.</br></br><center><b>'+otp+'<b>.<center>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
        });
}

function validateOtp(session, results, next) {
    if(!session.userData.verified){
        if(results && results.response && results.response==session.userData.otp) { 
        session.userData.verified='verified';
        session.send("Thanks for authentication. You have the following policies with us:");
            next();
        }
        else{
            builder.Prompts.text(session, "Invalid otp. Please enter the correct otp");  
        }
    }
    else{
        next({ response: results.response });
    }
 }
function validateOtp1(session, results, next) {
     console.log("otp2");
    if(!session.userData.verified){
        if(results && results.response && results.response==session.userData.otp) { 
        session.userData.verified='verified';
        session.send("Thanks for authentication. You have the following policies with us:");
            next();
        }
        else{
            builder.Prompts.text(session, "Invalid otp. Please enter the correct otp");  
        }
    }
    else{
        next({ response: results.response });
    }
}
function validateOtp2(session, results, next) {
     console.log("otp3");
    if(!session.userData.verified){
        if(results && results.response && results.response==session.userData.otp) { 
        session.userData.Verified='true';
        session.send("Thanks for authentication. You have the following policies with us:");
            next();
        }
        else{
            session.send("Sorry, we couldn't verfiy your details !!!");
            session.send("Goodbye!"); 
            session.endDialog(); 
        }
    }
    else{
        next({response:results.response});
    }
    }
function policies(session, results, next) {                         // ****************************policies*******************************
        var customerId = session.userData.CID;
        var mssg = "";
        var cards;
		var FNOLCard;
		
		if(session.userData.insuranceType === "FNOL" )
		{
			console.log("inside FNOL")
		FNOLCard = fundInsuranceData2.Customers.map(function(iData)
		{
			if(iData.CustomerID === customerId)
			{
				console.log("inside iData");
				return createFNOLCard(session, iData.insurance);	
			}
		})
		var message = new builder.Message(session).attachments(FNOLCard[0]).attachmentLayout('carousel');
        session.send(message);
		session.send("I can help you with the the following:");
		var options = {listStyle: builder.ListStyle.button};
		builder.Prompts.choice(session, "", FNOLServices, options);
		}
		else{
		
        cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === customerId)
                return createCard(session, iData.Insurance)
        })
        var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
        session.send(message);
        var options = {listStyle: builder.ListStyle.button};
        session.send("I can help you with the the following:");
        builder.Prompts.choice(session, "", serviceRequest, options);
		}
}
 
 

function service(session, results, next) {                           // ********************************service**********************************************
	console.log("inside service");
	console.log(results.response);
	console.log(session.userData.insuranceType);
	if(session.userData.insuranceType === "FNOL" )
	{
			if (results.response.index == 0) {	
             session.send("enter policy number");	
            			 
			builder.Prompts.text(session, "Kindly enter the policy number for which you would like to file a claim request");		   
		}
		else if(results.response.index == 1)
		{
			builder.prompts.text(session, "2nd one");
			
		}
	}
	else{
		
    if (results.response.index == 0) {
        var options = {listStyle: builder.ListStyle.button};
        session.send("I can help you with the the following:");
        builder.Prompts.choice(session, "", premiumOperations, options);
    }
    else if(results.response.index == 1){
        NotUnderstood(session);
    }else if(results.response.index == 2){
        var options = {listStyle: builder.ListStyle.button};
        session.send("This option is available only for the Investment Linked Policy - MIN98765.");
        session.send("Do you want to proceed?")
        builder.Prompts.confirm(session, "", options);
        //builder.Prompts.confirm(session, "This option is available only for the Investment Linked Policy - MIN98765. Do you want to proceed?");
    }
    
	}
}
function premiumOperation(session, results, next) {   // *********************************************************premium operation**************************
	console.log(results.response);
	if(session.userData.insuranceType === "FNOL")
	{
		var mssg = "";
        var cards;
		var policyNumber = results.response;
		fundInsuranceData2.Customers.map(function(idata)
		{
			if(idata.PolicyNumber === policyNumber)
			{
			session.send(session,"Thank you. Below are the details of your policy." );
			cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === customerId)
                return createFNOLpolicyCard(session, iData.HiredAndNonOwnedAutoInsurance)
				})
			var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
			session.send(message);
			}
			
		})
		builder .Prompts.text(session, "We are sorry for the incident. We are here to do all that we can to help you. Please provide the location and time of occurrence of the event");
		
	}
	else{
		
			console.log(results.response);
			var customerId = session.userData.CID;
			if (results.response.index == 0) {
				NotUnderstood(session);
			} else if (results.response.index == 1) {
				NotUnderstood(session);
			} else if (results.response.index == 2) {
				var cards = insuranceData.Customers.map(function (iData) {
					if (iData.CustomerID === customerId)
						return createLastPaidPremiumCard(session, iData.Insurance)
				})
				var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
				session.send(message);
				var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
				session.send(mssg);
				session.userData.step = "premiumOperation";
				askAnything(session);
			} else if (results.response.index == 3) {
				NotUnderstood(session);
			} else if (results.response.index == 4) {
				var cards = insuranceData.Customers.map(function (iData) {
					if (iData.CustomerID === customerId)
						return createPremiumOperationCard(session, iData.Insurance)
				})
				var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
				session.send(message);
				var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
				session.send(mssg);
				session.userData.step = "premiumOperation";
				askAnything(session);
			} else if(results.response===true){
			   var cards = fundInsuranceData.Customers.map(function (iData) {
					if (iData.CustomerID === customerId)
						return createFundCard(session, iData.InvestmentLinkedPolicy)
				}); 
			   session.userData.fundSwitch='done';
			   var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
			   session.send("Your investments are held under  the following funds");
			   session.send(message);
			   session.send("Can you please specify the fund switch to be made?");
			}
			else if(results.response===false){
				 session.userData={};
				 session.endDialog("Thanks for reaching out to us. Have a Good Day! ");
			}
			else {
				session.endDialogWithResult(results);
			}
	}
}


function FNOLClaim(session, results, next)
{
	if(session.userData.insuranceType === "FNOL"){
	session.send( "Kindly list the numbers that are applicable in order to facilitate raising the claim request:")
		FNOLclaim
		var options = {listStyle: builder.ListStyle.button};        
        builder.Prompts.choice(session, "", FNOLclaim, options);
	}
	else{
		session.endDialogWithResult(results);
	}
}
 function FNOLClaimValidation(session , results, next)
 {
	 if(session.userData.insuranceType === "FNOL"){
		builder.Prompts.text(session ,"Thank you for your response. Your claim has been registered. Please note your Reference ID: 12345. You can connect with us @ toll free number 1800 123 4567 at any time for any further assistance.Please take care.") ;
	 }
	 else{
		 
		session.endDialogWithResult(results); 
	 }
	 
 }

function premiumDueDate(session, response, next){
        var cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID)
                return createPremiumDueDateCard(session, iData.Insurance)
        })
        var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
        session.send(message);
        var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
        session.send(mssg);

        session.userData.step = "premiumOperation";
        askAnything(session);

}
function premiumDueAmount(session, response, next){
   var cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID)
                return createPremiumOperationCard(session, iData.Insurance)
        })
        var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
        session.send(message);
        var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
        session.send(mssg);
        session.userData.step = "premiumOperation";
        askAnything(session); 
}
function lastPaidPremiumDetails(session, response, next){
     var cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === session.userData.CID)
                return createLastPaidPremiumCard(session, iData.Insurance)
        })
        var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
        session.send(message);
        var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
        session.send(mssg);
        session.userData.step = "premiumOperation";
        askAnything(session);
}

function createTransferCard(session, data){
    var cards = [];
    for(var i=0;i<data.length;i++){
        var card = new builder.HeroCard(session);
        card.title(data[i].name)
        card.subtitle(data[i].value);
        cards.push(card);
    }
    return cards;
}
function createFundCard(session, fundData){
    var cards = [];
    var fundType=[
            {
                "name":"Balanced Fund",
                "value":"BalancedFund"
            },
            {
                "name":"Debt Fund",
                "value":"DebtFund"
            },
            {
                "name":"Cash Fund",
                "value":"CashFund"
            },
            {
                "name":"Equity Fund",
                "value":"EquityFund"
            }
        ]
    for (var i = 0; i < 4; i++) {
        var card = new builder.HeroCard(session);
        card.title(fundType[i].name)
        card.subtitle(fundData[0][fundType[i].value]);
        cards.push(card);
    }
    return cards; 
}
function createCard(session, insData) {
    var cards = [];
    for (var i = 0; i < insData.length; i++) {
        var card = new builder.HeroCard(session);
        card.title(insData[i].Type);
        card.subtitle("Policy Number : " + insData[i].PolicyNumber);
        cards.push(card);
    }
    return cards;
}

function createFNOLCard(session , insData)   // **************************************************************************************** FNOLCard
{
	console.log("inside fnol 2");
	var cards =[];
	for (var i = 0; i < insData.length; i++) {
        var card = new builder.HeroCard(session);
        card.title(insData[i].Type);
        
        cards.push(card);
    }
	
	return cards;
}

 function createFNOLpolicyCard(session, insData)
 {
	  var cards = [];
	  var card = new builder.HeroCard(session);
	  card.title("Policy Nmber " +insData.PolicyNumber);
	  card.text(insData.EffectiveDate +"Expiry Date :" +insData.ExpiryDate);
	  cards.push(card);
	  return cards;
 }
function createHeroCard(session) {
    return new builder.HeroCard(session)
        .title('Insurance Due Amount')
        .text('Hello, Mike');
}
function createServiceCard(session) {
    return new builder.HeroCard(session)
        .text('I can help you with the the following things: Please select one')
        .buttons([builder.CardAction.postBack(session,"information","Information on Products and Services"),builder.CardAction.postBack(session,"servicing","Servicing of existing policy")])
}

function createPolicyTermCard(session) {
    return new builder.HeroCard(session)
        .text('Ok. That’s great. We have different term products and would want to know in which policies you are interested')
        .buttons([builder.CardAction.postBack(session,"level","Level-Term"),builder.CardAction.postBack(session,"reducing","Reducing-Term")])
}
function getSampleCardActions1(session) {
    return [
        builder.CardAction.postBack(session,"level","Level-Term")
    ];
}
function getSampleCardActions2(session) {
    return [
        builder.CardAction.postBack(session,"reducing","Reducing-Term")
    ];
}
function createPremiumDueDateCard(session, premiumData){
  var cards = [];
    for (var i = 0; i < premiumData.length; i++) {
        var card = new builder.HeroCard(session);
        card.title(premiumData[i].Type + " - " + premiumData[i].PolicyNumber);
        card.text("Premium Due Date (dd/mm/yyyy): " + premiumData[i].PremiumDueDate);
        cards.push(card);
    }
    return cards;  
}
function createPremiumOperationCard(session, premiumData) {
    var cards = [];
    for (var i = 0; i < premiumData.length; i++) {
        var card = new builder.HeroCard(session);
        card.title(premiumData[i].Type + " - " + premiumData[i].PolicyNumber);
        card.text("Premium Amount : (" + premiumData[i].PremiumPayingFrequency + ") : Rs. " + premiumData[i].PremiumDueAmount + "/-");
        cards.push(card);
    }
    return cards;
}
function createLastPaidPremiumCard(session, lastPaidPremiumData){
    var cards = [];
    for (var i = 0; i < lastPaidPremiumData.length; i++) {
        var card = new builder.HeroCard(session);
        card.title(lastPaidPremiumData[i].Type + " - " + lastPaidPremiumData[i].PolicyNumber);
        card.text("Last Premium Paid Date (dd/mm/yyyy) : " + lastPaidPremiumData[i].LastPaidPremiumDate+" Last Premium Paid Amount (" + lastPaidPremiumData[i].PremiumPayingFrequency + "):Rs. " + lastPaidPremiumData[i].PremiumDueAmount + "/-");
        cards.push(card);
    }
    return cards;
}

function askAnything(session) {
    session.send("Would you like any other support?");
}

function NotUnderstood(session, args) {
    session.endDialog("Sorry i could not understand.");
}

function no(session) {
        session.userData = {};
        session.endConversation("Thanks for reaching out to us. Have a Good Day! "); 
}
function premiumDueAmount(session, args, next) {
    var customerId = session.userData.CID;
    if (customerId) {
        var cards = insuranceData.Customers.map(function (iData) {
            if (iData.CustomerID === customerId)
                return createPremiumOperationCard(session, iData.Insurance)
        })
        var message = new builder.Message(session).attachments(cards[0]).attachmentLayout('carousel');
        session.send(message);
        var mssg = "Thank you. You can connect with us @ toll free number 1800 123 4567 at any time for your requests.";
        session.send(mssg);
        session.userData.step = "premiumOperation";
        askAnything(session);
    }
    else {
        next();
    }

}
var policyType = [
     'Level Term',
     'Reducing Term'
]

var serviceRequest = [
    'Premium related changes and enquiries',
    'Profile changes',
    'Fund Switch and Premium Redirection'
]

var premiumOperations = [
    'Change in Premium Frequency',
    'Premium Calendar',
    'Details of Last Paid Premium',
    'Number of Premiums to be paid',
    'Due dates and Amount related'
]
var serviceType = [
    'Information on Products and Services',
    'Servicing of existing policy',
    'Looking for an agent'
]
var proceedConfirmation = [
    'Yes',
    'No'
]
var termTypes=  [
    'Level-Term',
    'Reducing-Term'
 ]
 
 var FNOLServices =[
		'Raising Claim request',
		'Installment reminder',
		' Policy document issuance',
		' Enquire policy and claim status',
       ' Change in premium frequency'
	   ]
 var FNOLclaim = [
		'There has been a damage to the insured vehicle',
        'The vehicle is in drivable condition',
		'There has been bodily injury to the insured members',
		'There has been damage to property of third party',
		'There has been bodily injury to third party'
 ]
function matchingEntity(fundType){
    var newFundType=[];
    console.log("before matches: "+fundType);
    if(fundType.length==0){
        return null
    }
    else{
        for(var i=0;i<fundType.length;i++){
            if(fundType[i].match(/balance/gi)){
                newFundType[i]="BalancedFund";
            }
            else if(fundType[i].match(/cash/gi)){
                newFundType[i]="CashFund";
            }
            else if(fundType[i].match(/debt/gi)){
                newFundType[i]="DebtFund";
            }
            else if(fundType[i].match(/equity/gi)){
                newFundType[i]="EquityFund";
            }
           
        }
    }
    console.log("inside matches: "+newFundType);
    return newFundType;
}