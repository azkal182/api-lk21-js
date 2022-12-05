'use strict'
const Logger = use('Logger')

const axios = require('axios');
const cheerio = require('cheerio');
const url = "https://lk21official.info/";
//axios.defaults.headers.common['accept-encoding'] = '';
axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36';
//const url = "https://dl.indexmovies.xyz/get/";
//const url = "https://dl.indexmovies.xyz/get/";

class Lk21Controller {
  async latest({
    request, response
  }) {
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    };
    function getId(href) {
      var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
      return match[5].split('/').join('');
    }
    let result = axios.get(url, config).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html)

      let list = $("#newest > div > div > div > div");
      let index = []

      list.each(function(v, i) {
        let title = $(this).find(".caption").text();
        // console.log(title)
        let img = "https" + $(this).find("figure > a > img").attr("src");
        let id = $(this).find("figure > a").attr("href")
        let rating = $(this).find(".rating").text();
        let quality = $(this).find(".quality-top").text();
        index.push({
          title,
          img,
          id: getId(id),
          rating,
          quality
        })

      })
      return {
        message: 'success',
        length: index.length,
        results: {
          data: index
        }}
    })
    Logger.info('A info message')
    return result
  }

  async search({
    request, response
  }) {
    let query = request.input('q')
    const config = {
      params: {
        s: query
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    };
    function getId(href) {
      var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
      return match[5].split('/').join('');
    }
    let result = axios.get(url, config).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html)

      let list = $(".search-item");
      let index = []

      list.each(function(v, i) {
        let title = $(this).find('figure > a').attr('title')
        let img = "https:" + $(this).find('figure > a > img').attr('src')
        let id = getId($(this).find("figure > a").attr("href"))
        let link = $(this).find(".search-content > h2 > a").attr('href');
        index.push({
          title,
          img,
          id: id,
          link

        })

      })
      return {
        message: 'success',
        length: index.length,
        results: {
          data: index
        }}
    })
    Logger.info('A info message')
    return result
  }





  async showData({
    request, response
  }) {
    let cookie = new Cookie()
    let query = request.input('id')
    Logger.info('from show' + query)
    let found = cookie.getCookie(query)
    const result = found.then(e => {
      console.log(e)

      let result = axios({
        method: 'post',
        url: "https://dl.indexmovies.xyz/verifying.php",
        data: {
          slug: query
        },
        headers: {
          'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Accept-Encoding': 'application/json',
          'cookie': e
        }
      }).then((res) => {
        let data = res.data
        const $ = cheerio.load(data)
        let list = $("tbody > tr");
        //console.log(res)
        let index = []
        list.each(function(v, i) {
          let item = $(this).find("strong").text()

          let link = $(this).find("a").attr('href')
          let quality = $(this).find("a").attr('class').substring(9, 13)

          //console.log(quality)

          index.push({
            item, link, quality
          })
        });

        console.log(index)
        return {
          message: 'success', results: {
            index
          }}
      })
      //console.log(result)
      return result
    })
    return result



    //return found
  }

  async getCookie(id) {
    Logger.info('from cookie')
    console.log('2')

    const config = {

      headers: {

        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',

        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',

        'Accept-Encoding': 'application/json'

      }

    };

    let result = axios.get("https://dl.indexmovies.xyz/get/" + id, config).then((res) => {
      let data = res.data
      const search = "setCookie('validate'"
      let idx = data.indexOf(search)
      let hasil = data.substring(idx + 23, idx + 63)
      console.log('')
      Logger.warning(data)
      return "validate=" + hasil
    });
    return result
  }






}

class Cookie {
  async getCookie(id) {
    Logger.info('from cookie')
    console.log('2')

    const config = {

      headers: {

        'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',

        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',

        'Accept-Encoding': 'application/json'

      }

    };

    let result = axios.get("https://dl.indexmovies.xyz/get/" + id, config).then((res) => {
      let data = res.data
      const search = "setCookie('validate'"
      let idx = data.indexOf(search)
      let hasil = data.substring(idx + 23, idx + 63)
      //console.log(data)
      return "validate=" + hasil
    });
    return result
  }
}

module.exports = Lk21Controller