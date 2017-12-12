require("dotenv-safe").load()

const MercadoBitcoin = require("./mercadobtc").MercadoBitcoin;
const MercadoBitcoinTrade = require('./mercadobtctrader').MercadoBitcoinTrade;


let infoApi = new MercadoBitcoin({
  currency: 'BTC'
});

let tradeApi = new MercadoBitcoinTrade({
  currency: 'BTC',
  key: process.env.KEY,
  secret: process.env.SECRET,
  pin: process.env.PIN
});


setInterval(() =>
  infoApi.ticker((tick) => {
    if (tick.ticker.sell <= 58000) {
      tradeApi.listMyOrders({
          coin_pair: 'BRLBTC',
          status_list: ['2']
        },
        (data) => console.log(data),
        (data) => console.log(data));
    } else
      console.log('Ainda muito alto, vamos esperar pra comprar depois.')
  }),
  process.env.CRAWLER_INTERVAL
)
