// const express = require('express');
// const axios = require('axios');
// // const { NuCache } = require('memjs');
// const Memcached = require('memjs');

// const app = express();
// const port = 3000;
// // const cache = new NuCache('localhost:11211');
// const cache = new Memcached('localhost:11211');

// app.get('/categories/:categoryname/products', async (req, res) => {
//     const categoryname = req.params.categoryname;
//     const n = parseInt(req.query.n) || 10;
//     const minPrice = parseFloat(req.query.minPrice) || 0;
//     const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
//     const sort = req.query.sort || 'rating';
//     const page = parseInt(req.query.page) || 1;

//     try {
//         const cacheKey = `top_products_${categoryname}_${n}_${minPrice}_${maxPrice}_${sort}_${page}`;
//         const cachedValue = await cache.get(cacheKey);

//         if (cachedValue) {
//             return res.json(JSON.parse(cachedValue));
//         }

//         const ecommerceCompanies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
//         const topProducts = [];

//         for (const company of ecommerceCompanies) {
//             const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products?top=${n}&minPrice=${minPrice}&maxPrice=${maxPrice}`);

//             for (const product of response.data) {
//                 topProducts.push({
//                     company,
//                     id: generateUuid(),
//                     ...product
//                 });
//             }
//         }

//         // sorting logic
//         topProducts.sort((a, b) => {
//             if (sort === 'rating') {
//                 return b.rating - a.rating;
//             } else if (sort === 'price') {
//                 return b.price - a.price;
//             } else if (sort === 'company') {
//                 return a.company.localeCompare(b.company);
//             } else if (sort === 'discount') {
//                 return b.discount - a.discount;
//             }
//         });

//         // pagination logic
//         const paginatedProducts = topProducts.slice((page - 1) * n, page * n);

//         await cache.set(cacheKey, JSON.stringify(paginatedProducts), { expires: 600 });

//         res.json(paginatedProducts);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

// app.get('/categories/:categoryname/products/:productid', async (req, res) => {
//     const categoryname = req.params.categoryname;
//     const productid = req.params.productid;

//     try {
//         const cacheKey = `product_${productid}`;
//         const cachedValue = await cache.get(cacheKey);

//         if (cachedValue) {
//             return res.json(JSON.parse(cachedValue));
//         }

//         const response = await axios.get(`http://20.244.56.144/test/products/${productid}`);

//         await cache.set(cacheKey, JSON.stringify(response.data), { expires: 600 });

//         res.json(response.data);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Server Error');
//     }
// });

// function generateUuid() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//         const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//     });
// }

// app.listen(port, () => {
//     console.log(`Server listening at http://localhost:${port}`);
// });


const express = require('express');
const axios = require('axios');
var cors = require('cors')


const app = express();
app.use(cors())
const port = 3000;
const cache = {};

app.get('/categories/:categoryname/products', async (req, res) => {
    const categoryname = req.params.categoryname;
    const n = parseInt(req.query.n) || 10;
    const minPrice = parseFloat(req.query.minPrice) || 0;
    const maxPrice = parseFloat(req.query.maxPrice) || Number.MAX_VALUE;
    const sort = req.query.sort || 'rating';
    const page = parseInt(req.query.page) || 1;

    try {
        const cacheKey = `top_products_${categoryname}_${n}_${minPrice}_${maxPrice}_${sort}_${page}`;
        const cachedValue = cache[cacheKey];

        if (cachedValue) {
            return res.json(cachedValue);
        }

        const ecommerceCompanies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
        const topProducts = [];

        for (const company of ecommerceCompanies) {
            const response = await axios.get(`http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products?top=${n}&minPrice=${minPrice}&maxPrice=${maxPrice}`);

            for (const product of response.data) {
                topProducts.push({
                    company,
                    id: generateUuid(),
                    ...product
                });
            }
        }

        // sorting logic
        topProducts.sort((a, b) => {
            if (sort === 'rating') {
                return b.rating - a.rating;
            } else if (sort === 'price') {
                return b.price - a.price;
            } else if (sort === 'company') {
                return a.company.localeCompare(b.company);
            } else if (sort === 'discount') {
                return b.discount - a.discount;
            }
        });

        // pagination logic
        const paginatedProducts = topProducts.slice((page - 1) * n, page * n);

        cache[cacheKey] = paginatedProducts;

        res.json(paginatedProducts);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const categoryname = req.params.categoryname;
    const productid = req.params.productid;

    try {
        const cacheKey = `product_${productid}`;
        const cachedValue = cache[cacheKey];

        if (cachedValue) {
            return res.json(cachedValue);
        }

        const response = await axios.get(`http://20.244.56.144/test/products/${productid}`);

        cache[cacheKey] = response.data;

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

function generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});