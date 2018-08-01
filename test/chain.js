const Pillar = require('../')

async function main () {
  const pillar = new Pillar()

  const cgi = await pillar.init()

  console.log(cgi)
}

main()
