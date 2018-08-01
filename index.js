const lotion = require('lotion')
const pillars = require('./pillars')

class Pillar {
  constructor() {
    this.app = lotion({
      initialState: {
          wallets: {
              'ting': {
                  balance: 100,
                  bonds: 0
              },
              'wai': {
                  balance: 100,
                  bonds: 0
              },
              'badActor': {
                  balance: 100,
                  bonds: 0
              }
          },
          bondQueue: [],
          bondFactor: 0.9,
          airdropFactor: 1.1,
          supply: 20,
          votePrices: {},
          stakedAmount: {},
          lastVoteWindow: 0,
          finalPrice: 0
      },
      // logTendermint: true,
      createEmptyBlocks: true,
      devMode: true
    })

    const hi = pillars()

    this.app.use(hi)
  }

  async init () {
    return await this.app.listen(3000)
  }

}

module.exports = Pillar
