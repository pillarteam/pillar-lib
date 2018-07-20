const coins = require('coins')
const debug = require('debug')('pillars')

function verifyAmountField (amount) {
  if (!amount) {
    throw new Error('`amount` is required.')
  }

  if (typeof amount !== 'number') {
    throw new Error('`amount` has to be an number.')
  }

  if (amount < 0) {
    throw new Error('`amount` has to be positive or 0.')
  }

  if (!Number.isInteger(amount)) {
    throw new Error('`amount` has to be an integer.')
  }

  if (amount > Number.MAX_SAFE_INTEGER) {
    throw Error('`amount` must be < 2^53')
  }
}

function verifyFrom (from) {
  if (!tx.from) {
    throw new Error('`from` is required.')
  }

  if (typeof tx.from !== 'string') {
    throw new Error('`from` is required.')
  }
}

function verifyBalanceFrom (from, amount, wallets) {
  if (!wallets.hasOwnProperty(from)) {
    throw new Error(`${from} doesn't exist.`)
  }
}

function verifyMinimumBalance (from, amount, wallets) {
  verifyBalanceFrom(from, amount, wallets)

  if (wallets[from].balance < amount) {
    throw new Error('Not enough funds.')
  }
}

function pillars (opts = {}) {
  let { handlers } = opts

  function init (state, chainInfo) {
    console.log(state)
    console.log(chainInfo)
  }

  function voteHandler (state, tx, chain) {
    debug('Here we vote !')
    // {amount: Number(stake), type: 'vote', price: Number(price), from: 'ting'}

    if (tx.senderAddress in tx.votePrices) {
        return
    }

    verifyFrom(tx.from)

    verifyMinimumBalance(tx.from, tx.amount, state.wallets)

    state.votePrices[tx.from] = tx.price
    state.stakedAmount[tx.from] = tx.amount

    return state
  }

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

    // If we are here everything is fine, we can mutate state
    if (state.wallets[tx.to]) {
      state.wallets[tx.to].balance += tx.amount
    } else {
      state.wallets[tx.to] = { balance: amount, bonds: 0}
    }

    state.wallets[tx.from].balance -= tx.amount

    return state
  }

  function airdropHandler (state, tx, chain) {
    console.log('Here we handle airdrop !')

    // AirDrop function doesn't seem right because it is going to sell bonds for everyone...
    // Need to verify how it actually works.

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
    console.log(state)
    console.log(tx.type)

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

  return [
    {
      type: 'initializer',
      middleware: init
    },
    {
      type: 'tx',
      middleware: txHandler
    }
  ]
}

module.exports = pillars
