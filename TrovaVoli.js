const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// Inserisci il tuo token del bot Telegram qui
const token = '5912220593:AAGNEYk96NP9prY9wGpkIrqcI969p52EqLw';

// Inserisci il tuo API key qui
const apiKey = '2e603ff6505c58dca77c9599eaf5928f';

// Crea un'istanza del bot Telegram
const bot = new TelegramBot(token, { polling: true });

//BENVENUTO NEL BOT
bot.onText(/ciao/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Benvenuto sul bot che fa talmente tante cose che potrebbe anche ingravidare tua madre! Cosa vuoi fare? ', {
    reply_markup: {
      keyboard: [
        ['Voli in tempo reale✈️', 'ingravidare mia madre'],
        ['Voli già atterrati🛬', 'voli in partenza🛫'],
        ['test', 'Storico']
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

//METODO DI TEST
bot.onText(/test/, (msg) => {
  const chatId = msg.chat.id;
  const message = 'Ottimo! Come vuoi cercare il tuo volo?';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'IATA', callback_data: 'iata' }],
        [{ text: 'Aereoporto di partenza', callback_data: 'dep' }],
        [{ text: 'Aereoporto di arrivo', callback_data: 'arr' }],
        [{ text: 'Aereoporto di partenza e arrivo', callback_data: 'dep_arr' }]
      ],
    },
  };
  bot.sendMessage(chatId, message, options);


  // Gestisce il callback dei bottoni
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const option = query.data;

    let message = '';

    switch(option) {
      case 'iata':
        message = 'Hai selezionato l\'opzione 1.';
        break;
      case 'dep':
        message = 'Hai selezionato l\'opzione 2.';
        break;
      case 'arr':
        message = 'Hai selezionato l\'opzione 3.';
        break;
      case 'dep_arr':
        message = 'Hai selezionato l\'opzione 3.';
        break;
      default:
        message = 'Opzione non valida.';
    }
    bot.sendMessage(chatId, message);
  });
});

//VOLI IN TEMPO REALE
bot.onText(/Voli in tempo reale✈️/, (msg) => {
  const chatId = msg.chat.id;
  const message = 'Ottimo! Come vuoi cercare il tuo volo?';
  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'IATA', callback_data: 'iata' }],
        [{ text: 'Aereoporto di partenza', callback_data: 'dep' }],
        [{ text: 'Aereoporto di arrivo', callback_data: 'arr' }],
        [{ text: 'Aereoporto di partenza e arrivo', callback_data: 'dep_arr' }]
      ],
    },
  };
  bot.sendMessage(chatId, message, options);


  // Gestisce il callback dei bottoni
  bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const option = query.data;

    let message = '';

    switch(option) {
      case 'iata':
        bot.sendMessage(chatId, 'qual è il codice IATA del volo che stai cercando?');
        bot.once('message', (msg) => {
          const flightCode = msg.text.toUpperCase();
          if (/^[A-Z]{2}[0-9]{1,4}$/i.test(flightCode)) {
          request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightCode}`, (error, response, body) => {
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
            
            bot.sendMessage(chatId, `Ecco le informazioni sul volo ${flightCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport}\n\n-Direzione: ${flightInfo.data[0].arrival.airport}\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
          });
        }else{
          bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');

        }
        });
        
        break;
      case 'dep':
        message = 'Hai selezionato l\'opzione 2.';
        break;
      case 'arr':
        message = 'Hai selezionato l\'opzione 3.';
        break;
      case 'dep_arr':
        message = 'Hai selezionato l\'opzione 3.';
        break;
      default:
        message = 'Opzione non valida.';
    }
  });
});


bot.onText(/Voli già atterrati🛬/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Ottimo! Inserisci il codice dell\'aereoporto');

  bot.once('message', (msg) => {
    const airportCode = msg.text.toUpperCase();
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '< Indietro', callback_data: 'prev' },
          { text: 'Avanti >', callback_data: 'next' }
        ]
      ]
    };

    if (/^[A-Z]{3}$/i.test(airportCode)) {
    request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=${airportCode}&flight_status=landed`, (error, response, body) => {
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
      console.log(flightInfo.data.length);
      
      console.log("----------------------------------------------------------------------------------------")
      bot.sendMessage(msg.chat.id, `Ecco gli ultimi 100 arrivi a ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport}\n\n-Arrivato a: ${flightInfo.data[0].arrival.airport}}`, { reply_markup: inlineKeyboard })
        .then((sentMsg) => {
          // Salva l'ID del messaggio per poterlo modificare successivamente
          const messageID = sentMsg.message_id;
          // Salva l'indice corrente dell'array
          let currentIndex = 0;
          // Gestisci le azioni degli utenti sulla tastiera inline
          bot.on('callback_query', (callbackQuery) => {
            const data = callbackQuery.data;
            if (data === 'next') {
              // Avanti
              currentIndex++;
              // Se siamo arrivati alla fine dell'array, torniamo all'inizio
              if (currentIndex >= flightInfo.data.length) {
                currentIndex = 0;
              }
            } else if (data === 'prev') {
              // Indietro
              currentIndex--;
              // Se siamo all'inizio dell'array, andiamo alla fine
              if (currentIndex < 0) {
                currentIndex = flightInfo.data.length - 1;
              }
            }
            // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
            bot.editMessageText(`Ecco gli ultimi 100 arrivi a ${airportCode}: \n\n-Partito da: ${flightInfo.data[currentIndex].departure.airport}\n\n-Arrivato a: ${flightInfo.data[currentIndex].arrival.airport}}`, {
              chat_id: msg.chat.id,
              message_id: messageID,
              reply_markup: inlineKeyboard
            });
          });
        });
      });
      // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport}\n\n-Direzione: ${flightInfo.data[0].arrival.airport}\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
  }else{
    bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');

  }
  });
});


bot.onText(/Info partenze/, (msg) => {
  bot.sendMessage(chatId, 'qual è il codice IATA del volo che stai cercando?');
  //aspetta un codice IATA valido
  bot.once('message', (msg) => {
    const flightCode = msg.text.toUpperCase();
    if (/^[A-Z]{2}[0-9]{1,4}$/i.test(flightCode)) {

      // esegue la ricerca del volo utilizzando flightCode
      // bot.sendMessage(chatId, `Hai inserito il codice volo ${flightCode}`);

      // Effettua una richiesta HTTP all'API di aviationstack per ottenere le informazioni del volo
      request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightCode}`, (error, response, body) => {
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

        bot.sendMessage(chatId, `Ecco le informazioni sul volo ${flightCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport}\n\n-Direzione: ${flightInfo.data[0].arrival.airport}\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
        // console.log(flightInfo.data[0].departure.airport );
      });

    } else {
      bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
    }
  });

});