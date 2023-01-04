"use strict";
const Logger = use("Logger");
const axios = require("axios");
const cheerio = require("cheerio");
const Env = use("Env");
const NodeCache = require('node-cache')
const nodeCache = new NodeCache()

const host = Env.get("HOST_OPLOVERZ", "https://oploverz.co.in/");
let cache = {};
class OploverzController {
 async searchOld({ request, response }) {
  let query = request.input("q");
  const config = {
   params: {
    s: query,
   },
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };

  let result = await axios.get(host, config).then((res) => {
   const html = res.data;
   const $ = cheerio.load(html);
   let list = $("article");
   let index = [];
   // console.log(list.html())
   list.each(function (v, i) {
    const title = $(this).find("h2").text();
    const id = $(this)
     .find("a")
     .attr("href")
     .match(/(?<=anime\/)(.*)/g)[0]
     .replace("/", "");
    const link = $(this).find("a").attr("href");
    const type = $(this).find(".typez").text();
    const img = $(this).find("img").attr("src");
    index.push({
     title,
     id,
     link,
     type,
     img,
    });
   });
   return { message: "success", length: index.length, results: index };
  });
  // console.log(result)
  return result;
 }

 async search({ request, response }) {
  let query = request.input("q");
  const res = await fetch("https://15.235.11.45/wp-admin/admin-ajax.php", {
   headers: {
    accept: "*/*",
    "accept-language":
     "en-ID,en;q=0.9,id-ID;q=0.8,id;q=0.7,en-GB;q=0.6,en-US;q=0.5",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
   },
   referrer: "https://15.235.11.45/",
   referrerPolicy: "strict-origin-when-cross-origin",
   body: "action=ts_ac_do_search&ts_ac_query=" + query,
   method: "POST",
   mode: "cors",
   credentials: "include",
  });
  if (!res.ok) {
   // This will activate the closest `error.js` Error Boundary
   throw new Error("Failed to fetch data");
  }

  const data = await res.json();
  const index = [];
  data.anime[0]["all"].forEach(function (v) {
   const id_num = v.ID;
   const poster = v.post_image.replace(/\?.*/, "");
   const title = v.post_title;
   const genres = v.post_genres;
   const type = v.post_type;
   const id = v.post_link.match(/(?<=anime\/)(.*)/g)[0].replaceAll("/", "");
   const link = v.post_link.replace("/", "");
   const post_latest = v.post_latest;
   index.push({ id_num, id, title, genres, type, poster, post_latest, link });
   //return ({message: 'success', length: data.anime[0]['all'].length, results})
   //console.log(id)
  });

  return { message: "success", length: index.length, results: index };
 }
 
 
 async detail({ request, response }) {
  let id = request.input("id");
  const cacheDetail = nodeCache.has('detail' + id)
  
  if (cacheDetail) {
   console.log('Mengambil data dari cache')
   return nodeCache.get('detail' + id)
  }
  const config = {
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };

  let result = await axios.get(`${host}anime/${id}`, config).then((res) => {
   const html = res.data;
   const $ = cheerio.load(html);
   let list = $(".eplister > ul > li");
   let index = {
    title: "",
    poster: "",
    status: "",
    studio: "",
    released: "",
    duration: "",
    season: "",
    episodes: "",
    type: "",
    posted_by: "",
    released_on: "",
    updated_on: "",
    description: "",
    list_episode: [],
   };

   const poster = $(".thumbook > .thumb > img").attr("src");
   index.poster = poster;

   const title = $("h1[itemprop=name]").text();

   index.title = title;
   let getDetail = $(".info-content > .spe");
   const desc = $("[itemprop=description]").text().trim();
   index.description = desc;
   $(".info-content > .spe > span").each(function () {
    // console.log($(this).text().split(':')[0])
    if ($(this).text().split(":")[0] == "Status") {
     //console.log('status')
     index.status = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Type") {
     //console.log('type')
     index.type = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Posted by") {
     //console.log('posted_by')
     index.posted_by = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Released on") {
     //console.log('released_on')
     index.released_on = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Updated on") {
     //console.log('updated_on')
     index.updated_on = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Studio") {
     //console.log('studio')
     index.studio = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Released") {
     //console.log('released')
     index.released = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Duration") {
     //console.log('duration')
     index.duration = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Season") {
     // console.log('season')
     index.season = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Episodes") {
     // console.log('season')
     index.episodes = $(this).text().split(":")[1];
    } else {
     console.log("other");
    }
   });

   //console.log(list.html())
   list.each(function (v, e) {
    const episode = $(this).find(".epl-num").text();
    const id = $(this)
     .find("a")
     .attr("href")
     .match(
      /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
     )[5]
     .replaceAll("/", "");
    const title = $(this).find(".epl-title").text();
    const uploaded = $(this).find(".epl-date").text();

    index.list_episode.push({
     episode,
     title,
     id,
     uploaded,
    });
   });

   return {
    message: "success",
    results: index,
   };
  });
  //console.log(result)
  nodeCache.set('detail' +id,result, 3600)
  return result;
 }

 async download({ request, response }) {
  let eps = request.input("id");
  const cacheDownload = nodeCache.has(eps)
  
  if (cacheDownload) {
   console.log('Mengambil data dari cache')
   return nodeCache.get(eps)
  }
  const config = {
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };

  let result = await axios.get(host + eps, config).then((res) => {
   const html = res.data;
   const $ = cheerio.load(html);
   let list = $(".soraddlx.soradlg");
   //console.log(list.html())
   let index = {
    status: "",
    studio: "",
    released: "",
    duration: "",
    season: "",
    type: "",
    posted_by: "",
    released_on: "",
    updated_on: "",
    episode: "",
    anime_id: "",
    prev: "",
    next: "",
    download: [],
    embed: [],
   };
   //get detail
   let getDetail = $(".info-content > .spe");

   const prev = $(
    "div.megavid > div > div.naveps.bignav > div:nth-child(1) > a"
   ).attr("href");

   const anime_id = $(
    "div.megavid > div > div.naveps.bignav > div:nth-child(2) > a"
   )
    .attr("href")
    .match(/(?<=anime\/)(.*)/g)[0]
    .replaceAll("/", "");
   index.anime_id = anime_id;
   //console.log(id_anime);

   const next = $(
    "div.megavid > div > div.naveps.bignav > div:nth-child(3) >a"
   ).attr("href");
   if (prev) {
    const final_prev = prev
     .match(
      /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
     )[5]
     .replaceAll("/", "");
    //  index.next.push(final_prev);
    index.prev = final_prev;
   }

   if (next) {
    const final_next = next
     .match(
      /^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/
     )[5]
     .replaceAll("/", "");
    index.next = final_next;
   }

   const get_embed = $(
    "div.entry-content > div:nth-child(3) > div.mctnx > div:nth-child(1) > .soraurlx"
   );

   get_embed.each(function () {
    const item = $(this);
    if (item.text() == "Google Drive (Acefile)") {
     //console.log(item.text());
    }

    item.each(function () {
     const get_google = $(this).find("a");
     const res_embed = $(this).find("strong").text();

     //console.log(res_embed);
     //embed.push({ res: res_embed });
     get_google.each(function () {
      if ($(this).text() === "Google Drive (Acefile)") {
       //console.log($(this).text());
       index.embed.push({
        resolution: res_embed,
        server: $(this).text(),
        link: $(this).attr("href"),
        id: $(this).attr("href").match(/(\d+)/)[1],
       });
      }
     });
    });
   });

   $(".info-content > .spe > span").each(function () {
    // console.log($(this).text().split(':')[0])
    if ($(this).text().split(":")[0] == "Status") {
     //console.log('status')
     index.status = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Type") {
     //console.log('type')
     index.type = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Posted by") {
     //console.log('posted_by')
     index.posted_by = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Released on") {
     //console.log('released_on')
     index.released_on = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Updated on") {
     //console.log('updated_on')
     index.updated_on = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Studio") {
     //console.log('studio')
     index.studio = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Released") {
     //console.log('released')
     index.released = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Duration") {
     //console.log('duration')
     index.duration = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Season") {
     // console.log('season')
     index.season = $(this).text().split(":")[1];
    } else if ($(this).text().split(":")[0] == "Episodes") {
     // console.log('season')
     index.episode = $(this).text().split(":")[1];
    } else {
     console.log("other");
     console.log($(this).text().split(":")[0]);
    }
   });

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
    const format = $(this).find("h3").text();

    const list = $(this).find(".soraurlx");

    const formatData = {
     format,
     resolutions: [],
    };

    list.each(function (v, i) {
     let resolutions = $(this).find("strong").text();

     const resolutionData = {
      name: resolutions,
      servers: [],
     };

     const server = $(this).find("a");

     server.each(function (v, e) {
      const server = $(this).text();
      const link = $(this).attr("href");
      const serverData = {
       name: server,
       link,
      };

      resolutionData.servers.push(serverData);
     });
     formatData.resolutions.push(resolutionData);
    });
    index.download.push(formatData);
   });
   return {
    message: "success",
    results: index,
   };

   //console.log(JSON.stringify(index))
  });
  // console.log(JSON.stringify(result, null, 1))
  nodeCache.set(eps,result, 3600)

  return result;
 }

 async latest({ request, response }) {
  const config = {
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };

  let result = await axios
   .get(host + "anime/?status=&type=&order=update#", config)
   .then((res) => {
    const html = res.data;
    const $ = cheerio.load(html);
    let list = $("article");
    let index = [];
    list.each(function () {
     const title = $(this).find("h2").text();
     const status = $(this).find(".bt > .epx").text();
     const type = $(this).find(".typez").text();
     const poster = $(this).find("img").attr("src");
     const link = $(this).find("a").attr("href");
     const id = $(this)
      .find("a")
      .attr("href")
      .match(/(?<=anime\/)(.*)/g)[0]
      .replace("/", "");
     index.push({ title, id, status, type, poster, link });
    });

    return { message: "success", length: index.length, results: index };
   });
  //   console.log(result)
  return result;
 }
 
 async latestCache({ request, response }) {
 const userAgent = "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36";
  const contentType = "application/x-www-form-urlencoded; charset=UTF-8";
  const acceptEncoding = "application/json";
  const config = {
    headers: {
      "user-agent": userAgent,
      "content-type": contentType,
      "Accept-Encoding": acceptEncoding,
    },
  };
  const url = `${host}anime/?status=&type=&order=update#`;

  // Cek apakah data sudah ada di cache
  if (cache[url] && cache[url].expiry > Date.now()) {
    console.log(`Mengambil data dari cache untuk URL: ${url}`);
    return cache[url].data;
  }

  console.log(`Mengambil data dari server untuk URL: ${url}`);
  const { data: html } = await axios.get(url, config);
  const $ = cheerio.load(html);
  const list = $("article");
  const results = [];
  list.each((i, el) => {
    const title = $(el).find("h2").text();
    const status = $(el).find(".bt > .epx").text();
    const type = $(el).find(".typez").text();
    const poster = $(el).find("img").attr("src");
    const link = $(el).find("a").attr("href");
    const id = $(el)
      .find("a")
      .attr("href")
      .match(/(?<=anime\/)(.*)/g)[0]
      .replace("/", "");
    results.push({ title, id, status, type, poster, link });
  });

  // Simpan data ke cache
  cache[url] = {
    data: { message: "success", length: results.length, results },
    expiry: Date.now() + 3600 * 1000,
  };
//console.log(results)
  return { message: "success", length: results.length, results };
}


 async latest_update({ request, response }) {
  const config = {
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };

  let result = await axios.get(host, config).then((res) => {
   const html = res.data;
   const $ = cheerio.load(html);
   let list = $("div:nth-child(6) > div.listupd.normal");
   let index = [];
   list.find("article").each(function () {
    const title = $(this).find("h2").text();
    const episode = $(this).find(".bt > .epx").text().match(/\d+/g)[0];
    const type = $(this).find(".typez").text();
    const score = $(this).find(".scr").text();
    const poster = $(this).find("img").attr("src");
    const link = $(this).find("h2 > a").attr("href");
    const id = link
     .match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3]
     .replaceAll("/", "");
    const detail = $(this).find("li");

    let status = "";
    let posted_by = "";
    let released_on = "";
    let series = "";

    detail.each(function () {
     const detail = $(this);
     if (detail.text().split(":")[0] == "Status") {
      // console.log('status')
      status = detail.text().split(":")[1];
     } else if (detail.text().split(":")[0] == "Posted by") {
      // console.log('posted_by')
      posted_by = detail.text().split(":")[1];
     } else if (detail.text().split(":")[0] == "Released on") {
      // console.log('released_on')
      released_on = detail.text().split(":")[1];
     } else if (detail.text().split(":")[0] == "series") {
      // console.log('series')
      series = detail.text().split(":")[1];
     } else {
      // console.log('lain')
     }
    });
    index.push({
     title,
     id,
     episode,
     type,
     score,
     poster,
     link,
     status,
     posted_by,
     released_on,
     series,
    });
   });
   return { message: "success", length: index.length, results: index };
   // console.log(index)
  });
  // console.log(result)
  return result;
 }
 
 
 
 

 async popular_today({ request, response }) {
  const cachePopularToday = nodeCache.has('PopularToday')
  
  if (cachePopularToday) {
   console.log('Mengambil data dari cache')
   return nodeCache.get('PopularToday')
  }
  
console.log('Mengambil data dari server')
  const config = {
   headers: {
    "user-agent":
     "Mozilla/5.0 (Linux; Android 12; CPH2043) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "Accept-Encoding": "application/json",
   },
  };
  let result = await axios.get(host, config).then((res) => {
   const html = res.data;
   const $ = cheerio.load(html);
   let list = $(
    "#content > div > div.postbody > div:nth-child(3) > div.listupd.normal > div > article"
   );
   //   console.log(list.html())
   let index = [];
   list.each(function () {
    const title = $(this).find(".eggtitle").text();
    const type = $(this).find(".eggtype").text();
    const episode = $(this).find(".eggepisode").text()
     ? $(this).find(".eggepisode").text().match(/\d+/g)[0]
     : "";
    const poster = $(this).find("img").attr("src");
    const link = $(this).find("a").attr("href");
    const id = link
     .match(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/)[3]
     .replaceAll("/", "");

    index.push({ title, id, type, episode, poster, link });
   });

   return { message: "success", length: index.length, results: index };
  });
  nodeCache.set('PopularToday',result, 3600)
  return result;
 }
}

module.exports = OploverzController;
