const axios = require('axios');
const qs = require('querystring');
const crypto = require('crypto');

const ENDPOINT_API = 'https://www.mercadobitcoin.com.br/api/'
const ENDPOINT_TRADE_PATH = "/tapi/v3/"
const ENDPOINT_TRADE_API = 'https://www.mercadobitcoin.net' + ENDPOINT_TRADE_PATH

var MercadoBitcoinTrade = function(config) {
  this.config = {
    KEY: config.key,
    SECRET: config.secret,
    PIN: config.pin,
    CURRENCY: config.currency
  }
}

MercadoBitcoinTrade.prototype = {

  getAccountInfo: function(success, error) {
    this.call('get_account_info', {}, success, error)
  },

  listMyOrders: function(parameters, success, error) {
    this.call('list_orders', parameters, success, error)
  },

  placeBuyOrder: function(qty, limit_price, success, error) {
    this.call('place_buy_order', {
      coin_pair: `BRL${this.config.CURRENCY}`,
      quantity: ('' + qty).substr(0, 10),
      limit_price: '' + limit_price
    }, success, error)
  },

  placeSellOrder: function(qty, limit_price, success, error) {
    this.call('place_sell_order', {
      coin_pair: `BRL${this.config.CURRENCY}`,
      quantity: ('' + qty).substr(0, 10),
      limit_price: '' + limit_price
    }, success, error)
  },

  cancelOrder: function(orderId, success, error) {
    this.call('cancel_order', {
      coin_pair: `BRL${this.config.CURRENCY}`,
      order_id: orderId
    }, success, error)
  },

  call: function(method, parameters, success, error) {

    var now = Math.round(new Date().getTime() / 1000)
    var queryString = qs.stringify({
      'tapi_method': method,
      'tapi_nonce': now
    })
    if (parameters) queryString += '&' + qs.stringify(parameters)

    var signature = crypto.createHmac('sha512', this.config.SECRET)
      .update(ENDPOINT_TRADE_PATH + '?' + queryString)
      .digest('hex')

    const axiosInstance = axios.create({
      headers: {
        'TAPI-ID': this.config.KEY,
        'TAPI-MAC': signature
      }
    });

    axiosInstance.post(ENDPOINT_TRADE_API, queryString)
      .then(function(response) {
        if (response.data) {
          if (response.data.status_code === 100 && success)
            success(response.data);
          else if (error) {
            error(response.data.error_message);
          } else {
            console.log(response.data.error_message);
          }
        } else console.log(response.data.error_message);
      }).catch((e) => error(e.data));
  }
}

module.exports = {
  MercadoBitcoinTrade
}
