const axios = require("axios");

axios.get("https://api.preciodelaluz.org/v1/prices/all?zone=PCB").then(response => {
    var franges = response.data;
    var bestFranges = getBestFranges(franges);
    getCheapestFranja(franges);
    getExpensiestFranja(franges);
    returnBestFranja(bestFranges, franges);
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
    var cheapestFranjaMaco = cheapestFranja[0] + "h - " + cheapestFranja[1] + "h";
    console.log("Mejor franja de precio: " + cheapestFranjaMaco + " a " + (cheapestPrice / 1000).toFixed(4) + "€/kWh");
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
    var expensiestFranjaMaco = expensiestFranja[0] + "h - " + expensiestFranja[1] + "h";
    console.log("Peor franja de precio: " + expensiestFranjaMaco + " a " + (expensiestPrice / 1000).toFixed(4) + "€/kWh");
}

function returnBestFranja(bestFranges, franges) {
    var bestFranja = "";
    var prices = [];
    for(fra in bestFranges){
        for(franja in franges){
            if(bestFranges[fra] == franja){
                prices.push(franges[franja].price);
            }
        }
    }
    var inicio = bestFranges[0].split("-");
    var final = bestFranges[bestFranges.length - 1].split("-")
    bestFranja = inicio[0] + "h - " + final[1] + "h"
    var precioMedio = calcularPrecioMedio(prices);
    console.log("Horas del dia con mejor precio: " + bestFranja + " con una media de " + (precioMedio / 1000).toFixed(4) + "€/kWh");
}

function calcularPrecioMedio(precios) {
    var resultado = 0;
    for (precio in precios) {
        resultado += precios[precio];
    }
    return (resultado / precios.length);
}