const { WebClient } = require('@slack/web-api')
const cheerio = require('cheerio')
const axios = require('axios')

// slack credentials
const token = process.env.SLACK_TOKEN
const conversationId = process.env.CONSERSATION_ID

let url =
  'https://df.olx.com.br/distrito-federal-e-regiao/brasilia/ciclismo?q=aro%2029&sf=1'

const getInfos = async () => {
  let res_page = await axios.get(url)

  let infos = []

  let $ = cheerio.load(res_page.data)

  info_list = $('#ad-list')

  info_list.find('a').each(function (item, element) {
    let path_A_photo = $(this).find('div > div > div').find('img').attr('src')

    let path_B_photo = $(this)
      .find('div > div > div')
      .find('img')
      .attr('date-src')

    const condition_path_B_photo =
      'date:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='

    let photo =
      path_A_photo.trim() !== condition_path_B_photo
        ? path_A_photo
        : path_B_photo

    let link = $(this).attr('href')
    let title = $(this).attr('title')
    let price = $(this)
      .find('div > :nth-child(2) > div:nth-child(1) > div:nth-child(2)')
      .text()
    let place = $(this)
      .find('div > :nth-child(2) > :nth-child(2) > div > :nth-child(1)')
      .text()
    let date = $(this)
      .find('div > :nth-child(2) > :nth-child(1) > :nth-child(3)')
      .text()

    // console.log('\n')
    // console.log('link: ', link)
    // console.log('imagem: ', photo)
    // console.log('title: ', title)
    // console.log('price: ', price)
    // console.log('place: ', place)
    // console.log('date: ', date)

    infos.push({
      link,
      title,
      price,
      place,
      date,
    })
  })

  return infos
}

sendMessage = async (products) => {
  for (product of products) {
    const web = new WebClient(token)

    let price = parseFloat(product.price.split(' ')[1].replace('.', ''))

    if (price < 1250) {
      console.log('price', price)

      // See: https://api.slack.com/methods/chat.postMessage
      const res = await web.chat.postMessage({
        channel: conversationId,
        text: `
          ${product.link}
          title: ${product.title}
          preço: ${product.price}
          place: ${product.place}
          date: ${product.date}
          \n
          \n
      `,
      })
    }
  }
}
;(async () => {
  let infos = await getInfos()

  let message = await sendMessage(infos)

  const web = new WebClient(token)

  // this is sent to the slack to indicate the end of a list of information
  await web.chat.postMessage({
    channel: conversationId,
    text: `
    ----------------------------
    \n
    ---------------------------
    `,
  })
})()
