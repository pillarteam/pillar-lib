const { randomBytes } = require('crypto')
const secp256k1 = require('secp256k1')

class Account {
  constructor () {
    // Need to accept Mnemonic
    this.privKey = randomBytes(32)
    this.pubKey = secp256k1.publicKeyCreate(this.privKey)
  }

  sign (msg) {
    return secp256k1.sign(msg, this.privKey)
  }

  verify (msg, signature) {
    return secp256k1.verify(msg, signature, this.pubKey)
  }
}

module.exports = Account
