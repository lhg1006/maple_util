'use client';

import React from 'react';
import { Card, Row, Col, Slider, Select, Switch, InputNumber, Space, Typography } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

export interface AdvancedFilters {
  levelRange: [number, number];
  jobRestriction: string[];
  itemType: string;
  minPrice?: number;
  maxPrice?: number;
  excludeCashItems: boolean; // 캐시 아이템 제외 토글
  cashItemsOnly: boolean; // 캐시 아이템만 표시 토글
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  visible: boolean;
  onToggle: () => void;
}

// 직업 옵션
const JOB_OPTIONS = [
  { value: 'ALL', label: '모든 직업' },
  { value: 'WARRIOR', label: '전사' },
  { value: 'MAGICIAN', label: '마법사' },
  { value: 'ARCHER', label: '궁수' },
  { value: 'THIEF', label: '도적' },
  { value: 'PIRATE', label: '해적' }
];

// 아이템 타입 옵션
const ITEM_TYPE_OPTIONS = [
  { value: 'ALL', label: '모든 타입' },
  { value: 'EQUIPMENT', label: '장비' },
  { value: 'CONSUMABLE', label: '소비' },
  { value: 'ETC', label: '기타' },
  { value: 'CASH', label: '캐시' }
];

export function AdvancedFilters({ filters, onChange, visible, onToggle }: AdvancedFiltersProps) {
  const updateFilters = (key: keyof AdvancedFilters, value: any) => {
    onChange({
      ...filters,
      [key]: value
    });
  };

  if (!visible) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#666',
            fontSize: '14px'
          }}
        >
          <FilterOutlined style={{ marginRight: '8px' }} />
          고급 필터 표시
        </button>
      </div>
    );
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            <FilterOutlined style={{ marginRight: '8px' }} />
            고급 필터
          </span>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#666'
            }}
          >
            숨기기
          </button>
        </div>
      }
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {/* 레벨 범위 */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>레벨 범위</Text>
            <div style={{ padding: '8px 0' }}>
              <Slider
                range
                min={0}
                max={300}
                value={filters.levelRange}
                onChange={(value) => updateFilters('levelRange', value as [number, number])}
                marks={{
                  0: '0',
                  50: '50',
                  100: '100',
                  150: '150',
                  200: '200',
                  250: '250',
                  300: '300'
                }}
              />
              <div style={{ textAlign: 'center', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Lv. {filters.levelRange[0]} ~ {filters.levelRange[1]}
              </div>
            </div>
          </div>
        </Col>

        {/* 직업 제한 */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>직업 제한</Text>
            <Select
              mode="multiple"
              style={{ width: '100%', marginTop: '8px' }}
              placeholder="직업 선택"
              value={filters.jobRestriction}
              onChange={(value) => updateFilters('jobRestriction', value)}
              maxTagCount={2}
            >
              {JOB_OPTIONS.map(job => (
                <Option key={job.value} value={job.value}>{job.label}</Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* 아이템 타입 */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>아이템 타입</Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={filters.itemType}
              onChange={(value) => updateFilters('itemType', value)}
            >
              {ITEM_TYPE_OPTIONS.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* 가격 범위 */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>판매 가격 (메소)</Text>
            <Space.Compact style={{ width: '100%', marginTop: '8px' }}>
              <InputNumber
                style={{ width: '50%' }}
                placeholder="최소"
                value={filters.minPrice}
                onChange={(value) => updateFilters('minPrice', value)}
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
              <InputNumber
                style={{ width: '50%' }}
                placeholder="최대"
                value={filters.maxPrice}
                onChange={(value) => updateFilters('maxPrice', value)}
                min={0}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Space.Compact>
          </div>
        </Col>

        {/* 캐시 아이템 필터 */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>캐시 아이템 필터</Text>
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <Switch
                  checked={filters.excludeCashItems}
                  onChange={(checked) => updateFilters('excludeCashItems', checked)}
                  size="small"
                />
                <span style={{ marginLeft: '8px', fontSize: '13px' }}>캐시 아이템 제외</span>
              </div>
              <div>
                <Switch
                  checked={filters.cashItemsOnly}
                  onChange={(checked) => updateFilters('cashItemsOnly', checked)}
                  size="small"
                />
                <span style={{ marginLeft: '8px', fontSize: '13px' }}>캐시 아이템만</span>
              </div>
            </div>
          </div>
        </Col>


        {/* 필터 초기화 */}
        <Col xs={24}>
          <div style={{ textAlign: 'right' }}>
            <button
              onClick={() => onChange({
                levelRange: [0, 300],
                jobRestriction: [],
                itemType: 'ALL',
                minPrice: undefined,
                maxPrice: undefined,
                excludeCashItems: false,
                cashItemsOnly: false
              })}
              style={{
                background: 'none',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#666'
              }}
            >
              필터 초기화
            </button>
          </div>
        </Col>
      </Row>
    </Card>
  );
}