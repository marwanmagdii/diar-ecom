import React from 'react';
import DataEnginePredictor from './DataEnginePredictor';
import { useStore } from '../../store';

export default function DataEnginePage() {
  const { orders, language } = useStore();

  const trackedCustomers = orders.filter(o => o.trackingData && o.trackingData.events && o.trackingData.events.length > 0);

  return (
    <div style={{ width: '100%', height: 'calc(100vh - 64px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <DataEnginePredictor trackedCustomers={trackedCustomers} allOrders={orders} />
    </div>
  );
}
