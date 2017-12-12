const axios = require('axios')
const ENDPOINT_API = 'https://www.mercadobitcoin.com.br/api/'

const MercadoBitcoin = function(config) {
  this.config = {
    CURRENCY: config.currency
  }
};

MercadoBitcoin.prototype = {

  ticker: function(success) {
    this.call('ticker', success);
  },

  orderBook: function(success) {
    this.call('orderbook', success);
  },

  trades: function(success) {
    this.call('trades', success);
  },

  call: function(method, success) {

    axios.get(ENDPOINT_API + this.config.CURRENCY + '/' + method)
      .then(function(response) {
        try {
          success(response.data);
        } catch (ex) {
          console.log(ex)
        }
      });
  }
}

module.exports = {
  MercadoBitcoin
}
