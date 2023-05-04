import { City, getCities } from "../database/models/city.js";




let textController = {};




const menu_keyboard = async () => {
    const cities = await getCities();

    let ikeyboard = [];

    for(const cityIndex in cities) {
        if(cityIndex % 2 == 0 || cityIndex == 0) {
            ikeyboard.push([ 
                {text: cities[cityIndex].name, callback_data: "city|"+cities[cityIndex].data} 
            ]);
        }
        else if(cityIndex % 2 != 0) {
            ikeyboard.splice(ikeyboard.length-1, 1);
            ikeyboard.push([ 
                {text: cities[cityIndex-1].name, callback_data: "city|"+cities[cityIndex-1].data}, 
                {text: cities[cityIndex].name, callback_data: "city|"+cities[cityIndex].data}
            ]);
        }
    }

    ikeyboard.push([ {text: "👤Профиль", callback_data: "profile" } ]);
    ikeyboard.push([ {text: "🎁История покупок", callback_data: "purchase_history" }, {text: "💰Пополнить баланс", callback_data: "top_up_balance" } ]);
    ikeyboard.push([ {text: "📘Оператор", url: "https://t.me/Candy_shop_operator" } ]);
    ikeyboard.push([ {text: "💶Работа/Заработок💶", url: "https://t.me/candytopshop" } ]);
    

    return { menu_text: "🔰 Выберите действие:", inline_keyboard: ikeyboard };
}





textController.menu = async (msg, bot) => {
    const chatId = msg.chat.id;

    const menuKeyboard = await menu_keyboard();

    bot.sendMessage(chatId, menuKeyboard.menu_text, {
        reply_markup: JSON.stringify({
            inline_keyboard: menuKeyboard.inline_keyboard
        })
    });
}





export { textController, menu_keyboard };