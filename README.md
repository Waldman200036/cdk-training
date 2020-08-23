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
    var rds = new AWS.RDS();
    rds.deregisterDBProxyTargets(params, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

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

Using the AWS SDKs to invoke the Data API
You can use the AWS CLI or the various SDKs to invoke the Data API. I walk you through several examples using the AWS SDK for Python (Boto3).

You can obtain complete versions of the code examples discussed in this post from aws-aurora-serverless-data-api-sam GitHub repo.

Start by importing the boto3 library and creating an RDSDataService client to interact with the Data API (see rds_client following object). Access the Data API functionality using the client object.

    import boto3
    rds_client = boto3.client('rds-data')

Then, specify the database name, database ARN, and the Secrets Manager secret ARN for your Aurora Serverless cluster as module-scope variables. In the following code example, update the values for your own environment:

    database_name = “add-database-name-here”
    db_cluster_arn = “add-cluster-arn-here”
    db_credentials_secrets_store_arn = “add-secrets-store-arn-here”

In practice, you can export these values via the AWS CloudFormation stack that provisioned the Aurora Serverless cluster and import them automatically using scripts such as this one. For instance, look at the output parameters from the sample CloudFormation template.

The RDSDataService client provides a function called execute_statement() that enables the issuance of SQL statements against our Aurora Serverless database. This function takes the parameters discussed previously. Create a wrapper function, so you don’t have to pass these parameters for every invocation. For more information, see the following wrapper function execute_statement():

    def execute_statement(sql):
        response = rds_client.execute_statement(
            secretArn=db_credentials_secrets_store_arn,
            database=database_name,
            resourceArn=db_cluster_arn,
            sql=sql
        )
        return response

    This function takes a SQL statement as an input parameter, executes the statement against the Aurora Serverless database, and returns a raw response object. I use this function in several examples that follow.

## Example 1 – Issuing DDL commands to create the database and a table
You can now use the wrapper execute_statement() function to execute DDL commands. For instance, create a database table.

First, create a file with the following content and name it package_table.sql:

    CREATE TABLE IF NOT EXISTS package (
        package_name VARCHAR(100) NOT NULL,
        package_version VARCHAR(50) NOT NULL,
        PRIMARY KEY (package_name, package_version)
    )

You use this file to create a table called package to store the name and version of software packages (for example, MySQL 5.7.21).

Next, create a MySQL database object and the package table by calling function execute_statement(), as in the following code example:

# create MySQL database object
    execute_statement(f'create database if not exists {database_name}')
# create ‘package’ table
    table_ddl_script_file = 'package_table.sql
    print(f’Creating table from DDL file: {table_ddl_script_file}’)
    with open(table_ddl_script_file, 'r') as ddl_script:
        ddl_script_content=ddl_script.read()
        execute_statement(ddl_script_content)

    To create multiple tables, you can use an array to iterate through multiple DDL .sql files and use function execute_statement(), again. For more information, see the aws-aurora-serverless-data-api-sam GitHub repo.

## Example 2 – Creating a simple query
Now use the function execute_statement() to run a simple query and print the raw results returned in the standard output:

    response = execute_statement('select * from package')
    print(response['records'])

## Example 3 – Creating a parameterized query
The RDSDataService client also supports parameterized queries by allowing you to use placeholder parameters in SQL statements. Escaped input values permit the resolution of these parameters at runtime. Parameterized queries are useful to prevent SQL injection attacks.

For instance, the following SQL query uses a parameter called package_name. It’s a placeholder for a package name that resolves at runtime when the query is executed using the value from variable package_name.

    sql = 'select * from package where package_name=:package_name'
    package_name = 'package100'
    sql_parameters = [{'name':'package_name', 'value':{'stringValue': f'{package_name}'}}]
    response = execute_statement(sql, sql_parameters)
    print(response['records'])

Now refactor the function execute_statement() to take an extra parameter (sql_parameters) to support parameterized SQL statements.

    def execute_statement(sql, sql_parameters=[]):
        response = rds_client.execute_statement(
            secretArn=db_credentials_secrets_store_arn,
            database=database_name,
            resourceArn=db_cluster_arn,
            sql=sql,
            parameters=sql_parameters
        )
        return response

## Example 4 – Formatting query results
As you’ve probably noticed already, the function execute_statement() returns raw results that likely need parsing and formatting before use. The following code example uses a couple of small Python functions (formatRecords(), formatRecord() and, formatField()) to format a list of returned records by processing individual records and fields.

### Formatting query returned Field
    def formatField(field):
       return list(field.values())[0]
### Formatting query returned Record
    def formatRecord(record):
       return [formatField(field) for field in record]
### Formatting query returned Field
    def formatRecords(records):
       return [formatRecord(record) for record in records]
    sql = 'select package_name, package_version from package'
    response = execute_statement(sql)
    print(formatRecords(response['records']))

## Example 5 – Creating a parameterized SQL insert
You can also parameterize other SQL statements, including insert statements. For example, the following code example uses the execute_statement() function to insert tuple (“package-2”, “version-1”) into the package table.

    sql = 'insert into package (package_name, package_version) values (:package_name, :package_version)'
    sql_parameters = [
        {'name':'package_name', 'value':{'stringValue': 'package-2'}},  
        {'name':'package_version', 'value':{'stringValue': 'version-1'}}
    ]
    response = execute_statement(sql, sql_parameters)
    print(f'Number of records updated: {response["numberOfRecordsUpdated"]}')

## Example 6 – Batching SQL inserts
The Data API also supports batching by executing a SQL statement multiple times against a set of specified parameters using a single API call. Batching can lead to significant performance gains, as the overall network time to process multiple SQL statements is drastically reduced (for example, inserting hundreds of rows in a table).

The RDSDataService’s batch_execute_statement() function makes these gains possible. This function takes similar parameters as the execute_statement() function but uses a two-dimensional array for the list of parameterized values.

Wrap the RDSDataService’s batch_execute_statement() function to simplify its list of parameters and make it easier for callers to invoke the function. The following wrapper batch_execute_statement() function takes a SQL statement and a two-dimensional array (set of lists) as parameters, invokes the original batch_execute_statement() function, and returns a raw response object:

    def batch_execute_statement(sql, sql_parameter_sets):
        response = rds_client.batch_execute_statement(
            secretArn=db_credentials_secrets_store_arn,
            database=database_name,
            resourceArn=db_cluster_arn,
            sql=sql,
            parameterSets=sql_parameter_sets
        )
        return response

    You can now invoke your batch_execute_statement() wrapper function to insert multiple rows using a single API call.

For instance, batch insert 10 packages in your packages table. First, populate the sql_parameters_sets 2-dimensional array with package names and versions. Then call batch_execute_statement() passing the SQL insert statement and the array as parameters, as shown in the following code example:

    sql = 'insert into package (package_name, package_version) values (:package_name, :package_version)'
        sql_parameter_sets = []
        for i in range(1,11):
            entry = [
                    {'name':'package_name', 'value':{'stringValue': f'package{i}'}},
                    {'name':'package_version', 'value':{'stringValue': 'version-1'}}
            ]
            sql_parameter_sets.append(entry)
        response = batch_execute_statement(sql, sql_parameter_sets)
        print(f'Number of records updated: {len(response["updateResults"])}')

## Example 7 – Handling exceptions
Now, create a specific exception type to raise and catch database-related errors in your code. Start by creating a simple class DataAccessLayerException, as shown in the following code example:

class DataAccessLayerException(Exception):
   pass
Your new exception type can now be used to raise and catch database-related errors.

For instance, the following code example shows how the function add_package() catches any errors that can potentially happen when issuing a SQL statement against the database. It wraps and re-raises the original exception as a DataAccessLayerException exception using Python 3’s “raise from” statement:

    def add_package():
        try:
            sql = 'insert into package (package_name, package_version) values (:package_name, :package_version)'
            sql_parameters = [
                {'name':'package_name', 'value':{'stringValue': f'package-2'}},
                {'name':'package_version', 'value':{'stringValue': 'version-1'}}
            ]
            response = execute_statement(sql, sql_parameters)
            print(f'Number of records updated: {response["numberOfRecordsUpdated"]}')
        except Exception as e:
            raise DataAccessLayerException(e) from e

            You can now use a try/except block to handle DataAccessLayerException exceptions when calling function add_package(), as shown in the following code example:

 try:
     add_package()
 except DataAccessLayerException as e:
     print(e)

## Example 8 – Committing or rolling back transactions
The Data API supports transactions. Your code can start a transaction, execute SQL commands within the context of that transaction, and then commit the transaction. If an exception occurs during this process, the transaction can be rolled back entirely:

Now, try updating the functions execute_statement() and batch_execute_statement() to support transactions. These functions now take an optional transaction_id parameter. If the caller doesn’t provide the transaction_id value, the functions execute as normal, and changes resulting from the call commit automatically. Otherwise, an explicit call to RDSDataService’s functions commit_transaction() or rollback_transaction() is required:

Refactored to support transactions, the function execute_statement() renders as follows:

      def execute_statement(sql, sql_parameters=[], transaction_id=None):
           parameters = {
               'secretArn': db_credentials_secrets_store_arn,
               'database': database_name,
               'resourceArn': db_cluster_arn,
                'sql': sql,
               'parameters': sql_parameters
           }
           if transaction_id is not None:
               parameters['transactionId'] = transaction_id
           response = rds_client.execute_statement(**parameters)
           return response

     Refactored to support transactions, function batch_execute_statement() renders as follows:

def batch_execute_statement(sql, sql_parameter_sets, transaction_id=None):
     parameters = {
         'secretArn': db_credentials_secrets_store_arn,
         'database': database_name,
         'resourceArn': db_cluster_arn,
         'sql': sql,
         'parameterSets': sql_parameter_sets
     }
     if transaction_id is not None:
         parameters['transactionId'] = transaction_id
     response = rds_client.batch_execute_statement(**parameters)
     return response

     Use the updated version of function batch_execute_statement() to batch insert data within a transactional context. If no errors occur, the transaction commits. Otherwise, it rolls back.

In the code example, the transaction_id passes to function batch_execute_statement() using the transaction object returned by function begin_transaction().

        transaction = rds_client.begin_transaction(
             secretArn=db_credentials_secrets_store_arn,
             resourceArn=db_cluster_arn,
             database=database_name)
        try:
            sql = 'insert into package (package_name, package_version) values (:package_name, :package_version)'
            sql_parameter_sets = []
            for i in range(30,40):
                entry = [
                        {'name':'package_name', 'value':{'stringValue': f'package{i}'}},
                        {'name':'package_version', 'value':{'stringValue': 'version-1'}}
                ] sql_parameter_sets.append(entry)
            response = batch_execute_statement(sql, sql_parameter_sets, transaction['transactionId'])
        except Exception:
            transaction_response = rds_client.rollback_transaction(
                secretArn=db_credentials_secrets_store_arn,
                resourceArn=db_cluster_arn,
                transactionId=transaction['transactionId'])
        else:
            transaction_response = rds_client.commit_transaction(
                secretArn=db_credentials_secrets_store_arn,
                resourceArn=db_cluster_arn,
                transactionId=transaction['transactionId'])
            print(f'Number of records updated: {len(response["updateResults"])}')
        print(f'Transaction Status: {transaction_response["transactionStatus"]}')
        Conclusion
