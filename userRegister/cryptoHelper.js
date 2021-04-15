const { createCipheriv } = require('crypto')

class CryptoHelper {
    constructor() {
        this.cryptoConfig = Object.values({
            algorithm: 'aes-192-ecb',
            cryptoKey: 'minha-chave-hiper-secret',
            initializationVectorKey: null
        })
    }
    
    async encrypt(data) {
        const cipher = createCipheriv(...this.cryptoConfig)
        
        return cipher.update(data, 'utf8', 'base64')
                    .concat(cipher.final('base64'))
    }
}

module.exports = CryptoHelper