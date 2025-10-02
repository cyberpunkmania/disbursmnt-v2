import React from 'react';
import DashboardLayout from './DashboardLayout';
import DashboardContent from './DashboardContent';

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
};

export default Dashboard;