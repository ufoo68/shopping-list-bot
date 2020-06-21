#!/usr/bin/env node
import cdk = require('@aws-cdk/core')
import { CdkLineBotStack } from '../lib/cdk-line-bot-stack'
import { bundleLayer } from '../lib/layerSetup'

bundleLayer()

const app = new cdk.App()
new CdkLineBotStack(app, 'CdkLineBotStack')