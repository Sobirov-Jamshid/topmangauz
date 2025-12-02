"use client";

import { Table, Button, Space, Popconfirm, Card, Row, Col, Statistic, Empty, Tabs, Tag, Tooltip } from "antd";
import { useCommentsCRUD, CommentType } from "@/hooks/admin/useComments";
import { showToast } from "@/lib/utils/toast";
import { CommentOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, WarningOutlined } from "@ant-design/icons";
import { formatDate } from "@/lib/utils/formatDate";

export default function CommentsAdminPage() {
  const { data: comments, reports, isLoading, deleteComment, resolveReport, deleting, refresh } = useCommentsCRUD();

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      showToast("Comment o'chirildi", "success");
    } catch {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      await resolveReport(reportId);
      showToast("Report hal qilindi", "success");
    } catch {
      showToast("Xatolik yuz berdi", "error");
    }
  };

  const commentColumns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      width: 70,
      sorter: (a: CommentType, b: CommentType) => a.id - b.id,
    },
    { 
      title: "Foydalanuvchi", 
      dataIndex: "user",
      render: (text: string) => (
        <div className="font-medium">{text || "Noma'lum"}</div>
      ),
      sorter: (a: CommentType, b: CommentType) => (a.user || "").localeCompare(b.user || ""),
    },
    { 
      title: "Bob ID", 
      dataIndex: "chapter",
      width: 100,
      render: (chapterId: number) => (
        <div className="font-medium">{chapterId}</div>
      ),
      sorter: (a: CommentType, b: CommentType) => (a.chapter || 0) - (b.chapter || 0),
    },
    { 
      title: "Matn", 
      dataIndex: "text", 
      ellipsis: true,
      render: (text: string) => (
        <div className="text-sm text-gray-600">{text}</div>
      ),
    },
    {
      title: "Javob",
      dataIndex: "parent",
      width: 100,
      render: (parent: number | null) => 
        parent ? (
          <Tag color="blue">Javob</Tag>
        ) : (
          <Tag color="green">Asosiy</Tag>
        ),
      sorter: (a: CommentType, b: CommentType) => Number(!!a.parent) - Number(!!b.parent),
    },
    {
      title: "Sana",
      dataIndex: "created_at",
      render: (date: string) => formatDate(date),
      sorter: (a: CommentType, b: CommentType) => new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime(),
    },
    {
      title: "Harakatlar",
      render: (_: any, record: CommentType) => (
        <Space>
          <Popconfirm title="O'chirishni tasdiqlang" onConfirm={() => handleDelete(record.id)}>
            <Button danger size="small" loading={deleting} icon={<DeleteOutlined />}>
              O'chirish
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const reportColumns = [
    { 
      title: "ID", 
      dataIndex: "comment", 
      width: 70,
      sorter: (a: any, b: any) => a.comment - b.comment,
    },
    { 
      title: "Sabab", 
      dataIndex: "reason",
      render: (reason: string) => (
        <div>
          <Tag color="red">
            {reason === 'spam' && 'Spam'}
            {reason === 'abuse' && 'Haqorat'}
            {reason === 'inappropriate' && 'Nomaqbul'}
            {reason === 'offensive' && 'Hujumkor'}
            {reason === 'other' && 'Boshqa'}
          </Tag>
        </div>
      ),
    },
    {
      title: "Comment ma'lumotlari",
      render: (_: any, record: any) => {
        const comment = comments.find(c => c.id === record.comment);
        return comment ? (
          <div>
            <div className="font-medium">{comment.user || "Noma'lum"}</div>
            <div className="text-sm text-gray-600 truncate max-w-xs">{comment.text}</div>
          </div>
        ) : (
          <div className="text-red-500">Comment topilmadi</div>
        );
      },
    },
    {
      title: "Harakatlar",
      render: (_: any, record: any) => (
        <Space>
          <Popconfirm 
            title="Commentni o'chirish" 
            description="Commentni o'chirib, reportni hal qilasizmi?" 
            onConfirm={async () => {
              const comment = comments.find(c => c.id === record.comment);
              if (comment) {
                await deleteComment(comment.id);
                await handleResolveReport(record.comment);
              }
            }}
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              O'chirish
            </Button>
          </Popconfirm>
          <Popconfirm 
            title="Reportni hal qilindi deb belgilash" 
            onConfirm={() => handleResolveReport(record.comment)}
          >
            <Button type="primary" size="small" className="bg-green-500 border-green-500" icon={<CheckCircleOutlined />}>
              Hal qilindi
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalComments = Array.isArray(comments) ? comments.length : 0;
  const parentComments = Array.isArray(comments) ? comments.filter(c => !c.parent).length : 0;
  const replyComments = Array.isArray(comments) ? comments.filter(c => !!c.parent).length : 0;
  const reportCount = Array.isArray(reports) ? reports.length : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Commentlar boshqaruvi</h1>
        <p className="text-gray-400">Foydalanuvchi commentlarini ko'rish va boshqarish</p>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card className="statistics-card">
            <Statistic
              title="Jami commentlar"
              value={totalComments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#ff9900', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistics-card">
            <Statistic
              title="Asosiy commentlar"
              value={parentComments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#52c41a', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistics-card">
            <Statistic
              title="Javoblar"
              value={replyComments}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#1890ff', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="statistics-card">
            <Statistic
              title="Shikoyatlar"
              value={reportCount}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card 
        bordered={false}
        className="overflow-hidden"
      >
        <Tabs
          defaultActiveKey="comments"
          items={[
            {
              key: 'comments',
              label: (
                <span>
                  <CommentOutlined /> Commentlar
                </span>
              ),
              children: (
                <Table 
                  rowKey="id" 
                  loading={isLoading} 
                  dataSource={Array.isArray(comments) ? comments : []} 
                  columns={commentColumns}
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Jami ${total} comment`,
                  }}
                  locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Ma'lumot yo'q" />
                  }}
                />
              ),
            },
            {
              key: 'reports',
              label: (
                <span>
                  <WarningOutlined /> Shikoyatlar
                  {reportCount > 0 && <Tag color="red" className="ml-2">{reportCount}</Tag>}
                </span>
              ),
              children: (
                <Table 
                  rowKey="comment" 
                  loading={isLoading} 
                  dataSource={Array.isArray(reports) ? reports : []} 
                  columns={reportColumns}
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Jami ${total} shikoyat`,
                  }}
                  locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Shikoyatlar yo'q" />
                  }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
