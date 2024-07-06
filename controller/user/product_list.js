const productDatabase = require("../../models/productModel");
const categoryDb = require("../../models/category");
const mongoose  = require("mongoose");

const productList = async (req, res) => {
    try {
        const current = req.session.user ? true : false;
        const search = req.query.search || "";
        const sort = req.query.sort || "default";
        const categoryId = req.query.category;
        
        // Fetch all categories for rendering the category filter options
        const categories = await categoryDb.find();

        // Determine sort option
        let sortOption;
        switch (sort) {
            case "price-asc":
                sortOption = { product_price: 1 };
                break;
            case "price-desc":
                sortOption = { product_price: -1 };
                break;
            case "name-asc":
                sortOption = { product_name: 1 };
                break;
            case "name-desc":
                sortOption = { product_name: -1 };
                break;
            default:
                sortOption = { product_name: 1 };
                break;
        }

       
        let query = {
            product_name: { $regex: search, $options: "i" }
        };

        // Add category to query if provided
        if (categoryId) {
            const category = await categoryDb.findOne({categoryName:categoryId})
            if (category) {
                query.product_category = category._id;
            }
        }
console.log(query);
        // Fetch products based on query and sort options
        const products = await productDatabase.find(query).sort(sortOption);

        // Send response based on request type (XHR or regular)
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json({ products });
        } else {
            res.render("user/product_list", { categories, search, product: products, status: current });
        }
    } catch (error) {
        console.error("Error occurred while fetching products:", error);
        res.status(500).send("Error occurred while fetching products");
    }
};

module.exports = {
    productList
};
