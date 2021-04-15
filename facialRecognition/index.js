const { Rekognition } = require('aws-sdk');

exports.handler = async (event) => {
    try {
        const rekognition =  new Rekognition()
        
        const { b64img } = event
        
        const params = {
            CollectionId: "users-faces",
            Image: {
                Bytes: Buffer.from(b64img.replace(/^data:image\/\w+;base64,/, ""),'base64')
            },
            MaxFaces: 1
        }
        
        return await new Promise(resolve => {
            rekognition.searchFacesByImage(params, (err, data) => {
                if (err) {
                    console.log(err, err.stack)
                    
                    resolve({ 
                        statusCode: err.statusCode,
                        message: err.message
                    })
                } 
                else if (data.FaceMatches[0]) {
                    resolve({
                        statusCode: 200,
                        message: "Logged",
                        username: data.FaceMatches[0].Face.ExternalImageId
                    })
                } 
                else {
                    resolve({
                        statusCode: 404,
                        message: "User not found"
                    })
                }
            })
        });
    } catch(err) {
        console.log(err)
        
        return {
            statusCode: 500,
            message: "Something went wrong"
        }
    }
};