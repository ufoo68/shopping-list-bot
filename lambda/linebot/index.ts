import * as Lambda from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as Line from '@line/bot-sdk'
import * as Types from '@line/bot-sdk/lib/types'
import { buildReplyText } from 'line-message-builder'
import { analyzeMessage, DbHandlerEvent, DbHandlerEventResponse } from 'layer'

const lambda = new AWS.Lambda()

const channelAccessToken = process.env.ACCESS_TOKEN!
const channelSecret = process.env.CHANNEL_SECRET!

const config: Line.ClientConfig = {
    channelAccessToken,
    channelSecret,
}
const client = new Line.Client(config)

async function eventHandler(event: Types.MessageEvent): Promise<any> {
    if (event.type !== 'message' || event.message.type !== 'text' || !event.source.userId) {
        return null
    }
    const responseOfAnalyze = analyzeMessage(event.message.text)

    const dbHandlerEvent: DbHandlerEvent = {
        messageType: responseOfAnalyze.type,
        message: event.message.text,
        userId: event.source.userId,
    }

    const responseOfHandler = await lambda.invoke({
        FunctionName: process.env.FUNCTION_NAME!,
        Payload: JSON.stringify(dbHandlerEvent)
    }).promise()
    const shoppingList: DbHandlerEventResponse = JSON.parse(responseOfHandler.Payload as string)
    if (shoppingList.items.length > 0) {
        return client.replyMessage(event.replyToken, buildReplyText([
            responseOfAnalyze.message,
            ...shoppingList.items,
        ]))
    }
    return client.replyMessage(event.replyToken, buildReplyText(responseOfAnalyze.message))
}

export const handler: Lambda.APIGatewayProxyHandler = async (proxyEevent: Lambda.APIGatewayEvent, _context) => {

    const signature = proxyEevent.headers['X-Line-Signature']
    if (!Line.validateSignature(proxyEevent.body!, channelSecret, signature)) {
        throw new Line.SignatureValidationFailed('signature validation failed', signature)
    }

    const body: Line.WebhookRequestBody = JSON.parse(proxyEevent.body!)
    await Promise
        .all(body.events.map(async event => eventHandler(event as Types.MessageEvent)))
        .catch(err => {
            console.error(err.Message)
            return {
                statusCode: 500,
                body: 'Error'
            }
        })
    return {
        statusCode: 200,
        body: 'OK'
    }
}