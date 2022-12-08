const axios = require("axios");
const express = require("express");
const app = express();

let discountSteamGames = {};
let freeEpicGames = {};

function st(str){
    return str.replace(/./g, function(chr){
      return chr + '\u0336';
    });
}

async function getSteamDiscountGames(){
    var gamesInfo = await axios.get("http://store.steampowered.com/api/featuredcategories", {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}});
    gamesInfo = gamesInfo.data.specials.items;
    for(let i = 0; i < gamesInfo.length; i++){
        let amount = parseFloat(gamesInfo[i].final_price);
        let from = gamesInfo[i].currency;
        let to = "EUR";

        let exchangeData = await axios.get(`https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from}/${to}.json`);
        let toValue = exchangeData.data[to];
        let result = amount * toValue;
        discountSteamGames[gamesInfo[i].name] = {image: gamesInfo[i].large_capsule_image, price: result, discount: gamesInfo[i].discount_percent, original_price: st(String(result/100)), game_url: (gamesInfo[i].type ? `https://store.steampowered.com/sub/${gamesInfo[i].id}` : `https://store.steampowered.com/app/${gamesInfo[i].id}`)};
    }
}

async function getFreeEpicGames(){
    var gamesInfo = await axios.get("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions", {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}});
    gamesInfo = gamesInfo.data.data.Catalog.searchStore.elements;
    for(let i = 0; i < gamesInfo.length; i++){
        if(gamesInfo[i].promotions != null){
            gamesInfo[i].keyImages.forEach(x => {
                if(x.type == "Thumbnail"){
                    freeEpicGames[gamesInfo[i].title] = {image: x.url, game_url: `https://store.epicgames.com/es-ES/p/${(gamesInfo[i].productSlug == null ? gamesInfo[i].urlSlug : gamesInfo[i].productSlug)}`}
                }
            });
        }
    }
}

app.listen(4488, ()=>{
    console.log("Server listening on port 4488");
});

app.get("/getSteam", async (req, res)=>{
    discountSteamGames = {};
    await getSteamDiscountGames();
    res.json(discountSteamGames);
});

app.get("/getEpic", async (req, res)=>{
    freeEpicGames = {};
    await getFreeEpicGames();
    res.json(freeEpicGames);
});