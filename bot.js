import dotenv from "dotenv";
dotenv.config();


import TelegramBot from "node-telegram-bot-api";
// import axios from "axios";

import { commandsController } from "./controllers/commandsController.js";
import { cbDataController } from "./controllers/cbDataController.js";
import { textController } from "./controllers/textController.js";
import { Account, isNewUser } from "./database/models/account.js";

import { City, getCities } from "./database/models/city.js";
import { Product, getProducts } from "./database/models/product.js";
import { InStockProduct, getInStockProducts } from "./database/models/inStockProduct.js";
import { SoldProduct } from "./database/models/soldProduct.js";

import fs from "fs";





const bot = new TelegramBot(
    process.env.TOKEN_MAIN,
    { polling: true }
);

const botChecker = new TelegramBot(
    process.env.TOKEN_ADMINS,
    { polling: true }
);





function getEmojis() {
    return ['😀', '😎', '🤖', '🚀', '🌈', '❤️', '🎉', '🍕', '🔥', '😃', '😊', '🐶', '🐱', '🐼', '🐔', '🐟', '🍔', '🍦', '🍓', '🌻', '🌍', '🎵', '🎮', '🎭', '🏀', '⚽️', '🚲', '✈️', '🚁'];
}
const game = {};
let payments = [];






bot.onText(/\/users/, async (msg) => {
    try {
        const chatId = msg.chat.id;
        const admins = await Account.find({status: "admin"});

        for(const admin of admins) {
            if(admin.tgId == chatId) {
                const accounts = await Account.find({});
                let accountsStr = "-----------\n";
                for(const acc of accounts) {
                    accountsStr += acc.tgId + "\n" + acc.balance + "\n" + acc.status + "\n-----------\n";
                }
                await bot.sendMessage(chatId, accountsStr);
                break;
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});




bot.onText(/\/addCardAdmin (.+)/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;
        let query = match[1];
        const admins = await Account.find({status: "admin"});

        for(const admin of admins) {
            if(admin.tgId == chatId) {
                await Account.updateOne({tgId: +query}, {$set: {status: "cardAdmin"}});
                bot.sendMessage(chatId, "Добавлен кард админ под id "+query);
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});


bot.onText(/\/send (.+)/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;
        let query = msg.text.split(" ");
        query.splice(0, 1);
        query = query.join("");
        const admins = await Account.find({status: "admin"});

        for(const admin of admins) {
            if(admin.tgId == chatId) {
                const accs = await Account.find({});
                for(const acc of accs) {
                    bot.sendMessage(acc.tgId, query);
                }
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});

bot.onText(/\/ban (.+)/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;
        let query = +match[1];
        const admins = await Account.find({status: "admin"});

        for(const admin of admins) {
            if(admin.tgId == chatId) {
                await Account.updateOne( {tgId: query}, {$set: {status: "ban"}} );
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});





bot.onText(/\/changeCard (.+)/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;
        let query = match[1];
        const admins = await Account.find( {status: "admin"} );
        const cardAdmins = await Account.find({status: "cardAdmin"});
        for(const admin of admins) {
            if(admin.tgId == chatId) {
                fs.writeFileSync("./cardNumber.txt", query);
                bot.sendMessage(chatId, "Номер карты изменён на "+query);
                return;
            }
        }
        for(const cardAdmin of cardAdmins) {
            if(cardAdmin.tgId == chatId) {
                fs.writeFileSync("./cardNumber.txt", query);
                bot.sendMessage(chatId, "Номер карты изменён на "+query);
                return;
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});




bot.onText(/\/adminData (.+)/, async (msg, match) => {
    try {
        const chatId = msg.chat.id;

        let query = msg.text.split(" ");
        query.splice(0, 1);
        query = query.join(" ");

        const admins = await Account.find( {status: "admin"} );
        for(const admin of admins) {
            if(admin.tgId == chatId) {
                fs.writeFileSync("./adminData.txt", query);
                bot.sendMessage(chatId, "Новые данные: "+query);
                return;
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
});





bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    let query = msg.text || " ";

    const nowUserStatus = await Account.findOne({tgId: chatId}).select("-_id status");
    console.log(nowUserStatus)
    if(nowUserStatus != null && nowUserStatus.status == "ban") return;

    if(query[0] == "/") {
        if(query == "/start") {
            try {
                let emojis = getEmojis();
                let secretEmojis = [];

                let ikeyboard = [];

                for(let row = 0; row < 3; row++) {
                    let ikeyboardRow = [];
                    for(let col = 0; col < 3; col++) {
                        const randEmojiIndex = Math.floor(Math.random() * (emojis.length-1));
                        ikeyboardRow.push({text: emojis[randEmojiIndex], callback_data: emojis[randEmojiIndex]});
                        let deletedEmoji = emojis.splice(randEmojiIndex, 1);
                        secretEmojis.push(deletedEmoji);
                        console.log(emojis);
                    }
                    ikeyboard.push(ikeyboardRow);
                }

                const secretEmoji = secretEmojis[Math.floor(Math.random() * (secretEmojis.length-1))];
                game[chatId] = { secretEmoji: secretEmoji };
                bot.sendMessage(chatId, `Загадано эмодзи: ${secretEmoji}\nВыберите правильное эмодзи:`, {
                    reply_markup: {
                        inline_keyboard: ikeyboard
                    }
                });
            }
            catch(err) {
                console.log(err.message);
            }
        }
        else if(query == "/reg") {
            commandsController.sendRegRequest(msg, bot)
        }
    }
    else {
        if(query == "💎Меню") {
            textController.menu(msg, bot);
            return;
        }

        try {
            function isNumber(num) {
                let res = +num;

                if(!isNaN(res)) {
                    return true;
                }
                else {
                    return false;
                }
            }

            function getTwoRandNumbers() {
                return (Math.floor(Math.random() * 50)) + 1;
            }

            for(const paymentIndex in payments) {
                if(payments[paymentIndex].id == chatId) {
                    if(isNumber(query)) {
                        query = (+query);
                        console.log(query);
                        if(query >= 100) {
                            query += getTwoRandNumbers();
                            let cardNumber = fs.readFileSync("./cardNumber.txt");
                            cardNumber = cardNumber.toString();
                            
                            await bot.sendMessage(chatId, `❗️ ВЫДАННЫЕ РЕКВИЗИТЫ ДЕЙСТВУЮТ 30 МИНУТ\n`+
                            `❗️ ПЕРЕВОДИТЕ ТОЧНУЮ СУММУ. НЕВЕРНАЯ СУММА НЕ БУДЕТ ЗАЧИСЛЕНА\n`+
                            `❗️ ОПЛАТА ДОЛЖНА ПРОХОДИТЬ ОДНИМ ПЛАТЕЖОМ\n`+
                            `❗️ ПРОБЛЕМЫ С ОПЛАТОЙ? ПЕРЕЙДИТЕ ПО ССЫЛКЕ : Payment(http://t.me/Candy_shop_operator)\n`+
                            `Предоставить чек об оплате и ID: ${chatId}\n`+
                            `❗️ С ПРОБЛЕМНОЙ ЗАЯВКОЙ ОБРАЩАЙТЕСЬ НЕ ПОЗДНЕЕ 24 ЧАСОВ С МОМЕНТА ОПЛАТЫ`);

                            console.log("checkUserPay|"+chatId+"|"+query);
                            const botMsg = await bot.sendMessage(chatId, `✅ Заявка принята на оплату.\n\nПереведите на банковскую  карту ${query} рублей удобным для вас способом\n\n❗️ Важно пополнить ровную сумму ❗️\n`+
                            `\n${cardNumber}\n\n❗️ У вас есть 45 мин на оплату, после чего платёж не будет зачислен ❗️\n\n⚠️ Перевёл неточную сумму - оплатил чужой заказ ⚠️`, {
                                reply_markup: JSON.stringify({
                                    inline_keyboard: [
                                        [ {text: "Оплатил", callback_data: "checkUserPay|"+chatId+"|"+query} ]
                                    ]
                                })
                            });
                            payments.splice(paymentIndex, 1);

                            // async function cancelMsg() {
                            //     try {
                            //         await Account.updateOne( {tgId: chatId}, {$set: {isWaitForPay: "false"}} );
                            //         await bot.editMessageText("Оплата не была проведена вовремя!", {
                            //             chat_id: chatId,
                            //             message_id: botMsg.message_id
                            //         });
                            //     }
                            //     catch(err) {
                            //         console.log(err.message);
                            //     }
                            // }
                            // setTimeout(cancelMsg, 2700000);
                        }
                        else {
                            bot.sendMessage(chatId, "Вы ввели не правильную сумму!\nПопробуйте ещё раз");
                        }
                    }
                    else {
                        bot.sendMessage(chatId, "Вы ввели не правильную сумму!\nПопробуйте ещё раз");
                    }
                    break;
                }
            }
        }
        catch(err) {
            console.log(err.message);
        }
    }
    
});




bot.on("callback_query", async (callbackQuery) => {
    let action = callbackQuery.data;
    const msg = callbackQuery.message;

    const chatId = msg.chat.id;

    const nowUserStatus = await Account.findOne({tgId: chatId}).select("-_id status");
    console.log(nowUserStatus)
    if(nowUserStatus != null && nowUserStatus.status == "ban") return;


    const chosenEmoji = action.toString();
    let secretEmoji = game[chatId];
    if(secretEmoji !== undefined) secretEmoji = secretEmoji.secretEmoji.toString();
    else secretEmoji = "";


    if(action == "profile") {
        cbDataController.profile(msg, bot);
    }
    else if(action == "purchase_history") {
        cbDataController.purchase_history(msg, bot);
    }
    else if(action == "top_up_balance") {
        payments.push({id: chatId});
        cbDataController.top_up_balance(msg, bot);
    }
    else {
        action = action.split("|");
        let command = action.splice(0, 1);
        if(command == "return") {
            cbDataController.return(msg, bot, action, botChecker);
        }
        else if(command == "city") {
            cbDataController.city(msg, bot, action, botChecker);
        }
        else if(command == "newRegRequest") {
            cbDataController.newReqRequest(msg, bot, action);
        }
        else if(command == "paymentCancel") {
            try {
                let userPaymentIndex;
                for(const paymentIndex in payments) {
                    if(payments[paymentIndex].id == chatId) {
                        userPaymentIndex = paymentIndex;
                        break;
                    }
                }
                if(userPaymentIndex !== undefined) {
                    payments.splice(userPaymentIndex, 1);
                    bot.sendMessage(chatId, "Пополнение отменено!");
                }
            }
            catch(err) {
                console.log(err.message);
            }
        }
        else if(command == "checkUserPay") {
            try {
                const accounts = await Account.find({status: "admin"});
                await Account.updateOne({tgId: chatId}, {$set: {isWaitForPay: "true"}});
                console.log("Action", action);
                for(const acc of accounts) {
                    try {
                        botChecker.sendMessage(acc.tgId, `Юсер под id ${action[0]} проводит оплату на ${action[1]} руб`, {
                            reply_markup: JSON.stringify({
                                inline_keyboard: [
                                    [ {text: "Принять оплату", callback_data: "userPay|true|"+action[0]+"|"+action[1]} ],
                                    [ {text: "Отменить оплату", callback_data: "userPay|false|"+action[0]+"|"+action[1]} ]
                                ]
                            })
                        });
                    }
                    catch(err) {
                        console.log(err.message);
                    }
                }
                await bot.sendMessage(chatId, "Ожидайте пополнение, в течении часа!");
                await bot.editMessageText("Оплата на " + action[1] + " руб", {
                    chat_id: chatId,
                    message_id: msg.message_id
                });
            }
            catch(err) {
                console.log(err.message);
            }
        }
        else {
            if (chosenEmoji === secretEmoji) {
                commandsController.start(msg, bot);
            } else {
                await bot.sendMessage(chatId, 'Неправильно! Попробуйте еще раз');
            }
        }
    }
});





botChecker.on("callback_query", async (callbackQuery) => {
    let action = callbackQuery.data;
    const msg = callbackQuery.message;

    const chatId = msg.chat.id;

    action = action.split("|");
    let command = action.splice(0, 1);

    if(command == "userPay") {
        try {
            const userId = +action[1];
            const nowUserAccount = await Account.findOne({tgId: userId});
            if(nowUserAccount.isWaitForPay == "true") {
                if(action[0] == "true") {
                        await Account.updateOne({tgId: userId}, {$set: { balance: nowUserAccount.balance + (+action[2]), isWaitForPay: "false" }});
                        botChecker.editMessageText("Вы приняли пополнение пользователя под id " + action[1] + " на сумму " + action[2] + " руб", {
                            chat_id: chatId,
                            message_id: msg.message_id
                        });
                        bot.sendMessage(userId, "Ваш платёж был принят, проверьте баланс в профиле!");
                }
                else {
                    await Account.updateOne({tgId: userId}, {$set: { isWaitForPay: "false" }});
                    botChecker.editMessageText("Вы отклонили пополнение пользователя под id " + action[1], {
                        chat_id: chatId,
                        message_id: msg.message_id
                    });
                    bot.sendMessage(userId, "Ваш платёж был отклонён!");
                }
            }
            else {
                botChecker.sendMessage(chatId, "Уже не актуально");
            }
        }
        catch(err) {
            console.log(err.message);
        }
    }
});





export { bot };
