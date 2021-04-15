const { DynamoDB, S3, Rekognition } = require('aws-sdk')
const CryptoHelper = require('./cryptoHelper.js')

const dynamo = new DynamoDB.DocumentClient({ region: 'us-east-2' })
const s3 = new S3({ params: { Bucket: 'fotosfacial' } })

exports.handler = async (event) => {
    try {
        const { b64img, username, password } = event
    
        const buf = Buffer.from(b64img.replace(/^data:image\/\w+;base64,/, ""),'base64')
        const Key = `${username}-${Date.now()}`

        const s3Params = {
            Key, 
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/jpeg'
        };
        
        const photo_url = (await s3.getSignedUrlPromise('getObject', { Key })).split('?')[0]
        
        await s3.putObject(s3Params).promise()
        
        console.log('successfully uploaded the image!')
        
        const rekognitionParams = {
            CollectionId: "users-faces",
            ExternalImageId: username, 
            Image: {
                S3Object: {
                    Bucket: "fotosfacial", 
                    Name: Key
              }
            }
        }
        const rekognition = new Rekognition()
        
        await rekognition.indexFaces(rekognitionParams).promise()
        
        const dynamoParams = {
            TableName: "users",
            Item: {
                username,
                password: await (new CryptoHelper()).encrypt(password),
                photo_url,
                photos_of_you: [],
                uploads: []
            }
        }
    
        await dynamo.put(dynamoParams).promise()
        
        return {
            statusCode: 200,
            message: "Registered user"
        }
    }
    catch(err) {
        console.log(err);
        
        return {
            statusCode: 500,
            message: "Something went wrong"
        }
    }
}