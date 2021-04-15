const { DynamoDB } = require('aws-sdk');
const dynamo = new DynamoDB.DocumentClient({ region: 'us-east-2' });

exports.handler = async (event, context, callback) => {
    const params = {
        TableName: 'users',
        Key: {
            username: event.queryStringParameters.username
        }
    }
    
    await new Promise(resolve => 
        dynamo.get(params, function(err, data) {
            if(err) {
                console.log(err)
                
                callback(null, {
                    statusCode: err.statusCode,
                    headers: {'Access-Control-Allow-Origin': '*'},
                    body: JSON.stringify({ 
                        statusCode: err.statusCode,
                        message: err.message
                    })
                })
    
                resolve()
            }
            
            if(!data.Item) {
                callback(null, {
                    statusCode: 404,
                    headers: {'Access-Control-Allow-Origin': '*'},
                    body: JSON.stringify({ 
                        statusCode: 404,
                        message: "User not found"
                    })
                })
                
                resolve()
            }
            
            const { password, ...user } = data.Item
            
            callback(null, {
                statusCode: 200,
                headers: {'Access-Control-Allow-Origin': '*'},
                body: JSON.stringify({ 
                    statusCode: 200,
                    message: "Success",
                    data: user
                })
            })
            
            resolve()
        })
    )
};