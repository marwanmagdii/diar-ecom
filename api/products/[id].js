import dbConnect from '../_utils/dbConnect.js';
import Product from '../_models/Product.js';
import mongoose from 'mongoose';
import { logger } from '../_utils/logger.js';

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  await dbConnect();

  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  const query = isObjectId ? { $or: [{ _id: id }, { id: id }] } : { id: id };

  switch (method) {
    case 'PUT':
      try {
        const product = await Product.findOneAndUpdate(query, req.body, {
          new: true,
          runValidators: true,
        });
        if (!product) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const productObj = product.toObject({ flattenMaps: true });
        productObj.id = productObj.id || productObj._id.toString();
        delete productObj._id;
        delete productObj.__v;
        if (productObj.variants) {
          productObj.variants = productObj.variants.map(v => {
            if (v._id) {
              v.id = v._id.toString();
              delete v._id;
            }
            return v;
          });
        }
        res.status(200).json({ success: true, data: productObj });
      } catch (error) {
        error.req = req;
        logger.error('API: Products [id]', `PUT Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'DELETE':
      try {
        const deletedProduct = await Product.findOneAndDelete(query);
        if (!deletedProduct) {
          return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        error.req = req;
        logger.error('API: Products [id]', `DELETE Request Failed at ${new Date().toISOString()}`, error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(405).json({ success: false, message: 'Method not allowed' });
      break;
  }
}
