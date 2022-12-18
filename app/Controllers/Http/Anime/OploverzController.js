'use strict'
const Logger = use('Logger')
const axios = require('axios');
const cheerio = require('cheerio');
const Env = use('Env')



const host = Env.get("HOST_OPLOVERZ", "https://15.235.11.45/")

class OploverzController {
  async search({
    request, response
  }) {
    let query = request.input('q')
    const config = {
      params: {
        s: query
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    }

    let result = await axios.get(host, config).then((res) => {
      const html = res.data
      const $ = cheerio.load(html)
      let list = $("article")
      let index = []
      // console.log(list.html())
      list.each(function (v, i) {
        const title = $(this).find('h2').text()
        const id = $(this).find('a').attr('href').match(/(?<=anime\/)(.*)/g)[0].replace('/', '')
        const link = $(this).find('a').attr('href')
        const type = $(this).find('.typez').text()
        const img = $(this).find('img').attr('src')
        index.push({
          title, id, link, type, img
        })
      })
      return index
    })
    // console.log(result)
    return result
  }

  async detail({
    request, response
  }) {
    let id = request.input('id')
    const config = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    }

    let result = await axios.get(`${host}anime/${id}`, config).then((res) => {
      const html = res.data
      const $ = cheerio.load(html)
      let list = $(".eplister > ul > li")
      let index = {
        status: '',
        studio: '',
        released: '',
        duration: '',
        season: '',
        type: '',
        posted_by: '',
        released_on: '',
        updated_on: '',
        list_episode: []
      }


      let getDetail = $(".info-content > .spe")
      $(".info-content > .spe > span").each(function() {
        // console.log($(this).text().split(':')[0])
        if ($(this).text().split(':')[0] == 'Status') {
          //console.log('status')
          index.status = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Type') {
          //console.log('type')
          index.type = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Posted by') {
          //console.log('posted_by')
          index.posted_by = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Released on') {
          //console.log('released_on')
          index.released_on = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Updated on') {
          //console.log('updated_on')
          index.updated_on = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Studio') {
          //console.log('studio')
          index.studio = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Released') {
          //console.log('released')
          index.released = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Duration') {
          //console.log('duration')
          index.duration = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Season') {
          // console.log('season')
          index.season = $(this).text().split(':')[1]
        } else {
          console.log('other')
        }
      })

      //console.log(list.html())
      list.each(function (v, e) {
        const episode = $(this).find('.epl-num').text()
        const id = $(this).find('a').attr('href').match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/)[5].replaceAll('/', '')
        const title = $(this).find('.epl-title').text()
        const uploaded = $(this).find('.epl-date').text()

        index.list_episode.push({
          episode,
          title,
          id,
          uploaded
        })

      })


      return {
        message: 'success',
        results: index
      }
    })
    //console.log(result)
    return result
  }


  async download({
    request, response
  }) {
    let eps = request.input('id')
    const config = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    }

    let result = await axios.get(host+eps, config).then((res) => {
      const html = res.data
      const $ = cheerio.load(html)
      let list = $(".soraddlx.soradlg")
      //console.log(list.html())
      let index = {
        status: '',
        studio: '',
        released: '',
        duration: '',
        season: '',
        type: '',
        posted_by: '',
        released_on: '',
        updated_on: '',
        episode: '',
        download: {}
      }
      //get detail
      let getDetail = $(".info-content > .spe")

      $(".info-content > .spe > span").each(function() {
        // console.log($(this).text().split(':')[0])
        if ($(this).text().split(':')[0] == 'Status') {
          //console.log('status')
          index.status = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Type') {
          //console.log('type')
          index.type = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Posted by') {
          //console.log('posted_by')
          index.posted_by = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Released on') {
          //console.log('released_on')
          index.released_on = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Updated on') {
          //console.log('updated_on')
          index.updated_on = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Studio') {
          //console.log('studio')
          index.studio = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Released') {
          //console.log('released')
          index.released = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Duration') {
          //console.log('duration')
          index.duration = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Season') {
          // console.log('season')
          index.season = $(this).text().split(':')[1]
        } else if ($(this).text().split(':')[0] == 'Episodes') {
          // console.log('season')
          index.episode = $(this).text().split(':')[1]
        } else {
          console.log('other')
          console.log($(this).text().split(':')[0])
        }
      })



      /*
      const status = getDetail.find('span:nth-child(1) ').html().match(/(?<=\/b\>)(.*)/)[1].trim()
      const studio = getDetail.find('span:nth-child(2) >a').text()
      const released = getDetail.find('span:nth-child(3) ').html().match(/(?<=\/b\>)(.*)/)[1].trim()
      const duration = getDetail.find('span:nth-child(4) ').html().match(/(?<=\/b\>)(.*)/)[1].trim()
      const season = getDetail.find('span:nth-child(5) >a ').text()
      const type = getDetail.find('span:nth-child(6) ').html().match(/(?<=\/b\>)(.*)/)[1].trim()
      index.status = status
      index.studio = studio
      index.released = released
      index.duration = duration
      index.season = season
      index.type = type
*/

      //end get detail
      list.each(function (v, i) {

        const format = $(this).find('h3').text()

        const list = $(this).find('.soraurlx')

        // index[format] = {}
        index['download'][format] = {}




        list.each(function (v, i) {
          let res = $(this).find('strong').text()
          // index[format][res] = {}
          index['download'][format][res] = {}

          const server = $(this).find('a')

          server.each(function (v, e) {
            const server = $(this).text()
            const link = $(this).attr('href')
            if (server === 'Google Drive (Acefile)') {
              //console.log('acefile')
              index['download'][format][res]['acefile'] = link

            } else if (server === 'Zippyshare') {
              //console.log('zippy')
              index['download'][format][res]['zippy'] = link
            } else if (server === 'One Drive') {
              //console.log('one_drive')
              index['download'][format][res]['one_drive'] = link
            } else if (server === 'Linkbox') {
              //console.log('linkbox')
              index['download'][format][res]['linkbox'] = link
            } else {

              //index[format][res][server] = link
              index['download'][format][res][server] = link
            }

          })
        })






      })
      return {
        message: 'success',
        results: index
      }

      //console.log(JSON.stringify(index))
    })
    // console.log(JSON.stringify(result, null, 1))

    return result



  }
}

module.exports = OploverzController