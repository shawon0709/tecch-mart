import React from 'react';
import { Table, Input, Button, Space, Tag } from 'antd';
import type { ColumnsType, TableProps, ColumnType } from 'antd/es/table';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

const { Search } = Input;

export interface DataTableColumn {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  sorter?: (a: any, b: any) => number;
  sortDirections?: ('ascend' | 'descend')[];
  filters?: { text: string; value: any }[];
  onFilter?: (value: any, record: any) => boolean;
  filterDropdown?: React.ReactNode;
  filterIcon?: (filtered: boolean) => React.ReactNode;
  width?: number | string;
  ellipsis?: boolean;
  filterSearch?: boolean;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  rowKey?: string;
  title?: string | React.ReactNode;
  searchable?: boolean;
  pagination?: TableProps<any>['pagination'];
  scroll?: TableProps<any>['scroll'];
  onRowClick?: (record: any) => void;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  className?: string;
  showSearch?: boolean;
  onSearch?: (searchText: string) => void;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  title,
  searchable = true,
  pagination = { pageSize: 10, showSizeChanger: true },
  scroll = { x: 800 },
  onRowClick,
  actions,
  searchPlaceholder = 'Search...',
  className = '',
  showSearch = true,
  onSearch
}: DataTableProps) {
  // Transform columns to Ant Design format with proper filtering
  const antColumns: ColumnsType<any> = columns.map(col => {
    const column: ColumnType<any> = {
      key: col.key,
      title: col.title,
      dataIndex: col.dataIndex,
      render: col.render,
      sorter: col.sorter,
      sortDirections: col.sortDirections || ['ascend', 'descend'],
      filters: col.filters,
      onFilter: col.onFilter,
      filterDropdown: col.filterDropdown,
      filterIcon: col.filterIcon || ((filtered: boolean) => (
        <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      )),
      width: col.width,
      ellipsis: col.ellipsis,
      filterSearch: col.filterSearch,
    };

    // If no custom filters provided but we want filtering, create default text filter
    if (!col.filters && !col.filterDropdown && col.onFilter === undefined) {
      column.filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${col.title}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                if (clearFilters) clearFilters();
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      );
      
      column.onFilter = (value, record) => {
        const cellValue = record[col.dataIndex];
        return cellValue?.toString().toLowerCase().includes((value as string).toLowerCase());
      };
      
      column.filterIcon = (filtered: boolean) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      );
    }

    return column;
  });

  const tableProps: TableProps<any> = {
    columns: antColumns,
    dataSource: data,
    loading,
    rowKey,
    pagination: {
      ...pagination,
      showTotal: (total, range) => (
        <span className="text-gray-500">
          {range[0]}-{range[1]} of {total} items
        </span>
      ),
    },
    scroll,
    onRow: onRowClick ? (record) => ({
      onClick: () => onRowClick(record),
      style: { cursor: 'pointer' }
    }) : undefined,
    className: `data-table ${className}`,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with title and actions */}
      {(title || actions || (showSearch && searchable)) && (
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {title && (
              <h3 className="text-lg font-semibold m-0">{title}</h3>
            )}
            
            <div className="flex flex-col md:flex-row gap-3 flex-1 md:justify-end">
              {/* Global search */}
              {showSearch && searchable && (
                <Search
                  placeholder={searchPlaceholder}
                  allowClear
                  onSearch={onSearch}
                  style={{ width: 250 }}
                  size="middle"
                />
              )}

              {/* Actions */}
              {actions && (
                <Space>
                  {actions}
                </Space>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-4">
        <Table {...tableProps} />
      </div>
    </div>
  );
}