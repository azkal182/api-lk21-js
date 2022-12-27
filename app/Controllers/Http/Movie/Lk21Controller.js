'use strict'
const Logger = use('Logger')
const Env = use('Env')

const {
  list
} = require('@adonisjs/framework/src/Route/Store');
const axios = require('axios');
const cheerio = require('cheerio');
const url = Env.get('HOST_LK21', 'https://lk21official.info/')
//axios.defaults.headers.common['accept-encoding'] = '';
axios.defaults.headers.common['user-agent'] = 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36';
//const url = "https://dl.indexmovies.xyz/get/";
//const url = "https://dl.indexmovies.xyz/get/";

class Lk21Controller {
  async latestOld({
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

      list.each(function (v, i) {
        let title = $(this).find(".caption").text();
        // console.log(title)
        let poster = "https" + $(this).find("figure > a > img").attr("src");
        let id = $(this).find("figure > a").attr("href")
        let rating = $(this).find(".rating").text();
        let quality = $(this).find(".quality-top").text();
        index.push({
          title,
          poster,
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
        }
      }
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
    let result = await axios.get(url, config).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html)

      let list = $(".search-item");
      let index = []

      list.each(function (v, i) {
        let title = $(this).find('figure > a').attr('title')
        let img = "https:" + $(this).find('figure > a > img').attr('src')
        let id = getId($(this).find("figure > a").attr("href"))
        let link = $(this).find(".search-content > h2 > a").attr('href');
        let tag = $(this).find('p.cat-links > a:nth-child(1)').attr('href')
        if (!tag.match(/series/gm)) {
          index.push({
            title,
            img,
            id: id,
            link
          })
        }
        /*
        index.push({
          title,
          img,
          id: id,
          link

        })
        */

      })
      return {
        message: 'success',
        length: index.length,
        results: {
          ...index
        }
      }
    })

    //get data themlviebd
    for (let i = 0; i < result.length; i++) {
     // console.log(result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim())
      const forId = result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim()

      let oke = await axios.get('https://api.themoviedb.org:443/3/search/movie?api_key=243bd781b4261e4fade9058a64105c28&query=' + forId)
     // console.log(oke.data.results[0])
      result.results.data[i]['TMDB'] = oke.data.results[0]
    }





    //console.log(result)
    return result
  }




  async showData({
    request,
    response
  }) {

    let query = request.input('id')
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    };


    let result = await axios.get(url + query,
      config).then((res) => {
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
        return {
          ...data,
          'server_embed': server_list
        }
      })


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
      let index = {
        'link_download': []
      }
      list.each(function (v, i) {
        let item = $(this).find("strong").text()
        let link = $(this).find("a").attr('href')
        let quality = $(this).find("a").attr('class').substring(9, 13)
        index['link_download'].push({
          item, link, quality
        })
      });

      return index
    })



    let employee = {
      ...result,
      ...get_download
    };

    return {
      message: 'success',
      results:
      employee

    }
  }




  // async showData({
  //   request, response
  // }) {
  //   let query = request.input('id')
  //   const cookie = await this.getCookie(query)
  //   let result = await axios({
  //     method: 'post',
  //     url: "https://dl.indexmovies.xyz/verifying.php",
  //     data: {
  //       slug: query
  //     },
  //     headers: {
  //       'user-agent': 'Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
  //       'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  //       'Accept-Encoding': 'application/json',
  //       'cookie': cookie
  //     }
  //   }).then((res) => {
  //     let data = res.data
  //     const $ = cheerio.load(data)
  //     let list = $("tbody > tr");
  //     let index = []
  //     list.each(function (v, i) {
  //       let item = $(this).find("strong").text()
  //       let link = $(this).find("a").attr('href')
  //       let quality = $(this).find("a").attr('class').substring(9, 13)
  //       index.push({
  //         item, link, quality
  //       })
  //     });
  //     // let embed = async () => {
  //     //   await this.test()
  //     // }


  //     return {
  //       message: 'success', results:
  //         index

  //     }
  //   })
  //   //console.log(result)
  //   // let embed = await this.test()
  //   // console.log(embed)
  //   return result
  // }

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

    let result = await axios.get("https://dl.indexmovies.xyz/get/" + id,
      config).then((res) => {
        let data = res.data
        const search = "setCookie('validate'"
        let idx = data.indexOf(search)
        let hasil = data.substring(idx + 23, idx + 63)
        console.log('')
        //Logger.warning(data)
        return "validate=" + hasil
      });
    console.log(result)
    return result
  }



  async latest({
    request,
    response
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


    let result = await axios.get(url + 'latest',
      config).then((res) => {
        let html = res.data
        let $ = cheerio.load(html)

        // console.log($('#pagination > span').html().match(/(\d+)(?!.*\d)/m)[0gi ])

        const item = $('#grid-wrapper > div')
        let index = []
        item.each(function (i, v) {
          let title = $(this).find('figure > a > img').attr('alt')
          let poster = 'https:' + $(this).find('figure > a > img').attr('src')
          let id = $(this).find('figure > a').attr('href')
          let rating = $(this).find('.rating').text()
          let quality = $(this).find('.quality').text()
          index.push({
            title,
            poster,
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
          }
        }
      })

    for (let i = 0; i < result.length; i++) {
      //console.log(result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim())
      const forId = result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim()

      let oke = await axios.get('https://api.themoviedb.org:443/3/search/movie?api_key=243bd781b4261e4fade9058a64105c28&query=' + forId)
      //console.log(oke.data.results[0])
      result.results.data[i]['TMDB'] = oke.data.results[0]
    }

    return result
  }



  async popular({
    request,
    response
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


    let result = await axios.get(url + 'populer',
      config).then((res) => {
        let html = res.data
        let $ = cheerio.load(html)

        // console.log($('#pagination > span').html().match(/(\d+)(?!.*\d)/m)[0gi ])

        const item = $('#grid-wrapper > div')
        let index = []
        item.each(function (i, v) {
          let title = $(this).find('figure > a > img').attr('alt')
          let poster = 'https:' + $(this).find('figure > a > img').attr('src')
          let id = $(this).find('figure > a').attr('href')
          let rating = $(this).find('.rating').text()
          let quality = $(this).find('.quality').text()
          index.push({
            title,
            poster,
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
          }
        }
      })

    for (let i = 0; i < result.length; i++) {
     // console.log(result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim())
      const forId = result.results.data[i].id.replaceAll('-', ' ').replace(/[0-9]*$/gm, '').trim()

      let oke = await axios.get('https://api.themoviedb.org:443/3/search/movie?api_key=243bd781b4261e4fade9058a64105c28&query=' + forId)
      //console.log(oke.data.results[0])
      result.results.data[i]['TMDB'] = oke.data.results[0]
    }

    return result
  }







  async test({
    request,
    response
  }) {

    let query = request.input('id')
    const config = {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'application/json'
      }
    };


    let result = await axios.get(url + query,
      config).then((res) => {
        let html = res.data
        let $ = cheerio.load(html)
        let server_list = {}

        let data = {}
        let get_meta = $('.col-xs-9.content')
        data.title = $('body > main > section.breadcrumb > div > ol > li.last > span').text()
        data.quality = get_meta.find('div:nth-child(1) > h3').text()
        data.country = get_meta.find('div:nth-child(2) > h3').text()
        // data.cast = get_meta.find('div:nth-child(3) > h3').text()
        data.cast = []
        get_meta.find('div:nth-child(3) > h3').each(function () {
          // console.log($(this).text())
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



        // console.log(data)








        // let get_meta = $('.col-xs-9.content')
        // let quality = get_meta.find('div:nth-child(1) > h3').text()
        // let qountry = get_meta.find('div:nth-child(2) > h3').text()
        // // let cast = get_meta.find('div:nth-child(3) > h3').text()
        // let director = get_meta.find('div:nth-child(4) > h3').text()
        // let genre = get_meta.find('div:nth-child(5) > h3').text()
        // let imdb = get_meta.find('div:nth-child(6) > h3:nth-child(2)').text()
        // let release = get_meta.find('div:nth-child(7) > h3').text()
        // let translator = get_meta.find('div:nth-child(8) > h3').text()
        // let uploaded = get_meta.find('div:nth-child(11) > h3').text()
        // let duration = get_meta.find('div:nth-child(12) > h3').text()
        // let overview = get_meta.find('blockquote').html().match(/<br>(.*?)<br>/m)[1].trim()
        // // let strin = ""
        // // console.log(overview)







        // this for find server embed
        let list = $('section').find('ul#loadProviders')
        list.children().each(function () {
          const server = $(this).find('a').text()
          const link = $(this).find('a').attr('href')
          // console.log(link)

          server_list[server] = {}

          server_list[server]['link'] = link
          server_list[server]['quality'] = []

          $(this).find('span').each(function (v, i) {
            // console.log($(this).find('span').text())
            // console.log(server)
            // console.log($(this).text())
            server_list[server]['quality'].push($(this).text())
          })
          // console.log()
        })

        let oke = {
          data
        }
        // console.log({ ...data })


        // console.log(server_list)
        // console.log({ 'server_embed': server_list })
        return {
          ...data,
          'server_embed': server_list
        }
      })

    // return result

    console.log(result)





















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
      let index = {
        'link_download': []
      }
      list.each(function (v, i) {
        let item = $(this).find("strong").text()
        let link = $(this).find("a").attr('href')
        let quality = $(this).find("a").attr('class').substring(9, 13)
        // index.push({
        //   item, link, quality
        // })

        // console.log(item)


        index['link_download'].push({
          item, link, quality
        })
        // index['link_download']['item'] = item
        // index['link_download']['link'] = link
        // index['link_download']['quality'] = quality
      });
      // let embed = async () => {
      //   await this.test()
      // }

      // console.log(server_list)
      // console.log(index)

      // let employee = {
      //   ...server_list,
      //   ...index
      // };
      // console.log(employee)

      // return {
      //   message: 'success', results:
      //     index

      // }

      return index
    })



    let employee = {
      ...result,
      ...get_download
    };

    // console.log(employee)



    return {
      message: 'success',
      results:
      employee

    }
    // console.log(get_download)
    // console.log(result)
  }





}

module.exports = Lk21Controller
