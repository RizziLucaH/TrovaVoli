const TelegramBot = require('node-telegram-bot-api');
const request = require('request');

// Inserisci il tuo token del bot Telegram qui
const token = '5912220593:AAGNEYk96NP9prY9wGpkIrqcI969p52EqLw';

// Inserisci il tuo API key qui
const apiKey = '065bc8a77175796fddfe3117f886415a';

// Crea un'istanza del bot Telegram
const bot = new TelegramBot(token, { polling: true });
const airportData =require('./src/airportsJSON.json');

//EXPRESS/EJS
//#region
const ejs=require('ejs');
const express=require('express');
const app=express();

app.use(express.urlencoded({
  extended:true
}));

// Configurazione EJS 
app.set('view engine', 'ejs');

// Cartella "views" come percorso predefinito per i file di visualizzazione
app.set('views', __dirname + '/views');

//Volo
let volo={flight_dep:"",flight_arr:"",flight_dep_time:"",flight_arr_time:""}

app.get("/",function(req,res){
  res.render("index", {volo:volo});
});

app.post("/",function(req,res){
  GetVolo(req.body.codice);
  res.redirect("/");
});

// Avvio server
app.listen(3000, () => {
  console.log('Il server è in ascolto sulla porta 3000');
});

//#endregion


//COMMANDER
//#region
const { program } = require('commander');

program
  .arguments('[campoOpzionale]')
  .description('Cerca voli in tempo reale')
  .action((campoOpzionale) => {
    // Codice da eseguire quando il comando viene invocato
    console.log(`Ricerco i voli in partenza da: ${campoOpzionale}`);
    // Altre operazioni...

    // Esegui la richiesta API o altre azioni necessarie
    // in base al campo opzionale fornito

    // Esempio: verifica se il campo opzionale è un codice IATA valido
    if (/^[A-Z]{3}$/i.test(campoOpzionale)) {
      
      request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${campoOpzionale}&flight_status=active`, (error, response, body) => {
              if (error) {
                console.error(error);
                return;
              }
  
              //Trasformo i risultati ottenuti in un JSON
              const flightInfo = JSON.parse(body);
              console.log(flightInfo.data);
              
            });
    } else {
      console.log('Campo opzionale non valido.');
    }
  });

program.parse(process.argv);

//#endregion


//BOT
//#region
//BENVENUTO NEL BOT
bot.onText(/ciao/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Benvenuto su Trova Voli! Cosa vuoi fare? ', {
    reply_markup: {
      keyboard: [
        ['Voli in tempo reale✈️', 'Storico'],
        ['Voli già atterrati🛬', 'voli in partenza🛫'],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

//METODO DI TEST
bot.onText(/test/, (msg) => {
});


//VOLI IN TEMPO REALE
bot.onText(/Voli in tempo reale✈️/, (msg,match) => {
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
  
              //Trasformo i risultati ottenuti in un JSON
              const flightInfo = JSON.parse(body);
              
              // bot.sendMessage(chatId, flightInfo );
              console.log(flightInfo);
              console.log("----------------------------------------------------------------------------------------")
              // bot.sendMessage(chatId, flightInfo.data );
              console.log(flightInfo.data);
              
              console.log("----------------------------------------------------------------------------------------")
              
              bot.sendMessage(chatId, `Ecco le informazioni sul volo ${flightCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)} 🛫\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}\n\nRitardo di: ${flightInfo.data[0].arrival.delay}` );
            });
          }else{
            bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
  
          }
          });
          
          break;
        
          case 'dep':
          bot.sendMessage(chatId, 'qual è l\'aereoporto di partenza del volo che stai cercando?');
  
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
            request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airportCode}&flight_status=active`, (error, response, body) => {
              if (error) {
                console.error(error);
                bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
                return;
              }
  
              //Trasformo i risultati ottenuti in un JSON
              const flightInfo = JSON.parse(body);
              
              console.log(flightInfo);
              console.log("----------------------------------------------------------------------------------------")
              console.log(flightInfo.data);
              console.log(flightInfo.data.length);
              
              console.log("----------------------------------------------------------------------------------------")
              bot.sendMessage(msg.chat.id, `Ecco gli ultimi ${flightInfo.data.length} partiti da ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬`, { reply_markup: inlineKeyboard })
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
  
                    const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);
  
                    // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
                      bot.editMessageText(`Ecco gli ultimi ${flightInfo.data.length} partiti da ${airportCode}: \n\n-Partito da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)}🛫\n\n-Destinazione: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)} 🛬`, {
                        chat_id: msg.chat.id,
                        message_id: messageID,
                        reply_markup: newInlineKeyboard
                      });
                  });
                });
              });
              // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
          }else{
            bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
  
          }
          });
          break;
  
        case 'arr':
          bot.sendMessage(chatId, 'qual è l\'aereoporto di arrivo del volo che stai cercando?');
  
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
            request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&arr_iata=${airportCode}&flight_status=active`, (error, response, body) => {
              if (error) {
                console.error(error);
                bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
                return;
              }
  
              //Trasformo i risultati ottenuti in un JSON
              const flightInfo = JSON.parse(body);
              
              console.log(flightInfo);
              console.log("----------------------------------------------------------------------------------------")
              console.log(flightInfo.data);
              console.log(flightInfo.data.length);
              
              console.log("----------------------------------------------------------------------------------------")
              bot.sendMessage(msg.chat.id, `Ecco i prossimi ${flightInfo.data.length} che arriveranno a ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}🛫\n\n-Destinazione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬`, { reply_markup: inlineKeyboard })
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
  
                    const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);
  
                    // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
                      bot.editMessageText(`Ecco i prossimi ${flightInfo.data.length} che arriveranno a ${airportCode}: \n\n-Partito da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)}🛬`, {
                        chat_id: msg.chat.id,
                        message_id: messageID,
                        reply_markup: newInlineKeyboard
                      });
                  });
                });
              });
              // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
          }else{
            bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
  
          }
          });
          break;
  
        case 'dep_arr':
          bot.sendMessage(chatId, 'quali sono  gli aereoporti del volo che stai cercando?\n\n Scrivimeli in questo formato: IATA Aereoporto di partenza-IATA Aereoporto di arrivo');
          
          bot.once('message', (msg) => {
            const airportCodeArray =msg.text.split('-'); 
            const airportDepCode = airportCodeArray[0].toUpperCase();
            const airportArrCode = airportCodeArray[1].toUpperCase();
            const inlineKeyboard = {
              inline_keyboard: [
                [
                  { text: '< Indietro', callback_data: 'prev' },
                  { text: 'Avanti >', callback_data: 'next' }
                ]
              ]
            };
            console.log(airportDepCode);
            console.log(airportArrCode);
            if (/^[A-Z]{3}$/i.test(airportDepCode) && /^[A-Z]{3}$/i.test(airportArrCode)) {
            request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airportDepCode}&arr_iata=${airportArrCode}`, (error, response, body) => {
              if (error) {
                console.error(error);
                bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
                return;
              }
  
              //Trasformo i risultati ottenuti in un JSON
              const flightInfo = JSON.parse(body);
              
              console.log(flightInfo);
              console.log("----------------------------------------------------------------------------------------")
              console.log(flightInfo.data);
              console.log(flightInfo.data.length);
              
              console.log("----------------------------------------------------------------------------------------")
              bot.sendMessage(msg.chat.id, `Ecco i ${flightInfo.data.length} voli che sono partiti da ${airportDepCode} ed arriveranno a ${airportArrCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬`, { reply_markup: inlineKeyboard })
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
                    const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);
                    // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
                      bot.editMessageText(`Ecco i ${flightInfo.data.length} voli che sono partiti da ${airportDepCode} ed arriveranno a ${airportArrCode}: \n\n-Partito da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)}🛬`, {
                        chat_id: msg.chat.id,
                        message_id: messageID,
                        reply_markup: newInlineKeyboard
                      });
                  });
                });
              });
          }else{
            bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');
          }
          });
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

      //Trasformo i risultati ottenuti in un JSON
      const flightInfo = JSON.parse(body);
      
      // bot.sendMessage(chatId, flightInfo );
      console.log(flightInfo);
      console.log("----------------------------------------------------------------------------------------")
      // bot.sendMessage(chatId, flightInfo.data );
      console.log(flightInfo.data);
      console.log(flightInfo.data.length);
      
      console.log("----------------------------------------------------------------------------------------")
      bot.sendMessage(msg.chat.id, `Ecco gli ultimi ${flightInfo.data.length} arrivi a ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)} 🛫\n\n-Arrivato a: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬}`, { reply_markup: inlineKeyboard })
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

            const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);

            // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
              bot.editMessageText(`Ecco gli ultimi 100 arrivi a ${airportCode}: \n\n-Partito da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)} 🛫\n\n-Arrivato a: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)}🛬`, {
                chat_id: msg.chat.id,
                message_id: messageID,
                reply_markup: newInlineKeyboard
              });
          });
        });
      });
      // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
  }else{
    bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');

  }
  });
});




bot.onText(/voli in partenza🛫/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Ottimo! Inserisci il codice dell\'aereoporto dal quale deve partire il tuo volo');

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
    request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&dep_iata=${airportCode}&flight_status=scheduled`, (error, response, body) => {
      if (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
        return;
      }

      //Trasformo i risultati ottenuti in un JSON
      const flightInfo = JSON.parse(body);
      
      // bot.sendMessage(chatId, flightInfo );
      console.log(flightInfo);
      console.log("----------------------------------------------------------------------------------------")
      // bot.sendMessage(chatId, flightInfo.data );
      console.log(flightInfo.data);
      console.log(flightInfo.data.length);
      
      console.log("----------------------------------------------------------------------------------------")
      bot.sendMessage(msg.chat.id, `Ecco i prossimi ${flightInfo.data.length} voli che partiranno da ${airportCode}: \n\n-Partenza da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}🛫\n\n-Destinazione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬`, { reply_markup: inlineKeyboard })
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

            const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);

            // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
              bot.editMessageText(`Ecco i prossimi ${flightInfo.data.length} voli che partiranno da ${airportCode}: \n\n-Partenza da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)}🛬`, {
                chat_id: msg.chat.id,
                message_id: messageID,
                reply_markup: newInlineKeyboard
              });
          });
        });
      });
      // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
  }else{
    bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');

  }
  });

});


bot.onText(/Storico/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Funzione non ancora attiva per scarsità di fondi, se la desideri puoi mandare 49.99$ (costo dell\'iscrizione all\'API) a questo indirizzo PayPal: lucarizzi04.lr@gmail.com\n\n Grazie!');


  //ipotetico messaggio
  // bot.sendMessage(chatId, 'Ottimo! Inserisci il giorno in cui è partito il tuo volo\n\n utilizza questo formato: ANNO-MESE-GIORNO');

  bot.once('message', (msg) => {
    const flightDate = msg.text;
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '< Indietro', callback_data: 'prev' },
          { text: 'Avanti >', callback_data: 'next' }
        ]
      ]
    };

    //regrex: 4 cifre decimali - 2 cifre decimali - 2 cifre decimali
    if (/^\d{4}-\d{2}-\d{2}$/.test(flightDate)) {
    request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_date=${flightDate}`, (error, response, body) => {
      if (error) {
        console.error(error);
        bot.sendMessage(chatId, 'Si è verificato un errore durante l\'elaborazione della richiesta.');
        return;
      }

      //Trasformo i risultati ottenuti in un JSON
      const flightInfo = JSON.parse(body);
      
      // bot.sendMessage(chatId, flightInfo );
      console.log(flightInfo);
      console.log("----------------------------------------------------------------------------------------")
      // bot.sendMessage(chatId, flightInfo.data );
      console.log(flightInfo.data);
      console.log(flightInfo.data.length);
      
      console.log("----------------------------------------------------------------------------------------")
      bot.sendMessage(msg.chat.id, `Ecco i primi ${flightInfo.data.length} voli del giorno ${flightDate}: \n\n-Partenza da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬`, { reply_markup: inlineKeyboard })
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

            const newInlineKeyboard = createInlineKeyboard(currentIndex, flightInfo.data.length);

            // Modifica il messaggio con il nuovo messaggio e la tastiera inline aggiornata
              bot.editMessageText(`Ecco i primi ${flightInfo.data.length} voli del giorno ${flightDate}: \n\n-Partenza da: ${flightInfo.data[currentIndex].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].departure.iata].country_id)} 🛫\n\n-Destinazione: ${flightInfo.data[currentIndex].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[currentIndex].arrival.iata].country_id)}🛬`, {
                chat_id: msg.chat.id,
                message_id: messageID,
                reply_markup: newInlineKeyboard
              });
          });
        });
      });
      // bot.sendMessage(chatId, `Ecco le informazioni sul volo ${airportCode}: \n\n-Partito da: ${flightInfo.data[0].departure.airport} ${getFlagEmoji(airportData[flightInfo.data[0].departure.iata].country_id)}\n\n-Direzione: ${flightInfo.data[0].arrival.airport} ${getFlagEmoji(airportData[flightInfo.data[0].arrival.iata].country_id)}🛬\n\n-Terminal di arrivo: ${flightInfo.data[0].arrival.terminal}` );
  }else{
    bot.sendMessage(chatId, 'Il codice volo inserito non è valido.');

  }
  });

});

//#endregion


//FUNZIONI
//#region

//EJS
async function GetVolo(flightCode){
    
  request(`http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightCode}`, (error, response, body) => {
    if (error) {
      console.error(error);
      return;
    }

    //Riempio volo
    flightInfo = JSON.parse(body);
    volo={flight_dep:flightInfo.data[0].departure.airport,flight_arr:flightInfo.data[0].arrival.airport,flight_dep_time:flightInfo.data[0].departure.actual,flight_arr_time:flightInfo.data[0].arrival.estimated};
  });

}

//BOT
function createInlineKeyboard(currentIndex, length) {
  return {
    inline_keyboard: [
      [
        { text: '< Indietro', callback_data: 'prev' },
        { text: 'Avanti >', callback_data: 'next' }
      ],
      [{ text: `${currentIndex + 1}/${length}`, callback_data: 'empty' }]
    ]
  };
}
function getFlagEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

//#endregion