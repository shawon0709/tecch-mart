import { useState, useEffect } from 'react';
import { Modal, Table, Tag, Statistic, Row, Col, Divider, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  ToolOutlined, 
  DollarOutlined, 
  HistoryOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { formatDate, formatDateTime, formatTime } from '@/lib/dateUtils';

interface DeviceHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  deviceId: string;
}

interface HistoryRecord {
  id: string;
  ticketId: string;
  receivedDate: string;
  completedDate?: string;
  status: string;
  problemDescription: string;
  diagnosis?: string;
  solution?: string;
  technicianName: string;
  consultancyFee: number;
  totalCost: number;
}

export default function DeviceHistoryModal({
  visible,
  onClose,
  deviceId
}: DeviceHistoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [deviceData, setDeviceData] = useState<any>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const columns: ColumnsType<HistoryRecord> = [
    {
      title: 'Ticket ID',
      dataIndex: 'ticketId',
      key: 'ticketId',
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: 'Received Date',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (date) => (
      <div>
        <div>{formatDate(date)}</div>
        <div className="text-xs text-gray-500">{formatTime(date)}</div>
      </div>
    ),
      sorter: (a, b) => new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'orange';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Problem',
      dataIndex: 'problemDescription',
      key: 'problemDescription',
      ellipsis: true,
    },
    {
      title: 'Technician',
      dataIndex: 'technicianName',
      key: 'technicianName',
      render: (name) => <Tag icon={<UserOutlined />}>{name}</Tag>,
    },
    {
      title: 'Consultancy Fee',
      dataIndex: 'consultancyFee',
      key: 'consultancyFee',
      render: (fee) => `BDT ${fee}`,
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => cost ? `BDT ${cost}` : '-',
    },
  ];

  const fetchDeviceHistory = async () => {
    if (!deviceId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/devices/${deviceId}/history`);
      const data = await response.json();
      setDeviceData(data);
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch device history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && deviceId) {
      fetchDeviceHistory();
    }
  }, [visible, deviceId]);

  const expandedRowRender = (record: HistoryRecord) => (
    <div className="p-4 bg-gray-50">
      <Row gutter={16}>
        <Col span={12}>
          <h4 className="font-semibold">Problem Description</h4>
          <p>{record.problemDescription}</p>
        </Col>
        <Col span={12}>
          <h4 className="font-semibold">Diagnosis</h4>
          <p>{record.diagnosis || 'No diagnosis recorded'}</p>
        </Col>
      </Row>
      {record.solution && (
        <>
          <Divider />
          <h4 className="font-semibold">Solution Applied</h4>
          <p>{record.solution}</p>
        </>
      )}
      <Divider />
          <Row gutter={16}>
              <Col span={8}>
                  <strong>Received:</strong> {formatDateTime(record.receivedDate)}
              </Col>
              {record.completedDate && (
                  <Col span={8}>
                      <strong>Completed:</strong> {formatDateTime(record.completedDate)}
                  </Col>
              )}
              <Col span={8}>
                  <strong>Status:</strong> <Tag color={record.status === 'COMPLETED' ? 'green' : 'blue'}>{record.status}</Tag>
              </Col>
          </Row>
    </div>
  );

  return (
    <Modal
      title={
        <div>
          <HistoryOutlined /> Device Repair History
          {deviceData?.device && (
            <div className="text-sm text-gray-600 mt-1">
              {deviceData.device.brand} {deviceData.device.model} ({deviceData.device.serialNumber})
              {deviceData.customer && ` - Owned by: ${deviceData.customer.name}`}
            </div>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      style={{ top: 20 }}
    >
      <Spin spinning={loading}>
        {deviceData && (
          <>
            <Row gutter={16} className="mb-6">
              <Col span={6}>
                <Statistic
                  title="Total Repairs"
                  value={deviceData.totalRepairs}
                  prefix={<HistoryOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Completed Repairs"
                  value={deviceData.history.filter((h: any) => h.status === 'COMPLETED').length}
                  prefix={<ToolOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Revenue"
                  value={deviceData.totalRevenue}
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Unique ID"
                  value={deviceData.device.uniqueId || 'N/A'}
                />
              </Col>
            </Row>

            <Divider />

            <Table
              columns={columns}
              dataSource={history}
              rowKey="ticketId"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) => true,
              }}
              summary={() => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>{deviceData.totalRepairs} repairs</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={2}></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <strong>BDT {deviceData.totalRevenue}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </>
        )}
      </Spin>
    </Modal>
  );
}