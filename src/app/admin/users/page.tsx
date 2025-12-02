"use client";
import { useState, useEffect } from "react";
import { Table, Card, Input, Button, Space, Tag, Modal, Switch, Avatar, Tooltip, Empty } from "antd";
import { useAllUsers, useUsersCount } from "@/hooks/admin/useUsers";
import { useUpdateAdminUserPartial } from "@/hooks/admin/useAdminUsers";
import { AllUser } from "@/lib/api/types";
import { SearchOutlined, FilterOutlined, UserOutlined, EditOutlined, CrownOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { showToast } from "@/lib/utils/toast";

export default function UsersAdminPage() {
  const [searchText, setSearchText] = useState("");
  const [filterStaff, setFilterStaff] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState("-id"); // Default ordering by id descending
  const [selectedUser, setSelectedUser] = useState<AllUser | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: usersData, isLoading, refetch } = useAllUsers(
    debouncedSearch, 
    ordering,
    currentPage
  );

  const { data: countData } = useUsersCount();
  const updateUserMutation = useUpdateAdminUserPartial();
  
  const users = usersData?.results || [];
  
  // Apply filters
  const filteredUsers = (Array.isArray(users) ? users : []).filter((user: AllUser) => {
    // Search filter
    const matchesSearch = !debouncedSearch || 
      user.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    // Staff filter
    const matchesStaff = filterStaff === null || user.is_staff === filterStaff;
    
    return matchesSearch && matchesStaff;
  });

  const handleEditUser = (user: AllUser) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    
    if (sorter && sorter.order) {
      const sortField = sorter.field as string;
      const sortOrder = sorter.order === 'ascend' ? '' : '-';
      setOrdering(`${sortOrder}${sortField}`);
    } else {
      setOrdering('-id'); // Default sorting
    }
  };
  
  const columns: any[] = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 80,
      sorter: true,
    },
    { 
      title: "Foydalanuvchi", 
      dataIndex: "username",
      render: (text: string, record: AllUser) => (
        <div className="flex items-center">
          <Avatar 
            style={{ backgroundColor: record.is_staff ? "#ff9900" : "#1890ff", marginRight: 8 }} 
            icon={<UserOutlined />} 
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
      sorter: true,
    },
    { 
      title: "Email", 
      dataIndex: "email",
      responsive: ["lg" as const],
      sorter: true,
    },
    { 
      title: "Avatar", 
      dataIndex: "avatar",
      render: (avatar: string, record: AllUser) => (
        avatar ? 
          <Avatar src={avatar} /> : 
          <Avatar style={{ backgroundColor: record.is_staff ? "#ff9900" : "#1890ff" }} icon={<UserOutlined />} />
      ),
      sorter: true,
      responsive: ["md" as const],
    },
    { 
      title: "Status", 
      dataIndex: "is_staff", 
      render: (isStaff: boolean, record: AllUser) => (
        <Space>
          {isStaff ? (
            <Tag color="orange" icon={<CrownOutlined />}>Admin</Tag>
          ) : (
            <Tag color="blue" icon={<UserOutlined />}>Foydalanuvchi</Tag>
          )}
        </Space>
      ),
      filters: [
        { text: "Admin", value: true },
        { text: "Foydalanuvchi", value: false },
      ],
      onFilter: (value: boolean, record: AllUser) => record.is_staff === value,
      width: 150,
    },
    {
      title: "Harakatlar",
      key: "action",
      render: (_: any, record: AllUser) => (
        <Space size="small">
          <Tooltip title="Tahrirlash">
            <Button 
              type="primary"
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
              size="small"
            >
              Tahrirlash
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Foydalanuvchilarni boshqarish</h1>
        <p className="text-gray-400">Tizimda ro'yxatdan o'tgan barcha foydalanuvchilarni ko'ring va boshqaring</p>
      </div>

      {/* Main Content */}
      <Card 
        title={<h2 className="text-xl font-bold text-gray-700">Foydalanuvchilar</h2>}
        bordered={false}
        className="overflow-hidden"
        extra={
          <Space>
            <Input
              placeholder="Foydalanuvchilarni qidirish..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              className="border-gray-300"
              style={{ width: 200 }}
              allowClear
            />
            <Button
              type={filterStaff === null ? "default" : "primary"}
              icon={<FilterOutlined />}
              onClick={() => {
                const newFilter = filterStaff === null ? true : filterStaff === true ? false : null;
                setFilterStaff(newFilter);
              }}
              className={filterStaff === null ? "" : "bg-orange-500 border-orange-500 hover:bg-orange-600 hover:border-orange-600"}
            >
              {filterStaff === null ? "Barcha" : filterStaff ? "Adminlar" : "Foydalanuvchilar"}
            </Button>
          </Space>
        }
      >
        <Table 
          rowKey="id" 
          loading={isLoading} 
          dataSource={filteredUsers} 
          columns={columns}
          pagination={{ 
            pageSize: pageSize,
            current: currentPage,
            total: countData?.count || 0,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} foydalanuvchi`,
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) setPageSize(size);
            },
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Ma'lumot yo'q" />
          }}
        />
      </Card>

      {/* Edit User Modal */}
      <Modal
        title={`${selectedUser?.username} - Admin huquqini o'zgartirish`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedUser(null);
        }}
        footer={null}
        width={500}
        centered
      >
        {selectedUser && (
          <div className="space-y-6 py-4">
            {/* User Info - Read Only */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Foydalanuvchi ma'lumotlari</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Username</label>
                  <div className="text-sm font-medium text-gray-900">{selectedUser.username}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <div className="text-sm font-medium text-gray-900">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Balans</label>
                  <div className="text-sm font-medium text-gray-900">{selectedUser.balance || 0} so'm</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ID</label>
                  <div className="text-sm font-medium text-gray-900">#{selectedUser.id}</div>
                </div>
              </div>
            </div>

            {/* Admin Status - Editable */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg bg-white">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Admin huquqini o'zgartirish</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={selectedUser.is_staff}
                    onChange={(checked) => {
                      setSelectedUser({ ...selectedUser, is_staff: checked });
                    }}
                    checkedChildren="✓ Admin"
                    unCheckedChildren="✗ User"
                    size="default"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {selectedUser.is_staff ? "Admin" : "Oddiy foydalanuvchi"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {selectedUser.is_staff 
                        ? "Bu foydalanuvchi admin paneliga kirish huquqiga ega" 
                        : "Bu foydalanuvchi faqat oddiy foydalanuvchi"}
                    </div>
                  </div>
                </div>
                <Tag color={selectedUser.is_staff ? "orange" : "blue"} className="text-base px-3 py-1">
                  {selectedUser.is_staff ? (
                    <span><CrownOutlined /> Admin</span>
                  ) : (
                    <span><UserOutlined /> User</span>
                  )}
                </Tag>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t pt-4">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  setSelectedUser(null);
                }}
                size="large"
              >
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                size="large"
                onClick={async () => {
                  try {
                    await updateUserMutation.mutateAsync({
                      id: selectedUser.id,
                      data: { is_staff: selectedUser.is_staff }
                    });
                    
                    showToast("✅ Muvaffaqiyatli yangilandi!", "success");
                    setIsModalVisible(false);
                    setSelectedUser(null);
                    refetch();
                  } catch (error: any) {
                    const errorMessage = error?.response?.data?.detail || error?.message || "Xatolik yuz berdi";
                    showToast(`❌ ${errorMessage}`, "error");
                  }
                }}
                loading={updateUserMutation.isPending}
              >
                Saqlash
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
} 