const axios = require("axios");
require('dotenv').config();
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});


axios.get("https://api.preciodelaluz.org/v1/prices/all?zone=PCB").then(response => {
    var franges = response.data;
    var bestFranges = getBestFranges(franges);
    var cheapestFranja = getCheapestFranja(franges);
    var expensiestFranja = getExpensiestFranja(franges);
    var bestFranja = returnBestFranja(bestFranges, franges);
    var tweet = bestFranja + "\n" + cheapestFranja + "\n" + expensiestFranja;
    postTweet(tweet);
}).catch(error => {
    console.log(error);
});

function getBestFranges(franges) {
    var bestFranges = [];
    for (franja in franges) {
        for (f in franges[franja]) {
            if (f == "is-cheap") {
                if (franges[franja][f]) {
                    bestFranges.push(franja);
                }
            }
        }
    }
    return bestFranges;
}

function getCheapestFranja(franges) {
    var cheapestFranja;
    var cheapestPrice = Number.MAX_VALUE
    for (franja in franges) {
        if (franges[franja].price < cheapestPrice) {
            cheapestFranja = franja;
            cheapestPrice = franges[franja].price;
        }
    }
    cheapestFranja = cheapestFranja.split("-");
    var cheapestFranjaMaco = cheapestFranja[0] + "h-" + cheapestFranja[1] + "h";
    return "Mejor franja de precio: " + cheapestFranjaMaco + " a " + (cheapestPrice / 1000).toFixed(4) + "€/kWh";
}

function getExpensiestFranja(franges) {
    var expensiestFranja;
    var expensiestPrice = 0;
    for (franja in franges) {
        if (franges[franja].price > expensiestPrice) {
            expensiestFranja = franja;
            expensiestPrice = franges[franja].price;
        }
    }
    expensiestFranja = expensiestFranja.split("-");
    var expensiestFranjaMaco = expensiestFranja[0] + "h-" + expensiestFranja[1] + "h";
    return "Peor franja de precio: " + expensiestFranjaMaco + " a " + (expensiestPrice / 1000).toFixed(4) + "€/kWh";
}

function returnBestFranja(bestFranges, franges) {
    var bestFranja = "";
    var prices = [];
    for (fra in bestFranges) {
        for (franja in franges) {
            if (bestFranges[fra] == franja) {
                prices.push(franges[franja].price);
            }
        }
    }
    var inicio = bestFranges[0].split("-");
    var final = bestFranges[bestFranges.length - 1].split("-")
    bestFranja = inicio[0] + "h-" + final[1] + "h"
    var precioMedio = calcularPrecioMedio(prices);
    return "Horas del dia con mejor precio: " + bestFranja + " con una media de " + (precioMedio / 1000).toFixed(4) + "€/kWh";
}

function calcularPrecioMedio(precios) {
    var resultado = 0;
    for (precio in precios) {
        resultado += precios[precio];
    }
    return (resultado / precios.length);
}

function postTweet(tweet) {
    client.post('statuses/update', { status: tweet }, function (error, tweet, response) {
        if (!error) {
            console.log("Tweet posted correctly");
        } else {
            console.error(error);
        }
    });
}

//(TODO) hacer que suba un tweet cuando vaya a empezar la franja alta y otro cuando la franja baja