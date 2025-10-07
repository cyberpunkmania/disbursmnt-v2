import React from 'react';
import DashboardLayout from './DashboardLayout';
import PayrollManagement from './PayrollManagement';

const Payroll: React.FC = () => {
  return (
    <DashboardLayout>
      <PayrollManagement />
    </DashboardLayout>
  );
};

export default Payroll;