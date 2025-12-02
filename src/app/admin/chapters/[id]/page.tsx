"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChaptersCRUD } from "@/hooks/admin/useChapters";
import { useMangasCRUD } from "@/hooks/admin/useMangas";
import { 
  Form, 
  Input, 
  Radio, 
  InputNumber, 
  Upload, 
  Button, 
  Card, 
  Spin, 
  Typography,
  Alert,
  Breadcrumb,
  Tabs,
  Descriptions,
  Divider,
  Space,
  Popconfirm,
  Tag
} from "antd";
import { 
  UploadOutlined, 
  SaveOutlined, 
  ArrowLeftOutlined, 
  FileOutlined,
  DeleteOutlined,
  BookOutlined
} from "@ant-design/icons";
import { showToast } from "@/lib/utils/toast";
import Link from "next/link";
import dayjs from "dayjs";
import { Chapter } from "@/lib/api/types";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chapterId = params.id as string;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const { getChapterDetail, updateChapter, deleteChapter } = useChaptersCRUD();
  const { data: chapter, isLoading } = getChapterDetail(chapterId);
  const { getManga } = useMangasCRUD();
  const { data: manga, isLoading: mangaLoading } = getManga(chapter?.manga);

  useEffect(() => {
    if (chapter) {
      form.setFieldsValue({
        manga: chapter.manga,
        title: chapter.title,
        access_type: chapter.access_type || 'free',
        price: chapter.price || undefined,
      });
    }
  }, [chapter, form]);

  const handleSubmit = async (values: any) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      
      if (values.title !== chapter?.title) {
        formData.append("title", values.title);
      }
      
      if (values.access_type !== chapter?.access_type) {
        formData.append("access_type", values.access_type);
      }
      
      if ((values.access_type === 'paid' || values.access_type === '3_days_paid') && values.price !== chapter?.price) {
        formData.append("price", values.price);
      }
      
      if (fileList[0]?.originFileObj) {
        formData.append("pdf_file", fileList[0].originFileObj);
      }

      if (formData.entries().next().done === false) {
        await updateChapter({ id: Number(chapterId), data: formData });
        showToast("Bob muvaffaqiyatli yangilandi", "success");
      }

    } catch (error) {
      // Silent fail
      showToast("Bobni yangilashda xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteChapter(Number(chapterId));
      showToast("Bob muvaffaqiyatli o'chirildi", "success");
      
      if (manga?.slug) {
        router.push(`/admin/manga/${manga.slug}`);
      } else {
        router.push("/admin/chapters");
      }
    } catch (error) {
      // Silent fail
      showToast("Bobni o'chirishda xatolik yuz berdi", "error");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
    accept: ".pdf",
    maxCount: 1,
  };

  if (isLoading || mangaLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="p-4">
        <Alert 
          message="Bob topilmadi" 
          description="Ushbu ID bilan bob topilmadi" 
          type="error" 
          showIcon 
        />
        <div className="mt-4">
          <Link href="/admin/chapters">
            <Button icon={<ArrowLeftOutlined />}>Boblar ro'yxatiga qaytish</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link href="/admin">Admin panel</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href="/admin/chapters">Boblar</Link>
        </Breadcrumb.Item>
        {manga && (
          <Breadcrumb.Item>
            <Link href={`/admin/manga/${manga.slug}`}>{manga.title}</Link>
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item>{chapter.title}</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <div className="flex items-center">
            <BookOutlined className="mr-2 text-[#ff9900]" />
            <span className="text-xl font-bold">Bob ma'lumotlari</span>
          </div>
        }
        bordered={false}
        style={{ background: "#121212", borderRadius: '8px' }}
        extra={
          <Space>
            {chapter.pdf_file && (
              <Button 
                type="primary" 
                icon={<FileOutlined />}
                onClick={() => window.open(chapter.pdf_file)}
                style={{ background: '#1890ff' }}
              >
                PDFni ko'rish
              </Button>
            )}
            <Popconfirm
              title="Bobni o'chirishni istaysizmi?"
              description="Bu amalni ortga qaytarib bo'lmaydi"
              onConfirm={handleDelete}
              okText="Ha"
              cancelText="Yo'q"
            >
              <Button 
                type="primary" 
                danger 
                icon={<DeleteOutlined />}
                loading={loading}
              >
                O'chirish
              </Button>
            </Popconfirm>
          </Space>
        }
      >
        <Tabs defaultActiveKey="info">
          <TabPane tab="Ma'lumotlar" key="info">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="ID">{chapter.id}</Descriptions.Item>
              <Descriptions.Item label="Sarlavha">{chapter.title}</Descriptions.Item>
              <Descriptions.Item label="Manga">
                {manga ? (
                  <Link href={`/admin/manga/${manga.slug}`} className="text-blue-500 hover:text-blue-700">
                    {manga.title}
                  </Link>
                ) : (
                  <Text>ID: {chapter.manga}</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Kirish turi">
                <Tag color={chapter.access_type === "free" ? "green" : chapter.access_type === "3_days_paid" ? "blue" : "orange"}>
                  {chapter.access_type === "free" ? "Bepul" : chapter.access_type === "3_days_paid" ? "3 kunlik pullik" : "Pullik"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Narx">
                {chapter.price ? `${chapter.price} so'm` : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Xarid qilingan">
                <Tag color={chapter.is_purchased === true || chapter.is_purchased === 'true' ? 'green' : 'default'}>
                  {chapter.is_purchased === true || chapter.is_purchased === 'true' ? 'Ha' : 'Yo\'q'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Yaratilgan vaqt">
                {chapter.created_at ? dayjs(chapter.created_at).format('YYYY-MM-DD HH:mm') : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="PDF fayl">
                {chapter.pdf_file ? (
                  <Link href={chapter.pdf_file} target="_blank">
                    PDF faylni ko'rish
                  </Link>
                ) : (
                  "Mavjud emas"
                )}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Tahrirlash" key="edit">
            <Form 
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item name="manga" hidden>
                <Input />
              </Form.Item>
              
              <Form.Item 
                name="title" 
                label="Sarlavha" 
                rules={[{ required: true, message: "Iltimos, sarlavhani kiriting" }]}
              >
                <Input placeholder="Bob sarlavhasini kiriting" />
              </Form.Item>
              
              <Form.Item 
                name="access_type" 
                label="Kirish turi" 
                rules={[{ required: true, message: "Iltimos, kirish turini tanlang" }]}
              >
                <Radio.Group>
                  <Radio value="free">Bepul</Radio>
                  <Radio value="paid">Pullik</Radio>
                  <Radio value="3_days_paid">3 kunlik pullik</Radio>
                </Radio.Group>
              </Form.Item>
              
              <Form.Item 
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues?.access_type !== currentValues?.access_type
                }
              >
                {({ getFieldValue }) => {
                  const accessType = getFieldValue('access_type');
                  return (accessType === 'paid' || accessType === '3_days_paid') ? (
                    <Form.Item 
                      name="price" 
                      label="Narx" 
                      rules={[{ required: true, message: "Iltimos, narxni kiriting" }]}
                    >
                      <InputNumber 
                        min={0} 
                        style={{ width: "100%" }} 
                        placeholder="Bobning narxini kiriting"
                        addonAfter="so'm"
                      />
                    </Form.Item>
                  ) : null;
                }}
              </Form.Item>
              
              <Form.Item 
                label="PDF fayl"
                tooltip="PDF faylni o'zgartirmasangiz, joriy fayl saqlanib qoladi"
              >
                <Upload {...uploadProps} listType="picture">
                  <Button icon={<UploadOutlined />}>PDF tanlash</Button>
                </Upload>
                {chapter.pdf_file && !fileList.length && (
                  <div className="mt-2">
                    <Text type="success">Joriy PDF fayl mavjud</Text>
                  </div>
                )}
              </Form.Item>

              <Form.Item className="flex justify-end">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={submitting}
                  icon={<SaveOutlined />}
                  style={{ background: "#ff9900" }}
                >
                  Saqlash
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      {/* PDF Preview in iframe */}
      {previewModalOpen && chapter.pdf_file && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Button
              type="primary"
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-2 right-2 z-10"
            >
              Yopish
            </Button>
            <iframe 
              src={`${chapter.pdf_file}#toolbar=0`}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
} 