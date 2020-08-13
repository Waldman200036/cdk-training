#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkTrainingStack } from '../lib/cdk-training-stack';

const app = new cdk.App();
new CdkTrainingStack(app, 'CdkTrainingStack');
