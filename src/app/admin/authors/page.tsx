"use client";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Avatar, Typography } from "antd";
import { useState } from "react";
import { useAuthors } from "@/hooks/admin/useAuthors";
import { showToast } from "@/lib/utils/toast";
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Author {
  id: number;
  name: string;
  manga_count?: number;
}

export default function AuthorsAdminPage() {
  const { 
    authors: data, 
    isLoadingAuthors: isLoading, 
    createAuthor, 
    updateAuthor, 
    deleteAuthor,
    isCreatingAuthor,
    isUpdatingAuthor,
  } = useAuthors();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<{ id?: number; name?: string } | null>(
    null
  );
  const [form] = Form.useForm();
  const [search, setSearch] = useState('');

  const stats = {
    total: Array.isArray(data) ? data.length : 0,
    totalManga: Array.isArray(data) ? data.reduce((sum, author) => sum + (author.manga_count || 0), 0) : 0,
    avgMangaPerAuthor: Array.isArray(data) && data.length > 0 ? 
      Math.round(data.reduce((sum, author) => sum + (author.manga_count || 0), 0) / data.length) : 0,
  };

  const openAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };
  
  const openEdit = (record: Author) => {
    setEditing(record);
    form.setFieldsValue({ name: record.name });
    setIsModalOpen(true);
  };
  
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing?.id) {
        await updateAuthor({ id: editing.id, data: values });
        showToast("Muvaffaqiyatli yangilandi", "success");
      } else {
        await createAuthor(values);
        showToast("Muvaffaqiyatli qo&apos;shildi", "success");
      }
      setIsModalOpen(false);
    } catch {}
  };

  const handleDelete = async (id: number) => {
    await deleteAuthor(id);
    showToast("Muvaffaqiyatli o&apos;chirildi", "success");
  };

  const filtered = (Array.isArray(data) ? data : []).filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 80,
      sorter: (a: Author, b: Author) => a.id - b.id,
    },
    { 
      title: "Tarjimon", 
      dataIndex: "name",
      render: (name: string) => (
        <div className="flex items-center">
          <Avatar 
            style={{ backgroundColor: "#ff9900", marginRight: 8 }} 
            icon={<UserOutlined />} 
          />
          <span className="font-medium">{name}</span>
        </div>
      ),
      sorter: (a: Author, b: Author) => a.name.localeCompare(b.name),
    },
    {
      title: "Manga soni",
      dataIndex: "manga_count",
      render: (_: unknown, record: Author) => record.manga_count || 0,
      sorter: (a: Author, b: Author) => (a.manga_count || 0) - (b.manga_count || 0),
    },
    {
      title: "Amallar",
      key: "action",
      render: (_: unknown, record: Author) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => openEdit(record)}
            className="text-blue-500 hover:text-blue-600"
          >
            Tahrirlash
          </Button>
          <Popconfirm
            title="Tarjimonni o&apos;chirishni istaysizmi?"
            description="Bu amalni ortga qaytarib bo&apos;lmaydi"
            onConfirm={() => handleDelete(record.id)}
            okText="Ha"
            cancelText="Yo&apos;q"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            >
              O&apos;chirish
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
                <UserOutlined className="text-white text-2xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <Title level={1} className="text-white mb-1 font-bold">
                Tarjimonlar
              </Title>
              <Text className="text-gray-400 text-lg">
                Manga mualliflarini professional boshqarish
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            className="bg-gradient-to-r from-[#ff9900] to-[#ff6600] border-none hover:from-[#ff6600] hover:to-[#ff4400] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 text-white font-semibold"
            size="large"
            style={{ height: '48px', padding: '0 24px' }}
          >
            + Yangi muallif
          </Button>
        </div>
      </div>

      {/* Compact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Jami mualliflar</div>
              <div className="text-[#ff9900] text-4xl font-bold">{stats.total}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff9900] to-[#ff6600] rounded-xl flex items-center justify-center shadow-lg">
              <UserOutlined className="text-white text-xl" />
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
              <div className="text-gray-400 text-sm font-medium mb-1">O&apos;rtacha manga</div>
              <div className="text-green-400 text-4xl font-bold">{stats.avgMangaPerAuthor}</div>
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
            placeholder="Tarjimon nomi bo&apos;yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white hover:border-[#ff9900] focus:border-[#ff9900] rounded-xl text-lg"
            size="large"
            style={{ height: '56px' }}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="text-gray-500 text-sm">
              {filtered.length} ta muallif
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
                Tarjimonlar ro&apos;yxati
              </Title>
            </div>
            <div className="text-gray-400 text-sm">
              {filtered.length} ta muallif topildi
            </div>
          </div>
        </div>
        <div className="p-6">
          <Table
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={filtered}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} muallif`,
              className: "custom-pagination"
            }}
            className="elegant-table"
            rowClassName="hover:bg-[#2a2a2a] transition-colors duration-200"
          />
        </div>
      </div>
      
      <Modal
        title={editing ? "Tarjimonni tahrirlash" : "Yangi muallif qo&apos;shish"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={isCreatingAuthor || isUpdatingAuthor}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tarjimon nomi"
            rules={[{ required: true, message: "Iltimos, muallif nomini kiriting" }]}
          >
            <Input placeholder="Tarjimon to&apos;liq ismini kiriting" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
} 