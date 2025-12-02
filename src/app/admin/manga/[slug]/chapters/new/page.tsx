"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMangasCRUD } from "@/hooks/admin/useMangas";
import { useChaptersCRUD } from "@/hooks/admin/useChapters";
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
  Space
} from "antd";
import { UploadOutlined, BookOutlined, SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { showToast } from "@/lib/utils/toast";
import Link from "next/link";

const { Title, Text } = Typography;

export default function NewChapterPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { getManga } = useMangasCRUD();
  const { data: manga, isLoading } = getManga(slug);
  const { createChapter } = useChaptersCRUD();

  useEffect(() => {
    if (manga) {
      form.setFieldsValue({ 
        manga: manga.id,
        access_type: 'free'
      });
    }
  }, [manga, form]);

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      showToast("Iltimos, PDF faylni yuklang", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append("manga", values.manga);
      formData.append("title", values.title);
      formData.append("access_type", values.access_type);
      
      if ((values.access_type === 'paid' || values.access_type === '3_days_paid') && values.price) {
        formData.append("price", values.price);
      }
      
      if (fileList[0]?.originFileObj) {
        formData.append("pdf_file", fileList[0].originFileObj);
      }

      await createChapter(formData);
      showToast("Yangi bob muvaffaqiyatli qo'shildi", "success");
      router.push(`/admin/manga/${slug}`);
    } catch (error) {
      // Silent fail
      showToast("Bob qo'shishda xatolik yuz berdi", "error");
    } finally {
      setSubmitting(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="p-4">
        <Alert 
          message="Manga topilmadi" 
          description="Ushbu URL manziliga tegishli manga topilmadi" 
          type="error" 
          showIcon 
        />
        <div className="mt-4">
          <Link href="/admin/manga">
            <Button icon={<ArrowLeftOutlined />}>Mangalar ro'yxatiga qaytish</Button>
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
          <Link href="/admin/manga">Mangalar</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link href={`/admin/manga/${slug}`}>{manga.title}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Yangi bob qo'shish</Breadcrumb.Item>
      </Breadcrumb>

      <Card
        title={
          <div className="flex items-center">
            <BookOutlined className="mr-2 text-[#ff9900]" />
            <span className="text-xl font-bold">{manga.title} - Yangi bob qo'shish</span>
          </div>
        }
        bordered={false}
        style={{ background: "#121212", borderRadius: '8px' }}
      >
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
            initialValue="free"
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
              if (accessType === 'paid' || accessType === '3_days_paid') {
                return (
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
                );
              }
              return null;
            }}
          </Form.Item>
          
          <Form.Item 
            label="PDF fayl"
            rules={[{ required: true, message: "Iltimos, PDF faylni yuklang" }]}
          >
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>PDF tanlash</Button>
            </Upload>
          </Form.Item>

          <Form.Item className="flex justify-end">
            <Space>
              <Button onClick={() => router.push(`/admin/manga/${slug}`)}>
                Bekor qilish
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={<SaveOutlined />}
                style={{ background: "#ff9900" }}
              >
                Saqlash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 