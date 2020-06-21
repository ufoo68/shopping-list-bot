import * as childProcess from 'child_process'

const LAMBDA_LAYER_DIR_NAME = './layer.out/nodejs/node_modules/'
export const bundleLayer = () => childProcess.execSync(`yarn install --production --modules-folder ${LAMBDA_LAYER_DIR_NAME}`)