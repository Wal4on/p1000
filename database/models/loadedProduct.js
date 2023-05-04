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



const LoadedProduct = mongoose.model("LoadedProduct", schema);




async function getLoadedProducts() {
    try {
        let loadedProduct = await LoadedProduct.find({});

        return loadedProduct;
    }
    catch(err) {
        console.log(err.message);
    }
}




export { LoadedProduct, getLoadedProducts };