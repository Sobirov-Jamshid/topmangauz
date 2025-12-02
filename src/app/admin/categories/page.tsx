"use client";

import React, { useState } from "react";
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Form, 
  Input,
  Popconfirm,
  message 
} from "antd";
import { 
  AppstoreOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useCategories } from "@/hooks/admin/useCategories";
import { showToast } from "@/lib/utils/toast";
import type { Category } from "@/lib/api/types";

const { Title } = Typography;

export default function AdminCategoriesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  const {
    categories,
    isLoadingCategories,
    createCategory,
    isCreatingCategory,
    updateCategory,
    isUpdatingCategory,
    deleteCategory,
    isDeletingCategory,
  } = useCategories();

  const handleCreateCategory = async (values: any) => {
    try {
      await createCategory({ name: values.name });
      setIsCreateModalOpen(false);
      form.resetFields();
      showToast('Kategoriya muvaffaqiyatli yaratildi!', 'success');
    } catch (error: any) {
      showToast('Kategoriya yaratishda xatolik yuz berdi', 'error');
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    form.setFieldsValue({
      name: category.name,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (values: any) => {
    if (!selectedCategory) return;
    
    try {
      await updateCategory({ id: selectedCategory.id, data: { name: values.name } });
      setIsEditModalOpen(false);
      form.resetFields();
      setSelectedCategory(null);
      showToast('Kategoriya muvaffaqiyatli yangilandi!', 'success');
    } catch (error: any) {
      showToast('Kategoriya yangilashda xatolik yuz berdi', 'error');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      showToast('Kategoriya muvaffaqiyatli o\'chirildi!', 'success');
    } catch (error: any) {
      showToast('Kategoriya o\'chirishda xatolik yuz berdi', 'error');
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amallar",
      key: "actions",
      width: 200,
      render: (_: any, record: Category) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditCategory(record)}
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Kategoriyani o'chirish"
            description="Rostdan ham bu kategoriyani o'chirmoqchimisiz?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            >
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ff9900] via-[#ff6600] to-[#ff4400] rounded-2xl flex items-center justify-center shadow-2xl">
            <AppstoreOutlined className="text-white text-2xl" />
          </div>
          <div>
            <Title level={1} className="text-white mb-1 font-bold">
              Kategoriyalar
            </Title>
            <p className="text-gray-400 text-lg">
              Manga kategoriyalarini boshqarish
            </p>
          </div>
        </div>
      </div>

      <Card
        title={<span className="text-white">Kategoriyalar ro'yxati</span>}
        className="bg-[#1a1a1a] border-[#2a2a2a]"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#ff9900] hover:bg-[#ff6600]"
          >
            Yangi kategoriya
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={categories || []}
          rowKey="id"
          loading={isLoadingCategories}
          locale={{
            emptyText: (
              <div className="text-center py-8">
                <AppstoreOutlined className="text-4xl text-gray-400 mb-4" />
                <div className="text-gray-400">Kategoriyalar mavjud emas</div>
              </div>
            ),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Jami: ${total} ta kategoriya`,
          }}
        />
      </Card>

      {/* Create Category Modal */}
      <Modal
        title="Yangi kategoriya qo'shish"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        className="category-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            name="name"
            label={<span className="text-white">Kategoriya nomi</span>}
            rules={[
              { required: true, message: 'Kategoriya nomini kiriting!' },
              { min: 1, max: 200, message: 'Kategoriya nomi 1-200 belgidan iborat bo\'lishi kerak!' }
            ]}
          >
            <Input 
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
              placeholder="Masalan: Manga, Manhwa, Manhua"
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                form.resetFields();
              }}>
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isCreatingCategory}
                className="bg-[#ff9900] hover:bg-[#ff6600]"
              >
                Yaratish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Kategoriyani tahrirlash"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
          setSelectedCategory(null);
        }}
        footer={null}
        className="category-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateCategory}
        >
          <Form.Item
            name="name"
            label={<span className="text-white">Kategoriya nomi</span>}
            rules={[
              { required: true, message: 'Kategoriya nomini kiriting!' },
              { min: 1, max: 200, message: 'Kategoriya nomi 1-200 belgidan iborat bo\'lishi kerak!' }
            ]}
          >
            <Input 
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
              placeholder="Kategoriya nomini kiriting"
            />
          </Form.Item>

          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setIsEditModalOpen(false);
                form.resetFields();
                setSelectedCategory(null);
              }}>
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={isUpdatingCategory}
                className="bg-[#ff9900] hover:bg-[#ff6600]"
              >
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
