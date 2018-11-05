const debug = require('debug')('pillars')
const _ = require('underscore')
const secp256k1 = require('secp256k1')
const {verifyAmountField, verifyFrom, verifyBalanceFrom, verifyMinimumBalance} = require('./utility')

function pillars (opts = {}) {
  let { handlers } = opts

  function init (state, chainInfo) {
    console.log(state)
    console.log(chainInfo)
  }

  // {amount: Number(stake), type: 'vote', price: Number(price), from: 'ting'}
  function voteHandler (state, tx, chain) {
    debug('Here we vote !')

    if (tx.senderAddress in state.votePrices) {
        return
    }

    verifyFrom(tx.from)

    verifyMinimumBalance(tx.from, tx.amount, state.wallets)

    state.votePrices[tx.from] = tx.price
    state.stakedAmount[tx.from] = tx.amount

    return state
  }

  /* {
    amount: Number(amount),
    type: 'transaction',
    from: '022b790d661536c5afdfcca06e069098a6b5fbc4bffe8042c36cc7348acfd5ca9b',
    to: '022b790d661536c5afdfcca06e069098a6b5fbc4bffe8042c36cc7348acfd5ca9b',
    nonce: 1,
    signature: 'blah blah'
  }
    */
  function transactionHandler (state, tx, chain) {
    debug('Here we handle transaction !')

    // Check we have everything we need amount, from, to
    verifyAmountField(tx.amount)

    verifyFrom(tx.from)

    verifyMinimumBalance(tx.from, tx.amount, state.wallets)

    if (!tx.to) {
      throw new Error('`to` is required.')
    }

    if (typeof tx.to !== 'string') {
      throw new Error('`to` has to be a string.')
    }

    // Maybe dont do the Number(tx.amount).toString() !!!
    let amountBuffer = Buffer.from(Number(tx.amount).toString())
    let typeBuffer = Buffer.from(tx.type)
    let fromBuffer = Buffer.from(tx.from, 'hex')
    let toBuffer = Buffer.from(tx.to, 'hex')
    let nonceBuffer = Buffer.from(Number(tx.nonce).toString())

    let totalLenght =  amountBuffer.length + typeBuffer.length + fromBuffer.length + toBuffer.length + nonceBuffer.length

    let msg = Buffer.concat([amountBuffer, typeBuffer, fromBuffer, toBuffer, nonceBuffer], totalLength)

    if (!secp256k1.verify(msg, tx.signature, tx.from)) {
      throw new Error('`signature` doesnt match.')
    }

    // If we are here everything is fine, we can mutate state
    if (state.wallets[tx.to]) {
      // TODO: Rename wallets in accounts
      state.wallets[tx.to].balance += tx.amount
    } else {
      state.wallets[tx.to] = { balance: tx.amount, bonds: 0, nonce: 0}
    }

    state.wallets[tx.from].balance -= tx.amount

    return state
  }

  function airdropHandler (state, tx, chain) {
    console.log('Here we handle airdrop !')

    // AirDrop function doesn't seem right because it is going to sell bonds for everyone...
    // Need to verify how it actually works.
    const initialSupply = state.supply

    _.mapObject(state.wallets, (wallet, address) => {
        wallet.share = wallet.balance/initialSupply
    })

    const targetCap = state.supply * state.airdropFactor

    while(state.bondQueue.length){
        const bondtoRedeem = state.bondQueue.splice(0,1)
        for(let i = 0; i < bondtoRedeem[0].amount; i++){
            if(state.supply < targetCap){
                state.wallets[bondtoRedeem[0].bondowner].balance += 1
                state.supply += 1
            }
        }
    }

    if(state.supply < targetCap){
        let margin = (targetCap - state.supply)
        _.mapObject(state.wallets, (wallet, address) => {
                console.log(wallet.share)
                wallet.balance += margin*(wallet.share)
                state.supply += margin*(wallet.share)
        })

    }

    return state
  }

  function bondsHandler (state, tx, chain) {
    debug('Here we handle bonds !')
    //{amount: Number(amount), type: 'bonds', from: 'ting'}

    verifyAmountField(tx.amount)

    verifyFrom(tx.from)

    verifyMinimumBalance(tx.from, tx.amount, state.wallets)


    state.bondQueue.push({bondowner : tx.from, amount: tx.amount})
    state.wallets[tx.from].bonds += tx.amount
    state.wallets[tx.from].balance = (state.wallets[tx.from].balance || 0) - tx.amount*state.bondFactor

    return state
  }

  function txHandler (state, tx, chain) {
    if (!tx.type) throw Error('Need to give a type of tx')
    if (typeof tx.type !== 'string') throw Error('`tx` need to be a string')

    switch (tx.type) {
      case 'vote':
        voteHandler(state, tx, chain)
        break
      case 'transaction':
        transactionHandler(state, tx, chain)
        break
      case 'airdrop':
        airdropHandler(state, tx, chain)
        break
      case 'bonds':
        bondsHandler(state, tx, chain)
        break
      default:
        throw Error('Unknown type !')
    }
  }

  function blockHandler (state, chain) {
    if ((chain.time - state.lastVoteWindow) > 20) {
      state.lastVoteWindow = chain.time
    } else {
      return
    }

    //state.wallets[input.senderAddress].balance -= input.amount

    var totalPrices = 0;
    var totalWeight = 0;


    for (var address in state.votePrices) {
      totalPrices += state.votePrices[address] * state.stakedAmount[address]
      totalWeight += state.stakedAmount[address]
    }

    if (totalWeight > 0) {
      state.finalPrice = totalPrices / totalWeight
    }
    for (var address in state.votePrices) {
      if (state.votePrices[address] < state.finalPrice * 0.95) {
        continue
      }
      else if (state.votePrices[address] > state.finalPrice * 1.05) {
        continue
      }
      else {
        continue
        // state.wallets[address].balance += state.stakedAmount[address] * 1.01
      }
    }
    state.votePrices = {}
    state.stakedAmount = {}
  }

  return [
    {
      type: 'initializer',
      middleware: init
    },
    {
      type: 'tx',
      middleware: txHandler
    }, {
      type: 'block',
      middleware: blockHandler
    }
  ]
}

module.exports = pillars
