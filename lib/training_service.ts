import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";

export class trainingService extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const handler = new lambda.Function(this, "trainingHandler", {
      runtime: lambda.Runtime.NODEJS_10_X, // So we can use async in widget.js
      code: lambda.Code.asset("resources/lambda"),
      handler: "index.main",
    });

    const api = new apigateway.RestApi(this, "training-api", {
      restApiName: "training Service",
      description: "This service serves training."
    });

    const getTrainingsIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: { "application/html": '{ "statusCode": "200" }' }
    });

    api.root.addMethod("GET", getTrainingsIntegration); // GET /

    const training = api.root.addResource("{state}");

    // Get a specific covid19 from bucket with: GET /{state}
    const getTrainingIntegration = new apigateway.LambdaIntegration(handler);

    training.addMethod("GET", getTrainingIntegration); // GET /{state}

  }
}