import mongoose from "mongoose";




const Schema = mongoose.Schema;


const schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        data: { type: String, required: true, unique: true },
        products: String
    }
);




const Category = mongoose.model("Category", schema);





async function getCategoryProducts(categoryData) {
    try {
        let category = await Category.findOne({data: categoryData});
        console.log(category);
        let categoryProducts = category.products.split("|");

        return categoryProducts;
    }
    catch(err) {
        console.log(err.message);
    }
}





async function getCategories() {
    try {
        let categories = await Category.find({});

        return categories;
    }
    catch(err) {
        console.log(err.message);
    }
}





export { Category, getCategoryProducts, getCategories };