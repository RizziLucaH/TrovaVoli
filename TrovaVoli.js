const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// Inserisci il tuo token del bot Telegram qui
const token = '5912220593:AAGNEYk96NP9prY9wGpkIrqcI969p52EqLw';

// Inserisci il tuo API key qui
const apiKey = '9b2e8310456bcad54b0b44b1b24ab79d';

// Crea un'istanza del bot Telegram
const bot = new TelegramBot(token, { polling: true });



// Gestore del comando "/flight"
bot.onText(/\/flight (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const flightCode = match[1].toUpperCase();
  bot.sendMessage(chatId, flightCode);


  // Effettua una richiesta HTTP all'API di aviationstack per ottenere le informazioni del volo
  request('http://api.aviationstack.com/v1/flights?access_key=9b2e8310456bcad54b0b44b1b24ab79d', (error, response, body) => {
    if (error) {
      console.error(error);
      bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
      return;
    }
    const data = JSON.parse(body);
    const responseMessage = `Informazioni sul volo ${data.data[0].flight.iata_number}:\n
                             Partenza: ${data.data[0].departure.airport} alle ${data.data[0].departure.scheduled}\n
                             Arrivo: ${data.data[0].arrival.airport} alle ${data.data[0].arrival.scheduled}\n
                             Compagnia aerea: ${data.data[0].airline.name}`;

    // Invia il messaggio di risposta al chat ID specificato
    bot.sendMessage(chatId, responseMessage);
    console.log(body);

  });
});
