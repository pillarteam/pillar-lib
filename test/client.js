let lotion = require('lotion')

async function client() {
  let client = await lotion.connect('06837993228012085ac45daefd31eddde4764144bf1b520856c0032e9e8ed8ac')

  let result = await
    client.send({ type: 'transaction'})

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
  console.log('\nRESULT:\n', result)
}

client()
