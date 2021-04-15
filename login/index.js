const { DynamoDB } = require('aws-sdk')
const dynamo = new DynamoDB.DocumentClient({ region: 'us-east-2' })
const CryptoHelper = require('./cryptoHelper.js')

const confirm_login = async (username, password) => {
    const params = {
        TableName: 'users',
        Key: {
            username
        }
    }
    
    return await new Promise(resolve => {
        dynamo.get(params, async function(err, data) {
            if(err) {
                console.log(err)
                
                resolve({ 
                    statusCode: err.statusCode,
                    message: err.message
                })

                return
            }
            
            const passwordDecrypted = await (new CryptoHelper()).decrypt(data.Item.password)
            
            if(data.Item && passwordDecrypted == password) {
                resolve({ 
                    statusCode: 200,
                    message: "Logged",
                    username
                })
                
                return
            }
            
            resolve({ 
                statusCode: 404,
                message: "User not found"
            })
        })
    })
}  

exports.handler = async (event, context, callback) => {
    return await confirm_login(event.username, event.password)
};
