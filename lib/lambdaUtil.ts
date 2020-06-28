import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'

interface LambdaUtilProps {
  layer: lambda.ILayerVersion
  path: string,
  environment?: {
    [key: string]: string
  },
}

export class LambdaUtil extends cdk.Construct {
  public readonly handler: lambda.Function
  constructor(scope: cdk.Construct, id: string, props: LambdaUtilProps) {
    super(scope, id)

    const { layer, environment, path } = props

    this.handler = new lambda.Function(this, id, {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path),
      layers: [layer],
      environment,
    })
  }
}