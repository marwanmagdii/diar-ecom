import React, { useState } from 'react';
import { Plus, Edit, Trash2, BarChart2, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import { useStore } from '../../store';
import DataTable from '../../components/admin/DataTable';

export default function Products() {
  const { products, deleteProduct, productsLoading: loading, language, t } = useStore();
  const { addToast } = useStore();
  const navigate = useNavigate();
  
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleteInput, setDeleteInput] = useState('');

  const handleDelete = (id) => {
    setProductToDelete(id);
    setDeleteInput('');
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete && deleteInput.trim().toLowerCase() === 'delete') {
      try {
        await deleteProduct(productToDelete);
        addToast(language === 'ar' ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully', 'success');
        setProductToDelete(null);
        setDeleteModalOpen(false);
        setDeleteInput('');
      } catch (e) {
        addToast(language === 'ar' ? 'فشل حذف المنتج' : 'Failed to delete product', 'error');
      }
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleExport = () => {
    const exportColumns = [
      { header: 'Product ID', key: 'id', width: 20 },
      { header: 'Name', key: 'title', width: 40 },
      { header: 'Category', key: 'category', width: 25 },
      { header: 'Price (EGP)', key: 'price', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Featured', key: 'featured', width: 15 }
    ];

    const data = products.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category || 'Uncategorized',
      price: p.price,
      status: p.isActive !== false ? 'Active' : 'Inactive',
      featured: p.featured ? 'Yes' : 'No'
    }));

    exportToExcel({ data, columns: exportColumns, filename: 'Products' });
  };

  const columns = [
    { 
      id: 'image', 
      label: language === 'ar' ? 'الصورة' : 'Image', 
      width: '60px',
      render: (product) => (
        <img src={product.image || 'https://placehold.co/40x40?text=IMG'} alt={product.title} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
      )
    },
    { 
      id: 'name', 
      label: language === 'ar' ? 'الاسم' : 'Name', 
      render: (product) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          {product.title}
          {product.featured && <span style={{ backgroundColor: '#fef08a', color: '#854d0e', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>★</span>}
        </div>
      )
    },
    { 
      id: 'category', 
      label: language === 'ar' ? 'الفئة' : 'Category', 
      render: (product) => product.category || (language === 'ar' ? 'غير مصنف' : 'Uncategorized')
    },
    { 
      id: 'price', 
      label: language === 'ar' ? 'السعر' : 'Price', 
      render: (product) => `${product.price} EGP`
    },
    { 
      id: 'status', 
      label: language === 'ar' ? 'الحالة' : 'Status', 
      render: (product) => (
        <span style={{ 
          backgroundColor: product.isActive !== false ? '#dcfce7' : '#f1f5f9', 
          color: product.isActive !== false ? '#166534' : '#64748b', 
          padding: '4px 8px', 
          borderRadius: '999px', 
          fontSize: '12px', 
          fontWeight: 600 
        }}>
          {product.isActive !== false ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Draft')}
        </span>
      )
    },
    { 
      id: 'actions', 
      label: language === 'ar' ? 'الإجراءات' : 'Actions', 
      align: 'right',
      render: (product) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <button className="icon-btn" title="Analysis" onClick={() => navigate(`/diaradmin26/products/${product.id}/analysis`)}><BarChart2 size={16} color="var(--primary)" /></button>
          <button className="icon-btn" onClick={() => navigate(`/diaradmin26/products/${product.id}`)}><Edit size={16} /></button>
          <button className="icon-btn" style={{ color: 'var(--error)' }} onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const searchFunction = (product, term) => {
    return product.title.toLowerCase().includes(term.toLowerCase());
  };

  const filteredProducts = React.useMemo(() => {
    if (categoryFilter === 'all') return products;
    return products.filter(p => p.category === categoryFilter);
  }, [products, categoryFilter]);

  const actionsNode = (
    <React.Fragment>
      <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} onClick={handleExport}>
        <Download size={18} /> {language === 'ar' ? 'تصدير' : 'Export'}
      </button>
      <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} onClick={() => navigate('/diaradmin26/products/analysis')}>
        <BarChart2 size={18} /> {language === 'ar' ? 'تحليل شامل' : 'Global Analysis'}
      </button>
      <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} onClick={() => navigate('/diaradmin26/products/new')}>
        <Plus size={18} /> {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
      </button>
    </React.Fragment>
  );

  const filtersNode = (
    <select 
      className="input-field" 
      style={{ width: '200px' }}
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
    >
      <option value="all">{language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
      {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );

  return (
    <div>
      <DataTable
        tableId="products"
        columns={columns}
        data={filteredProducts}
        searchPlaceholder={language === 'ar' ? "البحث عن المنتجات..." : "Search products..."}
        actions={actionsNode}
        filters={filtersNode}
        loading={loading}
        searchFunction={searchFunction}
      />

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
