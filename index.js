import 'dotenv/config'
// import axios from 'axios'
import linebot from 'linebot'
import schedule from 'node-schedule'
// import temp from './templates/temp.js'
import flex from './templates/flex.js'
import writejson from './utils/writejson.js'

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

const songs = []
bot.on('message', event => {
  if (event.message.type !== 'text') return
  if (!api) event.reply('KKBOX fetchAccessToken 中，請稍後再試')
  api.searchFetcher.setSearchCriteria(event.message.text, 'track').fetchSearchResult().then(response => {
    for (let i = 0; i < 12; i++) {
      // if (event.message.text.includes(response.data.tracks.data[i].album.artist.name)) {
      const replyFlex = JSON.parse(JSON.stringify(flex))
      // 抓專輯照片
      replyFlex.hero.url = response.data.tracks.data[i].album.images[0].url
      replyFlex.hero.action.uri = response.data.tracks.data[i].album.url
      // 抓專輯連結
      replyFlex.footer.contents[0].action.uri = response.data.tracks.data[i].album.url
      // 抓專輯名稱
      replyFlex.body.contents[0].text = response.data.tracks.data[i].album.name
      // 抓專輯發行日
      replyFlex.body.contents[1].contents[0].contents[1].text = response.data.tracks.data[i].album.release_date
      console.log(response.data.tracks.data[0].url)
      console.log(JSON.stringify(response.data.tracks.data[i].name, null, 2))
      songs.push(replyFlex)
    }
    // }
    const reply = {
      type: 'flex',
      altText: '查詢結果',
      contents: {
        type: 'carousel',
        contents: songs
      }
    }
    event.reply(reply)
    writejson(reply, 'courses')
    writejson(response.data.tracks, 'data')
  })
})

bot.listen('/', process.env.PORT || 3000, () => {
  console.log('機器人啟動')
})
