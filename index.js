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
    var gamesInfo = await axios.get("http://store.steampowered.com/api/featuredcategories?l=spanish", {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}});
    gamesInfo.data.specials.items.forEach(game => {
        console.log(game)
        discountSteamGames[game.name] = {type: game.type, image: game.large_capsule_image, price: game.final_price, discount: game.discount_percent, original_price: st(String(game.original_price/100)), game_url: (game.type ? `https://store.steampowered.com/sub/${game.id}` : `https://store.steampowered.com/app/${game.id}`)};
    });
}

async function getFreeEpicGames(){
    var gamesInfo = await axios.get("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions", {headers: {'Content-Type': 'application/json','Cache-Control' : 'no-cache'}});
    gamesInfo.data.data.Catalog.searchStore.elements.forEach(game =>{
        if(game.promotions != null){
            game.keyImages.forEach(x => {
                if(x.type == "Thumbnail"){
                    freeEpicGames[game.title] = {image: x.url, game_url: `https://store.epicgames.com/es-ES/p/${(game.productSlug == null ? game.urlSlug : game.productSlug)}`}
                }
            });
        }
    });
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
