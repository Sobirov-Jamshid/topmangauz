"use client";

import React from "react";
import { Card, Table, Button, Space, Tag, Typography } from "antd";
import { DollarOutlined, EyeOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function AdminPurchasesPage() {
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Foydalanuvchi",
      dataIndex: "user",
      key: "user",
      render: (user: any) => user?.username || "Noma'lum",
    },
    {
      title: "Manga",
      dataIndex: "manga",
      key: "manga",
      render: (manga: any) => manga?.title || "Noma'lum",
    },
    {
      title: "Bob",
      dataIndex: "chapter",
      key: "chapter",
      render: (chapter: any) => chapter?.title || "Noma'lum",
    },
    {
      title: "Narx",
      dataIndex: "price",
      key: "price",
      render: (price: number) => `${price} so'm`,
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amallar",
      key: "actions",
      render: () => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            Ko'rish
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff9900] via-[#ff6600] to-[#ff4400] rounded-2xl flex items-center justify-center shadow-2xl">
            <DollarOutlined className="text-white text-2xl" />
          </div>
          <div>
            <Title level={1} className="text-white mb-1 font-bold">
              Xaridlar
            </Title>
            <p className="text-gray-400 text-lg">
              Manga xaridlarini boshqarish
            </p>
          </div>
        </div>
      </div>

      <Card
        title="Xaridlar ro'yxati"
        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333]"
      >
        <Table
          columns={columns}
          dataSource={[]}
          rowKey="id"
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <DollarOutlined className="text-4xl text-gray-400 mb-4" />
                <div className="text-gray-400">Xaridlar mavjud emas</div>
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}