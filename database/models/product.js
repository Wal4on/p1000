import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        data: { type: String, required: true, unique: true },
        price: String
    }
);




const Product = mongoose.model("Product", schema);





async function getProducts() {
    try {
        let products = await Product.find({});

        return products;
    }
    catch(err) {
        console.log(err.message);
    }
}





export { Product, getProducts };