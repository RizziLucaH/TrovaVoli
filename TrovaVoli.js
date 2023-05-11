const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// Inserisci il tuo token del bot Telegram qui
const token = '5912220593:AAGNEYk96NP9prY9wGpkIrqcI969p52EqLw';

// Inserisci il tuo API key qui
const apiKey = '9b2e8310456bcad54b0b44b1b24ab79d';

// Crea un'istanza del bot Telegram
const bot = new TelegramBot(token, { polling: true });


bot.onText(/ciao/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Benvenuto sul bot che fa talmente tante cose che potrebbe anche ingravidare tua madre! Cosa vuoi fare? ', {
    reply_markup: {
      keyboard: [
        ['Cercare un volo', 'ingravidare mia madre'],
        ['vedere uno storico', 'niente']
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.onText(/Cercare un volo/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Ottimo! qual è il codice IATA del volo che vuoi cercare?');
  
  //aspetta un codice IATA valido
  bot.once('message', (msg) => {
    const flightCode = msg.text.toUpperCase();
    if (/^[A-Z]{2}[0-9]{4}$/i.test(flightCode)) {

      // esegue la ricerca del volo utilizzando flightCode
      // bot.sendMessage(chatId, `Hai inserito il codice volo ${flightCode}`);

      // Effettua una richiesta HTTP all'API di aviationstack per ottenere le informazioni del volo
      request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightCode}&flight_status=scheduled`, (error, response, body) => {
        if (error) {
          console.error(error);
          bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
          return;
        }
        const flightInfo = JSON.parse(body);
        
        // bot.sendMessage(chatId, flightInfo );
        console.log(flightInfo);
        console.log("----------------------------------------------------------------------------------------")
        // bot.sendMessage(chatId, flightInfo.data );
        console.log(flightInfo.data);

        console.log("----------------------------------------------------------------------------------------")

        bot.sendMessage(chatId, `Ecco le informazioni sul volo ${flightCode}: \nPartito da: ${flightInfo.data[0].departure.airport}\nDirezione: ${flightInfo.data[0].arrival.airport}\nTerminal di arrivo:${flightInfo.data[0].arrival.terminal}` );
        // console.log(flightInfo.data[0].departure.airport );
      });

    } else {
      bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
    }
  });

});

