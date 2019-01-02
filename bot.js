"use strict";

const mineflayer = require('mineflayer');
const vec3 = require('vec3');
const navigatePlugin = require('mineflayer-navigate')(mineflayer);

class botModel {
    constructor() {
        this.bot = mineflayer.createBot({
            host: "192.168.88.96", // optional
            port: 25565, // optional
            username: "bot0",
        });
        this.vec3 = vec3;
    }

    async join() {
        navigatePlugin(this.bot);
    }

    dig() {
        if (this.bot.targetDigBlock) {
            this.bot.chat(`already digging ${this.bot.targetDigBlock.name}`)
        } else {
            let target = this.bot.blockAt(this.bot.entity.position.offset(0, -1, 0));
            if (target && this.bot.canDigBlock(target)) {
                let err = "";
                this.bot.chat(`starting to dig ${target.name}`);
                this.bot.dig(target, this.onDiggingCompleted(err, target, this.bot));
            } else {
                this.bot.chat('cannot dig');
            }
        }
    }

    async onDiggingCompleted (err, target, bot) {
        if (err) {
            console.log(err.stack);
            return;
        }
        bot.chat(`finished digging ${target.name}`);
    }

    async sayItems(items = this.bot.inventory.items()) {
        let output = items.map(botModel.itemToString).join(', ');
        if (output) {
            this.bot.chat(output);
        } else {
            this.bot.chat('empty');
        }
    }

    static itemToString(item) {
        if (item) {
            return `${item.name} x ${item.count}`;
        } else {
            return '';
        }
    }

    itemByName(name) {
        return this.bot.inventory.items().filter(item => item.name === name)[0];
    }

    async equipItem(name, destination, callBack) {
        const item = this.itemByName(name);
        let err = "";
        if (item) {
            this.bot.equip(item, destination, this.checkIfEquipped(err, name, callBack));
        } else {
            this.bot.chat(`I have no ${name}`);
        }
    }

    checkIfEquipped(err, name, callBack) {
        if (err) {
            this.bot.chat(`cannot equip ${name}: ${err.message}`);
        } else {
            this.bot.chat(`equipped ${name}`);
            callBack();
        }
    }

    async unequipItem(destination) {
        bot.unequip(destination, (err) => {
            if (err) {
                this.bot.chat(`cannot unequip: ${err.message}`)
            } else {
                this.bot.chat('unequipped')
            }
        })
    }

    getcalculations(px, py, pz) {
        let size = 5;
        let start = 1;
        let forward;
        let path = [];
        let i = 0;

        let bx = parseFloat(px) + parseFloat("0.5");
        let by = py;
        let bz = parseFloat(pz) + parseFloat("0.5");

        for (let x = start; x <= size; x++) {
            forward = x % 2 !== 0;
            for (let z = start; z <= size; z++) {
                path[i++] = vec3(bx, by, bz);
                if (z === size) {
                    continue;
                }
                if (forward) {
                    bz++
                } else {
                    bz--
                }
            }
            bx++;
        }
        console.log(path);
        return path;
    }
}

module.exports = new botModel();