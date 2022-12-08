'use strict'
const Logger = use('Logger')
const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

axios.defaults.headers.common['accept-encoding'] = '';
const url = "https://dl.indexmovies.xyz/get/";
class BypasserController {
  async fembed({
    request, response
  }) {
    const ip = request.ip()
    Logger.warning(ip)
    let query = request.input('url')
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
      Logger.info()
      file.forEach(function(v, i) {
        link.push(v.file)
        meta.push(v)

      })
      return file
    })


    let file = await this.getFile(data)

    for (var i = 0; i < meta.length; ++i) {
      if (meta[i]['label'] === file[i]['label']) {
        meta[i]['file'] = file[i]['file'];
      }
    }
    //Logger.info(meta)
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
          Logger.info(nextID)
          https.get(nextID,
            (res) => {
              Logger.info(res.headers.location)
              final_link.push({
                file: res.headers.location,
                label: data[i]['label']
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
    return final_link

  }


}

module.exports = BypasserController