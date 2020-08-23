# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

# Class: AWS.RDS

## Sending a Request Using RDS
`var rds = new AWS.RDS();

rds.deregisterDBProxyTargets(params, function (err, data) {
 
  if (err) console.log(err, err.stack); // an error occurred
  
  else     console.log(data);           // successful response
  
});`

## Locking the API Version
In order to ensure that the RDS object uses this specific API, you can construct the object by passing the apiVersion option to the constructor:

var rds = new AWS.RDS({apiVersion: '2014-10-31'});
You can also set the API version globally in AWS.config.apiVersions using the rds service identifier:

AWS.config.apiVersions = {
  rds: '2014-10-31',
  // other service API versions
};

var rds = new AWS.RDS();

# Class: AWS.RDSDataService
Inherits:
AWS.Serviceshow all
Identifier:
rdsdataservice
API Version:
2018-08-01
Defined in:
(unknown)
* `Overview` Constructs a service interface object. Each API operation is exposed as a function on service.

## Service Description
Amazon RDS provides an HTTP endpoint to run SQL statements on an Amazon Aurora Serverless DB cluster. To run these statements, you work with the Data Service API.

For more information about the Data Service API, see Using the Data API for Aurora Serverless in the Amazon Aurora User Guide.