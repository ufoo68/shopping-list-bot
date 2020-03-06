import * as cdk from '@aws-cdk/core'
import { LambdaApi } from 'cdk-lambda-api'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export class CdkLineBotStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    })

    const lambdaApi = new LambdaApi(this, 'LineBot', {
      lambdaPath: 'Linebot',
      environment: {
        ACCESS_TOKEN: process.env.ACCESS_TOKEN!,
        CHANNEL_SECRET: process.env.CHANNEL_SECRET!,
        TABLE_NAME: table.tableName,
      }
    })

    table.grantFullAccess(lambdaApi.handler)
  }
}
