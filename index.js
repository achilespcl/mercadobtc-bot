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
    console.log(tick.ticker);
    if (tick.ticker.last >= process.env.BEST_BUY * 1.1) {
      tradeBTC(tick);
    } else
      console.log('Ainda muito alto, vamos esperar pra comprar depois.')
  }),
  process.env.CRAWLER_INTERVAL
)

tradeBTC = (tick) => {
  // Pega a informações da conta
  tradeApi.getAccountInfo((account) => {
    // Lista as minhas ordens de compra com o status de concluídas
    tradeApi.listMyOrders({
      status_list: '[4]',
      coin_pair: 'BRLBTC',
      order_type: 1
    }, (data) => {
      //Se houve uma queda de mais de 10% desde a minha última compra então compre metade do meu dinheiro e saia do processo
      if (data.orders[0].limit_price * 0.9 >= tick.ticker.last) {
        console.log('Estou comprando por:' + tick.ticker.last);
        console.log('A quantia de:' + account.balance.brl.available);
        tradeApi.placeBuyOrder(
          account.balance.brl.available / 2,
          tick.ticker.last,
          (data) => console.log('Ordem executada') + data,
          (e) => console.log(e));
        process.exit(0);
        //Se houve um aumento de mais de 10% desde a minha última compra então venda tudo que eu tiver.
      } else if (tick.ticker.last >= data.orders[0].limit_price * 1.1) {
        console.log("Estou vendendo por:" + tick.ticker.last);
        console.log("A quantia de:" + account.balance.btc.available);
        tradeApi.placeSellOrder(
          account.balance.btc.available,
          tick.ticker.last,
          (data) => console.log('Ordem executada' + data),
          (e) => console.log(e));
      } else {
        console.log('Não é o momento de fazer negociação');
      }
    }, (e) => console.log(e));
  }, (e) => console.log(e));
}
