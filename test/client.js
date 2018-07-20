let lotion = require('lotion')

async function client() {
  let client = await lotion.connect('dbe97c6e04740d002068678f78e484577c0908acfe1e1a393e887df48703c7ac')

  // Transaction example
  let result = await
    client.send({ type: 'transaction', from: 'wai', to: 'ting', amount: 4})

  console.log('\nRESULT:\n', result)

  let result = await
    client.send({ type: 'bonds', from: 'wai', amount: 4})

  console.log('\nRESULT:\n', result)


  /*result = await
    client.send({
      from: [
        // tx inputs. each must include an amount:
        {amount: 4, type: 'coin', senderAddress: 'ting'}
      ],
      to: [
        // tx outputs. sum of amounts must equal sum of amounts of inputs.
        {amount: 4, type: 'coin', receiverAddress: 'wai'}
        ]
    })*/
}

client()
