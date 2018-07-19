const coins = require('coins')

function pillars (opts = {}) {
  let { handlers } = opts

  function init (state, chainInfo) {
    console.log(state)
    console.log(chainInfo)
  }

  function voteHandler (state, tx, chain) {
    console.log('Here we vote !')
  }

  function transactionHandler (state, tx, chain) {
    console.log('Here we handle transaction !')
  }

  function txHandler (state, tx, chain) {
    console.log(state)
    console.log(tx.type)

    if (!tx.type) throw Error('Need to give a type of tx')

    switch (tx.type) {
      case 'vote':
        voteHandler(state, tx, chain)
        break
      case 'transaction':

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
