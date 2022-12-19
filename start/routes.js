'use strict'
//const url = Env.get('HOST_LK21', 'https://lk21official.info/')
const axios = require('axios');

const Lk21 = use('App/helpers/lk21')


/*

|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/test', async ({
  request, response
}) => {
  let lk21 = new Lk21()
  let data = await lk21.showData(request.input('url'))

  let final = data[data.length -1]['file']

  return final
})
Route.on('/').render('welcome', {
  data: "azkal"
})

Route.get('/fembed', async ({
  request, response, view
}) => {

  let lk21 = new Lk21()
  let data = await lk21.showData(request.input('url'))
  console.log(data)

  let final = data[data.length -1]['file']

  //return final
  return response.send(view.render('fembed', {
    data: data
  }))
})



// for movie lk21
Route.group(() => {
  Route.get('/latest', 'Movie/Lk21Controller.latest')
  Route.get('/search', 'Movie/Lk21Controller.search')
  Route.get('/show', 'Movie/Lk21Controller.showData')
  Route.get('/popular', 'Movie/Lk21Controller.popular')
  Route.get('/test', 'Movie/Lk21Controller.test')
}).prefix('api/movie/lk21');

// for series lk21
Route.group(() => {
  Route.get('/search', 'Series/Lk21Controller.search')
  Route.get('/latest', 'Series/Lk21Controller.latest')

}).prefix('api/series/lk21');

Route.group(() => {
  Route.get('/search', 'Anime/AnibatchController.search')
  Route.get('show', 'Anime/AnibatchController.show')

}).prefix('api/anime/anibatch');

Route.group(() => {
  Route.get('/search', 'Anime/OploverzController.search')
  Route.get('/detail', 'Anime/OploverzController.detail')
  Route.get('/download', 'Anime/OploverzController.download')
  Route.get('/latest', 'Anime/OploverzController.latest')
  Route.get('/latest_update', 'Anime/OploverzController.latest_update')
  Route.get('/popular', 'Anime/OploverzController.popular_today')


}).prefix('api/anime/oploverz');


Route.group(() => {
  Route.get('/fembed', 'BypasserController.fembed')
  Route.get('/zippyshare', 'BypasserController.zippyshare')

}).prefix('api/bypass');
