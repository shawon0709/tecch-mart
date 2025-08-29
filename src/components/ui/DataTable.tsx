import React, { useState, useMemo, useEffect } from 'react';
import { Table, Input, Button, Space, Checkbox, Tag } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
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
  
  // Enable text search filter
  filterable?: boolean;
  
  // Enable automatic Excel-style filters
  excelFilter?: boolean;
  filterMultiple?: boolean;
}

export interface DataTableProps {
  columns: DataTableColumn[];
  data: any[];
  loading?: boolean;
  rowKey?: string;
  title?: string | React.ReactNode;
  searchable?: boolean;
  pagination?: TableProps<any>['pagination'];
  onRowClick?: (record: any) => void;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  className?: string;
  showSearch?: boolean;
  onSearch?: (searchText: string) => void;
  maxHeight?: number | string;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  title,
  searchable = true,
  pagination = { pageSize: 10, showSizeChanger: true },
  onRowClick,
  actions,
  searchPlaceholder = 'Search...',
  className = '',
  showSearch = true,
  onSearch,
  maxHeight = '60vh',
  ...props
}: DataTableProps) {
  // State to track automatically generated filters
  const [autoFilters, setAutoFilters] = useState<Record<string, { text: string; value: any }[]>>({});
  
  // State to track filter selections for each column
  const [filterSelections, setFilterSelections] = useState<Record<string, any[]>>({});
  
  // Generate filters from data (like Excel)
  useEffect(() => {
    const newAutoFilters: Record<string, { text: string; value: any }[]> = {};
    
    columns.forEach(col => {
      if (col.excelFilter && !col.filters) {
        const uniqueValues = new Set();
        const filters: { text: string; value: any }[] = [];
        
        data.forEach(record => {
          const value = record[col.dataIndex];
          if (value !== undefined && value !== null && !uniqueValues.has(value)) {
            uniqueValues.add(value);
            filters.push({
              text: String(value),
              value: value
            });
          }
        });
        
        // Sort filters alphabetically
        filters.sort((a, b) => String(a.text).localeCompare(String(b.text)));
        newAutoFilters[col.dataIndex] = filters;
      }
    });
    
    setAutoFilters(newAutoFilters);
  }, [columns, data]);

  // Transform columns
  const antColumns: ColumnsType<any> = useMemo(() => {
    return columns.map(col => {
      // For text search filter
      if (col.filterable && !col.filters && !col.excelFilter) {
        return {
          ...col,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
            const [searchText, setSearchText] = useState(selectedKeys?.[0] || '');
            return (
              <div style={{ padding: 8, width: 200 }}>
                <Input
                  placeholder={`Search ${col.title}`}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onPressEnter={() => {
                    setSelectedKeys([searchText]);
                    confirm();
                  }}
                  style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedKeys([searchText]);
                      confirm();
                    }}
                    icon={<SearchOutlined />}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Search
                  </Button>
                  <Button
                    onClick={() => {
                      clearFilters?.();
                      setSearchText('');
                    }}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Reset
                  </Button>
                </Space>
              </div>
            );
          },
          onFilter: (value, record) =>
            record[col.dataIndex]
              ?.toString()
              .toLowerCase()
              .includes((value as string).toLowerCase()),
          filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
          ),
        };
      }

      // For Excel-style automatic filters or predefined filters
      const columnFilters = col.excelFilter ? autoFilters[col.dataIndex] : col.filters;
      
      if (columnFilters && columnFilters.length > 0) {
        return {
          ...col,
          filters: columnFilters,
          filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => {
            const [searchText, setSearchText] = useState('');
            const [localSelectedKeys, setLocalSelectedKeys] = useState<any[]>(selectedKeys || []);
            
            const filteredFilters = columnFilters.filter((filter: any) => 
              filter.text.toLowerCase().includes(searchText.toLowerCase())
            );
            
            const handleFilter = () => {
              setSelectedKeys(localSelectedKeys);
              // Store the selection for the filter icon
              setFilterSelections(prev => ({
                ...prev,
                [col.dataIndex]: localSelectedKeys
              }));
              confirm();
            };
            
            const handleReset = () => {
              setLocalSelectedKeys([]);
              setSelectedKeys([]);
              // Clear the stored selection
              setFilterSelections(prev => ({
                ...prev,
                [col.dataIndex]: []
              }));
              clearFilters?.();
              confirm();
            };
            
            const handleCheckboxChange = (value: any, checked: boolean) => {
              if (col.filterMultiple !== false) {
                // Multiple selection
                const newSelectedKeys = checked 
                  ? [...localSelectedKeys, value] 
                  : localSelectedKeys.filter(key => key !== value);
                setLocalSelectedKeys(newSelectedKeys);
              } else {
                // Single selection
                setLocalSelectedKeys(checked ? [value] : []);
              }
            };
            
            // Select all functionality
            const allValues = filteredFilters.map((f: any) => f.value);
            const allSelected = allValues.length > 0 && 
                               allValues.every((val: any) => localSelectedKeys.includes(val));
            const someSelected = allValues.length > 0 && 
                                allValues.some((val: any) => localSelectedKeys.includes(val)) && 
                                !allSelected;
            
            const handleSelectAll = (checked: boolean) => {
              if (checked) {
                // Add all visible values
                const newSelectedKeys = [...new Set([...localSelectedKeys, ...allValues])];
                setLocalSelectedKeys(newSelectedKeys);
              } else {
                // Remove all visible values
                const newSelectedKeys = localSelectedKeys.filter(key => !allValues.includes(key));
                setLocalSelectedKeys(newSelectedKeys);
              }
            };
            
            return (
              <div style={{ padding: 8, width: 250 }}>
                {/* Search input for filtering options */}
                <Input
                  placeholder="Search options"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ marginBottom: 8, display: 'block' }}
                  allowClear
                />
                
                {/* Select all checkbox */}
                {col.filterMultiple !== false && filteredFilters.length > 0 && (
                  <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                    <Checkbox
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={e => handleSelectAll(e.target.checked)}
                    >
                      Select All
                    </Checkbox>
                  </div>
                )}
                
                {/* Filter options with checkboxes */}
                <div style={{ maxHeight: 300, overflow: 'auto', marginBottom: 8 }}>
                  {filteredFilters.length > 0 ? (
                    filteredFilters.map((filter: any) => (
                      <div key={filter.value} style={{ display: 'block', marginBottom: 4 }}>
                        <Checkbox
                          checked={localSelectedKeys.includes(filter.value)}
                          onChange={e => handleCheckboxChange(filter.value, e.target.checked)}
                        >
                          {filter.text}
                        </Checkbox>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: 8, color: '#999', textAlign: 'center' }}>
                      No options found
                    </div>
                  )}
                </div>
                
                {/* Selected count indicator */}
                {localSelectedKeys.length > 0 && (
                  <div style={{ marginBottom: 8, fontSize: '12px', color: '#1890ff' }}>
                    {localSelectedKeys.length} selected
                  </div>
                )}
                
                {/* Action buttons */}
                <Space>
                  <Button
                    type="primary"
                    onClick={handleFilter}
                    size="small"
                    style={{ width: 90 }}
                  >
                    OK
                  </Button>
                  <Button
                    onClick={handleReset}
                    size="small"
                    style={{ width: 90 }}
                  >
                    Reset
                  </Button>
                </Space>
              </div>
            );
          },
          filterIcon: (filtered: boolean) => {
            const selectedCount = filterSelections[col.dataIndex]?.length || 0;
            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
                {filtered && selectedCount > 0 && (
                  <Tag 
                    color="blue" 
                    style={{ 
                      fontSize: '10px', 
                      height: '16px', 
                      lineHeight: '14px', 
                      marginLeft: '4px',
                      padding: '0 4px'
                    }}
                  >
                    {selectedCount}
                  </Tag>
                )}
              </div>
            );
          },
          onFilter: col.onFilter || ((value, record) => {
            const recordValue = record[col.dataIndex];
            return Array.isArray(value) 
              ? value.includes(recordValue) 
              : value === recordValue;
          }),
        };
      }

      return col;
    });
  }, [columns, autoFilters, filterSelections]);

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
    scroll: { x: 'max-content' },
    onRow: onRowClick ? (record) => ({
      onClick: () => onRowClick(record),
      style: { cursor: 'pointer' }
    }) : undefined,
    className: `data-table ${className}`,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with search and actions */}
      {(actions || (showSearch && searchable)) && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            {/* Global search - fills available space */}
            {showSearch && searchable && (
              <Search
                placeholder={searchPlaceholder}
                allowClear
                onSearch={onSearch}
                style={{ flex: 1 }}
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
      )}

      {/* Table container with vertical scrolling */}
      <div className="p-4">
        <div 
          style={{ 
            maxHeight: maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : 'none',
            overflow: 'auto',
          }}
        >
          <Table {...tableProps} {...props} />
        </div>
      </div>
    </div>
  );
}