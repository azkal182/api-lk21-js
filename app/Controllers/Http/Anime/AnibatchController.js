'use strict'
const Logger = use('Logger')
const axios = require('axios');
const cheerio = require('cheerio');
const host = "https://anibatch.anibatch.moe/"

class AnibatchController {
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
      list.each(function (v, i) {
        const title = $(this).find("h1").text()
        const link = $(this).find("h1 > a").attr("href")
        const thumb = $(this).find("img").attr("src")
        const get_list_thumb = $(this).find("img").attr("srcset")
        const word = get_list_thumb.split(',')
        let size_thumb = []
        word.forEach(function(v, i) {
          // const newData = JSON.parse(v.trim().split(' ')[0])
          //size_thumb.push(newData)
          size_thumb.push(v.trim().split(' ')[0])
        })


        // console.log(JSON.newData))
        //const ratting = $(this).find(".postedon").text()
        index.push({
          title, link, thumb


        })
        //console.log(link)
      })

      //console.log(index)
      return {
        message: 'success', count: index.length, results:
        index
      }
    });

    console.log(result)
    return result
  }

  async show({
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

    let result = await axios.get(host+id, config).then((res) => {
      const html = res.data
      const $ = cheerio.load(html)
      const data = $(".entry-content")
      let meta = {
        title: '',
        type: '',
        status: '',
        total_episode: '',
        release: '',
        broadcast_date: '',
        studio: '',
        duration: '',
        genre: [],


      }
      meta['title'] = data.find('ul > li:nth-child(1)').text().split(':')[1]
      meta['type'] = data.find('ul > li:nth-child(3)').text().split(':')[1]
      meta['status'] = data.find('ul > li:nth-child(4)').text().split(':')[1]
      meta['total_episode'] = data.find('ul > li:nth-child(5)').text().split(':')[1]
      meta['release'] = data.find('ul > li:nth-child(6)').text().split(':')[1]
      meta['broadcast_date'] = data.find('ul > li:nth-child(7)').text().split(':')[1]
      meta['studio'] = data.find('ul > li:nth-child(8)').text().split(':')[1]
      meta['duration'] = data.find('ul > li:nth-child(9)').text().split(':')[1]
      //meta['genre'] = data.find('ul > li:nth-child(10)').text()
      let genre = data.find('ul > li:nth-child(10)>a')

      //meta['genres'] = data.find('ul > li:nth-child(10)>a').text()

      let cek = {
        genre: []}
      //console.log(genre.length)

      genre.each(function (v, i) {
        // meta.genre.push($(this).text())
        meta.genre.push($(this).text())
        //gen.push($(this).text())

        // console.log(v)
      })



      let result = {
        episode: {}}
      $(".dlx").find('table').each(function (v, i) {
        //if (v == 5) return
        if (!$(this).find('strong').text())
          return
        //console.log(v)

        let eps = ''
        let table = ''
        let epp = []

        if ($(this).prev('h4') != "") {
          let h4 = $(this).prev('h4').text()
          const regex = /(?<=episode\s)[0-9]+/gmi
          // \d[^episode]
          let final_rgx = h4.match(regex)
          //console.log(final_rgx)
          if (final_rgx == null) {
            //const regex = /^(.*?[\\~])/gmi
            //eps = h4.match(regex)[0]
            const regex = /^([^~]+)/gm

            eps = h4.match(regex)[0]
            //console.log(h4.match(regex)[0])
          } else if (final_rgx) {
            //console.log(final_rgx[0])
            eps = final_rgx[0]
          } else {
            //console.log('tes')
          }
          //epp.push({title: 'hh'})
          //console.log(epp.length)
          //console.log('from h4 ' + eps)
        } else if ($(this).prev('table') != "") {
          let table = $(this).prev('table').find('b').html()

          const regex = /(?<=episode\s)[0-9]+/gmi
          let final_rgx = table.match(regex)
          if (final_rgx == null) {
            //const regex = /^(.*?[\\~])/gmi
            const regex = /^([^~]+)/gm

            // console.log(table.match(regex)[0])
            eps = table.match(regex)[0]
          } else if (final_rgx) {
            eps = final_rgx[0]
            //console.log(final_rgx[0])

          } else {
            console.log('tes')
          }

          //console.log('from table ' + eps)
        }
        let d = {}
        let resol = {}
        let dobj = []
        let resolobj = []
        $(this).find('tr').each(function(v, i) {
          //console.log($(this).text())
          if ($(this).find('a') == '') {

            let res = $(this).text().trim().replace(/ /g, "_")
            //console.log($(this).text())
            //d[res] = {}
            d[res] = {}
            resolobj = res


            //console.log(resol.resol)
            return
          } else {

            //console.log($(this).find('a').text())
            $(this).find('a').each(function(i, v) {
              let server = $(this).text()
              let link = $(this).attr('href')

              //console.log(server)
              //console.log($(this).text())
              //console.log($(this).find('a').attr('href'))
              //console.log(i)
              //console.log($(this).text())
              d[resolobj][server] = link

              //result[eps] = d
              //console.log(d['\nMp4 240p\n'])
              //console.log(resolobj)
            })
          }
          //console.log(d)
          //result[eps] = d
          result['episode'][eps] = d


        })
        //
        //console.log(d)


      })
      /*
      console.log(JSON.stringify(result,
        null,
        1))
        */
      //meta['episode'] = result

      //console.log(meta)
      //console.log(result)



      const mergedObject = {
        ...meta,
        ...result
      };
      console.log(JSON.stringify(mergedObject,
        null,
        1))

      return mergedObject
      //console.log(mergedObject)

      // meta.splice(7, 0, cek[0]);
      //console.log(meta)
      // console.log(cek)
    }).catch(function (error) {
      if (error.response) {
        // Request made and server responded
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }

    });

    return result
  }
}

module.exports = AnibatchController