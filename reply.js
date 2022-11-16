// import axios from 'axios'
import temp from './templates/temp'
import kkbox from '@kkbox/kkbox-javascript-developer-sdk'

api.searchFetcher
  .setSearchCriteria('五月天 派對動物', 'track')
  .fetchSearchResult()
  .then(response => {
    // Content from the KKBOX Open API
    console.log(response.data)

    // Continue to the next page
    api.searchFetcher.fetchNextPage(response).then(response => {
      console.log(response.data)
    })
  })
