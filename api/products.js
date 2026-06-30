import dbConnect from './_utils/dbConnect.js';
import Product from './_models/Product.js';
import Counter from './_models/Counter.js';
import { logger } from './_utils/logger.js';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const products = await Product.find({});
        // Map _id to id so the frontend doesn't need to change much
        const formattedProducts = products.map(p => {
          const product = p.toObject({ flattenMaps: true });
          product.id = product.id || product._id.toString();
          delete product._id;
          delete product.__v;
          if (product.variants) {
            product.variants = product.variants.map(v => {
              if (v._id) {
                v.id = v._id.toString();
                delete v._id;
              }
              return v;
            });
          }
          return product;
        });
        res.status(200).json(formattedProducts);
      } catch (error) {
        error.req = req;
        logger.error('API: Products', `GET Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const productData = { ...req.body };
        
        // Auto-increment ID if not provided
        if (!productData.id) {
          const counter = await Counter.findOneAndUpdate(
            { _id: 'productId' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
          );
          productData.id = counter.seq.toString();
        }

        const product = await Product.create(productData);
        const productObj = product.toObject({ flattenMaps: true });
        productObj.id = productData.id;
        
        res.status(201).json({ success: true, data: productObj });
      } catch (error) {
        error.req = req;
        logger.error('API: Products', `POST Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
