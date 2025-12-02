"use client";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, Tag, Row, Col, Typography } from "antd";
import { useState } from "react";
import { useGenres } from "@/hooks/admin/useGenres";
import { showToast } from "@/lib/utils/toast";
import { Genre } from "@/lib/api/types";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, TagOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function GenresAdminPage() {
  const { 
    genres: data, 
    isLoading, 
    createGenre, 
    updateGenre, 
    deleteGenre,
    isCreatingGenre,
    isUpdatingGenre,
    isDeletingGenre,
  } = useGenres();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Genre | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const stats = {
    total: Array.isArray(data) ? data.length : 0,
    totalManga: Array.isArray(data) ? data.reduce((sum, genre) => sum + (genre.manga_count || 0), 0) : 0,
    avgMangaPerGenre: Array.isArray(data) && data.length > 0 ? 
      Math.round(data.reduce((sum, genre) => sum + (genre.manga_count || 0), 0) / data.length) : 0,
  };

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const handleEdit = (record: Genre) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
    const values = await form.validateFields();
    if (editing?.id) {
      await updateGenre({ id: editing.id, data: values });
        showToast("Janr muvaffaqiyatli yangilandi", "success");
    } else {
      await createGenre(values);
        showToast("Janr muvaffaqiyatli qo'shildi", "success");
    }
    setOpen(false);
    } catch (error) {
      showToast("Janr saqlashda xatolik", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
    await deleteGenre(id);
      showToast("Janr muvaffaqiyatli o'chirildi", "success");
    } catch (error) {
      showToast("Janr o'chirishda xatolik", "error");
    }
  };

  const filtered = (Array.isArray(data) ? data : []).filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const getRandomColor = (id: number) => {
    const colors = ['#ff9900', '#1890ff', '#52c41a', '#722ed1', '#eb2f96', '#faad14'];
    return colors[id % colors.length];
  };

  const columns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 80,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    { 
      title: "Nomi", 
      dataIndex: "name",
      render: (name: string, record: Genre) => (
        <Tag color={getRandomColor(record.id || 0)} style={{ fontSize: '14px', padding: '4px 8px' }}>
          {name}
        </Tag>
      ),
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: "Manga soni",
      dataIndex: "manga_count",
      render: (_: any, record: any) => record.manga_count || 0,
      sorter: (a: any, b: any) => (a.manga_count || 0) - (b.manga_count || 0),
    },
    {
      title: "Amallar",
      key: "action",
      render: (_: any, record: Genre) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-600"
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Janrni o'chirishni istaysizmi?"
            description="Bu amalni ortga qaytarib bo'lmaydi"
            onConfirm={() => handleDelete(record.id!)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
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
      {/* Elegant Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff9900] via-[#ff6600] to-[#ff4400] rounded-2xl flex items-center justify-center shadow-2xl">
                <TagOutlined className="text-white text-2xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <Title level={1} className="text-white mb-1 font-bold">
                Janrlar
              </Title>
              <Text className="text-gray-400 text-lg">
                Manga janrlarini professional boshqarish
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="bg-gradient-to-r from-[#ff9900] to-[#ff6600] border-none hover:from-[#ff6600] hover:to-[#ff4400] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 text-white font-semibold"
            size="large"
            style={{ height: '48px', padding: '0 24px' }}
          >
            + Yangi janr
          </Button>
        </div>
      </div>

      {/* Compact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Jami janrlar</div>
              <div className="text-[#ff9900] text-4xl font-bold">{stats.total}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff9900] to-[#ff6600] rounded-xl flex items-center justify-center shadow-lg">
              <TagOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Jami manga</div>
              <div className="text-blue-400 text-4xl font-bold">{stats.totalManga}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileTextOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">O'rtacha manga</div>
              <div className="text-green-400 text-4xl font-bold">{stats.avgMangaPerGenre}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            prefix={<SearchOutlined className="text-[#ff9900] text-lg" />}
            placeholder="Janr nomi bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white hover:border-[#ff9900] focus:border-[#ff9900] rounded-xl text-lg"
            size="large"
            style={{ height: '56px' }}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="text-gray-500 text-sm">
              {filtered.length} ta janr
            </div>
          </div>
        </div>
      </div>

      {/* Elegant Table */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-[#333] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-full"></div>
              <Title level={4} className="text-white mb-0">
                Janrlar ro'yxati
              </Title>
            </div>
            <div className="text-gray-400 text-sm">
              {filtered.length} ta janr topildi
            </div>
          </div>
        </div>
        <div className="p-6">
          <Table 
            rowKey="id" 
            loading={isLoading} 
            dataSource={filtered} 
            columns={columns}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} janr`,
              className: "custom-pagination"
            }}
            className="elegant-table"
            rowClassName="hover:bg-[#2a2a2a] transition-colors duration-200"
          />
        </div>
      </div>
      
      <Modal 
        title={editing ? "Janrni tahrirlash" : "Yangi janr qo'shish"}
        open={open} 
        onOk={handleSave} 
        onCancel={() => setOpen(false)}
        okText={editing ? "Saqlash" : "Qo'shish"}
        cancelText="Bekor qilish"
        confirmLoading={isCreatingGenre || isUpdatingGenre}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Janr nomi"
            rules={[{ required: true, message: "Iltimos, janr nomini kiriting" }]}
          >
            <Input placeholder="Janr nomini kiriting" prefix={<TagOutlined />} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 