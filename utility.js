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
  if (!from) {
    throw new Error('`from` is required.')
  }

  if (typeof from !== 'string') {
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

module.exports = {verifyAmountField, verifyFrom, verifyBalanceFrom, verifyMinimumBalance}
