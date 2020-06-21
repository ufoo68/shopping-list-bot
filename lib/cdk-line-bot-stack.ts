import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apigateway from '@aws-cdk/aws-apigateway'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export class CdkLineBotStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING }
    })

    const handler = new lambda.Function(this, 'Function', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('linebot'),
      environment: {
        ACCESS_TOKEN: process.env.ACCESS_TOKEN!,
        CHANNEL_SECRET: process.env.CHANNEL_SECRET!,
        TABLE_NAME: table.tableName,
      }
    })

    table.grantFullAccess(handler) 

    const api = new apigateway.RestApi(this, 'Api')
    api.root.addMethod('POST', new apigateway.LambdaIntegration(handler))

  }
}
