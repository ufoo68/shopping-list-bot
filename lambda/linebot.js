const line = require('@line/bot-sdk');
const crypto = require('crypto');
const message = require('line-message-builder');
require('dotenv').config();
const client = new line.Client({channelAccessToken: process.env.ACCESSTOKEN});
 
exports.handler = function (event, context) {
 let signature = crypto.createHmac('sha256', process.env.CHANNELSECRET).update(event.body).digest('base64');
 let checkHeader = (event.headers || {})['X-Line-Signature'];
 let body = JSON.parse(event.body);
 if (signature === checkHeader) {
  if (body.events[0].replyToken === '00000000000000000000000000000000') { //接続確認エラー回避
   let lambdaResponse = {
    statusCode: 200,
    headers: { "X-Line-Status" : "OK"},
    body: '{"result":"connect check"}'
   };
   context.succeed(lambdaResponse);
  } else {
   client.replyMessage(body.events[0].replyToken, message.buildReplyText(body.events[0].message.text))
   .then(() => { 
    let lambdaResponse = {
     statusCode: 200,
     headers: { "X-Line-Status" : "OK"},
     body: '{"result":"completed"}'
    };
    context.succeed(lambdaResponse);
   }).catch((err) => console.log(err));
  }
 } else {
  console.log('署名認証エラー');
 }
};