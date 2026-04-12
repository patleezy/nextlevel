import { useState, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CONSOLE_META = {
  "Nintendo Switch":   { color: "#e60012", short: "Switch",   icon: "🔴" },
  "Nintendo Switch 2": { color: "#ff6b35", short: "Switch 2", icon: "🟠" },
  "PlayStation 5":     { color: "#0070cc", short: "PS5",      icon: "🔵" },
  "PS4/PS5":           { color: "#0070cc", short: "PS4/5",    icon: "🔵" },
  "Xbox":              { color: "#107c10", short: "Xbox",      icon: "🟢" },
  "PC":                { color: "#7c8fa6", short: "PC",        icon: "⬜" },
  "Mobile":            { color: "#8b5cf6", short: "Mobile",    icon: "🟣" },
};
const RATINGS = {
  "E":    { label: "Everyone",  color: "#22c55e", min: 0  },
  "E10+": { label: "Ages 10+",  color: "#f59e0b", min: 10 },
  "T":    { label: "Teen 13+",  color: "#f97316", min: 13 },
};
const PLAYTIME_LABEL = { short: "< 10 hrs", medium: "10–30 hrs", long: "30–80 hrs", endless: "Endless" };
const PLAYTIME_COLOR = { short: "#38bdf8", medium: "#a78bfa", long: "#f472b6", endless: "#4ade80" };
const CONSOLE_LIST = ["Nintendo Switch", "Nintendo Switch 2", "PlayStation 5", "PS4/PS5", "Xbox", "PC", "Mobile"];
const PRICE_RANGES = [{ label: "Free", max: 0 }, { label: "≤ $15", max: 15 }, { label: "≤ $40", max: 40 }, { label: "Any", max: Infinity }];
const GENRES = ["All","platformer","racing","sandbox","adventure","simulation","rpg","puzzle","casual","strategy","shooter","family","multiplayer","co-op","creative","relaxing","exploration","story","educational","sports","fitness","party","fighting","action","retro","social","rhythm","survival","collecting"];
const KID_EMOJIS = ["🦁","🐼","🦊","🐸","🐧","🦄","🐺","🐨","🐯","🦋"];
const SK_PROFILES = "nextlevel_profiles_v4";
const SK_WISHLIST  = "nextlevel_wishlist_v4";

function ageRating(age) { return age < 10 ? "E" : age < 13 ? "E10+" : "T"; }
function retailerUrl(g) {
  const c = g.consoles[0];
  const q = encodeURIComponent(g.title);
  if (c === "Nintendo Switch" || c === "Nintendo Switch 2")
    return `https://www.nintendo.com/us/search/#q=${q}&p=1&cat=gme&sort=df`;
  if (c === "PlayStation 5" || c === "PS4/PS5")
    return `https://store.playstation.com/en-us/search/${q}`;
  if (c === "Xbox")
    return `https://www.xbox.com/en-US/search/results/games?q=${q}`;
  if (c === "Mobile")
    return `https://apps.apple.com/us/iphone/search?term=${q}`;
  return `https://www.amazon.com/s?k=${q}+video+game`;
}

// ─── GAME DATABASE ────────────────────────────────────────────────────────────
const GAMES = [
  // Nintendo Switch exclusives
  { id:1,  title:"Mario Kart 8 Deluxe",                consoles:["Nintendo Switch"],                              excl:true,  genre:["racing","multiplayer","family"],     rating:"E",    price:60, slug:"mario-kart-8-deluxe",                     mc:92, ign:9.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The definitive kart racer — 96 courses, 4-player local, and endless replay. The Switch game every family owns.", quote:"Still the definitive kart racer. — IGN" },
  { id:2,  title:"Animal Crossing: New Horizons",       consoles:["Nintendo Switch"],                              excl:true,  genre:["simulation","family","casual"],      rating:"E",    price:60, slug:"animal-crossing",            mc:90, ign:9.0, time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Build your own island paradise at a relaxing pace. One of the most soothing games ever made for any age.", quote:"Radiates warmth and joy. — Metacritic" },
  { id:3,  title:"Super Mario Odyssey",                 consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","adventure"],   rating:"E",    price:60, slug:"super-mario-odyssey",                     mc:97, ign:10,  time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Mario's globe-trotting 3D adventure across wildly creative kingdoms. One of the highest-rated games ever made.", quote:"An absolute must-play. — IGN" },
  { id:4,  title:"Super Mario Bros. Wonder",            consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","multiplayer"], rating:"E",    price:60, slug:"super-mario-bros-wonder",                 mc:93, ign:9.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"The freshest 2D Mario in decades. Wonder Flowers transform every level into something brilliantly unexpected.", quote:"Mario's most creative 2D adventure in decades. — IGN" },
  { id:5,  title:"Super Mario 3D World + Bowser's Fury",consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","co-op"],       rating:"E",    price:60, slug:"super-mario-3d-world-bowsers-fury",        mc:89, ign:9.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Two great Mario games in one package. Bowser's Fury is an open-world adventure that's absolutely thrilling.", quote:"Two Mario masterpieces in one. — IGN" },
  { id:6,  title:"Zelda: Breath of the Wild",           consoles:["Nintendo Switch"],                              excl:true,  genre:["adventure","rpg","exploration"],     rating:"E10+", price:60, slug:"the-legend-of-zelda-breath-of-the-wild",  mc:97, ign:10,  time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"A breathtaking open-world adventure that redefined gaming. Exploration and discovery at every turn.", quote:"A new high-water mark for open-world design. — IGN" },
  { id:7,  title:"Zelda: Tears of the Kingdom",         consoles:["Nintendo Switch"],                              excl:true,  genre:["adventure","rpg","exploration"],     rating:"E10+", price:70, slug:"the-legend-of-zelda-breath-of-the-wild-sequel", mc:96, ign:10,  time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Build contraptions, soar the skies, explore a vast world. Somehow even better than its legendary predecessor.", quote:"One of the greatest games ever made. — IGN" },
  { id:8,  title:"Kirby and the Forgotten Land",        consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","action"],      rating:"E",    price:60, slug:"kirby-and-the-forgotten-land",            mc:85, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Adorable 3D platformer perfect for younger kids. Forgiving difficulty and 2-player co-op — endlessly welcoming.", quote:"Kirby's best adventure in years. — Metacritic" },
  { id:9,  title:"Luigi's Mansion 3",                   consoles:["Nintendo Switch"],                              excl:true,  genre:["adventure","puzzle","family"],       rating:"E",    price:60, slug:"luigis-mansion-3",                        mc:86, ign:8.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Spooky but not scary ghost-hunting fun. Great co-op, hilarious story — perfect for the Halloween season.", quote:"A ghostly delight for all ages. — IGN" },
  { id:10, title:"Super Smash Bros. Ultimate",          consoles:["Nintendo Switch"],                              excl:true,  genre:["fighting","family","multiplayer"],   rating:"E10+", price:60, slug:"super-smash-bros-ultimate",               mc:93, ign:9.4, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The ultimate crossover party fighter with 80+ characters. Epic for family game nights — everyone finds a favorite.", quote:"The definitive party fighter. — IGN" },
  { id:11, title:"Mario Party Superstars",              consoles:["Nintendo Switch"],                              excl:true,  genre:["party","family","multiplayer"],      rating:"E",    price:60, slug:"mario-party-superstars",                  mc:79, ign:7.5, time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"100 beloved minigames on classic boards. The best Mario Party in years — instant family game night hit.", quote:"The best Mario Party in years. — Nintendo Life" },
  { id:12, title:"Mario Party Jamboree",                consoles:["Nintendo Switch"],                              excl:true,  genre:["party","family","multiplayer"],      rating:"E",    price:60, slug:"super-mario-party-jamboree",              mc:82, ign:8.0, time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"7 boards, 110+ minigames — the biggest Mario Party ever. Best-in-series for pure party chaos.", quote:"Mario Party's finest hour. — Nintendo Life" },
  { id:13, title:"Splatoon 3",                          consoles:["Nintendo Switch"],                              excl:true,  genre:["shooter","competitive","family"],    rating:"E10+", price:60, slug:"splatoon-3",                              mc:83, ign:8.0, time:"endless", coop:true,  sib:false, pk:false, soon:false, desc:"Kid-friendly ink shooter with colorful chaos and surprisingly deep competitive strategy.", quote:"The freshest shooter franchise around. — IGN" },
  { id:14, title:"Pokémon Scarlet & Violet",            consoles:["Nintendo Switch"],                              excl:true,  genre:["rpg","adventure","family"],          rating:"E",    price:60, slug:"pokemon-scarletviolet",                         mc:72, ign:7.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Open-world Pokémon with hundreds of creatures to catch. Kids love the freedom to explore at their own pace.", quote:"A bold new direction for the franchise. — IGN" },
  { id:15, title:"Pokémon Legends: Arceus",             consoles:["Nintendo Switch"],                              excl:true,  genre:["rpg","adventure","exploration"],     rating:"E10+", price:60, slug:"pokemon-legends-arceus",                  mc:83, ign:8.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"A bold reinvention of Pokémon — catch Pokémon in an open ancient world. More action-focused and genuinely fresh.", quote:"Pokémon's most exciting evolution in years. — IGN" },
  { id:16, title:"Pikmin 4",                            consoles:["Nintendo Switch"],                              excl:true,  genre:["strategy","adventure","puzzle"],     rating:"E",    price:60, slug:"pikmin-4",                                mc:87, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Command tiny Pikmin to explore a miniature world. Utterly charming, brilliantly designed, and deeply satisfying.", quote:"Pikmin's finest hour. — IGN" },
  { id:17, title:"Ring Fit Adventure",                  consoles:["Nintendo Switch"],                              excl:true,  genre:["fitness","adventure","rpg"],         rating:"E",    price:80, slug:"ringfit-adventure",                      mc:83, ign:8.0, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"A full RPG adventure where exercise is your weapon. Gets kids genuinely active — sneaky brilliant parenting.", quote:"Exercise has never been this fun. — Nintendo Life" },
  { id:18, title:"Yoshi's Crafted World",               consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","casual"],      rating:"E",    price:60, slug:"yoshi-2018",                    mc:75, ign:7.2, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Adorable cardboard-craft world perfect for young children. Gentle difficulty — great for ages 4 and up.", quote:"A joyful adventure for the youngest players. — Metacritic" },
  { id:19, title:"Donkey Kong Country: Tropical Freeze",consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","action"],      rating:"E",    price:60, slug:"donkey-kong-country-tropical-freeze",      mc:83, ign:8.3, time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"Gorgeous and challenging platformer. Funky Kong mode makes it accessible for younger players too.", quote:"A stunning platformer with heart. — IGN" },
  { id:20, title:"Disney Illusion Island",              consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","co-op"],       rating:"E",    price:40, slug:"disney-illusion-island",                  mc:75, ign:7.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Gorgeous Disney 4-player platformer starring Mickey and friends. Perfect for young children.", quote:"A charming adventure for the whole family. — Nintendo Life" },
  { id:21, title:"Snipperclips Plus",                   consoles:["Nintendo Switch"],                              excl:true,  genre:["puzzle","co-op","family"],           rating:"E",    price:30, slug:"snipperclips-plus-cut-it-out-together",                       mc:82, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Cut shapes out of each other to solve puzzles. Brilliantly creative and original — nothing else like it.", quote:"One of Switch's most original games. — Nintendo Life" },
  { id:22, title:"Captain Toad: Treasure Tracker",      consoles:["Nintendo Switch"],                              excl:true,  genre:["puzzle","family","adventure"],       rating:"E",    price:40, slug:"captain-toad-treasure-tracker",           mc:81, ign:7.8, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Rotate diorama levels to find a path. No jumping required — great for very young kids.", quote:"A wonderfully charming puzzle adventure. — Nintendo Life" },
  { id:23, title:"Clubhouse Games: 51 Worldwide",       consoles:["Nintendo Switch"],                              excl:true,  genre:["party","casual","family"],           rating:"E",    price:40, slug:"clubhouse-games-51-worldwide-classics",    mc:79, ign:7.8, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"51 classics: chess, mahjong, darts, bowling and more. Incredible value for any family game night.", quote:"The ultimate party game collection. — Nintendo Life" },
  { id:24, title:"Kirby's Return to Dream Land DX",     consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","co-op"],       rating:"E",    price:60, slug:"kirbys-return-to-dream-land-deluxe",      mc:82, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Classic Kirby platforming remastered with four-player co-op. Perfect for families with young kids.", quote:"A charming remaster of a Kirby classic. — Nintendo Life" },
  // Multi-platform Console
  { id:25, title:"Minecraft",                           consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["sandbox","creative","adventure"],    rating:"E10+", price:30, slug:"minecraft",                               mc:93, ign:9.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The world's best-selling game. Endless creativity on every platform — kids never run out of things to build.", quote:"The world's greatest sandbox. Timeless. — IGN" },
  { id:26, title:"Stardew Valley",                      consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["simulation","rpg","casual"],        rating:"E",    price:15, slug:"stardew-valley",                          mc:89, ign:9.0, time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Run your own farm, build relationships, explore caves. Endlessly relaxing and rewarding — loved by all ages.", quote:"A masterpiece of cozy design. — IGN" },
  { id:27, title:"Terraria",                            consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["sandbox","adventure","rpg"],        rating:"E10+", price:10, slug:"terraria",                                mc:83, ign:9.0, time:"endless", coop:true,  sib:true,  pk:false, soon:false, desc:"2D mining-crafting-adventure with enormous depth. Kids get completely lost in this world — incredible value.", quote:"One of the greatest games for its price. — Metacritic" },
  { id:28, title:"Cuphead",                             consoles:["Nintendo Switch","Xbox","PC"],                  excl:false, genre:["action","platformer","challenging"],rating:"E10+", price:20, slug:"cuphead",                                 mc:88, ign:8.5, time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"1930s cartoon art with brutally hard boss fights. Stunning — best for patient older kids who love a real challenge.", quote:"A gorgeous, punishing masterpiece. — IGN" },
  { id:29, title:"Celeste",                             consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["platformer","story","challenging"],  rating:"E10+", price:20, slug:"celeste",                                 mc:94, ign:10,  time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Masterful precision platformer about climbing a mountain and overcoming anxiety. A game that genuinely matters.", quote:"A masterpiece of design and storytelling. — IGN" },
  { id:30, title:"Hollow Knight",                       consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","action","exploration"],  rating:"E10+", price:15, slug:"hollow-knight",                           mc:87, ign:9.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Deep atmospheric bug-kingdom adventure. Challenging but fair — one of the best indie games ever made.", quote:"A haunting, beautiful masterwork. — IGN" },
  { id:31, title:"Shovel Knight: Treasure Trove",       consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["platformer","adventure","retro"],    rating:"E10+", price:25, slug:"shovel-knight-treasure-trove",            mc:90, ign:9.0, time:"long",    coop:true,  sib:false, pk:true,  soon:false, desc:"Four full retro platformers in one brilliant package. Genuinely classic game design for all ages.", quote:"A love letter to classic gaming. — IGN" },
  { id:32, title:"Sonic Mania",                         consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["platformer","racing","retro"],       rating:"E",    price:20, slug:"sonic-mania",                             mc:87, ign:8.5, time:"short",   coop:true,  sib:false, pk:true,  soon:false, desc:"The best Sonic game in decades. Pure joyful speed with brilliant level design — a love letter to classic Sonic.", quote:"The Sonic game fans waited 25 years for. — IGN" },
  { id:33, title:"Undertale",                           consoles:["Nintendo Switch","PS4/PS5","PC"],               excl:false, genre:["rpg","story","adventure"],           rating:"E10+", price:10, slug:"undertale",                               mc:92, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Revolutionary RPG where you can befriend every enemy. A heartwarming, genre-defining classic for older kids.", quote:"A modern classic that everyone should play. — IGN" },
  { id:34, title:"Overcooked! All You Can Eat",         consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["co-op","party","family"],           rating:"E",    price:40, slug:"overcooked-all-you-can-eat",              mc:79, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Frantic cooperative cooking chaos. You will argue, laugh, and immediately want to play again.", quote:"The ultimate co-op party game. — Metacritic" },
  { id:35, title:"It Takes Two",                        consoles:["PS4/PS5","Xbox","PC"],                          excl:false, genre:["adventure","family","co-op"],        rating:"E10+", price:30, slug:"it-takes-two",                            mc:89, ign:9.0, time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"GOTY winner built for exactly two players. Every level is wildly inventive — the ideal game to play WITH your child.", quote:"The best co-op game ever made. Period. — IGN" },
  { id:36, title:"LEGO Star Wars: Skywalker Saga",      consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","family","co-op"],        rating:"E10+", price:60, slug:"lego-star-wars-the-sywalker-saga",        mc:75, ign:8.0, time:"long",    coop:true,  sib:true,  pk:true,  soon:false, desc:"All nine Star Wars films in one enormous LEGO game. Hundreds of hours for Star Wars fans of all ages.", quote:"The definitive LEGO game. — IGN" },
  { id:37, title:"LEGO Harry Potter Collection",        consoles:["Nintendo Switch","PS4/PS5","Xbox"],             excl:false, genre:["adventure","family","co-op"],        rating:"E10+", price:30, slug:"lego-harry-potter-collection",            mc:76, ign:7.5, time:"long",    coop:true,  sib:true,  pk:true,  soon:false, desc:"Seven Harry Potter films in LEGO form with local co-op. A must-have for any young wizard fan.", quote:"A magical LEGO adventure. — Nintendo Life" },
  { id:38, title:"Moving Out",                          consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["co-op","party","comedy"],            rating:"E",    price:25, slug:"moving-out",                              mc:79, ign:7.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Chaotic furniture-moving co-op. Throw couches through windows — endlessly funny for the whole family.", quote:"Hilariously chaotic co-op fun. — Nintendo Life" },
  { id:39, title:"Spiritfarer",                         consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["simulation","story","casual"],       rating:"E",    price:30, slug:"spiritfire",                             mc:84, ign:8.5, time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"A cozy management game about ferrying spirits. Surprisingly touching — a genuinely emotional shared experience.", quote:"A beautiful game about letting go. — IGN" },
  { id:40, title:"Ori and the Will of the Wisps",       consoles:["Xbox","PC","Nintendo Switch"],                  excl:false, genre:["platformer","adventure","story"],    rating:"E",    price:30, slug:"ori-and-the-will-of-the-wisps",           mc:90, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Breathtakingly beautiful emotional platformer. Stunning visuals, tight controls, deeply moving story.", quote:"One of the most beautiful games ever made. — IGN" },
  { id:41, title:"Crash Bandicoot N. Sane Trilogy",     consoles:["Nintendo Switch","PS4/PS5","Xbox"],             excl:false, genre:["platformer","family","action"],      rating:"E",    price:20, slug:"crash-bandicoot-n-sane-trilogy",           mc:80, ign:7.8, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Three classic platformers remastered beautifully. Great value for kids wanting a real challenge.", quote:"A faithful, beautiful remaster. — IGN" },
  { id:42, title:"Spyro Reignited Trilogy",             consoles:["Nintendo Switch","PS4/PS5","Xbox"],             excl:false, genre:["platformer","adventure","family"],   rating:"E",    price:20, slug:"spyro-reignited-trilogy",                 mc:82, ign:8.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Three beloved dragon adventures lovingly remade. Colorful, charming, and perfect for younger kids.", quote:"Spyro never looked this good. — IGN" },
  { id:43, title:"Among Us",                            consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["multiplayer","casual","social"],     rating:"E10+", price:0,  slug:"among-us",                                mc:85, ign:8.0, time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"Find the impostor! Hilarious social deduction with friends and family — teaches critical thinking.", quote:"A social experience unlike any other. — Metacritic" },
  { id:44, title:"Rocket League",                       consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["sports","racing","competitive"],     rating:"E",    price:0,  slug:"rocket-league",                           mc:86, ign:9.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Cars playing soccer — free to play and instantly addictive. Easy to learn, endlessly deep to master.", quote:"The most brilliantly designed sports game in years. — IGN" },
  { id:45, title:"Fall Guys",                           consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["party","casual","competitive"],      rating:"E",    price:0,  slug:"fall-guys",             mc:80, ign:8.0, time:"endless", coop:false, sib:true,  pk:false, soon:false, desc:"Chaotic battle royale of silly obstacle courses. Free to play and impossible not to smile at.", quote:"Pure, joyful chaos. — IGN" },
  { id:46, title:"Katamari Damacy REROLL",              consoles:["Nintendo Switch","PS4/PS5","PC"],               excl:false, genre:["puzzle","casual","family"],          rating:"E",    price:30, slug:"katamari-damacy-reroll",                  mc:78, ign:8.0, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Roll a sticky ball collecting increasingly large objects. Pure, weird, wonderful joy unlike anything else.", quote:"Pure, weird, wonderful fun. — Metacritic" },
  { id:47, title:"Crash Team Racing: Nitro-Fueled",     consoles:["Nintendo Switch","PS4/PS5"],                    excl:false, genre:["racing","family","multiplayer"],     rating:"E",    price:40, slug:"crash-team-racing-nitro-fueled",          mc:81, ign:8.3, time:"long",    coop:true,  sib:true,  pk:true,  soon:false, desc:"Brilliant kart racer loaded with content. The best Mario Kart alternative for PlayStation families.", quote:"The best kart racer on PS4. — IGN" },
  { id:48, title:"Minecraft Dungeons",                  consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["action","rpg","co-op"],             rating:"E10+", price:20, slug:"minecraft-dungeons",                      mc:74, ign:7.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Dungeon crawler in the Minecraft universe. Simple controls great for kids with 4-player local co-op.", quote:"A fun spin-off for younger Minecraft fans. — Metacritic" },
  { id:49, title:"Psychonauts 2",                       consoles:["Xbox","PS4/PS5","PC"],                          excl:false, genre:["platformer","adventure","story"],    rating:"E10+", price:40, slug:"psychonauts-2",                           mc:90, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Wildly creative 3D platformer set inside people's minds. Funny, touching, and unlike anything else.", quote:"One of the most creative games ever made. — IGN" },
  // Nintendo Switch 2
  { id:50, title:"Mario Kart World",                    consoles:["Nintendo Switch 2"],                            excl:true,  genre:["racing","family","multiplayer"],     rating:"E",    price:80, slug:"mario-kart-world",                        mc:87, ign:8.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The definitive Mario Kart — race through a massive open world connecting every track. A quantum leap for the franchise.", quote:"The future of kart racing is here. — IGN" },
  { id:51, title:"Donkey Kong Bananza",                 consoles:["Nintendo Switch 2"],                            excl:true,  genre:["platformer","adventure","family"],   rating:"E",    price:70, slug:"donkey-kong-bananza",                     mc:91, ign:10,  time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"DK's massive next-gen adventure with fully destructible environments. A platformer landmark on Switch 2.", quote:"DK's most memorable adventure in years. A true Switch 2 masterpiece. — IGN" },
  { id:52, title:"Metroid Prime 4: Beyond",             consoles:["Nintendo Switch","Nintendo Switch 2"],          excl:true,  genre:["adventure","action","exploration"],  rating:"T",    price:60, slug:"metroid-prime-4",                         mc:81,   ign:8.0,  time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Samus returns in a stunning first-person adventure. The Metroid game fans have waited nearly two decades for.", quote:"Reaches heights worthy of the Metroid name. — IGN" },
  { id:53, title:"Zelda: Echoes of Wisdom",             consoles:["Nintendo Switch"],                            excl:true,  genre:["adventure","puzzle","rpg"],          rating:"E10+", price:70, slug:"zelda-echoes-of-wisdom",                  mc:86, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Play as Princess Zelda herself. Summon echoes of objects and enemies to solve puzzles in a fresh 2D adventure.", quote:"A fresh, clever take on Zelda. — IGN" },
  { id:54, title:"Pokémon Legends: Z-A",                consoles:["Nintendo Switch 2"],                            excl:true,  genre:["rpg","adventure","exploration"],     rating:"E",    price:70, slug:"pokemon-legends-z-a",                      mc:79, ign:8.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"A bold new Pokémon adventure set in urban Lumiose City. The franchise's most ambitious world yet.", quote:"Pokémon's most ambitious world yet. — IGN" },
  { id:55, title:"Kirby Air Riders",                    consoles:["Nintendo Switch 2"],                            excl:true,  genre:["racing","family","casual"],          rating:"E",    price:70, slug:"kirby-air-riders",                        mc:78, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Kirby's return to air-riding with gorgeous visuals. Family-friendly racing perfect for young kids.", quote:"The Kirby racing game we always wanted. — Nintendo Life" },
  { id:152, title:"Mario Tennis Fever",                 consoles:["Nintendo Switch 2"],                            excl:true,  genre:["sports","multiplayer","family"],      rating:"E",    price:70, slug:"mario-tennis-fever",                      mc:77, ign:7.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Fast-paced tennis with Mario characters and up to 4-player local multiplayer. Motion controls with Joy-Con make it instantly fun for the whole family.", quote:"A fun family sports game that shines in multiplayer. — Nintendo Life" },
  // PlayStation exclusives
  { id:56, title:"Astro Bot",                           consoles:["PlayStation 5"],                                excl:true,  genre:["platformer","family","adventure"],   rating:"E",    price:60, slug:"astro-bot",                               mc:94, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"The best platformer in years. A love letter to gaming history packed with secrets, creativity, and pure joy.", quote:"A platform game for the ages. — IGN" },
  { id:57, title:"Astro's Playroom",                    consoles:["PlayStation 5"],                                excl:true,  genre:["platformer","family","casual"],      rating:"E",    price:0,  slug:"astros-playroom",                         mc:83, ign:8.5, time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Free with every PS5! The best pack-in game ever made — brilliantly showcases the DualSense controller.", quote:"The best pack-in game ever made. — IGN" },
  { id:58, title:"Ratchet & Clank: Rift Apart",         consoles:["PlayStation 5","PC"],                           excl:false, genre:["platformer","adventure","action"],   rating:"E10+", price:40, slug:"ratchet-clank-rift-apart",               mc:88, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Dimension-hopping action platformer that looks like a Pixar movie. Perfectly crafted — one of the best PS5 exclusives. Now on PC too.", quote:"Stunning, brilliant, and a must-play for PS5 owners. — IGN" },
  { id:59, title:"Sackboy: A Big Adventure",            consoles:["PS4/PS5"],                                      excl:true,  genre:["platformer","family","co-op"],       rating:"E",    price:35, slug:"sackboy-a-big-adventure",                 mc:80, ign:8.0, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Charming 3D platformer with great 4-player co-op. Beautiful visuals and music-themed levels everyone will love.", quote:"Sony's best family platformer in years. — Metacritic" },
  { id:60, title:"Spider-Man: Miles Morales",           consoles:["PS4/PS5"],                                      excl:true,  genre:["adventure","action","story"],        rating:"T",    price:40, slug:"marvels-spider-man-miles-morales",         mc:85, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Heartfelt superhero adventure with stunning swinging and combat. The perfect game for teen Spider-Man fans.", quote:"A smaller, more personal masterpiece. — IGN" },
  { id:61, title:"Horizon: Forbidden West",             consoles:["PS4/PS5","PC"],                                 excl:false, genre:["adventure","rpg","exploration"],     rating:"T",    price:60, slug:"horizon-zero-dawn-2",                  mc:88, ign:9.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Hunt robotic dinosaurs across a stunning post-apocalyptic world. Spectacular for older teens — now on PS4/PS5 and PC.", quote:"A stunning, gorgeous adventure. — IGN" },
  // Xbox exclusives
  { id:62, title:"Forza Horizon 5",                     consoles:["Xbox","PC"],                                    excl:true,  genre:["racing","family","simulation"],      rating:"E",    price:60, slug:"forza-horizon-5",                         mc:92, ign:9.0, time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"Best open-world racing game ever made. Explore stunning Mexico with hundreds of cars — gorgeous and endlessly fun.", quote:"The pinnacle of open-world racing. — IGN" },
  { id:63, title:"Sea of Thieves",                      consoles:["Xbox","PC"],                                    excl:true,  genre:["adventure","multiplayer","family"],  rating:"T",    price:0,  slug:"sea-of-thieves",                          mc:69, ign:7.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Sail as a pirate crew with friends or family. On Game Pass — one of the best shared adventures in gaming.", quote:"The best pirate game around. — Metacritic" },
  { id:64, title:"Grounded",                            consoles:["Xbox","PC"],                                    excl:true,  genre:["survival","adventure","co-op"],      rating:"E10+", price:40, slug:"grounded",                                mc:80, ign:8.0, time:"long",    coop:true,  sib:true,  pk:true,  soon:false, desc:"Survive in a backyard shrunk to tiny size — Honey I Shrunk the Kids meets Minecraft. Creative and fun.", quote:"A delightful survival sandbox. — IGN" },
  // Mobile
  { id:65, title:"Minecraft (Mobile)",                  consoles:["Mobile"],                                       excl:false, genre:["sandbox","creative","adventure"],    rating:"E10+", price:7,  slug:"minecraft",                               mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The full Minecraft experience in your pocket with cross-platform play — kids can join their console friends.", quote:"The definitive mobile sandbox. — App Store" },
  { id:66, title:"Alto's Odyssey",                      consoles:["Mobile"],                                       excl:false, genre:["casual","adventure","relaxing"],     rating:"E",    price:5,  slug:"altos-odyssey",                           mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Serene sandboarding runner with gorgeous evolving art. Completely stress-free and mesmerizing for all ages.", quote:"A meditative mobile masterpiece. — App Store" },
  { id:67, title:"Monument Valley 2",                   consoles:["Mobile"],                                       excl:false, genre:["puzzle","family","story"],           rating:"E",    price:5,  slug:"monument-valley-2",                       mc:null,ign:null,time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Magical optical illusion puzzles with a beautiful mother-daughter story. One of mobile gaming's finest achievements.", quote:"A mobile masterpiece of art and design. — App Store" },
  { id:68, title:"Monument Valley 3",                   consoles:["Mobile"],                                       excl:false, genre:["puzzle","family","story"],           rating:"E",    price:0,  slug:"monument-valley-3",                       mc:null,ign:null,time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Stunning third chapter, free on Netflix Games. A feast for the eyes and brain.", quote:"The most beautiful puzzle game. — Netflix Games" },
  { id:69, title:"Toca Boca World",                     consoles:["Mobile"],                                       excl:false, genre:["simulation","family","creative"],    rating:"E",    price:0,  slug:"toca-life-world",                         mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Safe open-ended pretend play for young kids. No ads, no inappropriate content — the gold standard of kids' apps.", quote:"Gold standard of kids' creative apps. — Common Sense Media" },
  { id:70, title:"Pokémon GO",                          consoles:["Mobile"],                                       excl:false, genre:["adventure","family","exploration"],  rating:"E",    price:0,  slug:"pokemon-go",                              mc:null,ign:null,time:"endless", coop:false, sib:true,  pk:true,  soon:false, desc:"Catch Pokémon in the real world. Gets kids outside and walking — genuinely great for the whole family.", quote:"Walking never felt this rewarding. — Common Sense Media" },
  { id:71, title:"Roblox",                              consoles:["Mobile"],                                       excl:false, genre:["sandbox","family","multiplayer"],    rating:"E10+", price:0,  slug:"roblox",                                  mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:false, soon:false, desc:"Millions of user-made games in one app. Extremely social — best with parental supervision and spending limits set.", quote:"The YouTube of gaming platforms. — Common Sense Media" },
  { id:72, title:"Stardew Valley (Mobile)",             consoles:["Mobile"],                                       excl:false, genre:["simulation","rpg","casual"],         rating:"E10+", price:5,  slug:"stardew-valley",                          mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"The full Stardew Valley experience on mobile. Endlessly charming farm-life RPG for any age.", quote:"The best $5 you'll spend on mobile. — App Store" },
  { id:73, title:"Bloons TD 6",                         consoles:["Mobile"],                                       excl:false, genre:["strategy","casual","family"],        rating:"E",    price:7,  slug:"bloons-td-6",                             mc:null,ign:null,time:"endless", coop:true,  sib:false, pk:false, soon:false, desc:"Hugely popular colorful tower defense. Clean content, surprisingly deep strategy, tons of updates.", quote:"Best tower defense on mobile. — App Store" },
  { id:74, title:"Sky: Children of the Light",          consoles:["Mobile"],                                       excl:false, genre:["adventure","exploration","social"],  rating:"E",    price:0,  slug:"sky-light-awaits",               mc:null,ign:null,time:"endless", coop:true,  sib:false, pk:true,  soon:false, desc:"Beautiful social adventure through the sky. Gentle, collaborative, and visually stunning — unlike anything else.", quote:"Unlike anything else on mobile. — App Store" },
  { id:75, title:"Geometry Dash",                       consoles:["Mobile"],                                       excl:false, genre:["platformer","rhythm","casual"],      rating:"E",    price:2,  slug:"geometry-dash",                           mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Rhythm-based platformer with pulsing music. Incredibly addictive — great for older kids.", quote:"One of mobile's finest rhythm games. — App Store" },
  { id:76, title:"Kingdom Rush Frontiers",              consoles:["Mobile"],                                       excl:false, genre:["strategy","casual","family"],        rating:"E10+", price:3,  slug:"kingdom-rush-frontiers",                  mc:null,ign:null,time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"One of the best tower defense games ever. Deep strategy in a fun fantasy skin.", quote:"Gold standard of mobile tower defense. — App Store" },
  { id:77, title:"Florence",                            consoles:["Mobile"],                                       excl:false, genre:["story","casual","family"],           rating:"E",    price:3,  slug:"florence",                                mc:null,ign:null,time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"An Oscar-winning interactive story about falling in love. Beautiful and emotionally resonant for older kids.", quote:"A masterpiece of interactive storytelling. — App Store" },
  { id:78, title:"Mini Metro",                          consoles:["Mobile"],                                       excl:false, genre:["strategy","puzzle","casual"],        rating:"E",    price:5,  slug:"mini-metro",                              mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Design a subway network before it gets overwhelmed. Relaxing, clever, and quietly educational.", quote:"A perfect mobile puzzle game. — App Store" },
  { id:79, title:"Pokémon TCG Pocket",                  consoles:["Mobile"],                                       excl:false, genre:["strategy","collecting","casual"],    rating:"E",    price:0,  slug:"pokemon-tcg-pocket",         mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Collect and battle with Pokémon cards digitally. Beautifully crafted, free to play, and deeply satisfying.", quote:"A brilliant digital card game. — App Store" },
  { id:80, title:"Prodigy Math",                        consoles:["Mobile"],                                       excl:false, genre:["educational","rpg","casual"],        rating:"E",    price:0,  slug:"prodigy-math-game",                       mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Math RPG that's genuinely educational. Kids solve math problems to battle monsters — they learn without realizing it.", quote:"Makes math genuinely fun. — Common Sense Media" },
  { id:81, title:"Khan Academy Kids",                   consoles:["Mobile"],                                       excl:false, genre:["educational","casual","family"],     rating:"E",    price:0,  slug:"khan-academy-kids",                       mc:null,ign:null,time:"short",   coop:false, sib:false, pk:false, soon:false, desc:"Free educational app for early learners covering reading, math, and social skills. A genuine parent favorite.", quote:"Best free educational app. — Common Sense Media" },
  { id:82, title:"Stumble Guys",                        consoles:["Mobile"],                                       excl:false, genre:["party","casual","multiplayer"],      rating:"E",    price:0,  slug:"stumble-guys",                            mc:null,ign:null,time:"short",   coop:false, sib:true,  pk:false, soon:false, desc:"Mobile Fall Guys clone that's just as chaotic and fun. Free and completely kid-friendly.", quote:"Best free party game on mobile. — App Store" },
  { id:83, title:"Alto's Adventure",                    consoles:["Mobile"],                                       excl:false, genre:["casual","adventure","relaxing"],     rating:"E",    price:5,  slug:"altos-adventure",                         mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"The original snowboarding runner — peaceful, beautiful, and endlessly replayable. A true mobile classic.", quote:"A mobile classic. — App Store" },
  { id:84, title:"Oceanhorn 2",                         consoles:["Mobile"],                                       excl:false, genre:["adventure","rpg","exploration"],     rating:"E10+", price:7,  slug:"oceanhorn-2-knights-of-the-lost-realm",   mc:null,ign:null,time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Zelda-inspired mobile adventure with stunning visuals. The closest thing to a full console RPG on mobile.", quote:"The closest thing to Zelda on mobile. — App Store" },
  { id:85, title:"Heads Up!",                           consoles:["Mobile"],                                       excl:false, genre:["party","family","social"],           rating:"E",    price:1,  slug:"heads-up",                                mc:null,ign:null,time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"Ellen's hilarious guessing game — one of the best family party games you can play on a single device.", quote:"The ultimate family party game app. — App Store" },
  { id:86, title:"DragonBox Algebra",                   consoles:["Mobile"],                                       excl:false, genre:["educational","puzzle","family"],     rating:"E",    price:5,  slug:"dragonbox-algebra-5",                     mc:null,ign:null,time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Teaches algebra through intuitive visual puzzles. Kids genuinely learn without realizing it — brilliant design.", quote:"The smartest educational game ever made. — Common Sense Media" },
  { id:87, title:"Marvel Snap",                         consoles:["Mobile"],                                       excl:false, genre:["strategy","collecting","casual"],    rating:"E10+", price:0,  slug:"marvel-snap",                             mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Fast, brilliant card game with Marvel heroes. Quick 3-minute matches perfect for older kids.", quote:"The best mobile card game in years. — App Store" },
  { id:88, title:"Toca Life World",                     consoles:["Mobile"],                                       excl:false, genre:["simulation","family","creative"],    rating:"E",    price:0,  slug:"toca-life-world",                         mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Creative open-ended play in a connected world. Perfect for imaginative younger kids.", quote:"Creative play at its finest. — Common Sense Media" },
  { id:89, title:"Duolingo",                            consoles:["Mobile"],                                       excl:false, genre:["educational","casual","family"],     rating:"E",    price:0,  slug:"duolingo",                                mc:null,ign:null,time:"short",   coop:false, sib:false, pk:false, soon:false, desc:"Learn a new language through gamified lessons. Genuinely educational, genuinely fun, and completely free.", quote:"The world's best language learning app. — Common Sense Media" },
  { id:90, title:"Mini Golf King",                      consoles:["Mobile"],                                       excl:false, genre:["sports","casual","competitive"],     rating:"E",    price:0,  slug:"mini-golf-king-multiplayer",                          mc:null,ign:null,time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"Multiplayer mini-golf with beautiful courses. Simple enough for the whole family to enjoy together.", quote:"Best mobile mini-golf game. — App Store" },

  // ── Nintendo Switch Additions ──────────────────────────────────────────────────
  { id:91, title:"Paper Mario: The Thousand-Year Door",  consoles:["Nintendo Switch"],                              excl:true,  genre:["rpg","adventure","story"],           rating:"E",    price:60, slug:"paper-mario-the-thousand-year-door",       mc:88, ign:8.5, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"The beloved GameCube RPG remade in stunning style. Witty writing, inventive battles, and a great adventure for kids who love stories.", quote:"A gorgeous, faithful revival of a classic. — IGN" },
  { id:92, title:"Princess Peach: Showtime!",            consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","family","adventure"],    rating:"E",    price:60, slug:"princess-peach-showtime",                 mc:71, ign:7.0, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Peach takes center stage in charming costume-swapping adventures. A delightful pick for younger kids who love variety.", quote:"A sweet, accessible adventure for young players. — Nintendo Life" },
  { id:93, title:"WarioWare: Move It!",                  consoles:["Nintendo Switch"],                              excl:true,  genre:["party","family","casual"],           rating:"E",    price:50, slug:"warioware-move-it",                       mc:76, ign:7.5, time:"short",   coop:true,  sib:true,  pk:true,  soon:false, desc:"200+ frantic microgames using Joy-Con motion. Completely chaotic and hilarious — a guaranteed crowd-pleaser for all ages.", quote:"Party gold in the hands of the right group. — Nintendo Life" },
  { id:94, title:"Pikmin 3 Deluxe",                      consoles:["Nintendo Switch"],                              excl:true,  genre:["strategy","adventure","family"],     rating:"E",    price:60, slug:"pikmin-3-deluxe",                         mc:82, ign:8.5, time:"medium",  coop:true,  sib:false, pk:true,  soon:false, desc:"Command tiny Pikmin in a fruit-collecting adventure. Beautiful, charming, and sneakily great for kids learning to plan ahead.", quote:"A gorgeous, accessible strategy gem. — IGN" },
  { id:95, title:"New Pokémon Snap",                     consoles:["Nintendo Switch"],                              excl:true,  genre:["adventure","family","casual"],       rating:"E",    price:60, slug:"new-pokemon-snap",                        mc:80, ign:8.0, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"Photograph Pokémon living freely in the wild. A uniquely relaxing game — kids will squeal with delight at every new discovery.", quote:"A charming return to a beloved formula. — IGN" },
  { id:96, title:"Mario vs. Donkey Kong",                consoles:["Nintendo Switch"],                              excl:true,  genre:["puzzle","platformer","family"],      rating:"E",    price:50, slug:"mario-vs-donkey-kong",                    mc:73, ign:7.0, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Clever 2D puzzle-platformer remade for Switch. Guide mini Marios to safety in progressively tricky levels. Perfect for younger kids.", quote:"A polished, charming remake of a forgotten gem. — Nintendo Life" },
  { id:97, title:"Nintendo Switch Sports",               consoles:["Nintendo Switch"],                              excl:true,  genre:["sports","family","fitness"],         rating:"E",    price:50, slug:"nintendo-switch-sports",                  mc:73, ign:7.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Six sports using Joy-Con motion: soccer, tennis, bowling and more. Gets the whole family off the couch — a spiritual Wii Sports sequel.", quote:"The Wii Sports successor the family room needed. — Nintendo Life" },
  { id:98, title:"Kirby's Dream Buffet",                 consoles:["Nintendo Switch"],                              excl:true,  genre:["party","racing","family"],           rating:"E",    price:15, slug:"kirbys-dream-buffet",                     mc:63, ign:6.5, time:"short",   coop:true,  sib:true,  pk:false, soon:false, desc:"Tiny Kirby rolls through obstacle courses eating food in adorable 4-player races. Budget-friendly chaos for game nights.", quote:"Simple, sweet party fun. — Nintendo Life" },

  // ── Switch 2 Additions ─────────────────────────────────────────────────────────
  { id:99, title:"Sonic Racing: CrossWorlds",            consoles:["Nintendo Switch 2","PlayStation 5","Xbox","PC"],excl:false, genre:["racing","family","multiplayer"],     rating:"E",    price:60, slug:"sonic-racing-crossworlds",                mc:82, ign:8.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Sonic's new kart racer explodes across multiple game universes. Fast, flashy, and packed with SEGA fan service for the whole family.", quote:"A seriously fun kart racer with loads of personality. — IGN" },

  // ── Multi-Platform Additions ───────────────────────────────────────────────────
  { id:100, title:"Sea of Stars",                        consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["rpg","adventure","story"],           rating:"E10+", price:35, slug:"sea-of-stars",                            mc:91, ign:8.5, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Gorgeous turn-based RPG inspired by SNES classics. Stunning pixel art, incredible music, and a heartfelt story. Perfect for older kids.", quote:"A love letter to the golden age of RPGs. — IGN" },
  { id:101, title:"Vampire Survivors",                   consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["action","casual","adventure"],       rating:"E10+", price:5,  slug:"vampire-survivors",                       mc:94, ign:8.5, time:"endless", coop:true,  sib:true,  pk:false, soon:false, desc:"Survive waves of enemies with auto-attacking builds in this brilliantly addictive roguelite. One of the best $5 games ever made.", quote:"Brutally addictive — one of gaming's great bargains. — IGN" },
  { id:102, title:"Dave the Diver",                      consoles:["Nintendo Switch","PS4/PS5","PC"],               excl:false, genre:["adventure","rpg","casual"],          rating:"E10+", price:20, slug:"dave-the-diver",                          mc:90, ign:8.5, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"Dive deep to catch fish, then serve them at your sushi restaurant. A wildly creative mix of genres that's impossible to put down.", quote:"Delightfully eclectic — gaming at its most joyful. — IGN" },
  { id:103, title:"Hades",                               consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["action","rpg","adventure"],          rating:"T",    price:25, slug:"hades",                                   mc:93, ign:9.0, time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Escape the Underworld through brilliant action combat. Incredible writing and endlessly replayable — the best roguelite ever made.", quote:"A genre masterpiece. Absolutely unmissable. — IGN" },
  { id:104, title:"A Short Hike",                        consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","casual","exploration"],  rating:"E",    price:8,  slug:"a-short-hike",                            mc:92, ign:9.0, time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Climb a mountain, explore at your own pace, meet quirky characters. A warm, gentle masterpiece — finished in 2 magical hours.", quote:"A tiny gem of pure joy and charm. — IGN" },
  { id:105, title:"Chicory: A Colorful Tale",            consoles:["Nintendo Switch","PS4/PS5","PC"],               excl:false, genre:["adventure","puzzle","creative"],     rating:"E",    price:20, slug:"chicory-a-colorful-tale",                 mc:88, ign:8.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Color the world with a magic paintbrush in this gentle adventure. Thoughtful storytelling about creativity and self-doubt.", quote:"One of the most original and touching games in years. — IGN" },
  { id:106, title:"Unpacking",                           consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["casual","puzzle","story"],           rating:"E",    price:20, slug:"unpacking",                               mc:84, ign:8.5, time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Unpack boxes and arrange items to wordlessly tell a life story. A genuinely unique, meditative experience — short and perfectly formed.", quote:"A beautiful, novel storytelling experience. — IGN" },
  { id:107, title:"Tunic",                               consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","puzzle","exploration"],  rating:"E10+", price:30, slug:"tunic",                                   mc:86, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Explore a mysterious island as a tiny fox with no instructions given. Incredibly clever puzzle design that rewards curiosity.", quote:"One of the most inventive games in years. — IGN" },
  { id:108, title:"Another Crab's Treasure",             consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["action","adventure","platformer"],   rating:"E10+", price:30, slug:"another-crabs-treasure",                  mc:83, ign:8.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Souls-like adventure starring a tiny crab fighting underwater enemies. Surprisingly accessible with assist options — great for persistent teens.", quote:"A fresh take on the genre from an unexpected perspective. — IGN" },
  { id:109, title:"Disney Dreamlight Valley",            consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["simulation","casual","family"],      rating:"E",    price:30, slug:"disney-dreamlight-valley",                mc:74, ign:7.5, time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"Farm and build alongside beloved Disney and Pixar characters. Enormous content for Disney fans of all ages.", quote:"A cozy Disney dream come true. — Nintendo Life" },
  { id:110, title:"Stardew Valley Expanded",             consoles:["PC"],                                           excl:false, genre:["simulation","rpg","casual"],         rating:"E",    price:0,  slug:"stardew-valley",                          mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"A fan-made expansion that massively extends the base game — free mod adding hundreds of hours. PC only via Nexus Mods.", quote:"The best Stardew expansion ever made. — Gaming community" },

  // ── PlayStation 5 Additions ────────────────────────────────────────────────────
  { id:111, title:"Kena: Bridge of Spirits",             consoles:["PS4/PS5","PC"],                                 excl:false, genre:["adventure","action","story"],        rating:"E10+", price:40, slug:"kena-bridge-of-spirits",                  mc:82, ign:8.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Guide spirit companions in a stunning hand-painted world. Action-adventure with a beautiful emotional story — Pixar-level visuals.", quote:"One of the most visually stunning indie games ever made. — IGN" },
  { id:112, title:"Gran Turismo 7",                      consoles:["PlayStation 5","PS4/PS5"],                      excl:true,  genre:["racing","simulation","sports"],      rating:"E",    price:60, slug:"gran-turismo-7",                           mc:87, ign:8.0, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"The definitive sim racing game — hundreds of real cars and iconic tracks. Cars look photorealistic. A must for car-obsessed kids.", quote:"The most authentic racing experience on console. — IGN" },
  { id:113, title:"Marvel's Spider-Man 2",               consoles:["PlayStation 5"],                                excl:true,  genre:["adventure","action","story"],        rating:"T",    price:70, slug:"marvels-spider-man-2",                    mc:90, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Play as both Peter Parker and Miles Morales across a massive NYC. The best superhero game ever made — teens will be obsessed.", quote:"The superhero game of the generation. — IGN" },
  { id:114, title:"Returnal",                            consoles:["PlayStation 5","PC"],                           excl:true,  genre:["action","adventure","rpg"],          rating:"T",    price:60, slug:"returnal",                                mc:86, ign:9.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Third-person shooter roguelite on an alien planet. Tough but brilliant — best for teen gamers who love a real challenge and atmosphere.", quote:"One of PS5's most compelling exclusives. — IGN" },

  // ── Xbox / PC Additions ────────────────────────────────────────────────────────
  { id:115, title:"Hi-Fi Rush",                          consoles:["Xbox","PC","PS4/PS5"],                          excl:false, genre:["action","rhythm","adventure"],       rating:"T",    price:30, slug:"hi-fi-rush",                              mc:87, ign:9.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Battle to the beat in a cel-shaded musical action game. One of the most joyful and inventive games in years — teens will adore it.", quote:"A joyful, brilliantly designed action-rhythm masterpiece. — IGN" },
  { id:116, title:"Pentiment",                           consoles:["Xbox","PC"],                                    excl:true,  genre:["adventure","story","rpg"],           rating:"T",    price:20, slug:"pentiment",                               mc:87, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"Illustrated medieval mystery adventure with gorgeous art. Slow-burn narrative experience — excellent for curious older teens.", quote:"A unique masterpiece unlike anything else. — IGN" },
  { id:117, title:"Microsoft Flight Simulator 2024",     consoles:["Xbox","PC"],                                    excl:true,  genre:["simulation","adventure","exploration"],rating:"E",  price:60, slug:"microsoft-flight-simulator-2024",          mc:79, ign:8.0, time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"Fly anywhere on Earth in stunning detail. Kids obsessed with aviation will be completely captivated by this technical marvel.", quote:"The world in your hands — technically stunning. — IGN" },
  { id:118, title:"Forza Motorsport (2023)",             consoles:["Xbox","PC"],                                    excl:true,  genre:["racing","simulation","sports"],      rating:"E",    price:60, slug:"forza-motorsport",                        mc:84, ign:7.0, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"True sim-racing with 500+ cars and a full career mode. More technical than Forza Horizon — great for motorsport-obsessed teens.", quote:"A solid return to sim racing roots. — IGN" },
  { id:119, title:"Halo Infinite",                       consoles:["Xbox","PC"],                                    excl:true,  genre:["shooter","multiplayer","adventure"],  rating:"T",    price:0,  slug:"halo-infinite",                           mc:87, ign:8.5, time:"endless", coop:false, sib:true,  pk:false, soon:false, desc:"Master Chief returns in a massive open-world campaign, plus free multiplayer. The definitive console shooter — multiplayer is completely free.", quote:"A triumphant return for the Master Chief. — IGN" },

  // ── Additional Mobile Games ────────────────────────────────────────────────────
  { id:120, title:"Brawl Stars",                         consoles:["Mobile"],                                       excl:false, genre:["multiplayer","competitive","casual"],  rating:"E10+",price:0,  slug:"brawl-stars",                             mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:false, soon:false, desc:"Fast 3-minute battles in a variety of team modes. Supercell's most kid-friendly competitive game — huge with the elementary school crowd.", quote:"The perfect bite-sized competitive game. — App Store" },
  { id:121, title:"Subway Surfers",                      consoles:["Mobile"],                                       excl:false, genre:["casual","adventure","racing"],        rating:"E",    price:0,  slug:"subway-surfers",                          mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Iconic endless runner — swipe to dodge trains and collect coins. Simple and endlessly addictive for younger kids.", quote:"The definitive mobile endless runner. — App Store" },
  { id:122, title:"Infinite Craft",                      consoles:["Mobile"],                                       excl:false, genre:["casual","creative","puzzle"],         rating:"E",    price:0,  slug:"infinite-craft",                          mc:null,ign:null,time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"Combine elements to create new things — starting with fire and water, ending up with entire universes. Brilliantly creative and educational.", quote:"Impossibly addictive creative puzzle. — App Store" },
  { id:123, title:"Clash Royale",                        consoles:["Mobile"],                                       excl:false, genre:["strategy","competitive","casual"],    rating:"E10+", price:0,  slug:"clash-royale",                            mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Real-time card battle strategy game from Supercell. Quick matches teach deck-building and tactical thinking.", quote:"The smartest mobile strategy game around. — App Store" },
  { id:124, title:"Temple Run 2",                        consoles:["Mobile"],                                       excl:false, genre:["casual","adventure","racing"],        rating:"E",    price:0,  slug:"temple-run-2",                            mc:null,ign:null,time:"endless", coop:false, sib:false, pk:false, soon:false, desc:"Run from the idol-monster through jungle temples. The classic mobile endless runner — still wildly fun for all ages.", quote:"The original mobile classic. — App Store" },
  { id:125, title:"Crossy Road",                         consoles:["Mobile"],                                       excl:false, genre:["casual","party","family"],            rating:"E",    price:0,  slug:"crossy-road",                             mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Help a chicken cross endless roads and rivers. The successor to Frogger — silly, charming, and great for young kids.", quote:"Modern Frogger perfection. — App Store" },
  { id:126, title:"Laqueus Escape",                      consoles:["Mobile"],                                       excl:false, genre:["puzzle","adventure","casual"],        rating:"E",    price:0,  slug:"laqueus-escape-chapter-1",                mc:null,ign:null,time:"short",   coop:false, sib:false, pk:true,  soon:false, desc:"Atmospheric escape room puzzles that feel genuinely clever. Perfect brain-training for kids and parents to solve together.", quote:"Escape room excellence on mobile. — App Store" },
  { id:127, title:"Pokémon UNITE",                       consoles:["Nintendo Switch","Mobile"],                     excl:false, genre:["multiplayer","strategy","competitive"],rating:"E",  price:0,  slug:"pokemon-unite",                           mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:false, soon:false, desc:"5v5 team battle game with beloved Pokémon. Cross-play between Switch and mobile — a surprisingly accessible MOBA for kids.", quote:"The best Pokémon spinoff in years. — Nintendo Life" },

  // ── More Quality Multi-Platform ────────────────────────────────────────────────
  { id:128, title:"Slime Rancher 2",                     consoles:["Xbox","PC","PS4/PS5"],                          excl:false, genre:["simulation","adventure","casual"],    rating:"E",    price:30, slug:"slime-rancher-2",                         mc:74, ign:7.5, time:"long",    coop:false, sib:false, pk:true,  soon:false, desc:"Collect adorable slimes on a vibrant alien planet. Incredibly cozy and relaxing — kids of all ages love the bouncy, colorful world.", quote:"A charming, endlessly cozy sequel. — IGN" },
  { id:129, title:"Lego 2K Drive",                       consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["racing","family","creative"],         rating:"E",    price:40, slug:"lego-2k-drive",                           mc:73, ign:7.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Open-world LEGO racing across four unique biomes. Build your own vehicles mid-race — great for young LEGO fans.", quote:"LEGO and racing make perfect sense together. — Nintendo Life" },
  { id:130, title:"Planet Coaster 2",                    consoles:["PlayStation 5","Xbox","PC"],                    excl:false, genre:["simulation","creative","strategy"],   rating:"E",    price:50, slug:"planet-coaster-2",                        mc:79, ign:7.5, time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"Build and manage your dream theme park. Incredibly creative sandbox — kids can design roller coasters and run a whole resort.", quote:"The ultimate theme park builder. — IGN" },
  { id:132, title:"Immortals Fenyx Rising",              consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","rpg","exploration"],     rating:"T",    price:30, slug:"immortals-fenyx-rising",                  mc:80, ign:8.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Greek mythology adventure styled like Zelda: Breath of the Wild. Charming humor and clever puzzles — a surprisingly great alternative.", quote:"A colourful, charming open-world adventure. — IGN" },
  { id:133, title:"Bugsnax",                             consoles:["Nintendo Switch","PS4/PS5","Xbox","PC"],        excl:false, genre:["adventure","casual","puzzle"],        rating:"E",    price:25, slug:"bugsnax",                                 mc:77, ign:7.5, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Catch half-bug half-snack creatures on a mystery island. Surprisingly deep and emotional story underneath the silly premise.", quote:"Strangely touching beneath its absurd premise. — IGN" },
  { id:134, title:"Splatoon 3: Side Order",              consoles:["Nintendo Switch"],                              excl:true,  genre:["action","shooter","adventure"],       rating:"E10+", price:25, slug:"splatoon-3",                              mc:80, ign:8.0, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"The solo DLC expansion for Splatoon 3 — a roguelite mode with Agent 8. More content for fans of the franchise's ink-shooting action.", quote:"A fresh, replayable take on the Splatoon world. — Nintendo Life" },

  // ── Switch Exclusives (more) ───────────────────────────────────────────────────
  { id:135, title:"Advance Wars 1+2: Re-Boot Camp",      consoles:["Nintendo Switch"],                              excl:true,  genre:["strategy","adventure","family"],      rating:"E",    price:60, slug:"advance-wars-1-2-re-boot-camp",           mc:77, ign:7.5, time:"long",    coop:true,  sib:false, pk:false, soon:false, desc:"Two classic strategy games lovingly remade. Command armies in turn-based battles — great for introducing older kids to strategy games.", quote:"A faithful revival of tactical gaming classics. — IGN" },
  { id:136, title:"Fire Emblem Engage",                  consoles:["Nintendo Switch"],                              excl:true,  genre:["strategy","rpg","adventure"],         rating:"T",    price:60, slug:"fire-emblem-engage",                      mc:83, ign:8.5, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Turn-based strategy RPG with spectacular battles. Excellent for teens who love tactics and JRPG stories.", quote:"A spectacular showcase of tactical RPG design. — IGN" },
  { id:137, title:"Bayonetta Origins: Cereza",           consoles:["Nintendo Switch"],                              excl:true,  genre:["adventure","puzzle","story"],         rating:"T",    price:60, slug:"bayonetta-origins-cereza-and-the-lost-demon", mc:86, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"A fairy-tale storybook adventure about young Bayonetta. Gorgeous art direction and inventive two-hand puzzle design — unlike anything else.", quote:"A beautifully told fairy-tale adventure. — IGN" },
  { id:138, title:"Xenoblade Chronicles 3",              consoles:["Nintendo Switch"],                              excl:true,  genre:["rpg","adventure","story"],            rating:"T",    price:60, slug:"xenoblade-chronicles-3",                  mc:89, ign:9.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"Epic open-world JRPG with a deep combat system and sweeping story. One of Switch's greatest achievements — for dedicated older teens.", quote:"A colossal, emotional RPG masterpiece. — IGN" },
  { id:139, title:"Endless Ocean Luminous",              consoles:["Nintendo Switch"],                              excl:true,  genre:["simulation","exploration","casual"],  rating:"E",    price:30, slug:"endless-ocean-luminous",                  mc:62, ign:7.0, time:"endless", coop:true,  sib:false, pk:true,  soon:false, desc:"Swim the ocean, discover sea life, and share peaceful dives online. A uniquely calming experience — kids who love marine biology will love this.", quote:"A tranquil, beautiful digital aquarium. — Nintendo Life" },
  { id:140, title:"Deltarune",                           consoles:["Nintendo Switch","PS4/PS5","PC"],               excl:false, genre:["rpg","story","adventure"],            rating:"E10+", price:0,  slug:"deltarune",                               mc:86, ign:8.5, time:"medium",  coop:false, sib:false, pk:false, soon:false, desc:"The free sequel to Undertale from Toby Fox. Chapters 1-2 are completely free — a masterful story-driven RPG with unforgettable characters.", quote:"Every bit the worthy successor to Undertale. — IGN" },
  { id:141, title:"Astro Bot",                           consoles:["PlayStation 5"],                                excl:true,  genre:["platformer","adventure","family"],      rating:"E10+", price:40, slug:"astro-bot",                               mc:94, ign:9.0, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"The 2024 Game of the Year — a Pixar-quality 3D platformer that PlayStation fans of all ages will adore. Pure joy from start to finish.", quote:"The best 3D platformer of the decade. — VGC" },
  { id:142, title:"Balatro",                             consoles:["Nintendo Switch","PlayStation 5","Xbox","PC","Mobile"], excl:false, genre:["strategy","casual","puzzle"],   rating:"E10+", price:15, slug:"balatro",                                 mc:90, ign:9.0, time:"endless", coop:false, sib:false, pk:true,  soon:false, desc:"A poker-themed roguelike card game that's hypnotically addictive. Warning: it's hard to put down. Best for teens and parents who love strategy.", quote:"Ludicrously fun and remarkably approachable. — IGN" },
  { id:143, title:"Super Mario Party Jamboree",          consoles:["Nintendo Switch"],                              excl:true,  genre:["party","family","multiplayer"],        rating:"E",    price:60, slug:"super-mario-party-jamboree",              mc:82, ign:9.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The best Mario Party ever — 7 boards, 110+ minigames, and a huge online mode. The go-to family game night game for all ages.", quote:"The best Mario Party to date. — Nintendo Life" },
  { id:144, title:"Kirby and the Forgotten Land",        consoles:["Nintendo Switch"],                              excl:true,  genre:["platformer","adventure","family"],      rating:"E10+", price:60, slug:"kirby-and-the-forgotten-land",            mc:85, ign:8.5, time:"medium",  coop:true,  sib:true,  pk:true,  soon:false, desc:"Kirby's first full 3D adventure through a post-apocalyptic world. Incredible co-op mode lets a second player join as Bandana Waddle Dee — perfect for parent and child.", quote:"A delightful first 3D adventure for Kirby. — IGN" },
  { id:145, title:"Mario & Luigi: Brothership",          consoles:["Nintendo Switch"],                              excl:true,  genre:["rpg","adventure","story"],             rating:"E10+", price:60, slug:"mario-luigi-brothership",                 mc:80, ign:8.5, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"The beloved RPG duo returns in a vibrant oceanic adventure. Turn-based combat with clever timing mechanics — a great first RPG for older kids.", quote:"A charming, inventive return for the brothers. — IGN" },
  { id:146, title:"Minecraft Legends",                   consoles:["Nintendo Switch","PlayStation 5","Xbox","PC"],  excl:false, genre:["strategy","adventure","creative"],    rating:"E10+", price:30, slug:"minecraft-legends",                       mc:71, ign:7.0, time:"medium",  coop:true,  sib:true,  pk:false, soon:false, desc:"A Minecraft action-strategy spinoff where you lead mobs against Piglins. Great for Minecraft fans who want something with more structure.", quote:"A fun new angle on the Minecraft universe. — Nintendo Life" },
  { id:147, title:"It Takes Two",                        consoles:["Nintendo Switch","PlayStation 5","Xbox","PC"],  excl:false, genre:["co-op","adventure","platformer"],     rating:"T",    price:40, slug:"it-takes-two",                            mc:88, ign:9.0, time:"long",    coop:true,  sib:false, pk:true,  soon:false, desc:"A cooperative masterpiece designed for exactly two players. Parents and older kids will love solving creative puzzles together — it requires zero split-screen squinting.", quote:"One of the greatest co-op games ever made. — IGN" },
  { id:148, title:"Ori and the Will of the Wisps",       consoles:["Nintendo Switch","Xbox","PC"],                  excl:false, genre:["platformer","adventure","story"],      rating:"E",    price:30, slug:"ori-and-the-will-of-the-wisps",           mc:90, ign:9.0, time:"medium",  coop:false, sib:false, pk:true,  soon:false, desc:"Breathtakingly beautiful platformer with a touching story. One of the most visually stunning games ever made — emotional and accessible for kids 8+.", quote:"A masterpiece of motion, music, and heart. — IGN" },
  { id:149, title:"Hollow Knight",                       consoles:["Nintendo Switch","PlayStation 5","Xbox","PC"],  excl:false, genre:["adventure","exploration","platformer"], rating:"E",   price:15, slug:"hollow-knight",                           mc:90, ign:9.0, time:"long",    coop:false, sib:false, pk:false, soon:false, desc:"A stunning hand-drawn underground insect kingdom to explore. One of the greatest indie games ever — ideal for patient older kids who love discovery and challenge.", quote:"A triumph of atmosphere and design. — IGN" },
  { id:150, title:"Minecraft Education",                 consoles:["PC","Xbox","Mobile"],                           excl:false, genre:["educational","creative","sandbox"],   rating:"E",    price:0,  slug:"minecraft-education-edition",             mc:null,ign:null,time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"The classroom version of Minecraft — free for many schools and available for families. Build, code, and learn together in the world kids already love.", quote:"Learning disguised as the world's most popular game. — Common Sense Media" },
  { id:151, title:"Pokémon Pokopia",                     consoles:["Nintendo Switch 2"],                            excl:true,  genre:["simulation","sandbox","collecting","family"], rating:"E", price:70, slug:"pokemon-pokopia",                        mc:90, ign:9.0, time:"endless", coop:true,  sib:true,  pk:true,  soon:false, desc:"Build a Pokémon paradise from scratch — tend, befriend, and evolve Pokémon in a peaceful world made for exploring together.", quote:"The highest-rated Pokémon game of all time. — IGN" },
];

// ─── SMALL UTILITIES ──────────────────────────────────────────────────────────
const thumbCache = {};

function GameThumb({ game, size = 52 }) {
  const [src, setSrc] = useState(thumbCache[game.id] || null);
  const col = CONSOLE_META[game.consoles[0]]?.color || "#374151";

  useEffect(() => {
    if (src || !game.slug) return;
    fetch(`https://api.rawg.io/api/games/${game.slug}?key=${import.meta.env.VITE_RAWG_API_KEY || "3b7ab5e4a9334b23b461609de5c93bab"}`)
      .then(r => r.json())
      .then(d => { if (d.background_image) { thumbCache[game.id] = d.background_image; setSrc(d.background_image); } })
      .catch(() => {});
  }, []);

  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: `${col}33`, border: `1px solid ${col}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4 }}>
      {src ? <img src={src} alt={game.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setSrc(null)} /> : <span>🎮</span>}
    </div>
  );
}

function ScoreBadge({ val, label }) {
  if (!val) return null;
  const c = val >= 90 ? "#4ade80" : val >= 75 ? "#fbbf24" : "#f87171";
  return (
    <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 7, padding: "3px 7px", textAlign: "center", minWidth: 40 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: c, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700, marginTop: 1 }}>{label}</div>
    </div>
  );
}

// ─── GAME CARD ────────────────────────────────────────────────────────────────
function GameCard({ game, activeProfile, wishlist, onWishlist, compareList, onCompare }) {
  const inW = wishlist.includes(game.id);
  const inC = compareList.includes(game.id);
  const ri = RATINGS[game.rating];
  const isNS2 = game.consoles.includes("Nintendo Switch 2") && !game.consoles.includes("Nintendo Switch");
  const isExcl = game.excl && game.consoles.length === 1;
  const isMulti = game.consoles.length > 2;
  const owned = activeProfile?.owned?.includes(game.id);

  return (
    <div className="gcard" style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${isNS2 ? "rgba(255,107,53,0.4)" : "rgba(255,255,255,0.12)"}`, borderRadius: 16, padding: 14, position: "relative", opacity: owned ? 0.4 : 1, transition: "transform 0.18s, box-shadow 0.18s" }}>
      {isNS2 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff6b35,#f59e0b)", borderRadius: "16px 16px 0 0" }} />}
      {owned && <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "1px 7px", fontSize: 9, fontWeight: 800, color: "#a5b4fc" }}>✓ Owned</div>}
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
        <button onClick={() => onCompare(game.id)} style={{ background: inC ? "rgba(56,189,248,0.15)" : "rgba(0,0,0,0.35)", border: `1px solid ${inC ? "#38bdf8" : "rgba(255,255,255,0.08)"}`, borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: inC ? "#38bdf8" : "rgba(255,255,255,0.35)" }}>⚖</button>
        <button onClick={() => onWishlist(game.id)} style={{ background: inW ? "rgba(244,114,182,0.15)" : "rgba(0,0,0,0.35)", border: `1px solid ${inW ? "#f472b6" : "rgba(255,255,255,0.08)"}`, borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", color: inW ? "#f472b6" : "rgba(255,255,255,0.35)" }}>{inW ? "♥" : "♡"}</button>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 9, paddingRight: 60 }}>
        <GameThumb game={game} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 800, margin: "0 0 4px", lineHeight: 1.3 }}>{game.title}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {game.consoles.slice(0, 2).map(c => <span key={c} style={{ fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 100, background: `${CONSOLE_META[c]?.color || "#374151"}22`, color: CONSOLE_META[c]?.color || "#9ca3af", border: `1px solid ${CONSOLE_META[c]?.color || "#374151"}44` }}>{CONSOLE_META[c]?.short || c}</span>)}
            {game.consoles.length > 2 && <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 100, background: "rgba(107,114,128,0.2)", color: "#9ca3af", fontWeight: 700 }}>+{game.consoles.length - 2}</span>}
            {isExcl && <span style={{ fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 100, background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>🔒 Exclusive</span>}
            {isMulti && <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 100, background: "rgba(107,114,128,0.12)", color: "#9ca3af" }}>🌐 Multi</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 100, background: `${ri.color}18`, color: ri.color }}>{ri.label}</span>
        <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: `${PLAYTIME_COLOR[game.time]}18`, color: PLAYTIME_COLOR[game.time] }}>⏱ {PLAYTIME_LABEL[game.time]}</span>
        {game.pk  && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: "rgba(251,191,36,0.1)", color: "#fbbf24" }}>👨‍👧 Parent+Kid</span>}
        {game.sib && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: "rgba(167,139,250,0.1)", color: "#a78bfa" }}>👦👧 Siblings</span>}
        {game.coop && !game.pk && !game.sib && <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}>👥 Co-op</span>}
        {game.soon && <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 100, background: "rgba(239,68,68,0.12)", color: "#f87171" }}>🔜 Coming Soon</span>}
        {game.aiGen && <span style={{ fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 100, background: "rgba(34,211,238,0.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.15)" }}>✨ AI Pick</span>}
      </div>
      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.72)", margin: "0 0 8px", lineHeight: 1.55 }}>{game.desc}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <ScoreBadge val={game.mc} label="Metacritic" />
        <ScoreBadge val={game.ign ? Math.round(game.ign * 10) : null} label="IGN×10" />
        <div style={{ flex: 1 }} />
        <span style={{ fontWeight: 900, fontSize: 15, color: game.price === 0 ? "#4ade80" : "#f9a8d4" }}>{game.price === 0 ? "Free" : `$${game.price}`}</span>
      </div>
      {game.quote && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", margin: "0 0 8px", fontStyle: "italic", borderLeft: "2px solid rgba(99,102,241,0.3)", paddingLeft: 6, lineHeight: 1.5 }}>{game.quote}</p>}
      <a href={retailerUrl(game)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", padding: 8, borderRadius: 10, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>🛒 Check Price & Buy</a>
    </div>
  );
}

// ─── PROFILE MANAGER ──────────────────────────────────────────────────────────
function ProfileManager({ profiles, setProfiles, activeProfileId, setActiveProfileId }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", age: "", emoji: "🦁", platforms: [], owned: [] });
  const iStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "7px 10px", color: "#f1f5f9", fontSize: 13, fontWeight: 600, fontFamily: "inherit", outline: "none" };

  function save() {
    if (!form.name || !form.age) return;
    const data = { ...form, age: parseInt(form.age), owned: form.owned || [] };
    if (editId) { setProfiles(p => p.map(x => x.id === editId ? { ...x, ...data } : x)); setEditId(null); }
    else { const n = { ...data, id: Date.now() }; setProfiles(p => [...p, n]); setActiveProfileId(n.id); }
    setForm({ name: "", age: "", emoji: "🦁", platforms: [], owned: [] }); setAdding(false);
  }
  const del = id => { setProfiles(p => p.filter(x => x.id !== id)); if (activeProfileId === id) setActiveProfileId(null); };
  const startEdit = p => { setForm({ name: p.name, age: p.age, emoji: p.emoji, platforms: p.platforms, owned: p.owned || [] }); setEditId(p.id); setAdding(true); };
  const togglePl = pl => setForm(f => ({ ...f, platforms: f.platforms.includes(pl) ? f.platforms.filter(x => x !== pl) : [...f.platforms, pl] }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Child Profiles</h2>
        {!adding && <button onClick={() => { setAdding(true); setEditId(null); setForm({ name: "", age: "", emoji: "🦁", platforms: [], owned: [] }); }} style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>+ Add Child</button>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        {profiles.map(p => (
          <div key={p.id} onClick={() => setActiveProfileId(p.id)} style={{ background: activeProfileId === p.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${activeProfileId === p.id ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`, borderRadius: 14, padding: "12px 14px", cursor: "pointer", minWidth: 130, position: "relative", transition: "all 0.15s" }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{p.emoji}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 15 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Age {p.age} · {RATINGS[ageRating(p.age)].label}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {p.platforms.map(pl => <span key={pl} style={{ fontSize: 8, background: `${CONSOLE_META[pl]?.color || "#374151"}22`, color: CONSOLE_META[pl]?.color || "#9ca3af", padding: "1px 5px", borderRadius: 100, fontWeight: 700 }}>{CONSOLE_META[pl]?.short || pl}</span>)}
            </div>
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 3 }}>
              <button onClick={e => { e.stopPropagation(); startEdit(p); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>✏</button>
              <button onClick={e => { e.stopPropagation(); del(p.id); }} style={{ background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)" }}>✕</button>
            </div>
          </div>
        ))}
        {profiles.length === 0 && !adding && <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No profiles yet — add your first child to get personalized recommendations!</p>}
      </div>
      {adding && (
        <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 16, padding: 18 }}>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 14, letterSpacing: -0.3 }}>{editId ? "Edit Profile" : "New Profile"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 5 }}>Name</div><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Emma" style={iStyle} /></div>
            <div><div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 5 }}>Age</div><input type="number" min={2} max={17} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="2–17" style={iStyle} /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 7 }}>Avatar</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {KID_EMOJIS.map(e => <button key={e} onClick={() => setForm(f => ({ ...f, emoji: e }))} style={{ background: form.emoji === e ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${form.emoji === e ? "#6366f1" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{e}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 7 }}>Platforms They Own</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {CONSOLE_LIST.map(pl => <button key={pl} onClick={() => togglePl(pl)} style={{ background: form.platforms.includes(pl) ? `${CONSOLE_META[pl]?.color || "#6366f1"}22` : "rgba(255,255,255,0.04)", border: `1.5px solid ${form.platforms.includes(pl) ? CONSOLE_META[pl]?.color || "#6366f1" : "rgba(255,255,255,0.08)"}`, borderRadius: 100, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", color: form.platforms.includes(pl) ? CONSOLE_META[pl]?.color || "#a5b4fc" : "rgba(255,255,255,0.4)", fontFamily: "inherit" }}>{pl}</button>)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={save} style={{ background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>{editId ? "Save Changes" : "Add Profile"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "8px 18px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── GIFT MODE ────────────────────────────────────────────────────────────────
function GiftMode({ profiles, allGames }) {
  const [budget, setBudget] = useState(100);
  const [profileId, setProfileId] = useState(null);
  const [bundle, setBundle] = useState([]);
  const [built, setBuilt] = useState(false);

  function build() {
    const profile = profiles.find(p => p.id === profileId);
    const allowed = profile ? Object.keys(RATINGS).filter(r => RATINGS[r].min <= RATINGS[ageRating(profile.age)].min) : Object.keys(RATINGS);
    const owned = profile?.owned || [];
    const pls = profile?.platforms || [];
    let pool = allGames
      .filter(g => g.price > 0 && g.price <= budget && allowed.includes(g.rating) && !owned.includes(g.id))
      .filter(g => pls.length === 0 || pls.some(pl => g.consoles.includes(pl)))
      .sort((a, b) => (b.mc || 70) - (a.mc || 70));
    let rem = budget, sel = [];
    for (const g of pool) { if (g.price <= rem && sel.length < 5) { sel.push(g); rem -= g.price; } }
    const frees = allGames.filter(g => g.price === 0 && !owned.includes(g.id) && allowed.includes(g.rating)).slice(0, 2);
    setBundle([...sel, ...frees]); setBuilt(true);
  }

  const total = bundle.filter(g => g.price > 0).reduce((s, g) => s + g.price, 0);

  return (
    <div>
      <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 18, letterSpacing: -0.5 }}>🎁 Gift Bundle Builder</h2>
      <div style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Budget</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input type="range" min={20} max={300} step={5} value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ flex: 1, accentColor: "#fbbf24" }} />
            <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 26, color: "#fbbf24", minWidth: 60 }}>${budget}</span>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>For Which Child?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[{ id: null, emoji: "🎲", name: "Anyone" }, ...profiles].map(p => (
              <button key={p.id ?? "any"} onClick={() => setProfileId(p.id ?? null)} style={{ background: profileId === (p.id ?? null) ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${profileId === (p.id ?? null) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.08)"}`, borderRadius: 100, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: profileId === (p.id ?? null) ? "#a5b4fc" : "rgba(255,255,255,0.4)", fontFamily: "inherit" }}>{p.emoji} {p.name}</button>
            ))}
          </div>
        </div>
        <button onClick={build} style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", border: "none", color: "#fff", padding: "9px 24px", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>Build My Bundle 🎁</button>
      </div>
      {built && bundle.length > 0 && (
        <div className="fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>{bundle.length} games · {bundle.filter(g => g.price === 0).length} free</div>
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 800 }}>Paid: <span style={{ color: "#fbbf24" }}>${total}</span> / ${budget}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 10 }}>
            {bundle.map(g => (
              <div key={g.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 12 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}><GameThumb game={g} size={38} /><div><div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{g.title}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{g.consoles[0]}</div></div></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 100, background: `${RATINGS[g.rating].color}18`, color: RATINGS[g.rating].color }}>{RATINGS[g.rating].label}</span>
                  <span style={{ fontWeight: 900, fontSize: 13, color: g.price === 0 ? "#4ade80" : "#fbbf24" }}>{g.price === 0 ? "Free" : `$${g.price}`}</span>
                </div>
                {g.mc && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>🏆 {g.mc} Metacritic</div>}
                <a href={retailerUrl(g)} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: 5, borderRadius: 7, fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>🛒 Check Price</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WISHLIST ─────────────────────────────────────────────────────────────────
function WishlistPanel({ wishlist, allGames, onWishlist }) {
  const games = wishlist.map(id => allGames.find(g => g.id === id)).filter(Boolean);
  const total = games.filter(g => g.price > 0).reduce((s, g) => s + g.price, 0);
  if (!games.length) return <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.2)" }}><div style={{ fontSize: 48, marginBottom: 14 }}>♡</div><p style={{ fontWeight: 700, fontSize: 14 }}>No games saved yet.<br />Hit ♡ on any card.</p></div>;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Saved Games ({games.length})</h2>
        <div style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)", padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 800 }}>Total: <span style={{ color: "#f472b6" }}>{total === 0 ? "All Free!" : `$${total}`}</span></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 10 }}>
        {games.map(g => (
          <div key={g.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 12, position: "relative" }}>
            <button onClick={() => onWishlist(g.id)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(244,114,182,0.12)", border: "1px solid rgba(244,114,182,0.3)", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#f472b6" }}>♥</button>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}><GameThumb game={g} size={38} /><div style={{ paddingRight: 24 }}><div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>{g.title}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{g.consoles[0]}</div></div></div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 100, background: `${RATINGS[g.rating].color}18`, color: RATINGS[g.rating].color }}>{RATINGS[g.rating].label}</span>
              <span style={{ fontWeight: 900, fontSize: 13, color: g.price === 0 ? "#4ade80" : "#f9a8d4" }}>{g.price === 0 ? "Free" : `$${g.price}`}</span>
            </div>
            <a href={retailerUrl(g)} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", padding: 5, borderRadius: 7, fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>🛒 Check Price</a>
          </div>
        ))}
      </div>

    </div>
  );
}

// ─── COMPARE ──────────────────────────────────────────────────────────────────
function ComparePanel({ compareList, setCompareList, allGames }) {
  const games = compareList.map(id => allGames.find(g => g.id === id)).filter(Boolean);

  const [aiTakes, setAiTakes] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiGamesKey, setAiGamesKey] = useState("");

  const currentKey = games.map(g => g.id).join("-");

  useEffect(() => {
    if (games.length < 2 || currentKey === aiGamesKey) return;
    setAiLoading(true);
    setAiError(null);
    setAiTakes(null);
    const slim = games.map(({ title, rating, genre, price, mc, ign, time, coop, pk, sib }) =>
      ({ title, rating, genre, price, mc, ign, time, coop, pk, sib })
    );
    fetch("/api/ai-take", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ games: slim }),
    })
      .then(r => r.json())
      .then(data => {
        setAiTakes(data.takes || null);
        if (data.error) setAiError(data.error);
        setAiGamesKey(currentKey);
      })
      .catch(() => setAiError("Could not reach AI"))
      .finally(() => setAiLoading(false));
  }, [currentKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAi = () => {
    setAiGamesKey("");
  };

  if (games.length < 2) return <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.2)" }}><div style={{ fontSize: 48, marginBottom: 14 }}>⚖️</div><p style={{ fontWeight: 700, fontSize: 14 }}>Hit ⚖ on 2–3 game cards<br />to compare them here.</p></div>;

  const rows = [
    { l: "Rating",    r: g => <span style={{ color: RATINGS[g.rating].color, fontWeight: 800 }}>{RATINGS[g.rating].label}</span> },
    { l: "Price",     r: g => <span style={{ color: g.price === 0 ? "#4ade80" : "#f9a8d4", fontWeight: 900, fontSize: 13 }}>{g.price === 0 ? "Free" : `$${g.price}`}</span> },
    { l: "Metacritic",r: g => g.mc ? <span style={{ color: g.mc >= 90 ? "#4ade80" : g.mc >= 75 ? "#fbbf24" : "#f87171", fontWeight: 900, fontSize: 14 }}>{g.mc}</span> : "—" },
    { l: "IGN",       r: g => g.ign ? <span style={{ color: g.ign >= 9 ? "#4ade80" : g.ign >= 7.5 ? "#fbbf24" : "#f87171", fontWeight: 900, fontSize: 13 }}>{g.ign}</span> : "—" },
    { l: "Platform",  r: g => <span style={{ fontSize: 10 }}>{g.consoles.slice(0, 2).join(", ")}</span> },
    { l: "Exclusive", r: g => g.excl && g.consoles.length === 1 ? <span style={{ color: "#fbbf24", fontSize: 10 }}>🔒 Yes</span> : <span style={{ color: "#6b7280", fontSize: 10 }}>🌐 Multi</span> },
    { l: "Playtime",  r: g => <span style={{ color: PLAYTIME_COLOR[g.time], fontSize: 10 }}>{PLAYTIME_LABEL[g.time]}</span> },
    { l: "Multiplayer",r: g => <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
      {g.pk  && <span style={{ fontSize: 9, color: "#fbbf24" }}>👨‍👧 Parent+Kid</span>}
      {g.sib && <span style={{ fontSize: 9, color: "#a78bfa" }}>👦👧 Siblings</span>}
      {g.coop && !g.pk && !g.sib && <span style={{ fontSize: 9, color: "#38bdf8" }}>👥 Co-op</span>}
      {!g.coop && !g.pk && !g.sib && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>Solo only</span>}
    </div> },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>Compare ({games.length})</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={refreshAi} style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✨ AI Take</button>
          <button onClick={() => setCompareList([])} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", padding: "5px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Clear All</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "6px 0", minWidth: 300 }}>
          <thead><tr>
            <td style={{ width: 80, paddingBottom: 12 }} />
            {games.map(g => (
              <td key={g.id} style={{ textAlign: "center", verticalAlign: "top", paddingBottom: 12 }}>
                <GameThumb game={g} size={44} />
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontWeight: 800, fontSize: 12, lineHeight: 1.3, marginTop: 5 }}>{g.title}</div>
                <button onClick={() => setCompareList(p => p.filter(i => i !== g.id))} style={{ marginTop: 4, background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.3)", padding: "2px 7px", borderRadius: 100, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>✕ Remove</button>
              </td>
            ))}
          </tr></thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.l} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "7px 4px", color: "rgba(255,255,255,0.25)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>{row.l}</td>
                {games.map(g => <td key={g.id} style={{ padding: "7px 8px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 6, fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{row.r(g)}</td>)}
              </tr>
            ))}
            <tr style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "10px 4px", color: "rgba(99,102,241,0.6)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, verticalAlign: "top" }}>✨ AI Take</td>
              {games.map((g, i) => (
                <td key={g.id} style={{ padding: "8px", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.08)", borderRadius: 6, verticalAlign: "top" }}>
                  {aiLoading && (
                    <div style={{ height: 44, borderRadius: 6, background: "rgba(255,255,255,0.04)", animation: "pulse 1.5s ease-in-out infinite" }} />
                  )}
                  {!aiLoading && aiError && (
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>AI unavailable</span>
                  )}
                  {!aiLoading && !aiError && aiTakes?.[i] && (
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(200,185,255,0.85)", lineHeight: 1.6 }}>{aiTakes[i]}</p>
                  )}
                  {!aiLoading && !aiError && !aiTakes && (
                    <span style={{ fontSize: 9, color: "rgba(99,102,241,0.4)", fontStyle: "italic" }}>Click ✨ AI Take to compare</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("find");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [loaded, setLoaded] = useState(false);
  // Filters
  const [selConsoles, setSelConsoles] = useState([]);
  const [genre, setGenre] = useState("All");
  const [maxRating, setMaxRating] = useState("T");
  const [priceIdx, setPriceIdx] = useState(3);
  const [multiFilter, setMultiFilter] = useState("all");
  const [playtimeFilter, setPlaytimeFilter] = useState("all");
  const [exclOnly, setExclOnly] = useState(false);
  const [sortBy, setSortBy] = useState("mc");
  const [searchQuery, setSearchQuery] = useState("");

  // Persist
  useEffect(() => {
    try {
      const pr = localStorage.getItem(SK_PROFILES); if (pr) setProfiles(JSON.parse(pr));
      const wl = localStorage.getItem(SK_WISHLIST);  if (wl) setWishlist(JSON.parse(wl));
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(SK_PROFILES, JSON.stringify(profiles)); } catch {} }, [profiles, loaded]);
  useEffect(() => { if (!loaded) return; try { localStorage.setItem(SK_WISHLIST, JSON.stringify(wishlist)); } catch {} }, [wishlist, loaded]);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || null;
  useEffect(() => { if (activeProfile) setMaxRating(ageRating(activeProfile.age)); }, [activeProfile]);

  const toggleWishlist  = id => setWishlist(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleCompare   = id => setCompareList(p => p.includes(id) ? p.filter(x => x !== id) : p.length >= 3 ? [...p.slice(1), id] : [...p, id]);
  const toggleConsole   = c  => setSelConsoles(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  const allowedRatings = Object.keys(RATINGS).filter(r => RATINGS[r].min <= RATINGS[maxRating].min);
  const maxPrice = PRICE_RANGES[priceIdx].max;

  const results = GAMES.filter(g => {
    if (selConsoles.length > 0 && !selConsoles.some(c => g.consoles.includes(c))) return false;
    if (activeProfile?.platforms?.length > 0 && !activeProfile.platforms.some(pl => g.consoles.includes(pl))) return false;
    if (genre !== "All" && !g.genre.includes(genre)) return false;
    if (!allowedRatings.includes(g.rating)) return false;
    if (g.price > maxPrice) return false;
    if (multiFilter === "coop"     && !g.coop) return false;
    if (multiFilter === "sibling"  && !g.sib)  return false;
    if (multiFilter === "parentkid"&& !g.pk)   return false;
    if (playtimeFilter !== "all"   && g.time !== playtimeFilter) return false;
    if (exclOnly && !(g.excl && g.consoles.length === 1)) return false;
    if (searchQuery && !g.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "mc")    return (b.mc || 65)  - (a.mc || 65);
    if (sortBy === "ign")   return (b.ign || 6.5)- (a.ign || 6.5);
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "az")    return a.title.localeCompare(b.title);
    return 0;
  });

  const TABS = [
    { id: "find",     l: "🎮 Find" },
    { id: "profiles", l: `👧 Kids${profiles.length > 0 ? ` (${profiles.length})` : ""}` },
    { id: "gift",     l: "🎁 Gift" },
    { id: "wishlist", l: `♡ Saved${wishlist.length > 0 ? ` (${wishlist.length})` : ""}` },
    { id: "compare",  l: `⚖ Compare${compareList.length > 0 ? ` (${compareList.length})` : ""}` },
  ];

  const chip = (active, onClick, children, col) => (
    <button onClick={onClick} style={{ cursor: "pointer", border: `1.5px solid ${active ? (col || "rgba(99,102,241,0.6)") : "rgba(255,255,255,0.22)"}`, borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s", background: active ? (col ? `${col}22` : "rgba(99,102,241,0.15)") : "rgba(255,255,255,0.06)", color: active ? (col || "#a5b4fc") : "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{children}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d16", fontFamily: "'DM Sans',sans-serif", color: "#f1f5f9" }}>      <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%236366f1'/><text y='.9em' font-size='70' x='12'>🎮</text></svg>" />
      <style>{`
        * { box-sizing: border-box; }
        .gcard:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(0,0,0,0.45); border-color: rgba(255,255,255,0.13) !important; }
        .fade-in { animation: fi 0.3s ease; }
        @keyframes fi { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.35; } 50% { opacity:0.75; } }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 100px; }
        select option { background: #1a1040; }
        input[type=range] { height: 4px; }
        @media (max-width: 480px) { .filter-chips { gap: 4px !important; } }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: "rgba(8,8,15,0.96)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", gap: 14, height: 54 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 13, color: "#fff" }}>NL</div>
            <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 17, letterSpacing: -0.3, background: "linear-gradient(135deg,#a5b4fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NextLevel</span>
          </div>
          <div style={{ flex: 1 }} />
          {activeProfile && (
            <div onClick={() => { setTab("profiles"); setMenuOpen(false); }} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 100, padding: "4px 10px 4px 6px", cursor: "pointer" }}>
              <span style={{ fontSize: 16 }}>{activeProfile.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc" }}>{activeProfile.name}</span>
            </div>
          )}
          <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 22, padding: "0 4px", lineHeight: 1, display: "flex", alignItems: "center", flexShrink: 0 }}>☰</button>
        </div>
      </header>

      {/* ── PROFILE QUICK BAR ── */}
      {profiles.length > 0 && tab === "find" && (
        <div style={{ background: "rgba(99,102,241,0.04)", borderBottom: "1px solid rgba(99,102,241,0.1)", padding: "8px 16px", display: "flex", gap: 6, alignItems: "center", overflowX: "auto" }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.5)", whiteSpace: "nowrap" }}>Filter for:</span>
          {chip(!activeProfileId, () => setActiveProfileId(null), "🌟 All Kids")}
          {profiles.map(p => chip(activeProfileId === p.id, () => setActiveProfileId(p.id), `${p.emoji} ${p.name} · ${p.age}y`, CONSOLE_META[p.platforms?.[0]]?.color))}
        </div>
      )}

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "18px 12px 60px" }}>

        {/* ── FIND TAB ── */}
        {tab === "find" && (
          <div>
            {/* Hero banner */}
            <div style={{ textAlign: "center", padding: "28px 16px 24px", marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "rgba(99,102,241,0.95)", marginBottom: 8 }}>Family Game Finder</div>
              <h1 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "clamp(26px,5.5vw,44px)", fontWeight: 800, margin: "0 0 10px", lineHeight: 1.1, letterSpacing: -1.5, background: "linear-gradient(135deg,#ffffff 20%,#c4b5fd 55%,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Find games your kids<br />will actually love
              </h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", margin: "0 auto", maxWidth: 380, lineHeight: 1.6 }}>
                {GAMES.length} curated games across every platform — filtered by age, playtime, co-op, and budget.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                {[["🎮", `${GAMES.filter(g=>!g.consoles.includes("Mobile")).length} Console Games`], ["📱", `${GAMES.filter(g=>g.consoles.includes("Mobile")).length} Mobile Games`], ["👨‍👧", `${GAMES.filter(g=>g.pk).length} Parent+Kid`], ["🆓", `${GAMES.filter(g=>g.price===0).length} Free Games`]].map(([icon, label]) => (
                  <div key={label} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 100, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 5 }}>
                    <span>{icon}</span><span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20, marginBottom: 20 }}>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.4, pointerEvents: "none" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search games…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 32px 8px 32px", color: "#f1f5f9", fontSize: 16, fontWeight: 600, fontFamily: "inherit", outline: "none" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 15, padding: "2px 4px", lineHeight: 1 }}>✕</button>
                )}
              </div>

              {/* Console toggles */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Console</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {chip(selConsoles.length === 0, () => setSelConsoles([]), "All Platforms")}
                  {CONSOLE_LIST.map(c => chip(selConsoles.includes(c), () => toggleConsole(c), `${CONSOLE_META[c].icon} ${c}`, CONSOLE_META[c].color))}
                </div>
              </div>

              {/* Exclusive toggle */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {chip(exclOnly, () => setExclOnly(p => !p), "🔒 Exclusives Only")}
                  {chip(!exclOnly, () => setExclOnly(false), "🌐 Include Multi-platform")}
                </div>
              </div>

              {/* Genre */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Genre</div>
                <select value={genre} onChange={e => setGenre(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 14px", color: genre !== "All" ? "#a5b4fc" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, fontFamily: "inherit", outline: "none", cursor: "pointer", width: "100%", maxWidth: 280 }}>
                  {GENRES.map(g => <option key={g} value={g}>{g === "All" ? "🌟 All Genres" : g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                </select>
              </div>

              {/* Rating */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Max Age Rating</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {Object.entries(RATINGS).map(([k, v]) => chip(maxRating === k, () => setMaxRating(k), v.label, v.color))}
                </div>
              </div>

              {/* Multiplayer */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Multiplayer</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[["all", "All Games"], ["coop", "👥 Co-op"], ["sibling", "👦👧 Siblings"], ["parentkid", "👨‍👧 Parent+Kid"]].map(([v, l]) => chip(multiFilter === v, () => setMultiFilter(v), l))}
                </div>
              </div>

              {/* Playtime */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Playtime</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {[["all", "Any"], ["short", "Short"], ["medium", "Medium"], ["long", "Long"], ["endless", "Endless"]].map(([v, l]) => chip(playtimeFilter === v, () => setPlaytimeFilter(v), l))}
                </div>
              </div>

              {/* Budget + Sort */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Budget</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {PRICE_RANGES.map((p, i) => chip(priceIdx === i, () => setPriceIdx(i), p.label))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>Sort</div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "7px 12px", color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 700, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
                    <option value="mc">🏆 Metacritic</option>
                    <option value="ign">📺 IGN Score</option>
                    <option value="price">💰 Price</option>
                    <option value="az">🔤 A–Z</option>
                  </select>
                </div>
              </div>

            </div>

            {(
              <div className="fade-in">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 800 }}>
                    {results.length > 0 ? `${results.length} games` : "No matches"}
                    {activeProfile && <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>for {activeProfile.emoji} {activeProfile.name}</span>}
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>♡ save · ⚖ compare</span>
                </div>
                {results.length === 0
                  ? <div style={{ textAlign: "center", padding: "50px 20px", color: "rgba(255,255,255,0.25)" }}><div style={{ fontSize: 36, marginBottom: 10 }}>😔</div><p style={{ fontWeight: 700 }}>No matches — try broadening your filters.</p></div>
                  : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                      {results.map(g => <GameCard key={g.id} game={g} activeProfile={activeProfile} wishlist={wishlist} onWishlist={toggleWishlist} compareList={compareList} onCompare={toggleCompare} />)}
                    </div>
                }
              </div>
            )}
          </div>
        )}

        {tab === "profiles" && <ProfileManager profiles={profiles} setProfiles={setProfiles} activeProfileId={activeProfileId} setActiveProfileId={setActiveProfileId} />}
        {tab === "gift"     && <GiftMode profiles={profiles} allGames={GAMES} />}
        {tab === "wishlist" && <WishlistPanel wishlist={wishlist} allGames={GAMES} onWishlist={toggleWishlist} />}
        {tab === "compare"  && <ComparePanel compareList={compareList} setCompareList={setCompareList} allGames={GAMES} />}
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 16px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ width: 20, height: 20, borderRadius: 5, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#fff", fontFamily: "'Syne',sans-serif" }}>NL</div>
          <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 13, background: "linear-gradient(135deg,#a5b4fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NextLevel</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, margin: "0 0 4px" }}>Helping families find great games since 2025</p>
        <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 10, margin: 0 }}>Game data sourced from Metacritic, IGN, and RAWG · Prices may vary</p>
      </footer>

      {/* ── HAMBURGER DRAWER ── */}
      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 290, background: "#0d0d1a", borderLeft: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", overflowY: "auto" }}>

            {/* Drawer header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 12, color: "#fff" }}>NL</div>
                <span style={{ fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 16, background: "linear-gradient(135deg,#a5b4fc,#f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>NextLevel</span>
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "2px 6px" }}>✕</button>
            </div>

            {/* Nav items */}
            <div style={{ padding: "10px 0" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", padding: "8px 18px 4px" }}>Menu</div>
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }} style={{ width: "100%", textAlign: "left", background: tab === t.id ? "rgba(99,102,241,0.12)" : "none", border: "none", borderLeft: tab === t.id ? "3px solid #818cf8" : "3px solid transparent", color: tab === t.id ? "#a5b4fc" : "rgba(255,255,255,0.7)", padding: "12px 18px", fontSize: 14, fontWeight: tab === t.id ? 700 : 500, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  {t.l}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "4px 18px" }} />

            {/* Buy Me a Coffee */}
            <div style={{ padding: "20px 18px 28px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>Support</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>🎮 Support the Quest</div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 16px" }}>NextLevel is free — no ads, no paywalls. If it leveled up your family's game nights, a coffee keeps it running and growing.</p>
              <a href="https://buymeacoffee.com/patleezy" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#FFDD00", color: "#1a1a1a", fontWeight: 800, fontSize: 13, padding: "10px 18px", borderRadius: 100, textDecoration: "none", fontFamily: "inherit" }}>☕ Buy Me a Coffee</a>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
