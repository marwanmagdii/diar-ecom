import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useStoreConfig } from './StoreConfigContext';
import { useLanguage } from './LanguageContext';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);


export const AdminProvider = ({ children }) => {
  const { config } = useStoreConfig();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    return localStorage.getItem('currentAdmin') || 'Marwan';
  });

  const setAdmin = (name) => {
    setCurrentAdmin(name);
    localStorage.setItem('currentAdmin', name);
  };

  const logAdminAction = async (actionType, description, details = {}) => {
    if (config?.loggingSettings && config.loggingSettings[currentAdmin] === false) return;
    
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminName: currentAdmin,
          actionType,
          description,
          details
        })
      });
    } catch (e) {
      console.error('Failed to log admin action', e);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/orders');
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to fetch orders');
      }
      const data = await res.json();
      setOrders(data.map(o => ({
        ...o,
        createdAt: new Date(o.createdAt)
      })));
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const addOrder = async (newOrder) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Backend returned error:', errData);
        throw new Error(errData.error || 'Failed to create order');
      }
      const { data } = await res.json();
      setOrders(prev => [{...data, createdAt: new Date(data.createdAt)}, ...prev]);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding order:', error);
      return { success: false, error: error.message };
    }
  };

  const updateOrder = async (orderId, updatedFields) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to update order');
      }
      const { data } = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? { ...data, createdAt: new Date(data.createdAt) } : o));
      let logDesc = `Updated order #${orderId}`;
      if (updatedFields.status) {
        logDesc = `Changed order #${orderId} status to ${updatedFields.status}`;
      } else if (updatedFields.items) {
        logDesc = `Modified items for order #${orderId}`;
      }
      logAdminAction('update_order', logDesc, updatedFields);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        await res.text().catch(() => {});
        throw new Error('Failed to delete order');
      }
      setOrders(prev => prev.filter(o => o.id !== orderId));
      logAdminAction('delete_order', `Deleted order #${orderId}`);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // Merge User Function: Takes orders from sourcePhone and assigns them to targetPhone
  const mergeUsers = (targetPhone, sourcePhone) => {
    setOrders(prev => prev.map(o => {
      const currentNorm = o.phone?.replace(/[^0-9+]/g, '');
      const sourceNorm = sourcePhone.replace(/[^0-9+]/g, '');
      if (currentNorm === sourceNorm) {
        return { ...o, phone: targetPhone };
      }
      return o;
    }));
  };

  const users = useMemo(() => {
    const userMap = {};
    orders.forEach(order => {
      const normalizedPhone = order.phone?.replace(/[^0-9+]/g, '') || order.customer;
      
      if (!userMap[normalizedPhone]) {
        userMap[normalizedPhone] = {
          id: normalizedPhone,
          name: order.customer,
          phone: order.phone,
          latestAddress: order.address,
          totalSpent: 0,
          orderCount: 0,
          orders: [],
          purchasedCategories: {},
          deviceIds: new Set(),
          linkedAccounts: []
        };
      }
      
      userMap[normalizedPhone].totalSpent += order.total || 0;
      userMap[normalizedPhone].orderCount += 1;
      userMap[normalizedPhone].orders.push(order);

      if (order.trackingData && order.trackingData.deviceId) {
        userMap[normalizedPhone].deviceIds.add(order.trackingData.deviceId);
      }

      // Track categories for analytics
      order.items?.forEach(item => {
        if (item.category) {
          userMap[normalizedPhone].purchasedCategories[item.category] = (userMap[normalizedPhone].purchasedCategories[item.category] || 0) + item.qty;
        }
      });
    });

    // Inject Influencers as Users
    const influencers = (config?.promoCodes || []).filter(p => p.influencerName || p.commissionValue > 0);
    influencers.forEach(inf => {
      const influencerId = `inf_${inf.code}`;
      const generatedOrders = orders.filter(o => o.promoCode === inf.code);
      
      userMap[influencerId] = {
        id: influencerId,
        name: `${inf.influencerName} (Influencer)`,
        phone: `Code: ${inf.code}`, // Display promo code in the phone column
        latestAddress: 'Partner Account',
        totalSpent: inf.totalRevenue || 0, // We'll hijack this for sorting, but display it differently in UI
        orderCount: generatedOrders.length,
        orders: generatedOrders,
        purchasedCategories: {},
        isInfluencer: true,
        influencerData: inf
      };
    });

    // Calculate Analytics per user
    const userArray = Object.values(userMap);
    userArray.forEach(user => {
      let topCategory = 'None';
      let maxQty = 0;
      for (const [cat, qty] of Object.entries(user.purchasedCategories || {})) {
        if (qty > maxQty) {
          maxQty = qty;
          topCategory = cat;
        }
      }
      user.primaryInterest = topCategory;

      // Cross-reference device IDs to find linked accounts
      if (user.deviceIds && user.deviceIds.size > 0) {
        userArray.forEach(otherUser => {
          if (otherUser.id !== user.id && otherUser.deviceIds && !otherUser.isInfluencer) {
            const sharedDevices = [...user.deviceIds].filter(id => otherUser.deviceIds.has(id));
            if (sharedDevices.length > 0) {
              if (!user.linkedAccounts.find(u => u.id === otherUser.id)) {
                user.linkedAccounts.push({
                  id: otherUser.id,
                  name: otherUser.name,
                  phone: otherUser.phone
                });
              }
            }
          }
        });
      }
    });

    return userArray.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders, config]);

  const { language: lang, toggleLanguage: setLang, t } = useLanguage();

  return (
    <AdminContext.Provider value={{ orders, loading, error, addOrder, updateOrder, deleteOrder, mergeUsers, users, lang, setLang, t,
      currentAdmin,
      setAdmin,
      logAdminAction
    }}>
      {children}
    </AdminContext.Provider>
  );
};
