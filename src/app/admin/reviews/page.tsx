"use client";

import { Table, Button, Space, Popconfirm, Tag, Card, Row, Col, Statistic, Empty } from "antd";
import { useReviewsCRUD } from "@/hooks/admin/useReviews";
import { showToast } from "@/lib/utils/toast";
import { StarOutlined, CheckCircleOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";

export default function ReviewsAdminPage() {
  const {
    data: reviews,
    isLoading,
    approveReview,
    rejectReview,
    approving,
    rejecting,
  } = useReviewsCRUD();

  const handleApprove = async (id: number) => {
    try {
      await approveReview(id);
      showToast("Tasdiqlandi", "success");
    } catch {
      showToast("Xatolik", "error");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await rejectReview(id);
      showToast("O'chirildi", "success");
    } catch {
      showToast("Xatolik", "error");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: "Foydalanuvchi",
      dataIndex: ["user"],
      render: (text: string) => <div className="font-medium">{text || "Noma'lum"}</div>,
      sorter: (a: any, b: any) =>
        (a.user || "").localeCompare(b.user?.username || ""),
    },
    {
      title: "Manga",
      dataIndex: ["manga", "title"],
      render: (text: string) => <div className="font-medium">{text || "Noma'lum"}</div>,
      sorter: (a: any, b: any) =>
        (a.manga?.title || "").localeCompare(b.manga?.title || ""),
    },
    {
      title: "Matn",
      dataIndex: "text",
      ellipsis: true,
      render: (text: string) => <div className="text-sm text-gray-600">{text}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => {
        if (status === "approved") {
          return <Tag color="success">Tasdiqlangan</Tag>;
        }
        if (status === "rejected") {
          return <Tag color="error">Rad etilgan</Tag>;
        }
        return <Tag color="warning">Kutilmoqda</Tag>;
      },
      sorter: (a: any, b: any) => {
        const order: Record<string, number> = { approved: 2, pending: 1, rejected: 0 };
        return (order[a.status] || 0) - (order[b.status] || 0);
      },
    },
    {
      title: "Harakatlar",
      render: (_: any, record: any) => (
        <Space>
          {record.status !== "approved" && (
            <Popconfirm
              title="Tasdiqlaysizmi?"
              onConfirm={() => handleApprove(record.id)}
            >
              <Button
                loading={approving}
                size="small"
                type="primary"
                className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600"
              >
                Tasdiqlash
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="O'chirishni tasdiqlang"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" loading={rejecting} icon={<DeleteOutlined />}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const list = Array.isArray(reviews) ? reviews : [];
  const totalReviews = list.length;
  const approvedReviews = list.filter((r) => r.status === "approved").length;
  const pendingReviews = list.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <Row gutter={16}>
        <Col span={8}>
          <Card className="statistics-card" variant="borderless">
            <Statistic
              title="Jami sharhlar"
              value={totalReviews}
              prefix={<StarOutlined />}
              valueStyle={{ color: "#ff9900", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistics-card" variant="borderless">
            <Statistic
              title="Tasdiqlangan"
              value={approvedReviews}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="statistics-card" variant="borderless">
            <Statistic
              title="Kutilmoqda"
              value={pendingReviews}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card
        title={<h2 className="text-xl font-bold text-gray-700">Sharhlar</h2>}
        variant="borderless"
        className="overflow-hidden"
      >
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={list}
          columns={columns}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Jami ${total} sharh`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Ma'lumot yo'q"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
}
