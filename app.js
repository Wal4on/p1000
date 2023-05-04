import dotenv from "dotenv";
dotenv.config();


import { Account } from "./database/models/account.js";
import express from "express";
import "./database/index.js";
import { bot } from "./bot.js";

import hbs from "hbs";
import expressHbs from "express-handlebars";

import { City, getCities } from "./database/models/city.js";
import { Product, getProducts } from "./database/models/product.js";
import { InStockProduct, getInStockProducts } from "./database/models/inStockProduct.js";
import { SoldProduct } from "./database/models/soldProduct.js";
import { LoadedProduct, getLoadedProducts } from "./database/models/loadedProduct.js"

import fs, { cpSync } from "fs";
import formidable from "formidable";






const app = express();



app.engine("hbs", expressHbs.engine(
    {
        layoutsDir: "./views/layouts", 
        defaultLayout: "layout",
        extname: "hbs"
    }
))
app.set("view engine", "hbs");
hbs.registerPartials("./views/partials");



app.use(express.static("./static"));


app.get("/", (req, res) => {
    try {
        let script = fs.readFileSync("./scripts/adminPanelScript.js", {encoding: "utf8"});
        
        res.render("admin", {
            title: "Panel",
            script: new hbs.SafeString(script.toString())
        });
    }
    catch(err) {
        console.log(err.messsage);
        res.send(err.messsage);
    }
});


app.post("/admin", express.json(), async (req, res) => {
    try {
        let adminData = fs.readFileSync("./adminData.txt");
        adminData = adminData.toString().split(" ");
        if(req.body.login != adminData[0] || req.body.password != adminData[1]) {
            res.send("Incorrect data!");
            return;
        }

        let citiesInfoList = [];

        let productsInfoList = [];

        let productsInCitiesInfoList = [];

        let productsPriceInfoList = [];

        let kladmansInfoList = [];

        let kladmans = await Account.find( {status: "kladman"} );
        for(const kladman of kladmans) {
            kladmansInfoList.push({
                id: kladman.tgId,
                name: kladman.nickname || "none"
            });
        }


        let cities = await getCities();
        // console.log(cities);
        let products = await getProducts();

        let cityIndex = 1;
        if(cities.length != 0) {

            let prodIndex = 1;
            for(const prod of products) {
                productsInfoList.push({
                    name: prod.name,
                    data: prod.data,
                    price: prod.price,
                    i: prodIndex
                });
                let prices = prod.price.split("|");
                let pricesObj = [];
                for(const p of prices) {
                    if(p.split("-")[1] == "null") continue;
                    pricesObj.push( {amount: p.split("-")[0]} );
                }
                productsPriceInfoList.push({
                    data: prod.data,
                    prices: pricesObj
                })
                prodIndex++;
            }


            for(const city of cities) {
                const cityProds = city.products.split("|");
                const prods = [];
                
                for(const prod of products) {
                    let isInCityProd = false;
                    for(const cityProd of cityProds) {
                        if(cityProd == prod.data) {
                            isInCityProd = true;
                            break;
                        }
                    }
                    if(isInCityProd) {
                        prods.push( {name: prod.name, data: prod.data} );
                    }
                }

                productsInCitiesInfoList.push({
                    data: city.data,
                    products: prods
                });
                // console.log(productsInCitiesInfoList[productsInCitiesInfoList.length-1]);

                citiesInfoList.push({
                    name: city.name,
                    data: city.data,
                    products: productsInfoList,
                    i: cityIndex
                });

                cityIndex++;
            }
            
        }
        else if(products.length != 0) {
            productsInfoList = [];
            let prodIndex = 1;
            
            for(const prod of products) {
                productsInfoList.push({
                    name: prod.name,
                    data: prod.data,
                    price: prod.price,
                    i: prodIndex
                });
                prodIndex++;
            }
        }

        const productsPriceInfoListTemp = productsPriceInfoList;
        productsPriceInfoList = [];

        for(let tempPiceOfProductIndex = 0; tempPiceOfProductIndex < productsInfoList.length; tempPiceOfProductIndex++) {
            productsPriceInfoList.push(productsPriceInfoListTemp[tempPiceOfProductIndex]);
        }

        let stats = [];

        const soldProducts = await SoldProduct.find({});


        for(const soldP of soldProducts) {
            let isNewDate = true;
            for(const statI in stats) {
                if(stats[statI].date == soldP.date) {
                    isNewDate = false;
                    break; 
                }
            }
            if(isNewDate) {
                stats.push({
                    date: soldP.date
                });
            }
        }

        for(const stat of stats) {
            let soldProducts = await SoldProduct.find({date: stat.date});
            let prods = [];
            let genPrice = 0;
            for(const soldP of soldProducts) {
                let isNewProdName = true;
                for(const prodIndex in prods) {
                    if(prods[prodIndex].name == soldP.name) {
                        isNewProdName = false;
                        let isNewPrice = true;
                        for(const amountProdIndex in prods[prodIndex].amounts) {
                            if(prods[prodIndex].amounts[amountProdIndex].amount == soldP.amount) {
                                isNewPrice = false;
                                prods[prodIndex].amounts[amountProdIndex].number++;
                                genPrice += (+soldP.price);
                                break;
                            }
                        }
                        if(isNewPrice) {
                            prods[prodIndex].amounts.push({amount: soldP.amount, number: 1});
                            genPrice += (+soldP.price);
                        }
                        break;
                    }
                }
                if(isNewProdName) {
                    prods.push({name: soldP.name, amounts: []});
                    prods[prods.length-1].amounts.push({amount: soldP.amount, number: 1});
                    genPrice += (+soldP.price);
                }
            }
            stat.sold = prods;
            stat.price = Math.round(genPrice);
        }

        let nowProds = [];
        const nowInStockCandies = await InStockProduct.find({});
        let candyIndex = 1;
        for(const inStockCandy of nowInStockCandies) {
            const cName = await Product.findOne({data: inStockCandy.data}).select("-_id name");
            const cityName = await City.findOne({data: inStockCandy.city}).select("-_id name");
            const kNick = await Account.findOne({tgId: inStockCandy.kladmanId}).select("-_id nickname");
            nowProds.push({
                name: cName.name,
                data: inStockCandy.data,
                cityName: cityName.name,
                cityData: inStockCandy.city,
                amount: inStockCandy.amount,
                kId: inStockCandy.kladmanId,
                kName: kNick.nickname,
                addInf: inStockCandy.additionalInfo,
                candyIndex: candyIndex,
                id: inStockCandy._id
            });
            candyIndex++;
        }


        let inStockDatas = [];
        for(const nowInStockCandy of nowInStockCandies) {
            let isNewDate = true;
            if(nowInStockCandy.date !== undefined) {
                for(const dat of inStockDatas) {
                    if(dat.date == nowInStockCandy.date)  {
                        isNewDate = false;
                        break;
                    }
                }
                if(isNewDate) {
                    inStockDatas.push({
                        date: nowInStockCandy.date
                    });
                }
            }
        }

        let datasCitiesProducts = [];
        for(const cDate of inStockDatas) {
            const inStockCities = await InStockProduct.find({date: cDate.date});
            let datasCities = [];

            for(const isc of inStockCities) {
                let isNewCity = true;
                for(const dc of datasCities) {
                    if(dc.city == isc.city)  {
                        isNewCity = false;
                        break;
                    }
                }
                if(isNewCity) {
                    const c = await City.findOne({data: isc.city});
                    const cProds = c.products.split("|");
                    let cProdsList = [];
                    for(const cp of cProds) {
                        const ispc = await InStockProduct.find({data: cp, city: c.data, date: cDate.date});
                        // console.log(ispc);
                        const ams = [];
                        for(const am of ispc) {
                            let isNewAmount = true;
                            let aIndex;
                            for(const a in ams) {
                                if(ams[a].amount == am.amount) {
                                    isNewAmount = false;
                                    aIndex = a;
                                    break;
                                }
                            }
                            if(isNewAmount) {
                                ams.push({amount: am.amount, number: 1});
                            }
                            else {
                                ams[aIndex].number++;
                            }
                            // ams.push(am.amount)
                        }
                        const pName = await Product.findOne({data: cp}).select("-_id name");
                        cProdsList.push({
                            data: cp,
                            pName: pName.name,
                            amounts: ams
                        });
                    }

                    const cName = await City.findOne({data: isc.city}).select("-_id name");
                    datasCities.push({
                        city: isc.city,
                        cityName: cName.name,
                        prods: cProdsList
                    });
                }
            }
        
            datasCitiesProducts.push({
                date: cDate.date,
                cities: datasCities
            });
        }

        const nowInStockCandiesLoaded = await LoadedProduct.find({});
        let inStockDatasLoaded = [];
        for(const nowInStockCandy of nowInStockCandiesLoaded) {
            let isNewDate = true;
            if(nowInStockCandy.date !== undefined) {
                for(const dat of inStockDatasLoaded) {
                    if(dat.date == nowInStockCandy.date)  {
                        isNewDate = false;
                        break;
                    }
                }
                if(isNewDate) {
                    inStockDatasLoaded.push({
                        date: nowInStockCandy.date
                    });
                }
            }
        }
        let datasCitiesProductsLoaded = [];
        for(const cDate of inStockDatasLoaded) {
            const inStockCities = await LoadedProduct.find({date: cDate.date});
            let datasCities = [];

            for(const isc of inStockCities) {
                let isNewCity = true;
                for(const dc of datasCities) {
                    if(dc.city == isc.city)  {
                        isNewCity = false;
                        break;
                    }
                }
                if(isNewCity) {
                    const c = await City.findOne({data: isc.city});
                    const cProds = c.products.split("|");
                    let cProdsList = [];
                    for(const cp of cProds) {
                        const ispc = await LoadedProduct.find({data: cp, city: c.data, date: cDate.date});
                        // console.log(ispc);
                        const ams = [];
                        for(const am of ispc) {
                            let isNewAmount = true;
                            let aIndex;
                            for(const a in ams) {
                                if(ams[a].amount == am.amount) {
                                    isNewAmount = false;
                                    aIndex = a;
                                    break;
                                }
                            }
                            if(isNewAmount) {
                                ams.push({amount: am.amount, number: 1});
                            }
                            else {
                                ams[aIndex].number++;
                            }
                            // ams.push(am.amount)
                        }
                        const pName = await Product.findOne({data: cp}).select("-_id name");
                        cProdsList.push({
                            data: cp,
                            pName: pName.name,
                            amounts: ams
                        });
                    }

                    const cName = await City.findOne({data: isc.city}).select("-_id name");
                    datasCities.push({
                        city: isc.city,
                        cityName: cName.name,
                        prods: cProdsList
                    });
                }
            }
        
            datasCitiesProductsLoaded.push({
                date: cDate.date,
                cities: datasCities
            });
        }

        res.render("adminPanel", {
            title: "Panel",
            citiesLength: citiesInfoList.length,
            cities: citiesInfoList,
            productsLength: productsInfoList.length,
            products: productsInfoList,
            productsInCities: productsInCitiesInfoList,
            productsPrices: productsPriceInfoList,
            kladmans: kladmansInfoList,
            nowProds: nowProds,
            inStockLen: nowProds.length,
            dcp: datasCitiesProducts,
            dcpl: datasCitiesProductsLoaded,
            stats: stats
        });
    }
    catch(err) {
        console.log(err.messsage);
        res.send(err.messsage);
    }
});



app.post("/admin/changeCity", express.json(), async (req, res) => {
    try {
        if(req.body.products.length == 0) {
            await City.updateOne({data: req.body.data}, {$set: { name: req.body.name }});
        }
        else {
            await City.updateOne({data: req.body.data}, {$set: { name: req.body.name, products: req.body.products.join("|") }});
        }
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});

app.post("/admin/addCity", express.json(), async (req, res) => {
    try {
        if(req.body.products.length != 0 && req.body.name != "") {
            await City.create({
                name: req.body.name,
                data: req.body.data,
                products: req.body.products.join("|")
            });
        }
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});

app.post("/admin/delCity", express.json(), async (req, res) => {
    try {
        await City.deleteOne({data: req.body.data});
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});



app.post("/admin/changeProduct", express.json(), async (req, res) => {
    try {
        await Product.updateOne({data: req.body.data}, {$set: { name: req.body.name, price: req.body.price }});
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});

app.post("/admin/addProduct", express.json(), async (req, res) => {
    try {
        if(req.body.price != 0 && req.body.name != "") {
            await Product.create({
                name: req.body.name,
                data: req.body.data,
                price: req.body.price
            });
        }
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});

app.post("/admin/delProduct", express.json(), async (req, res) => {
    try {
        await Product.deleteOne({data: req.body.data});
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});

app.post("/admin/delCandy", express.json(), async (req, res) => {
    try {
        const inStockProdData = await InStockProduct.findOne({_id: req.body.mongId});
        fs.rmSync(`./photos/${inStockProdData.city}/${inStockProdData._id}/`, { recursive: true, force: true });
        await InStockProduct.deleteOne({_id: req.body.mongId});
    }
    catch(err) {
        console.log(err.messsage);
    }

    res.sendStatus(200);
});




app.post("/admin/uploads", async (req, res) => {
    try {
        new formidable.IncomingForm({
            multiples: true,
            uploadDir: "./uploads"
        }).parse(req, async (err, fields, files) => {

            const productData = fields["product"+fields.place];

            const date = new Date();
            
            const newInStockProduct = await InStockProduct.create({
                data: fields["product"+fields.place],
                amount: fields["amount"+productData],
                kladmanId: +fields.kladmans,
                city: fields.place,
                date: date.getDate() + "|" + (date.getMonth()+1) + "|" + date.getFullYear(),
                additionalInfo: fields.additionalDescription
            });
            const treasureDirName = newInStockProduct._id.toString();

            const newLoadedProduct = await LoadedProduct.create({
                data: fields["product"+fields.place],
                amount: fields["amount"+productData],
                kladmanId: +fields.kladmans,
                city: fields.place,
                date: date.getDate() + "|" + (date.getMonth()+1) + "|" + date.getFullYear(),
                additionalInfo: fields.additionalDescription
            });
            
            if (!fs.existsSync(`./photos`)) {
                fs.mkdirSync(`./photos`);
            }
            if (!fs.existsSync(`./photos/${fields.place}`)) {
                fs.mkdirSync(`./photos/${fields.place}`);
            }

            if(files.treasurePhotos.length === undefined) {
                if(files.treasurePhotos.size != 0) {
                    if (!fs.existsSync(`./photos/${fields.place}/${treasureDirName}`)) {
                        fs.mkdirSync(`./photos/${fields.place}/${treasureDirName}`);
                    }
                    fs.readdir("./uploads", (err, photos) => {
                        for(const photoName of photos) {
                            console.log(photoName);
                            if(photoName == files.treasurePhotos.newFilename) {
                                const photo = fs.readFileSync(`./uploads/${photoName}`);
                                fs.writeFileSync(`./photos/${fields.place}/${treasureDirName}/${treasureDirName}1.png`, photo);
                                fs.unlink(`./uploads/${photoName}`, (err) => {
                                    if(err) console.log(err.message);
                                });
                            }
                        }
                    });
                }
                else {
                    fs.readdir("./uploads", (err, photos) => {
                        for(const photoName of photos) {
                            if(photoName == files.treasurePhotos.newFilename) {
                                fs.unlink(`./uploads/${photoName}`, (err) => {
                                    if(err) console.log(err.message);
                                });
                            }
                        }
                    });
                    await InStockProduct.deleteOne({data: fields["product"+fields.place]});
                    await LoadedProduct.deleteOne({data: fields["product"+fields.place]});
                }
            }
            else {
                if(!fs.existsSync(`./photos/${fields.place}/${treasureDirName}`)) {
                    fs.mkdirSync(`./photos/${fields.place}/${treasureDirName}`);
                }
                let photoNumber = 1;
                for(const treasurePhoto of files.treasurePhotos) {
                    const photo = fs.readFileSync(`./uploads/${treasurePhoto.newFilename}`);

                    fs.writeFileSync(`./photos/${fields.place}/${treasureDirName}/${treasureDirName}${photoNumber}.png`, photo);
                    fs.unlink(`./uploads/${treasurePhoto.newFilename}`, (err) => {
                        if(err) console.log(err.message);
                    });
                    
                    photoNumber++;
                }
            }

            res.redirect("/");
        });
    }
    catch(err) {
        console.log(err.messsage);
        res.send(err.messsage);
    }
});


app.listen(80, (err) => {
    if(err) console.log(err.messsage);
    else console.log("Started!");
});

