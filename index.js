const axios = require("axios");
const express = require("express");
const app = express();

let discountSteamGames = {};
let freeEpicGames = {};

async function getDiscountGames(){
    var gamesInfo = await axios.get("http://store.steampowered.com/api/featuredcategories/?l=spanish");
    var isFree;
    gamesInfo.data.specials.items.forEach(game => {
        if(game.final_price < game.original_price){
            discountSteamGames[game.name] = {image: game.large_capsule_image, price: game.final_price, game_url: `https://store.steampowered.com/app/${game.id}`};
        }
    });

    gamesInfo = await axios.get("https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions");



    gamesInfo.data.data.Catalog.searchStore.elements.forEach(game =>{
        game.categories.forEach(x => {
            if(x.path == "freegames"){
                var gameNameURL;
                game.customAttributes.forEach(catt => {
                    if(catt.key == "com.epicgames.app.productSlug"){
                        gameNameURL = x.value;
                    }
                });
                freeEpicGames[game.title] = {image: game.keyImages[2].url, game_url: `https://store.epicgames.com/es-ES/p/${gameNameURL}`}
            }
        });
    });

    
}

app.listen(4488, ()=>{
    getDiscountGames();
    console.log("Server listening on port 3000");
});

app.get("/getSteam", (req, res)=>{
    getDiscountGames();
    res.json(discountSteamGames);
});

app.get("/getEpic", (req, res)=>{
    getDiscountGames();
    res.json(freeEpicGames);
});
