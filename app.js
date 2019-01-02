const botModel = require("./bot.js");
const bot = botModel.bot;
const vec3 = botModel.vec3;

let pointForDigging = vec3();

//let our bot join to the server
botModel.join();

bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops

bot.navigate.on('pathPartFound', function (path) {
    bot.chat('Going ' + path.length + ' meters in the general direction for now.')
});
bot.navigate.on('pathFound', function (path) {
    bot.chat('I can get there in ' + path.length + ' moves.')
});
bot.navigate.on('cannotFind', function (closestPath) {
    bot.chat('unable to find path. getting as close as possible')
    bot.navigate.walk(closestPath)
});
bot.navigate.on('arrived', function () {
    bot.chat('I have arrived')
});
bot.navigate.on('interrupted', function () {
    bot.chat('stopping')
});

// commands via chat
bot.on('chat', function (username, message) {
    let command = message.split(' ');
    if (username === bot.username) return;
    const target = bot.players[username].entity;
    if (message === 'come') {
        bot.navigate.to(target.position);
    } else if (message === 'sayItems') {
        botModel.sayItems();
    } else if (/^equip \w+ \w+$/.test(message)) {
        // equip destination name
        // ex: equip hand diamond
        botModel.equipItem(command[2], command[1])
    } else if (message === 'getPoint') {
        let initPosition = target.position;
        pointForDigging = vec3(
            Math.round(initPosition.x, 1) + 0.4,
            Math.round(initPosition.y, 1),
            Math.round(initPosition.z, 1) + 0.4
        );
        bot.chat('position defined with coordinates' + pointForDigging);
    } else if (message === 'stop') {
        bot.navigate.stop()
    } else if (message === 'test') {
        bot.chat('computing path to ' + target.position);
        const results = bot.navigate.findPathSync(target.position);
        bot.chat('status: ' + results.status);
        bot.navigate.walk(results.path, function (stopReason) {
            bot.chat(stopReason)
        })
    } else if (/^makeHole \w+ \w+ \w+$/.test(message)) {
        let path = botModel.getcalculations(command[1], command[2], command[3]);
        let startPoint = vec3(parseFloat(command[1]) + parseFloat("0.5"), parseFloat(command[2]) + parseFloat("0.5"), parseFloat(command[3]) + parseFloat("0.5"));
        bot.navigate.walk([startPoint], function (stopReason) {
            bot.chat(stopReason + ". Let`s go to dig!");
            botModel.equipItem( "stone_pickaxe", "hand", function(){
                removeLevel(path);
            });
            //removeLevel(path);
        });
    } else {
        const match = message.match(/^goto\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*\)\s*$/);
        if (match) {
            const pt = vec3(
                parseFloat(match[1], 1),
                parseFloat(match[2], 1),
                parseFloat(match[3], 1));
            bot.navigate.to(pt);
        } else {
            console.log('no match')
        }
    }
});


function removeLevel(path){
    //for (let i = 0; i <= path.length; i++){
        bot.navigate.walk([path[0]], function () {
           botModel.dig();
        });
    //}
}



// Item {
//     type: 274,
//         count: 1,
//         metadata: 77,
//         nbt: null,
//         name: 'stone_pickaxe',
//         displayName: 'Stone Pickaxe',
//         stackSize: 1,
//         slot: 38 },