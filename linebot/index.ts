import * as Lambda from 'aws-lambda'
import * as Line from '@line/bot-sdk'
import * as Types from '@line/bot-sdk/lib/types'
import { buildReplyText } from 'line-message-builder'
import { conversation } from './conversationModel'
import { dbHandler } from './dbHandler'

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
    const response = conversation(event.message.text)

    const replyText = [response.message]

    const shoppingList = await dbHandler(response.type, event.message.text, event.source.userId)
    if (shoppingList.length > 0) {
        shoppingList.map(value => replyText.push(value))
    }
    return client.replyMessage(event.replyToken, buildReplyText(replyText))
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