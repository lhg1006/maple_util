'use client';

import React, { useState } from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { ExclamationCircleOutlined, CopyrightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface CopyrightNoticeProps {
  isVisible: boolean;
  onClose: () => void;
}

export function CopyrightNotice({ isVisible, onClose }: CopyrightNoticeProps) {

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>저작권 안내 및 이용약관</span>
        </Space>
      }
      open={isVisible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          확인
        </Button>,
      ]}
      width={600}
    >
      <div style={{ padding: '16px 0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} style={{ color: '#ff4d4f' }}>
              <CopyrightOutlined /> 중요한 저작권 안내
            </Title>
            <Paragraph>
              이 웹사이트를 이용하기 전에 다음 내용을 반드시 읽고 동의해주세요.
            </Paragraph>
          </div>

          <div style={{ background: '#fff2f0', padding: '16px', borderRadius: '6px', border: '1px solid #ffccc7' }}>
            <Title level={5} style={{ color: '#cf1322', margin: '0 0 8px 0' }}>
              📋 이용약관 및 저작권 안내
            </Title>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>비공식 서비스</strong>: 이 사이트는 넥슨코리아와 무관한 개인이 운영하는 비공식 서비스입니다.</li>
              <li><strong>저작권 소유</strong>: 모든 메이플스토리 관련 데이터, 이미지, 아이콘의 저작권은 넥슨코리아에 있습니다.</li>
              <li><strong>비상업적 이용</strong>: 이 서비스는 비상업적 목적으로만 제공되며, 어떠한 수익도 창출하지 않습니다.</li>
              <li><strong>정보 제공 목적</strong>: 메이플스토리 이용자들의 편의를 위한 정보 제공이 유일한 목적입니다.</li>
              <li><strong>책임 제한</strong>: 제공되는 정보의 정확성을 보장하지 않으며, 이용으로 인한 손해에 대해 책임지지 않습니다.</li>
            </ul>
          </div>

          <div style={{ background: '#f6ffed', padding: '16px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
            <Title level={5} style={{ color: '#389e0d', margin: '0 0 8px 0' }}>
              🤝 이용자 의무사항
            </Title>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>본 사이트의 데이터를 상업적 목적으로 사용하지 않습니다.</li>
              <li>넥슨코리아의 지적재산권을 존중합니다.</li>
              <li>본 사이트가 공식 서비스가 아닌 데이터 뷰어 도구임을 인지하고 있습니다.</li>
              <li>저작권 문제 발생 시 즉시 신고하여 해결에 협조합니다.</li>
            </ul>
          </div>

          <div style={{ background: '#fff7e6', padding: '16px', borderRadius: '6px', border: '1px solid #ffd591' }}>
            <Title level={5} style={{ color: '#d46b08', margin: '0 0 8px 0' }}>
              🗂️ CDN 데이터 정책
            </Title>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>CDN 데이터는 검색 최적화를 위한 메타데이터만 저장합니다.</li>
              <li>게임 이미지는 직접 저장하지 않고 원본 API 링크로 참조합니다.</li>
              <li>모든 CDN 데이터는 비상업적 교육 목적으로만 사용됩니다.</li>
              <li>원본 데이터의 저작권은 넥슨코리아에 있습니다.</li>
            </ul>
          </div>

          <div style={{ background: '#f0f2ff', padding: '16px', borderRadius: '6px', border: '1px solid #adc6ff' }}>
            <Title level={5} style={{ color: '#1d39c4', margin: '0 0 8px 0' }}>
              📞 문의 및 신고
            </Title>
            <Paragraph style={{ margin: 0 }}>
              저작권 문제나 기타 문의사항이 있으시면 GitHub Issues를 통해 연락해주세요.
              <br />
              문제가 되는 내용은 즉시 제거하겠습니다.
            </Paragraph>
          </div>

        </Space>
      </div>
    </Modal>
  );
}