'use client';

import { Modal, Typography, Spin, Alert, Divider, Space, Tag } from 'antd';
import { UserOutlined, EnvironmentOutlined, MessageOutlined } from '@ant-design/icons';
import { useMapleNPC } from '@/hooks/useMapleData';
import Image from 'next/image';

const { Title, Text, Paragraph } = Typography;

interface NPCDetailModalProps {
  npcId: number | null;
  open: boolean;
  onClose: () => void;
}

export const NPCDetailModal: React.FC<NPCDetailModalProps> = ({ npcId, open, onClose }) => {
  const { data: npc, isLoading, isError, error } = useMapleNPC(npcId || 0, !!npcId);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <span>NPC 상세 정보</span>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" tip="NPC 정보를 불러오는 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
        </div>
      )}

      {isError && (
        <Alert
          message="오류 발생"
          description={`NPC 정보를 불러오는데 실패했습니다. ${error?.message || ''}`}
          type="error"
          showIcon
        />
      )}

      {npc && (
        <div style={{ padding: '8px 0' }}>
          {/* NPC 기본 정보 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* NPC 이미지 */}
            <div style={{
              width: '120px',
              height: '120px',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden'
            }}>
              <Image
                src={`https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`}
                alt={npc.name}
                width={100}
                height={100}
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999;">
                        <span style="font-size: 48px;">👤</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>

            {/* NPC 정보 */}
            <div style={{ flex: 1 }}>
              <Title level={3} style={{ margin: '0 0 16px 0', color: '#1890ff' }}>
                {npc.name}
              </Title>
              
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text strong>ID: </Text>
                  <Text code>{npc.id}</Text>
                </div>
                
                {npc.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <Text>{npc.location}</Text>
                  </div>
                )}
              </Space>
            </div>
          </div>

          <Divider />

          {/* NPC 설명 */}
          {npc.description && (
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined />
                설명
              </Title>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {npc.description}
                </Paragraph>
              </div>
            </div>
          )}

          {/* 대화 스크립트 */}
          {npc.scripts && npc.scripts.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <Title level={4} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageOutlined />
                대화 내용
              </Title>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {npc.scripts.map((script, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <Tag color="blue" style={{ marginBottom: '4px' }}>
                      대화 {index + 1}
                    </Tag>
                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {script}
                    </Paragraph>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추가 정보 */}
          <div style={{
            backgroundColor: '#f0f2f5',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              본 정보는 maplestory.io API에서 제공됩니다.
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
};