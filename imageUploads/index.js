const { Rekognition, DynamoDB, S3 } = require('aws-sdk');

exports.handler = async (event, context, callback) => {
    try {
        const rekognition =  new Rekognition()
        const dynamodb = new DynamoDB.DocumentClient({ region: 'us-east-2' });
        const s3 = new S3({ params: { Bucket: 'fotosfacial' } })
        
        const { b64img, username } = event
        
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
        
        await dynamodb.update({
            TableName: "users",
            Key: {
                username: username
            },
            UpdateExpression: "SET uploads = list_append(uploads, :i)",
            ExpressionAttributeValues:{
                ":i": [photo_url]
            }
        }).promise()
        
        var rekognitionParams = {
            CollectionId: "users-faces",
            Image: {
                Bytes: buf
            },
            MaxFaces: 5
        }
        
        const data = await rekognition.searchFacesByImage(rekognitionParams).promise()

        if (data.FaceMatches.length > 0) {
            const array_nomes = data.FaceMatches.map((match) => {
                return match.Face.ExternalImageId
            })

            for (let user of array_nomes) {
                await dynamodb.update({
                    TableName: "users",
                    Key: {
                        username: user
                    },
                    UpdateExpression: "SET photos_of_you = list_append(photos_of_you, :i)",
                    ExpressionAttributeValues:{
                        ":i": [photo_url]
                    }
                }).promise()
            }
        }
            
        return {
            statusCode: 200,
            message: "Uploaded"
        }
    } catch(err) {
        console.log(err);
        
        return {
            statusCode: 500,
            message: "Something went wrong"
        }
    }
};