import { Account, isNewUser } from "../database/models/account.js";
import { City, getCities } from "../database/models/city.js";
import { menu_keyboard } from "./textController.js";
import { Product } from "../database/models/product.js";
import { InStockProduct, getInStockProducts } from "../database/models/inStockProduct.js";
import { SoldProduct } from "../database/models/soldProduct.js";

import fs from "fs";



let cbDataController = {};




cbDataController.returnToMenu = async (msg, bot, action) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        const menuKeyboard = menu_keyboard();

        await bot.editMessageText((await menuKeyboard).menu_text, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                resize_keyboard: true,
                inline_keyboard: (await menuKeyboard).inline_keyboard
            }
        });
    }
    catch(err) {
        console.log(err);
    }
}





cbDataController.profile = async (msg, bot) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        let acc = await Account.findOne({tgId: chatId});

        const accInfo = `👤 Ваш профиль:\n\n` +
        `💰 Баланс: ${Math.round(acc.balance)} руб\n`;

        await bot.editMessageText(accInfo, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [ { text: "◀Назад", callback_data: "return|returnToMenu" } ]
                ],
            }
        });
    }
    catch(err) {
        console.log(err.message);
    }
}





cbDataController.purchase_history = async (msg, bot) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        await bot.editMessageText("История покупок ещё не добавлена!", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [ { text: "◀Назад", callback_data: "return|returnToMenu" } ]
                ],
            }
        });
    }
    catch(err) {
        console.log(err.message);
    }
}





cbDataController.top_up_balance = async (msg, bot) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        await bot.editMessageText("Введите сумму пополнения от 100 руб:", {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: [
                    [ { text: "Отмена", callback_data: "paymentCancel|"+chatId } ]
                ]
            }
        });
    }
    catch(err) {
        console.log(err.message);
    }
}




cbDataController.newReqRequest = async (msg, bot, action) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        const answer = action[2];
        const userName = action[1];
        const userId = action[0];

        if(answer == "true") {
            await Account.updateOne({tgId: userId}, {$set: { status: "kladman", nickname: userName}} );
            bot.editMessageText("Юсер под id " + userId + " был успешно зарегестрирован!", {
                chat_id: chatId,
                message_id: messageId
            });
            bot.sendMessage(userId, "Вы были зарегестрированы как закладчик!");
        }
        else {
            bot.editMessageText("Юсер под id " + userId + " не был зарегестрирован!", {
                chat_id: chatId,
                message_id: messageId
            });
            bot.sendMessage(userId, "Вам было отказано в регистрации!");
        }
    }
    catch(err) {
        console.log(err.message);
    }
}









cbDataController.city = async (msg, bot, action) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        if(action.length > 1) {
            cbDataController.product(msg, bot, action);
            return;
        }

        const cities = await getCities();
        const cityData = action[0];

        for(const city of cities) {
            if(city.data == cityData) {
                let ikeyboard = [];


                for(let prod of city.products.split("|")) {
                    let prodInfo;
                    try {
                        prodInfo = await Product.findOne({data: prod});
                    }
                    catch(err) {
                        console.log(err.message);
                    }
                    
                    if(prodInfo != undefined) {
                        ikeyboard.push([{ text: prodInfo.name, callback_data: `city|${cityData}|${prodInfo.data}` }]);
                    }
                }

                ikeyboard.push([ { text: "◀Назад", callback_data: "return|returnToMenu" } ]);

                await bot.editMessageText(`${city.name}\n`, {
                    chat_id: chatId,
                    message_id: messageId,
                    reply_markup: {
                        inline_keyboard: ikeyboard
                    }
                });

                break;
            }
        }
    }
    catch(err) {
        console.log(err.message);
    }
}




cbDataController.product = async (msg, bot, action) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        if(action.length > 2) {
            cbDataController.buy(msg, bot, action);
            return;
        }

        const cityData = action[0];
        const productData = action[1];


        let ikeyboard = [];
        let aboutProductMessageText;


        let productInfo;
        const productPrices = {};
        try {
            productInfo = await Product.findOne({data: productData});
            
            for(const prodP of productInfo.price.split("|")) {
                if(prodP.split("-")[1] == "null") continue;
                productPrices[prodP.split("-")[0]] = prodP.split("-")[1] * 107.5 / 100;
            }
            aboutProductMessageText = `${productInfo.name}`;
        }
        catch(err) {
            console.log(err.message);
        }

        const thisInStockProducts = await InStockProduct.find({data: productData, city: cityData});

        const thisInStockProductAmounts = [];

        if(thisInStockProducts.length != 0) {
            for(const thisInStockProduct of thisInStockProducts) {
                const thisInStockProductAmount = thisInStockProduct.amount;
                let isInAmounts = false;
                for(const ispa of thisInStockProductAmounts) {
                    if(ispa == thisInStockProductAmount) {
                        isInAmounts = true;
                        break;
                    }
                }
                if(!isInAmounts) {
                    ikeyboard.push([ { text: thisInStockProductAmount+"г - "+productPrices[thisInStockProductAmount]+" руб", callback_data: "city|"+action.join("|")+"|buy|"+thisInStockProductAmount } ]);
                    thisInStockProductAmounts.push(thisInStockProductAmount);
                }
            }
        }
        else {
            ikeyboard.push([ {text: "Сейчас нет в наличии!", callback_data: "-"} ]);
        }

        ikeyboard.push([ { text: "◀Назад", callback_data: "return|"+`city|${cityData}` } ]);


        await bot.editMessageText(aboutProductMessageText, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: ikeyboard
            }
        });
    }
    catch(err) {
        console.log(err.message);
    }
}





cbDataController.buy = async (msg, bot, action) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    console.log(action);

    try {
        let city = await City.findOne({data: action[0]});
        let product = await Product.findOne({data: action[1]});

        let amount = +action[action.length-1];
        

        let user = await Account.findOne({tgId: chatId});
        
        
        const productPrices = {};
        for(const prodP of product.price.split("|")) {
            productPrices[prodP.split("-")[0]] = prodP.split("-")[1];
        }
        // function getTwoRandNumbers() {
        //     return (Math.floor(Math.random() * 99))/100;
        // }
        let productPrice = +productPrices[amount.toString()];
        productPrice = productPrice * 107.5 / 100;

        let isSuccessfully = false;
        let newBalance;
        if(user.balance >= productPrice) {
            newBalance = user.balance - productPrice;
            isSuccessfully = true;
        }
        let ikeyboard = [];
        
        let orderInfoMessage = "-";
        try {
            if(isSuccessfully) {
                let treasure;
                let treasures = await getInStockProducts();

                for(const tr of treasures) {
                    if(tr.amount == amount && tr.data == product.data && tr.city == city.data) {
                        treasure = tr;
                        break;
                    } 
                }
                if(treasure !== undefined) {
                    const treasureDirFiles = fs.readdirSync(`./photos/${treasure.city}/${treasure._id.toString()}`, { withFileTypes: true });

                    if(treasureDirFiles.length > 0) {
                        for(const treasureDirFile of treasureDirFiles) {
                            const treasureDirPhoto = fs.readFileSync(`./photos/${treasure.city}/${treasure._id.toString()}/${treasureDirFile.name}`);
                            await bot.sendPhoto(chatId, treasureDirPhoto);
                        }

                        await InStockProduct.deleteOne( {_id: treasure._id} );

                        await Account.updateOne( {tgId: chatId}, {$set: { balance: Math.round(newBalance) }} );

                        orderInfoMessage = `Ваш заказ:\n\n`+
                        `Город: ${city.name}\n`+
                        `Товар: ${product.name}\n`+
                        `Количество: ${amount}г\n`+
                        `Цена: ${productPrice} руб\n\n`+
                        `Вы успешно приобрели даный товар, остаток на вашем счёте - ${Math.round(newBalance)} руб`;
                        ikeyboard.push([ { text: "◀В главное меню", callback_data: "return|returnToMenu" } ]);

                        fs.rmSync(`./photos/${treasure.city}/${treasure._id.toString()}/`, { recursive: true, force: true });

                        await bot.sendMessage(chatId, `Доп. информация про ваш заказ: ${treasure.additionalInfo}`);

                        const date = new Date();
                        await SoldProduct.create({
                            name: product.name,
                            data: product.data,
                            amount: amount.toString(),
                            price: productPrice.toString(),
                            city: city.name,
                            kladmanId: treasure.kladmanId,
                            date: date.getDate() + "|" + (date.getMonth()+1) + "|" + date.getFullYear()
                        });
                    }
                }
                else {
                    orderInfoMessage = `Ваш заказ:\n\n`+
                    `Город: ${city.name}\n`+
                    `Товар: ${product.name}\n`+
                    `Количество: ${amount}г\n`+
                    `Цена: ${productPrice} руб\n\n`+
                    `Такого товара нету в наличии!`;
                    ikeyboard.push([ { text: "◀В главное меню", callback_data: "return|returnToMenu" } ]);
                }
            }
            else {
                orderInfoMessage = `Ваш заказ:\n\n`+
                `Город: ${city.name}\n`+
                `Товар: ${product.name}\n`+
                `Количество: ${amount}г\n`+
                `Цена: ${productPrice} руб\n\n`+
                `На вашем счету не хватило денег, баланс - ${Math.round(user.balance)} руб`;
                ikeyboard.push([ {text: "💰Пополнить баланс", callback_data: "top_up_balance" } ]);
            }
        }
        catch(err) {
            console.log(err.message);
            orderInfoMessage = `Ваш заказ:\n\n`+
            `Город: ${city.name}\n`+
            `Товар: ${product.name}\n`+
            `Количество: ${amount}г\n`+
            `Цена: ${productPrice} руб\n\n`+
            `Ошибка в обработке заказа. Приносим свои извинения!`;
            ikeyboard.push([ { text: "◀В главное меню", callback_data: "return|returnToMenu" } ]);
        }
        

        await bot.editMessageText(orderInfoMessage, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: ikeyboard
            }
        });

    }
    catch(err) {
        console.log(err.message);
    }
}





cbDataController.return = async (msg, bot, action) => {
    try {
        let params = action[0];
        action.splice(0, 1);
        cbDataController[params](msg, bot, action);
    }
    catch(err) {
        console.log(err.message);
    }
}





export { cbDataController };