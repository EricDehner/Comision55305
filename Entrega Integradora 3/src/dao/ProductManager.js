import { productModel } from "./models/product.model.js";

class ProductManager {
    async getProducts(params) {
        if (params) {
            let { limit, page, query, sort } = params
            limit = limit ? limit : 9;
            page = page ? page : 1;
            sort = sort ? (sort == "asc" ? 1 : -1) : 0;
            query = query || {};

            let queryFilter = {};
            if (query && typeof query === 'string') {
                queryFilter.category = query.replace('category:', '');
            }

            console.log("Params:", params, "Limit:", limit, "Page:", page, "Sort:", sort, "Query Filter:", queryFilter);
            let products = await productModel.paginate(queryFilter, { limit: limit, page: page, sort: { price: sort } });
            let status = products ? "success" : "error";


            let prevLink = products.hasPrevPage ? "http://localhost:8080/products?limit=" + limit + "&sort=" + sort + "&page=" + products.prevPage/*  + "&query=" + queryFilter  */ : null;
            let nextLink = products.hasNextPage ? "http://localhost:8080/products?limit=" + limit + "&sort=" + sort + "&page=" + products.nextPage/*  + "&query=" + queryFilter  */ : null;

            products = { status: status, payload: products.docs, totalPages: products.totalPages, prevPage: products.prevPage, nextPage: products.nextPage, page: products.page, hasPrevPage: products.hasPrevPage, hasNextPage: products.hasNextPage, prevLink: prevLink, nextLink: nextLink };
            return products;
        } else {
            if (params) {
                return productModel.find().limit(limit).lean()
            } else {
                return productModel.find().lean();
            }
        }
    }


    async addProduct(product) {
        try {
            if (await this.validateCode(product.code)) {
                console.log("Error! Code exists!");
                return false;
            } else {
                const producto = {
                    title: product.title,
                    description: product.description,
                    code: product.code,
                    price: product.price,
                    status: product.status,
                    stock: product.stock,
                    category: product.category,
                    thumbnails: product.thumbnails,
                    owner: product.owner
                };
                const createdProduct = await productModel.create(producto);
                console.log("Product added!");
                return createdProduct;
            }
        } catch (error) {
            console.error("Error adding product:", error);
            return false;
        }
    }

    async validateCode(code) {
        try {
            return await productModel.exists({ code: code });
        } catch (error) {
            console.error("Error validating code:", error);
            return false;
        }
    }

    async updateProduct(id, product) {
        try {
            const updatedProduct = await productModel.findByIdAndUpdate(id, product, {
                new: true,
            });
            if (updatedProduct) {
                console.log("Product updated!");
                return true;
            } else {
                console.log("Product not found!");
                return false;
            }
        } catch (error) {
            console.error("Error updating product:", error);
            return false;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await productModel.findByIdAndDelete(id);
            if (deletedProduct) {
                console.log("Product #" + id + " deleted!");
                return true;
            } else {
                console.log("Product not found!");
                return false;
            }
        } catch (error) {
            console.error("Error deleting product:", error);
            return false;
        }
    }

    async getProductById(id) {
        try {
            return await productModel.findById(id).lean();
        } catch (error) {
            console.error("Error fetching product by id:", error);
            return null;
        }
    }

    validateId(id) {
        return id.length === 24 ? true : false;
    }
}

export default ProductManager;