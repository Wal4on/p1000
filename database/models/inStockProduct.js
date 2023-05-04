import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        data: String,
        amount: String,
        city: String,
        kladmanId: Number,
        date: String,
        additionalInfo: String
    }
);



const InStockProduct = mongoose.model("InStockProduct", schema);




async function getInStockProducts() {
    try {
        let inStockProducts = await InStockProduct.find({});

        return inStockProducts;
    }
    catch(err) {
        console.log(err.message);
    }
}




export { InStockProduct, getInStockProducts };