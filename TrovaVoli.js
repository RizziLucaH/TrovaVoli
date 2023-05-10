const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const RapidAPI = require('rapidapi-connect');

// Inserisci il tuo token del bot Telegram qui
const token = '5912220593:AAGNEYk96NP9prY9wGpkIrqcI969p52EqLw';

// Inserisci il nome dell'API di RapidAPI che stai utilizzando
const apiName = 'Skyscanner';

// Inserisci l'host dell'API di RapidAPI che stai utilizzando
const apiHost = 'skyscanner50.p.rapidapi.com';

// Inserisci la tua chiave API di RapidAPI qui
const rapidapiKey = '62098293f7msh970942565abb21ep1916e7jsnb4d9054608a0';

const bot = new TelegramBot(token, {polling: true});
const rapid = new RapidAPI('62098293f7msh970942565abb21ep1916e7jsnb4d9054608a0', 'skyscanner50.p.rapidapi.com');


bot.on('message',(msg)=>
{
    const apiUrl = `https://${apiHost}/api/v1/searchAirport`;
    request({
        url: apiUrl,
        headers: {
          'X-RapidAPI-Key': rapidapiKey
        }
      }, (error, response, body) => {
        if (error) {
          console.error(error);
          bot.sendMessage(msg.chat.id, 'Si è verificato un errore durante la chiamata all\'API.');
          return;
        }
        
        // Parse della risposta dell'API
        const data = JSON.parse(body);
        
        // Invio della risposta al bot Telegram
        bot.sendMessage(msg.chat.id, `Risposta dall'API di RapidAPI: ${JSON.stringify(data)}`);
    });

});

// TEST API

// const axios = require('axios');

// const options = {
//     method: 'GET',
//     url: 'https://skyscanner50.p.rapidapi.com/api/v1/searchAirport',
//     params: {query: 'london'},
//     headers: {
//         'X-RapidAPI-Key': '62098293f7msh970942565abb21ep1916e7jsnb4d9054608a0',
//         'X-RapidAPI-Host': 'skyscanner50.p.rapidapi.com'
//     }
// };

// bot.on('message',(msg)=>
// {
//     var hi="api";
//     try {
//         const response =  axios.request(options);
//         console.log(response.data);
//     } catch (error) {
//         console.error(error);
//     }
// });

//#region test vari
// require('dotenv').config()

// bot.onText(/\/start/,(msg)=>
// {
//     bot.sendMessage(msg.chat.id,"ciao mondo");
// });

// bot.onText(/\/gatto/,(msg)=>
// {
//     bot.sendPhoto(msg.chat.id,"https://www.e-coop.it/sites/default/files/styles/scale/public/2020-09/Gatto%20Indoor_Big_0.jpeg?itok=XeEiAZf3",
//     {
//         caption:"Questa è la foto di un gatto, come da te richiesto!"
//     });

// });

// bot.on('message',(msg)=>
// {
//     var hi="ciao";
//     if(msg.text.toString().toLowerCase().indexOf(hi)===0)
//     {
//         bot.sendMessage(msg.chat.id,"hai scritto ciao ma senza /");
//     }
// });

// bot.onText(/\/testbottoni/,(msg)=>
// {
//     bot.sendMessage(msg.chat.id,"testiamo i bottoni porcodio",
//     {
//         "reply_markup":
//         {
//             "keyboard":[
//                 ["prova btn1","prova btn2"],
//                 ["bottonone"],
//                 ["bottoncino"]
//             ]
//         }
//     });

// });
//#endregion


