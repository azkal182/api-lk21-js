'use strict'
const Logger = use('Logger')
const Env = use('Env')

const {
  list
} = require('@adonisjs/framework/src/Route/Store');
const axios = require('axios');
const cheerio = require('cheerio');
const url = Env.get('HOST_LK21', 'https://lk21official.info/')
const https = require('https');
axios.defaults.headers.common['accept-encoding'] = '';
axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36';
//const url = "https://dl.indexmovies.xyz/get/";
//const url = "https://dl.indexmovies.xyz/get/";

class Lk21Controller {
  async showData(url) {


    let query = url.match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3].replace('/', '')

    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    };
    /*

    let result = await axios.get(url + query, config).then((res) => {
      let html = res.data
      let $ = cheerio.load(html)
      let server_list = {}

      let data = {}
      let get_meta = $('.col-xs-9.content')
      data.title = $('body > main > section.breadcrumb > div > ol > li.last > span').text()
      data.quality = get_meta.find('div:nth-child(1) > h3').text()
      data.country = get_meta.find('div:nth-child(2) > h3').text()
      data.cast = []
      get_meta.find('div:nth-child(3) > h3').each(function () {
        data['cast'].push($(this).text())
      })
      data.director = get_meta.find('div:nth-child(4) > h3').text()
      data.genre = []
      get_meta.find('div:nth-child(5) > h3').each(function () {
        data['genre'].push($(this).text())
      })
      data.imdb = get_meta.find('div:nth-child(6) > h3:nth-child(2)').text()
      data.release = get_meta.find('div:nth-child(7) > h3').text()
      data.translator = get_meta.find('div:nth-child(8) > h3').text()
      data.uploaded = get_meta.find('div:nth-child(11) > h3').text()
      data.duration = get_meta.find('div:nth-child(12) > h3').text()
      data.overview = get_meta.find('blockquote').html().match(/<br>(.*?)<br>/m)[1].trim()
      data.trailer = $('#player-default > div > div.action-player > ul > li:nth-child(3) > a').attr('href')

      // this for find server embed
      let list = $('section').find('ul#loadProviders')
      list.children().each(function () {
        const server = $(this).find('a').text()
        const link = $(this).find('a').attr('href')

        server_list[server] = {}

        server_list[server]['link'] = link
        server_list[server]['quality'] = []

        $(this).find('span').each(function (v, i) {
          server_list[server]['quality'].push($(this).text())
        })
      })
      return { ...data, 'server_embed': server_list }
    })

*/
    const cookie = await this.getCookie(query)

    let get_download = await axios({
      method: 'post',
      url: "https://dl.indexmovies.xyz/verifying.php",
      data: {
        slug: query
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json',
        'cookie': cookie
      }
    }).then((res) => {
      let data = res.data

      const $ = cheerio.load(data)
      let list = $("tbody > tr");
      //console.log(list.text())
      let index = {
        'link_download': []
      }
      list.each(function (v, i) {
        let item = $(this).find("strong").text()
        let link = $(this).find("a").attr('href')
        let quality = $(this).find("a").attr('class').substring(9, 13)
        //index['link_download'].push({ item, link, quality })


        if (item === "Fembed") {
          //console.log("fembed")
          index = link
        }

      });


      return index
    })


    /*
    let employee = {
      ...result,
      ...get_download
    };
    */



    return this.fembed(get_download)

  }


  async getCookie(id) {
    // Logger.info('from cookie')
    // console.log('2')

    const config = {

      headers: {

        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',

        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',

        'Accept-Encoding': 'application/json'

      }

    };

    let result = await axios.get("https://dl.indexmovies.xyz/get/" + id, config).then((res) => {
      let data = res.data
      const search = "setCookie('validate'"
      let idx = data.indexOf(search)
      let hasil = data.substring(idx + 23,
        idx + 63)
      //console.log('')
      //Logger.warning(data)
      return "validate=" + hasil
    });

    return result
  }







  async fembed(query) {
    // const ip = request.ip()
    // Logger.warning(ip)
    //let query = request.input('url')
    //console.log(query)
    const config = {
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'

      }

    };

    let path = await axios.get(query, config).then((res) => {
      let data = res.data;
      const regex = /\/api\/source\/[^\"']+/mg
      const found = data.match(regex)[0];
      return found
    })
    let link = []
    let meta = []
    let data = await axios.post("https://layarkacaxxi.icu" + path).then((res) => {
      const file = res.data.data


      file.forEach(function(v, i) {
        link.push(v.file)
        meta.push({
          file: v.file, type: v.type, label: v.label.match(/^[0-9]*/gm)[0]
        })
        //console.log(v.label)

      })
      return file
    })


    let file = await this.getFile(data)

    for (var i = 0; i < meta.length; ++i) {
      //console.log(file[i]['label'])
      if (meta[i]['label'] === file[i]['label']) {

        meta[i]['file'] = file[i]['file'];
        //meta.i.label = "oke"
        //meta[i]['label'] = "label"
        // meta[i]['file'] = 'oke'
      }
    }
    //console.log(meta)
    return meta

  }

  async getFile(data) {
    const link = []
    data.forEach(function (v, i) {
      link.push(v.file)
    })
    //Logger.info(link)
    let final_link = []


    let result = await link.reduce((accumulatorPromise, nextID, i) => {
      return accumulatorPromise.then(() => {
        return new Promise((resolve, reject) => {
          //Logger.info(nextID)
          https.get(nextID,
            (res) => {
              // Logger.info(data[i]['label'].match(/^[0-9]*/gm)[0])
              final_link.push({
                file: res.headers.location,
                label: data[i]['label'].match(/^[0-9]*/gm)[0]
              })
              resolve(res.headers.location);
              //return res.headers.location
            }).on('error',
            (e) => {
              console.error(e);
            });
        });
      });
    }, Promise.resolve());
    //Logger.info(t)
    //console.log(final_link)
    return final_link

  }

}

module.exports = Lk21Controller