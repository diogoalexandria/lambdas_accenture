const { createDecipheriv } = require('crypto')

class CryptoHelper {
    constructor() {
        this.cryptoConfig = Object.values({
            algorithm: 'aes-192-ecb',
            cryptoKey: 'minha-chave-hiper-secret',
            initializationVectorKey: null
        })
    }
    
    async decrypt(data) {
        const cipher = createDecipheriv(...this.cryptoConfig)
        
        return cipher.update(data, 'base64', 'utf8')
                    .concat(cipher.final('utf8'))
    }
}

module.exports = CryptoHelper