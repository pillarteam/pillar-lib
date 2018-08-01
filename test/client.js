let lotion = require('lotion')

async function client() {
  let client = await lotion.connect('3e577d9f5e7762dec79b958fcf5616b1be6f51229d17776229d37f3ab084941c')

  // Transaction example
  let result = await
    client.send({ type: 'transaction', from: 'wai', to: 'ting', amount: 4})

  console.log('\nRESULT:\n', result)

  result = await
    client.send({ type: 'bonds', from: 'wai', amount: 4})

  console.log('\nRESULT:\n', result)

  result = await
    client.send({ type: 'airdrop', from: 'wai'})

  console.log('\nRESULT:\n', result)
}

client()
