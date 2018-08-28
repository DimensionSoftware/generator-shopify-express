require('dotenv').config()

function reload(module){
  delete require.cache[require.resolve(module)]
  return require(module)
}

global.reload   = reload
global.rl       = reload
global.cl       = console.log

global.clone    = require('clone')
global.Lazy     = require('lazy.js')
global.sprintf  = require('sprintf')
global.outdent  = require('outdent')

global.Shopify      = require('shopify-api-node')
global.ShopifyToken = require('shopify-token')
global.shopifyToken = new ShopifyToken({
  apiKey: process.env.SHOPIFY_APP_KEY,
  sharedSecret: process.env.SHOPIFY_APP_SECRET,
  redirectUri: 'http://localhost:3000/shopify/auth/callback'
})

global.knexConfig = require('./knexfile')
global.ss = require('./bin/split-schedule') // It's both an executable and a library.
global.db = require('./server/db')
function boot() {
  global.app = require('./server/index')
  return global.app
}
global.boot = boot
console.log('Type boot() to start the web server and populate `global.app`.')
