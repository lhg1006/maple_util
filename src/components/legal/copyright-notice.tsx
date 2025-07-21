'use client';

import React from 'react';
import { Modal, Typography, Space, Button } from 'antd';
import { ExclamationCircleOutlined, CopyrightOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

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
      width={700}
      centered
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      <div style={{ padding: '16px 0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4} className="text-red-500 dark:text-red-400">
              <CopyrightOutlined /> 중요한 저작권 안내
            </Title>
            <Paragraph className="text-gray-700 dark:text-gray-300">
              이 웹사이트 이용 시 다음 내용을 숙지해주시기 바랍니다.
            </Paragraph>
          </div>

          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
            <Title level={5} className="text-red-600 dark:text-red-400" style={{ margin: '0 0 8px 0' }}>
              📋 서비스 정보 및 저작권 안내
            </Title>
            <ul className="text-gray-700 dark:text-gray-300" style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>비공식 서비스</strong>: 이 사이트는 넥슨코리아와 무관한 개인이 운영하는 비공식 서비스입니다.</li>
              <li><strong>저작권 소유</strong>: 모든 메이플스토리 관련 데이터, 이미지, 아이콘의 저작권은 넥슨코리아에 있습니다.</li>
              <li><strong>비상업적 이용</strong>: 이 서비스는 비상업적 목적으로만 제공되며, 어떠한 수익도 창출하지 않습니다.</li>
              <li><strong>정보 제공 목적</strong>: 메이플스토리 이용자들의 편의를 위한 정보 제공이 유일한 목적입니다.</li>
              <li><strong>책임 제한</strong>: 제공되는 정보의 정확성을 보장하지 않으며, 이용으로 인한 손해에 대해 책임지지 않습니다.</li>
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" style={{ padding: '16px', borderRadius: '6px' }}>
            <Title level={5} className="text-green-600 dark:text-green-400" style={{ margin: '0 0 8px 0' }}>
              ℹ️ 이용 시 참고사항
            </Title>
            <ul className="text-gray-700 dark:text-gray-300" style={{ margin: 0, paddingLeft: '20px' }}>
              <li>본 사이트는 게임 데이터 조회를 위한 도구입니다.</li>
              <li>넥슨코리아의 지적재산권을 존중하며 운영됩니다.</li>
              <li>공식 서비스가 아닌 개인 운영 서비스임을 안내드립니다.</li>
              <li>데이터는 maplestory.io API를 통해 제공받습니다.</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800" style={{ padding: '16px', borderRadius: '6px' }}>
            <Title level={5} className="text-blue-600 dark:text-blue-400" style={{ margin: '0 0 8px 0' }}>
              📞 문의 및 신고
            </Title>
            <Paragraph className="text-gray-700 dark:text-gray-300" style={{ margin: 0 }}>
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