import React from 'react';
import DashboardLayout from './DashboardLayout';
import WorkersManagement from './WorkersManagement';

const Workers: React.FC = () => {
  return (
    <DashboardLayout>
      <WorkersManagement />
    </DashboardLayout>
  );
};

export default Workers;