import React from 'react';
import DashboardLayout from './DashboardLayout';
import PositionsManagement from './PositionsManagement';

const Positions: React.FC = () => {
  return (
    <DashboardLayout>
      <PositionsManagement />
    </DashboardLayout>
  );
};

export default Positions;