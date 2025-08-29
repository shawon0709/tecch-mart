import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import AdminLayout from '../layouts/AdminLayout';
import { isAuthenticated } from '../lib/auth';

// Import all components
import CustomerList from '@/features/customers/CustomerList';
import TechnicianList from '@/features/technicians/TechnicianList';
import SupplierList from '@/features/suppliers/SupplierList';
import InventoryList from '@/features/inventory/InventoryList';
import TicketList from '@/features/repairs/TicketList';
import InvoiceList from '@/features/billing/InvoiceList';
import SalesReport from '@/features/reports/SalesReport';
import InventoryReport from '@/features/reports/InventoryReport';
import OverviewCards from '@/features/dashboard/OverviewCards';
import RecentTickets from '@/features/dashboard/RecentTickets';
import DeviceList from '@/features/repairs/DeviceList';
import ReceiverList from '@/features/receivers/ReceiverList';

export default function Dashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (router.query.section) {
      setActiveSection(router.query.section as string);
    }
  }, [router.query.section]);

  if (!isClient) return null;

const renderSection = () => {
  switch (activeSection) {
    case 'dashboard':
      return (
        <>
          <OverviewCards />
          <RecentTickets />
        </>
      );
    case 'customers':
      return <CustomerList />;
    case 'technicians':
      return <TechnicianList />;
    case 'suppliers':
      return <SupplierList />;
    case 'inventory':
      return <InventoryList />;
    case 'tickets':
      return <TicketList />;
    case 'devices':
      return <DeviceList />;
    case 'billing':
      return <InvoiceList />;
    case 'receivers':
      return <ReceiverList />;
    case 'reports':
      return (
        <>
          <SalesReport />
          <InventoryReport />
        </>
      );
    default:
      return <div>Not Found</div>;
  }
};

  return (
    <AdminLayout>
      <motion.div
        key={activeSection}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderSection()}
      </motion.div>
    </AdminLayout>
  );
}