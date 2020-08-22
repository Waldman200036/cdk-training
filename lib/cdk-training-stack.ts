import * as cdk from '@aws-cdk/core';
import * as training_service from '../lib/training_service';

export class CdkTrainingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    new training_service.trainingService(this, 'training');
  }
}
