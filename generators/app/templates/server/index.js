require('isomorphic-fetch')
require('dotenv').config()

const fs         = require('fs')
const express    = require('express')
const session    = require('express-session')
const RedisStore = require('connect-redis')(session)
const path       = require('path')
const logger     = require('morgan')
const sprintf    = require('sprintf')
const Lazy       = require('lazy.js')
const outdent    = require('outdent')

const webpack              = require('webpack')
const webpackMiddleware    = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config               = require('../config/webpack.config.js')

const ShopifyAPIClient = require('shopify-api-node')
const ShopifyExpress   = require('@shopify/shopify-express')
const {SQLStrategy}    = require('@shopify/shopify-express/strategies')

const db = require('./db')
const { Shop } = db

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
} = process.env

const shopifyConfig = {
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['write_orders, write_products'],
  shopStore: new SQLStrategy(db.knexConfig),
  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request

    /*
    registerWebhook(shop, accessToken, {
      topic: 'orders/create',
      address: `${SHOPIFY_APP_HOST}/order-create`,
      format: 'json'
    });
    */

    return response.redirect('/')
  },
}

const registerWebhook = function(shopDomain, accessToken, webhook) {
  const shopify = new ShopifyAPIClient({ shopName: shopDomain, accessToken: accessToken });
  shopify.webhook.create(webhook).then(
    response => console.log(`webhook '${webhook.topic}' created`),
    err => console.log(`Error creating webhook '${webhook.topic}'. ${JSON.stringify(err.response.body)}`)
  );
}

const app = express();
const isDevelopment = NODE_ENV !== 'production';

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(
  session({
    store: isDevelopment ? undefined : new RedisStore(),
    secret: SHOPIFY_APP_SECRET,
    resave: true,
    saveUninitialized: false,
  })
)

// Run webpack hot reloading in dev
if (isDevelopment) {
  const compiler = webpack(config)
  const middleware = webpackMiddleware(compiler, {
    hot: true,
    inline: true,
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  })

  app.use(middleware)
  app.use(webpackHotMiddleware(compiler))
} else {
  const staticPath = path.resolve(__dirname, '../assets')
  app.use('/assets', express.static(staticPath))
}

// Install
app.get('/install', (req, res) => res.render('install'))

// Create shopify middlewares and router
const shopify = ShopifyExpress(shopifyConfig)

// Mount Shopify Routes
const {routes, middleware} = shopify
const {withShop, withWebhook} = middleware

app.use('/shopify', routes)

// Client
app.get('/', withShop({authBaseUrl: '/shopify'}), function(request, response) {
  const { session: { shop, accessToken } } = request
  response.render('app', {
    title: 'Shopify Node App',
    apiKey: shopifyConfig.apiKey,
    shop: shop,
  })
})


app.post('/order-create', withWebhook((error, request) => {
  if (error) {
    console.error(error)
    return;
  }

  console.log('We got a webhook!')
  console.log('Details: ', request.webhook)
  console.log('Body:', request.body)
}))

// Proxied Routes

/**
 * Return params added by Shopify before proxying to us.
 *
 * @param   {Request} req    an express Request
 * @returns {Array}          [path_prefix, shop, signature, timestamp].  timestamp is a Number and everything else is a string.
 */
function proxiedParams(req) {
  return [
    req.query.path_prefix,
    req.query.shop,
    req.query.signature,
    req.query.timestamp
  ]
}

app.get('/chefs-schedule/', function(request, response) {
  const [pathPrefix, shop, signature, timestamp ] = proxiedParams(request)
  Shop.findOne({ shopify_domain: shop }).then((s) => {
    response.type('application/liquid')
    response.status(200).send(body)
  }).catch((err) => {
    console.error(err)
  })
})

// Error Handlers
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(error, request, response, next) {
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  response.status(error.status || 500);
  response.render('error');
});

module.exports = app;
