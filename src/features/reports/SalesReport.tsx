import { useState, useEffect } from 'react';
import { Card, DatePicker, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Ticket } from '../repairs/ticket.types';

const { RangePicker } = DatePicker;
const { Title } = Typography;

interface SalesData {
  month: string;
  amount: number;
}

export default function SalesReport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  const columns: ColumnsType<Ticket> = [
    {
      title: 'Ticket ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Amount',
      dataIndex: 'invoiceTotal',
      key: 'amount',
      render: (amount) => amount ? `$${amount.toFixed(2)}` : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data);

      // Process data for chart
      const monthlyData: Record<string, number> = {};
      data.forEach((ticket: Ticket) => {
        if (ticket.invoiceTotal) {
          const date = new Date(ticket.createdAt || '');
          const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
          monthlyData[month] = (monthlyData[month] || 0) + (ticket.invoiceTotal || 0);
        }
      });

      const chartData = Object.keys(monthlyData).map(month => ({
        month,
        amount: monthlyData[month],
      }));

      setSalesData(chartData);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div>
      <Title level={3}>Sales Report</Title>
      
      <div className="mb-6">
        <Card title="Monthly Sales">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" name="Sales Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Recent Tickets">
        <Table
          columns={columns}
          dataSource={tickets}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}