"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  Spin,
  Tabs,
  Table,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Divider,
  message,
  Row,
  Col,
  Alert,
  Modal,
  Radio,
  Tooltip,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  StarOutlined,
  EyeOutlined,
  BookOutlined,
  EditOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useMangasCRUD } from "@/hooks/admin/useMangas";
import { useAuthorsCRUD } from "@/hooks/admin/useAuthors";
import { useGenresCRUD } from "@/hooks/admin/useGenres";
import { useCategoriesCRUD } from "@/hooks/admin/useCategories";
import { useChaptersCRUD } from "@/hooks/admin/useChapters";
import { useAges } from "@/hooks/admin/useAges";
import Image from "next/image";
import { showToast } from "@/lib/utils/toast";
import Link from "next/link";
import { MangaDetail } from "@/lib/api/types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isCreating = slug === "create";

  const [form] = Form.useForm();
  const [coverFile, setCoverFile] = useState<any[]>([]);
  const [backgroundFile, setBackgroundFile] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const descriptionRef = useRef<any>(null);
  const [forceDescription, setForceDescription] = useState<string>("");
  const [isDescriptionLoaded, setIsDescriptionLoaded] = useState<boolean>(false);

  const {
    getMangaDetail,
    createManga,
    updateManga,
    deleteManga,
    getMangaChapters,
  } = useMangasCRUD();

  const { categories } = useCategoriesCRUD();
  const { authors } = useAuthorsCRUD();
  const { genres } = useGenresCRUD();
  const { ages } = useAges();

  const { data: mangaDetail, isLoading: isLoadingManga } = getMangaDetail(
    isCreating ? "" : slug
  );

  const { data: chaptersResponse, isLoading: isLoadingChapters } = getMangaChapters(
    isCreating ? "" : slug
  );

  const chapters = Array.isArray(chaptersResponse) 
    ? chaptersResponse 
    : (chaptersResponse || []);

  useEffect(() => {
    if (!isCreating && mangaDetail) {
      if (mangaDetail.description) {
        setForceDescription(mangaDetail.description);
        setIsDescriptionLoaded(true);
      }
      
      // Form maydonlarini to'ldirish - barcha kerakli fieldlar
      const formValues = {
        title: mangaDetail.title || '',
        title_uz: mangaDetail.title_uz || mangaDetail.title || '',
        title_en: mangaDetail.title_en || mangaDetail.title || '',
        slug: mangaDetail.slug || '',
        category: mangaDetail.category?.id,
        author: mangaDetail.author?.id,
        age: mangaDetail.age?.id,
        genres: mangaDetail.genres?.map((g) => g.id) || [],
        year: mangaDetail.year,
        status: mangaDetail.status || 'ongoing',
        description: mangaDetail.description || '',
      };
      
      // Form-ga qiymatlarni o'rnatish
      form.setFieldsValue(formValues);
      
      // Description ni alohida qayta tekshirish va o'rnatish
      if (mangaDetail.description && mangaDetail.description.trim()) {
        // Force set description multiple times to ensure it sticks
        const setDescription = () => {
          form.setFieldValue('description', mangaDetail.description);
          
          // Also try to set directly on the ref if available
          if (descriptionRef.current) {
            descriptionRef.current.value = mangaDetail.description;
            descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };
        
        // Immediate set
        setDescription();
        
        // Multiple attempts with increasing delays
        setTimeout(setDescription, 50);
        setTimeout(setDescription, 200);
        setTimeout(setDescription, 500);
        setTimeout(setDescription, 1000);
        setTimeout(setDescription, 2000);
        setTimeout(setDescription, 3000);
      } else {
        setForceDescription("");
      }
    } else if (isCreating) {
      // Yangi manga yaratish uchun default qiymatlar
      form.resetFields();
      form.setFieldsValue({
        status: 'ongoing',
      });
    }
  }, [mangaDetail, isCreating, form]);

  // Separate useEffect specifically for description
  useEffect(() => {
    if (!isCreating && mangaDetail?.description) {
      // Force set the description state
      setForceDescription(mangaDetail.description);
      
      // Also try to set it on the form
      form.setFieldValue('description', mangaDetail.description);
      
      // And try direct DOM manipulation
      if (descriptionRef.current) {
        descriptionRef.current.value = mangaDetail.description;
        descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, [mangaDetail?.description, isCreating, form]);

  // Final aggressive approach - run after component is fully mounted
  useEffect(() => {
    if (!isCreating && mangaDetail?.description) {
      const aggressiveSetDescription = () => {
        setForceDescription(mangaDetail.description);
        form.setFieldValue('description', mangaDetail.description);
        
        if (descriptionRef.current) {
          descriptionRef.current.value = mangaDetail.description;
          descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          descriptionRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      
      // Run immediately and then with delays
      aggressiveSetDescription();
      setTimeout(aggressiveSetDescription, 100);
      setTimeout(aggressiveSetDescription, 500);
      setTimeout(aggressiveSetDescription, 1000);
      setTimeout(aggressiveSetDescription, 2000);
    }
  }, [mangaDetail?.id, isCreating, form]);

  // Final check - run when component mounts to see if description is available
  useEffect(() => {
    if (mangaDetail?.description && !forceDescription) {
      setForceDescription(mangaDetail.description);
      setIsDescriptionLoaded(true);
    }
  }, []);

  // CRITICAL: Force set description whenever mangaDetail changes
  useEffect(() => {
    if (mangaDetail?.description) {
      if (mangaDetail.description !== forceDescription) {
        setForceDescription(mangaDetail.description);
        setIsDescriptionLoaded(true);
      }
    }
  }, [mangaDetail?.description]);

  // ULTIMATE FIX: Force update description field directly
  useEffect(() => {
    if (mangaDetail?.description && descriptionRef.current) {
      // Direct DOM manipulation
      descriptionRef.current.value = mangaDetail.description;
      descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      descriptionRef.current.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Also set the state
      setForceDescription(mangaDetail.description);
      setIsDescriptionLoaded(true);
    }
  }, [mangaDetail?.description, descriptionRef.current]);

  // FINAL NUCLEAR OPTION: Force set description with multiple attempts
  useEffect(() => {
    if (mangaDetail?.description) {
      const setDescriptionNuclear = () => {
        setForceDescription(mangaDetail.description);
        setIsDescriptionLoaded(true);
        
        if (descriptionRef.current) {
          descriptionRef.current.value = mangaDetail.description;
          descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          descriptionRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      
      // Immediate attempt
      setDescriptionNuclear();
      
      // Multiple delayed attempts
      setTimeout(setDescriptionNuclear, 100);
      setTimeout(setDescriptionNuclear, 300);
      setTimeout(setDescriptionNuclear, 500);
      setTimeout(setDescriptionNuclear, 1000);
      setTimeout(setDescriptionNuclear, 2000);
    }
  }, [mangaDetail?.description]);

  // EMERGENCY FIX: Try to set description on every render
  useEffect(() => {
    if (mangaDetail?.description && !forceDescription) {
      setForceDescription(mangaDetail.description);
      setIsDescriptionLoaded(true);
    }
  });

  // FINAL DESPERATE ATTEMPT: Force set description with interval
  useEffect(() => {
    if (mangaDetail?.description) {
      const interval = setInterval(() => {
        setForceDescription(mangaDetail.description);
        setIsDescriptionLoaded(true);
        
        if (descriptionRef.current) {
          descriptionRef.current.value = mangaDetail.description;
          descriptionRef.current.dispatchEvent(new Event('input', { bubbles: true }));
          descriptionRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, 100);
      
      // Clear interval after 5 seconds
      setTimeout(() => {
        clearInterval(interval);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [mangaDetail?.description]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const formData = new FormData();
      
      // Required fields
      formData.append("title", values.title);
      formData.append("title_uz", values.title_uz || values.title);
      formData.append("title_en", values.title_en || values.title);
      
      if (values.slug) {
        formData.append("slug", values.slug);
      }
      
      formData.append("category", values.category);
      formData.append("author", values.author);
      formData.append("year", values.year.toString());
      formData.append("status", values.status);
      formData.append("description", values.description);

      // Genres
      if (values.genres && Array.isArray(values.genres)) {
        values.genres.forEach((gid: number) =>
          formData.append("genres", gid.toString())
        );
      }

      // Files
      if (coverFile[0]?.originFileObj) {
        formData.append("cover", coverFile[0].originFileObj);
      }
      if (backgroundFile[0]?.originFileObj) {
        formData.append("background", backgroundFile[0].originFileObj);
      }

      if (isCreating) {
        await (createManga as any)(formData);
        showToast("✅ Yangi manga yaratildi!", "success");
      } else {
        await (updateManga as any)({ slug, data: formData });
        showToast("✅ Manga yangilandi!", "success");
      }

      router.push("/admin/manga");
    } catch (error: any) {
      const errorMessage = error?.response?.data?.detail || error?.message || "Xatolik yuz berdi";
      showToast(`❌ ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!mangaDetail?.id) return;
    
    try {
      setLoading(true);
      await deleteManga(mangaDetail.id);
      showToast("Manga muvaffaqiyatli o'chirildi", "success");
      router.push("/admin/manga");
    } catch (error) {
      // Silent fail
      showToast("Mangani o'chirishda xatolik", "error");
    } finally {
      setLoading(false);
    }
  };

  const coverUploadProps = {
    beforeUpload: (file: any) => {
      setCoverFile([file]);
      return false;
    },
    onRemove: () => {
      setCoverFile([]);
    },
    fileList: coverFile,
  };

  const backgroundUploadProps = {
    beforeUpload: (file: any) => {
      setBackgroundFile([file]);
      return false;
    },
    onRemove: () => {
      setBackgroundFile([]);
    },
    fileList: backgroundFile,
  };

  const ChaptersTab = ({ mangaId, slug }: { mangaId: number, slug: string }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [editing, setEditing] = useState<any | null>(null);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const chaptersHook = useChaptersCRUD();
    const { createChapter, updateChapter, deleteChapter } = chaptersHook;
    const { data: chapters, isLoading: isLoadingChapters, refetch } = (chaptersHook as any).getMangaChapters ? (chaptersHook as any).getMangaChapters(slug) : { data: [], isLoading: false, refetch: () => {} };

    const openAdd = () => {
      setEditing(null);
      form.resetFields();
      form.setFieldsValue({ 
        manga: mangaId,
        access_type: 'free'
      });
      setFileList([]);
      setModalOpen(true);
    };

    const openEdit = (record: any) => {
      setEditing(record);
      form.setFieldsValue({
        manga: record.manga,
        title: record.title,
        access_type: record.access_type || 'free',
        price: record.price || undefined,
      });
      setModalOpen(true);
    };

    const handlePreview = (pdfUrl: string) => {
      setPreviewUrl(pdfUrl);
      setPreviewModalOpen(true);
    };

    const handleOk = async () => {
      try {
        setLoading(true);
        const values = await form.validateFields();
        
        const formData = new FormData();
        formData.append("manga", values.manga.toString());
        formData.append("title", values.title);
        formData.append("access_type", values.access_type);
        
        if ((values.access_type === 'paid' || values.access_type === '3_days_paid') && values.price) {
          formData.append("price", values.price.toString());
        }
        
        if (fileList[0]?.originFileObj) {
          formData.append("pdf_file", fileList[0].originFileObj);
        }

        if (editing?.id) {
          await updateChapter({ id: editing.id, data: formData as any });
          showToast("✅ Bob yangilandi!", "success");
        } else {
          await createChapter(formData as any);
          showToast("✅ Yangi bob qo'shildi!", "success");
        }
        
        refetch();
        setModalOpen(false);
        form.resetFields();
        setFileList([]);
      } catch (error: any) {
        const errorMessage = error?.response?.data?.detail || error?.message || "Xatolik yuz berdi";
        showToast(`❌ ${errorMessage}`, "error");
      } finally {
        setLoading(false);
      }
    };

    const handleDelete = async (id: number) => {
      try {
        setLoading(true);
        await deleteChapter(id);
        showToast("Bob muvaffaqiyatli o'chirildi", "success");
        refetch();
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

    const chapterColumns = [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 60,
      },
      {
        title: "Sarlavha",
        dataIndex: "title",
        key: "chapter_title",
        sorter: (a: any, b: any) => a.title.localeCompare(b.title),
      },
      {
        title: "PDF fayl",
        key: "pdf_file",
        render: (record: any) => (
          record.pdf_file ? (
            <Button
              type="link"
              icon={<FileOutlined />}
              onClick={() => handlePreview(record.pdf_file)}
            >
              Ko'rish
            </Button>
          ) : (
            <Text type="secondary">Mavjud emas</Text>
          )
        ),
      },
      {
        title: "Kirish turi",
        dataIndex: "access_type",
        key: "access_type",
        render: (type: string) => (
          <Tag color={type === "free" ? "green" : type === "3_days_paid" ? "blue" : "orange"}>
            {type === "free" ? "Bepul" : type === "3_days_paid" ? "3 kunlik pullik" : "Pullik"}
          </Tag>
        ),
      },
      {
        title: "Narx",
        dataIndex: "price",
        key: "price",
        render: (price: string) => price ? `${price} so'm` : "-",
      },
      {
        title: "Yaratilgan sana",
        dataIndex: "created_at",
        key: "created_at",
        render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : "-",
        sorter: (a: any, b: any) => {
          if (!a.created_at || !b.created_at) return 0;
          return dayjs(a.created_at).unix() - dayjs(b.created_at).unix();
        },
      },
      {
        title: "Amallar",
        key: "actions",
        render: (_: any, record: any) => (
          <Space>
            {record.pdf_file && (
              <Tooltip title="PDFni ko'rish">
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(record.pdf_file)}
                  style={{ background: '#1890ff' }}
                />
              </Tooltip>
            )}
            <Tooltip title="Tahrirlash">
              <Button
                type="primary"
                size="small"
                icon={<EditOutlined />}
                onClick={() => openEdit(record)}
                style={{ background: '#52c41a' }}
              />
            </Tooltip>
            <Tooltip title="O'chirish">
              <Popconfirm
                title="Bobni o'chirishni istaysizmi?"
                description="Bu amalni ortga qaytarib bo'lmaydi"
                onConfirm={() => handleDelete(record.id)}
                okText="Ha"
                cancelText="Yo'q"
              >
                <Button 
                  type="primary" 
                  danger 
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ];

    return (
      <>
        <Card
          bordered={false}
          style={{ background: "#121212", borderRadius: '8px' }}
          bodyStyle={{ padding: '0' }}
          title={
            <div className="flex justify-between items-center">
              <span>Manga boblari</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAdd}
                style={{ background: '#ff9900', borderColor: '#ff9900' }}
              >
                Yangi bob qo'shish
              </Button>
            </div>
          }
        >
          <Table
            rowKey="id"
            dataSource={chapters || []}
            columns={chapterColumns}
            loading={isLoadingChapters || loading}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Jami ${total} bob`,
            }}
            locale={{ emptyText: "Boblar mavjud emas" }}
          />
        </Card>

        {/* Create/Edit Chapter Modal */}
        <Modal
          title={
            <div className="flex items-center">
              {editing ? (
                <>
                  <EditOutlined className="mr-2 text-[#ff9900]" />
                  <span>Bobni tahrirlash</span>
                </>
              ) : (
                <>
                  <PlusOutlined className="mr-2 text-[#ff9900]" />
                  <span>Yangi bob qo'shish</span>
                </>
              )}
            </div>
          }
          open={modalOpen}
          onOk={handleOk}
          onCancel={() => setModalOpen(false)}
          okText="Saqlash"
          cancelText="Bekor qilish"
          width={600}
          confirmLoading={loading}
        >
          <Form form={form} layout="vertical">
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
                const accessType = getFieldValue('access_type') || '';
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
              tooltip={editing && !fileList.length ? "PDF faylni o'zgartirmasangiz, joriy fayl saqlanib qoladi" : ""}
            >
              <Upload {...uploadProps} listType="picture">
                <Button icon={<UploadOutlined />}>PDF tanlash</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>

        {/* PDF Preview Modal */}
        <Modal
          title="PDF fayl ko'rish"
          open={previewModalOpen}
          onCancel={() => setPreviewModalOpen(false)}
          footer={[
            <Button key="close" onClick={() => setPreviewModalOpen(false)}>
              Yopish
            </Button>,
          ]}
          width="80%"
          style={{ top: 20 }}
          bodyStyle={{ height: '80vh' }}
        >
          {previewUrl && (
            <iframe 
              src={`${previewUrl}#toolbar=0`} 
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
            />
          )}
        </Modal>
      </>
    );
  };

  if (isLoadingManga && !isCreating) {
    return (
      <div className="p-6 flex justify-center items-center h-[60vh]">
        <Spin size="large" tip="Ma'lumotlar yuklanmoqda..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/admin/manga")}
        >
          Orqaga
        </Button>
        <Title level={4} className="mt-2 sm:mt-0">
          {isCreating ? "Yangi manga qo'shish" : "Mangani tahrirlash"}
        </Title>
        <div>
          {!isCreating && (
            <Popconfirm
              title="Mangani o'chirishni istaysizmi?"
              description="Bu amalni ortga qaytarib bo'lmaydi"
              onConfirm={handleDelete}
              okText="Ha"
              cancelText="Yo'q"
            >
              <Button danger icon={<DeleteOutlined />} className="mr-2">
                O'chirish
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            Saqlash
          </Button>
        </div>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "Asosiy ma'lumotlar",
            children: (
              <Card
                bordered={false}
                style={{ background: "#121212", borderRadius: '8px' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    status: "ongoing",
                    description: mangaDetail?.description || '',
                    title: mangaDetail?.title || '',
                    title_uz: mangaDetail?.title_uz || mangaDetail?.title || '',
                    title_en: mangaDetail?.title_en || mangaDetail?.title || '',
                    slug: mangaDetail?.slug || '',
                    category: mangaDetail?.category?.id,
                    author: mangaDetail?.author?.id,
                    age: mangaDetail?.age?.id,
                    genres: mangaDetail?.genres?.map((g) => g.id) || [],
                    year: mangaDetail?.year,
                  }}
                >
                  <Row gutter={24}>
                    <Col xs={24} md={16}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="title"
                            label="Sarlavha"
                            rules={[{ required: true, message: "Iltimos, sarlavhani kiriting" }]}
                          >
                            <Input placeholder="Manga sarlavhasini kiriting" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="slug"
                            label="Slug (URL manzil)"
                            rules={[
                              { 
                                pattern: /^[-a-zA-Z0-9_]+$/,
                                message: "Slug faqat harflar, raqamlar va tire belgisidan iborat bo'lishi kerak" 
                              }
                            ]}
                            tooltip="Bo'sh qoldirilsa, avtomatik yaratiladi"
                          >
                            <Input placeholder="manga-nomi-slug" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            name="category"
                            label="Kategoriya"
                            rules={[{ required: true, message: "Iltimos, kategoriyani tanlang" }]}
                          >
                            <Select
                              options={categories?.map((c: any) => ({ label: c.name, value: c.id }))}
                              showSearch
                              optionFilterProp="label"
                              placeholder="Kategoriyani tanlang"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="author"
                            label="Tarjimon"
                            rules={[{ required: true, message: "Iltimos, muallifni tanlang" }]}
                          >
                            <Select
                              options={authors?.map((a: any) => ({ label: a.name, value: a.id }))}
                              showSearch
                              optionFilterProp="label"
                              placeholder="Tarjimonni tanlang"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        name="genres"
                        label="Janrlar"
                        rules={[{ required: true, message: "Iltimos, janrlarni tanlang" }]}
                      >
                        <Select
                          mode="multiple"
                          options={genres?.map((g: any) => ({ label: g.name, value: g.id }))}
                          showSearch
                          optionFilterProp="label"
                          placeholder="Janrlarni tanlang"
                        />
                      </Form.Item>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item 
                            name="year" 
                            label="Yil"
                            rules={[{ required: true, message: "Iltimos, chiqarilgan yilni kiriting" }]}
                          >
                            <InputNumber 
                              min={1900} 
                              max={2100} 
                              style={{ width: "100%" }} 
                              placeholder="Chiqarilgan yil" 
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item 
                            name="status" 
                            label="Status" 
                            rules={[{ required: true, message: "Iltimos, statusni tanlang" }]}
                          >
                            <Select
                              options={[
                                { label: "Jarayonda", value: "ongoing" },
                                { label: "Yakunlangan", value: "completed" },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider style={{ borderColor: '#333', margin: '20px 0' }} />

                      <Form.Item 
                        name="description" 
                        label="Tavsif"
                        rules={[{ 
                          required: true, 
                          message: "Iltimos, manga tavsifini kiriting!",
                          whitespace: true 
                        }]}
                      >
                        <Input 
                          placeholder="Manga haqida batafsil tavsif yozing..." 
                          value={forceDescription || mangaDetail?.description || ''}
                          onChange={(e) => {
                            setForceDescription(e.target.value);
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                          Debug: forceDescription = "{forceDescription}" | mangaDetail.description = "{mangaDetail?.description}"
                        </div>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                      <Card 
                        title="Media fayllar" 
                        bordered={false} 
                        style={{ background: "#1a1a1a" }}
                      >
                        <div className="mb-4">
                          <div className="mb-2">Muqova rasmi</div>
                          <Upload {...coverUploadProps} listType="picture">
                            <Button icon={<UploadOutlined />}>Muqova tanlash</Button>
                          </Upload>
                          {!isCreating && mangaDetail?.cover && !coverFile.length && (
                            <div className="mt-3 border border-gray-700 rounded p-2">
                              <Text type="secondary">Joriy muqova:</Text>
                              <div className="relative h-40 w-full mt-1">
                                <Image 
                                  src={mangaDetail.cover} 
                                  alt="Cover" 
                                  fill 
                                  style={{ objectFit: "cover" }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Divider style={{ borderColor: '#333' }} />

                        <div>
                          <div className="mb-2">Fon rasmi</div>
                          <Upload {...backgroundUploadProps} listType="picture">
                            <Button icon={<UploadOutlined />}>Fon rasmi tanlash</Button>
                          </Upload>
                          {!isCreating && mangaDetail?.background && !backgroundFile.length && (
                            <div className="mt-3 border border-gray-700 rounded p-2">
                              <Text type="secondary">Joriy fon:</Text>
                              <div className="relative h-32 w-full mt-1">
                                <Image 
                                  src={mangaDetail.background} 
                                  alt="Background" 
                                  fill 
                                  style={{ objectFit: "cover" }} 
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                      
                      {!isCreating && mangaDetail && (
                        <Card 
                          className="mt-4" 
                          title="Statistika" 
                          bordered={false} 
                          style={{ background: "#1a1a1a" }}
                        >
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Text>Ko'rishlar:</Text>
                              <div className="flex items-center">
                                <EyeOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                <Text>{mangaDetail.views || 0}</Text>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Text>Reyting:</Text>
                              <div className="flex items-center">
                                <StarOutlined style={{ marginRight: 4, color: '#ff9900' }} />
                                <Text>{mangaDetail.rating ? mangaDetail.rating.toFixed(1) : "0.0"}</Text>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Text>Boblar soni:</Text>
                              <div className="flex items-center">
                                <BookOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                                <Text>{chapters?.length || 0}</Text>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
          {
            key: "2",
            label: "Boblar",
            disabled: isCreating,
            children: (
              <ChaptersTab mangaId={mangaDetail?.id || 0} slug={slug} />
            ),
          },
          {
            key: "3",
            label: "Sharhlar",
            disabled: isCreating,
            children: (
              <Card
                bordered={false}
                style={{ background: "#121212", borderRadius: '8px' }}
                bodyStyle={{ padding: '24px' }}
              >
                <Table
                  rowKey="id"
                  dataSource={mangaDetail?.reviews || []}
                  columns={[
                    {
                      title: "Foydalanuvchi",
                      dataIndex: "user",
                      key: "user",
                    },
                    {
                      title: "Sharh",
                      dataIndex: "text",
                      key: "text",
                    },
                    {
                      title: "Baho",
                      dataIndex: "rating",
                      key: "rating",
                      render: (rating: number) => (
                        <div className="flex">
                          {[...Array(rating || 0)].map((_, i) => (
                            <StarOutlined key={i} style={{ color: "#ff9900" }} />
                          ))}
                        </div>
                      ),
                    },
                    {
                      title: "Vaqt",
                      dataIndex: "created_at",
                      key: "created_at",
                      render: (date: string) => new Date(date).toLocaleDateString(),
                    },
                    {
                      title: "Amallar",
                      key: "action",
                      render: () => (
                        <Space>
                          <Popconfirm
                            title="Sharhni o'chirishni istaysizmi?"
                            okText="Ha"
                            cancelText="Yo'q"
                          >
                            <Button type="primary" danger size="small">
                              O'chirish
                            </Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: "Sharhlar mavjud emas" }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
} 