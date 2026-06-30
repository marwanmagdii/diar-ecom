import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, BarChart2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';
export default function Products() {
  const { products, deleteProduct, productsLoading: loading } = useStore();
  const { t } = useStore();
  const { addToast } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [analysisProduct, setAnalysisProduct] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id) => {
    setProductToDelete(id);
    setDeleteInput('');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete && deleteInput.trim().toLowerCase() === 'delete') {
      try {
        await deleteProduct(productToDelete);
        addToast('Product deleted successfully', 'success');
        setProductToDelete(null);
        setDeleteModalOpen(false);
        setDeleteInput('');
      } catch (e) {
        addToast('Failed to delete product', 'error');
      }
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleExport = () => {
    const columns = [
      { header: 'Product ID', key: 'id', width: 20 },
      { header: 'Name', key: 'title', width: 40 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Price (EGP)', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Featured', key: 'featured', width: 15 }
    ];

    const data = filteredProducts.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category || 'Uncategorized',
      price: p.price,
      status: p.isActive !== false ? 'Active' : 'Inactive',
      featured: p.featured ? 'Yes' : 'No'
    }));

    exportToExcel({ data, columns, filename: 'Products' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search products..." 
              style={{ width: '250px', paddingLeft: '36px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="input-field" 
            style={{ width: '200px' }}
            onChange={(e) => setSearchTerm(e.target.value === 'all' ? '' : e.target.value)}
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleExport}>
            <Download size={18} /> Export
          </button>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/diaradmin26/products/analysis')}>
            <BarChart2 size={18} /> Global Analysis
          </button>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/diaradmin26/products/new')}>
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

        <div className="admin-table-container">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image || 'https://placehold.co/40x40?text=IMG'} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.title}
                        {product.featured && <span style={{ backgroundColor: '#fef08a', color: '#854d0e', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>★</span>}
                      </div>
                    </td>
                    <td>{product.category || 'Uncategorized'}</td>
                    <td>{product.price} EGP</td>
                    <td>
                      <span style={{ 
                        backgroundColor: product.isActive !== false ? '#dcfce7' : '#f1f5f9', 
                        color: product.isActive !== false ? '#166534' : '#64748b', 
                        padding: '4px 8px', 
                        borderRadius: '999px', 
                        fontSize: '12px', 
                        fontWeight: 600 
                      }}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="icon-btn" title="Analysis" onClick={() => navigate(`/diaradmin26/products/${product.id}/analysis`)}><BarChart2 size={16} color="var(--primary)" /></button>
                      <button className="icon-btn" onClick={() => navigate(`/diaradmin26/products/${product.id}`)}><Edit size={16} /></button>
                      <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                      <div style={{ margin: '0 auto 16px', border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite' }}></div>
                      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                      Loading products...
                    </td>
                  </tr>
                )}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--on-surface-variant)' }}>No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      {deleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ padding: '24px', maxWidth: '400px', width: '100%', backgroundColor: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--on-surface)' }}>Delete Product</h3>
            <p style={{ margin: '0 0 16px 0', color: 'var(--on-surface-variant)' }}>Are you sure you want to delete this product? Type <strong>delete</strong> to confirm:</p>
            <input 
              type="text" 
              className="input-field" 
              style={{ marginBottom: '24px', width: '100%' }}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="delete"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={cancelDelete}>Cancel</button>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', opacity: deleteInput.trim().toLowerCase() !== 'delete' ? 0.5 : 1 }} disabled={deleteInput.trim().toLowerCase() !== 'delete'} onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
