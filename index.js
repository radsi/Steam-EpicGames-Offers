const axios = require("axios");
const express = require("express");
const app = express();

let discountSteamGames = {};
let freeEpicGames = {};

async function getSteamDiscountGames(){
    var gamesInfo = await axios.get("http://store.steampowered.com/api/featuredcategories/?l=spanish");
    gamesInfo.data.specials.items.forEach(game => {
        if(game.final_price < game.original_price){
            discountSteamGames[game.name] = {image: game.large_capsule_image, price: game.final_price, game_url: `https://store.steampowered.com/app/${game.id}`};
        }
    });
}

async function getFreeEpicGames(){
    var gamesInfo = await require("free-games")("es", "ES");
    gamesInfo.forEach(game => {
        if(game.price.totalPrice.discountPrice == 0){
            game.keyImages.forEach(x => {
                if(x.type == "Thumbnail"){
                    freeEpicGames[game.title] = {image: x.url, game_url: `https://store.epicgames.com/es-ES/p/${game.productSlug}`}
                }
            });
        }      
    });
}

app.listen(4488, ()=>{
    console.log("Server listening on port 3000");
});

app.get("/getSteam", async (req, res)=>{
    await getSteamDiscountGames();
    res.json(discountSteamGames);
});

app.get("/getEpic", async (req, res)=>{
    await getFreeEpicGames();
    res.json(freeEpicGames);
});
