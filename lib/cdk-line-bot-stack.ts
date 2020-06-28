import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import { LambdaUtil } from './lambdaUtil'

export class CdkLineBotStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    })

    const layer = new lambda.LayerVersion(this, 'layer', {
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      code: lambda.Code.fromAsset('layer.out'),
    })

    const dbHandler = new LambdaUtil(this, 'DbHandlerFunction', {
      path: 'lambda/dbHandler',
      layer,
      environment: {
        TABLE_NAME: table.tableName,
      },
    }).handler

    const linebot = new LambdaUtil(this, 'LineBotFunction', {
      path: 'lambda/linebot',
      layer,
      environment: {
        ACCESS_TOKEN: process.env.ACCESS_TOKEN!,
        CHANNEL_SECRET: process.env.CHANNEL_SECRET!,
        FUNCTION_NAME: dbHandler.functionName,
      }
    }).handler

    dbHandler.grantInvoke(linebot)

    table.grantFullAccess(dbHandler)

    const api = new apigateway.RestApi(this, 'Api')
    api.root.addMethod('POST', new apigateway.LambdaIntegration(linebot))

  }
}
