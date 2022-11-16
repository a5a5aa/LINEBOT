import 'dotenv/config'
import axios from 'axios'
import linebot from 'linebot'
import schedule from 'node-schedule'
import temp from './templates/temp.js'

// import * as kkbox from '@kkbox/kkbox-javascript-developer-sdk'

import kkbox from '@kkbox/kkbox-javascript-developer-sdk'

const auth = new kkbox.Auth(process.env.CLIENT_ID, process.env.CLIENT_SECRET)
let accessToken = ''
let api
const refreshToken = async () => {
  try {
    const response = await auth.clientCredentialsFlow.fetchAccessToken()
    accessToken = response.data.access_token
    api = new kkbox.Api(accessToken)
    console.log('KKBOX fetchAccessToken 成功')
  } catch (error) {
    console.log('KKBOX fetchAccessToken error')
  }
}
schedule.scheduleJob('0 0 * * *', refreshToken)
refreshToken()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.on('message', event => {
  if (event.message.type !== 'text') return
  if (!api) event.reply('KKBOX fetchAccessToken 中，請稍後再試')
  api.searchFetcher.setSearchCriteria(event.message.text, 'track').fetchSearchResult().then(response => {
    // console.log(JSON.stringify(response.data, null, 2))
    console.log(JSON.stringify(response.data.tracks.data[0].name, null, 2))
  })
})

// api.searchFetcher.setSearchCriteria('五月天 派對動物', 'track').fetchSearchResult().then(response => {
//   console.log(response.data)
// api.searchFetcher.fetchNextPage(response).then(response => {
//       console.log(response.data)
//   })
// })

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
