import * as cdk from '@aws-cdk/core'
import { LambdaApi } from 'cdk-lambda-api'

export class CdkLineBotStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    new LambdaApi(this, 'lineBot', {
      lambdaPath: 'linebot',
      environment: {
        ACCESS_TOKEN: process.env.ACCESS_TOKEN!,
        CHANNEL_SECRET: process.env.CHANNEL_SECRET!
      }
    })

  }
}
