import { useState, useEffect } from 'react';
import { Card, Table, Typography, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../inventory/inventory.types';

const { Title } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function InventoryReport() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const columns: ColumnsType<InventoryItem> = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Brand',
            dataIndex: 'brand',
            key: 'brand',
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <Tag color={quantity <= record.reorderLevel ? 'red' : 'green'}>
                    {quantity}
                </Tag>
            ),
        },
        {
            title: 'Reorder Level',
            dataIndex: 'reorderLevel',
            key: 'reorderLevel',
        },
    ];

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/inventory');
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error('Failed to fetch inventory', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const categoryData = inventory.reduce((acc: Record<string, number>, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.quantity;
        return acc;
    }, {});

    const pieData = Object.keys(categoryData).map(category => ({
        name: category,
        value: categoryData[category],
    }));

    return (
        <div>
            <Title level={3}>Inventory Report</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card title="Inventory by Category">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) =>
                                        `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%`
                                    }

                                >
                                    {pieData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Low Stock Items">
                    <Table
                        columns={columns.filter(col => ['name', 'quantity', 'reorderLevel'].includes(col.key as string))}
                        dataSource={inventory.filter(item => item.quantity <= item.reorderLevel)}
                        loading={loading}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            </div>

            <Card title="All Inventory Items">
                <Table
                    columns={columns}
                    dataSource={inventory}
                    loading={loading}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
}