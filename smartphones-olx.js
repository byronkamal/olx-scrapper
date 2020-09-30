const { WebClient } = require('@slack/web-api')
const cheerio = require('cheerio')
const axios = require('axios')

let samsung_url =
  'https://df.olx.com.br/distrito-federal-e-regiao/brasilia/ciclismo?q=bicicleta'

const getInfos = async () => {
  let res_page = await axios.get(samsung_url)

  let informacoes = []

  let $ = cheerio.load(res_page.data)

  lista_informacoes = $('#ad-list')

  lista_informacoes.find('a').each(function (item, element) {
    let caminho_A_foto = $(this).find('div > div > div').find('img').attr('src')
    let caminho_B_foto = $(this)
      .find('div > div > div')
      .find('img')
      .attr('data-src')

    const condicao_caminho_B_foto =
      'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

    let foto =
      caminho_A_foto.trim() !== condicao_caminho_B_foto
        ? caminho_A_foto
        : caminho_B_foto

    let link = $(this).attr('href')
    let titulo = $(this).attr('title')
    let preco = $(this)
      .find('div > :nth-child(2) > div:nth-child(1) > div:nth-child(2)')
      .text()
    let local = $(this)
      .find('div > :nth-child(2) > :nth-child(2) > div > :nth-child(1)')
      .text()
    let data = $(this)
      .find('div > :nth-child(2) > :nth-child(1) > :nth-child(3)')
      .text()

    // console.log('\n')
    // console.log('link: ', link)
    // console.log('imagem: ', foto)
    // console.log('titulo: ', titulo)
    // console.log('preco: ', preco)
    // console.log('local: ', local)
    // console.log('data: ', data)

    informacoes.push({
      link,
      titulo,
      preco,
      local,
      data,
    })
  })

  return informacoes
}

sendMessage = async (dados) => {
  for (dado of dados) {
    const token = process.env.SLACK_TOKEN
    // const token = 'xoxb-1323035210197-1326141891794-6XiWjQbl9Xq1WCfQueToFO4v'

    const web = new WebClient(token)

    // const conversationId = 'C019MPYPXD1' // canal de celular
    // const conversationId = 'C01BM9UP97X' // canal de bibicletas
    const conversationId = process.env.CONSERSATION_ID

    if (parseFloat(dado.preco.split(' ')[1]) < 2.001) {
      // See: https://api.slack.com/methods/chat.postMessage
      const res = await web.chat.postMessage({
        channel: conversationId,
        text: `
        ${dado.link}
        titulo: ${dado.titulo}
        preço: ${dado.preco}
        local: ${dado.local}
        data: ${dado.data}
        \n
        \n
    `,
      })
    }
  }
}
;(async () => {
  let infos = await getInfos()
  let send = await sendMessage(infos)

  const token = process.env.SLACK_TOKEN
  // const token = 'xoxb-1323035210197-1326141891794-6XiWjQbl9Xq1WCfQueToFO4v'

  const web = new WebClient(token)

  const conversationId = process.env.CONSERSATION_ID
  // const conversationId = 'C019MPYPXD1' // canal de celular
  // const conversationId = 'C01BM9UP97X' // canal de bibicletas

  await web.chat.postMessage({
    channel: conversationId,
    text: `
    ----------------------------
    \n
    ---------------------------
    `,
  })
})()
