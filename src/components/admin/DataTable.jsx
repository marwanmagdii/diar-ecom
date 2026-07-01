import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Filter, Search, MoreVertical, RotateCcw } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import BottomSheet from '../ui/BottomSheet';
import { useStore } from '../../store';

export default function DataTable({ 
  tableId, 
  columns, 
  data, 
  searchPlaceholder, 
  onRowClick, 
  actions, 
  filters, 
  loading,
  loadingMessage,
  emptyMessage,
  searchFunction, // optional custom search, otherwise string match
  renderExpandedRow
}) {
  const { lang, language } = useStore();
  const currentLang = lang || language || 'en';
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Default visible columns: all true initially
  const defaultVisible = columns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {});
  const defaultOrder = columns.map(col => col.id);

  const [visibleColumns, setVisibleColumns] = useState(defaultVisible);
  const [columnOrder, setColumnOrder] = useState(defaultOrder);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`table-prefs-${tableId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.visibleColumns) setVisibleColumns({ ...defaultVisible, ...parsed.visibleColumns });
        if (parsed.columnOrder) {
          // ensure all current columns exist in the order, and remove deleted ones
          const validOrder = parsed.columnOrder.filter(id => defaultOrder.includes(id));
          const missing = defaultOrder.filter(id => !validOrder.includes(id));
          setColumnOrder([...validOrder, ...missing]);
        }
      }
    } catch (e) {
      console.error('Error loading table preferences', e);
    }
  }, [tableId]);

  // Save to localStorage
  const savePrefs = (vis, ord) => {
    localStorage.setItem(`table-prefs-${tableId}`, JSON.stringify({ visibleColumns: vis, columnOrder: ord }));
  };

  const handleToggleColumn = (colId, checked) => {
    const newVis = { ...visibleColumns, [colId]: checked };
    setVisibleColumns(newVis);
    savePrefs(newVis, columnOrder);
  };

  const handleReset = () => {
    setVisibleColumns(defaultVisible);
    setColumnOrder(defaultOrder);
    savePrefs(defaultVisible, defaultOrder);
  };

  const moveColumnUp = (colId) => {
    const idx = columnOrder.indexOf(colId);
    if (idx > 0) {
      const newOrder = [...columnOrder];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      setColumnOrder(newOrder);
      savePrefs(visibleColumns, newOrder);
    }
  };

  const moveColumnDown = (colId) => {
    const idx = columnOrder.indexOf(colId);
    if (idx < columnOrder.length - 1 && idx !== -1) {
      const newOrder = [...columnOrder];
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
      setColumnOrder(newOrder);
      savePrefs(visibleColumns, newOrder);
    }
  };

  // Drag and Drop
  const handleDragStart = (e, colId) => {
    e.dataTransfer.setData('colId', colId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    const draggedColId = e.dataTransfer.getData('colId');
    if (!draggedColId || draggedColId === targetColId) return;

    const newOrder = [...columnOrder];
    const draggedIdx = newOrder.indexOf(draggedColId);
    const targetIdx = newOrder.indexOf(targetColId);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedColId);

    setColumnOrder(newOrder);
    savePrefs(visibleColumns, newOrder);
  };

  // Filter Data
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    if (searchFunction) return data.filter(row => searchFunction(row, searchTerm));
    
    const lowerSearch = searchTerm.toLowerCase();
    return data.filter(row => {
      // Basic string match across all properties
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerSearch)
      );
    });
  }, [data, searchTerm, searchFunction]);

  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpand = (rowKey, e) => {
    if (e) e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [rowKey]: !prev[rowKey] }));
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <div style={{ position: 'relative', flex: '1 0 auto', minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--on-surface-variant)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder={searchPlaceholder || (currentLang === 'ar' ? 'بحث...' : 'Search...')} 
              style={{ width: '100%', paddingLeft: '36px' }} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filters && isMobile ? (
            <button className="btn btn-secondary" onClick={() => setIsFiltersOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
              <Filter size={18} />
            </button>
          ) : (
            filters
          )}
        </div>

        <div className="admin-page-header-right">
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }} 
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
            >
              <Filter size={18} /> {currentLang === 'ar' ? 'الأعمدة' : 'Columns'}
            </button>
            {showColumnsMenu && (
              <div className="columns-dropdown" style={{ right: 0, left: 'auto', minWidth: '200px' }}>
                <div style={{ padding: '8px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface-variant)' }}>{currentLang === 'ar' ? 'الأعمدة المرئية' : 'Visible Columns'}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={handleReset} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', color: 'var(--error)' }} title={currentLang === 'ar' ? 'إعادة ضبط' : 'Reset'}>
                      <RotateCcw size={14} />
                    </button>
                    <button className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => setShowColumnsMenu(false)}>
                      {currentLang === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </div>
                {columnOrder.map(colId => {
                  const colDef = columns.find(c => c.id === colId);
                  if (!colDef) return null;
                  return (
                    <label key={colId} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer', fontSize: '14px', padding: '0 8px' }}>
                      <input 
                        type="checkbox" 
                        checked={visibleColumns[colId] !== false} 
                        onChange={(e) => handleToggleColumn(colId, e.target.checked)}
                      />
                      <span style={{ flex: 1 }}>{colDef.label}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveColumnUp(colId); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--on-surface-variant)' }}><ChevronUp size={14}/></button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); moveColumnDown(colId); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--on-surface-variant)' }}><ChevronDown size={14}/></button>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          {actions}
        </div>
      </div>

      <div className="admin-table-container">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                {columnOrder.map(colId => {
                  if (visibleColumns[colId] === false) return null;
                  const colDef = columns.find(c => c.id === colId);
                  if (!colDef) return null;
                  return (
                    <th 
                      key={colId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, colId)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, colId)}
                      style={{ 
                        cursor: 'grab', 
                        textAlign: colDef.align || 'left',
                        width: colDef.width || 'auto'
                      }}
                      title={currentLang === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
                    >
                      {colDef.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`}>
                    {columnOrder.map((colId, j) => {
                      if (visibleColumns[colId] === false) return null;
                      return (
                        <td key={`skeleton-${i}-${j}`} style={{ padding: '16px' }}>
                          <Skeleton height="16px" width={j === 0 ? "80%" : j === columnOrder.length - 1 ? "40px" : "60%"} />
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columnOrder.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--on-surface-variant)' }}>
                    {emptyMessage || (currentLang === 'ar' ? 'لا توجد بيانات.' : 'No data found.')}
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => {
                  const rowKey = row.id || i;
                  const isExpanded = !!expandedRows[rowKey];
                  return (
                    <React.Fragment key={rowKey}>
                      <tr 
                        onClick={() => onRowClick && onRowClick(row)}
                        style={{ cursor: onRowClick ? 'pointer' : 'default', borderBottom: isExpanded ? 'none' : '' }}
                        className={onRowClick ? "hover-row" : ""}
                      >
                        {columnOrder.map(colId => {
                          if (visibleColumns[colId] === false) return null;
                          const colDef = columns.find(c => c.id === colId);
                          if (!colDef) return null;
                          return (
                            <td 
                              key={colId} 
                              data-label={colDef.label}
                              style={{ textAlign: colDef.align || 'left' }}
                            >
                              {colDef.render ? colDef.render(row, { isExpanded, toggleExpand: (e) => toggleExpand(rowKey, e) }) : row[colId]}
                            </td>
                          );
                        })}
                      </tr>
                      {renderExpandedRow && isExpanded && (
                        <tr>
                          <td colSpan={columnOrder.filter(c => visibleColumns[c] !== false).length} style={{ padding: 0, borderBottom: '1px solid #f1f5f9' }}>
                            {renderExpandedRow(row)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isMobile && filters && (
        <BottomSheet 
          isOpen={isFiltersOpen} 
          onClose={() => setIsFiltersOpen(false)} 
          title={currentLang === 'ar' ? 'تصفية النتائج' : 'Filters'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filters}
            <button className="btn btn-primary" onClick={() => setIsFiltersOpen(false)} style={{ marginTop: '8px', padding: '12px' }}>
              {currentLang === 'ar' ? 'تطبيق' : 'Apply'}
            </button>
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
