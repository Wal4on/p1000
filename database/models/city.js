import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        data: { type: String, required: true, unique: true },
        products: String
    }
);



const City = mongoose.model("City", schema);




async function getCities() {
    try {
        let cities = await City.find({});

        return cities;
    }
    catch(err) {
        console.log(err.message);
    }
}




export { City, getCities };