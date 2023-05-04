import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        name: String,
        data: String,
        amount: String,
        price: String,
        city: String,
        kladmanId: Number,
        date: String
    }
);



const SoldProduct = mongoose.model("SoldProduct", schema);




async function getSoldProducts() {
    try {
        let soldProducts = await SoldProduct.find({});

        return soldProducts;
    }
    catch(err) {
        console.log(err.message);
    }
}




export { SoldProduct, getSoldProducts };