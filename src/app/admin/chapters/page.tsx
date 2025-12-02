"use client";

import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Tag,
  Popconfirm,
  Typography,
  Alert,
  Badge,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  DollarOutlined,
  GiftOutlined,
  DownloadOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useChapters } from "@/hooks/admin/useChapters";
import { useMangas } from "@/hooks/admin/useMangas";
import type { ColumnsType } from "antd/es/table";
import type { ChapterCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";
import { safeRemoveChild } from "@/lib/utils/dom";
import { adminService } from "@/lib/api/adminService";
import PdfViewerModal from "@/components/common/PdfViewerModal";

const { Title, Text } = Typography;
const { Option } = Select;

// Loading Spinner komponenti
const LoadingSpinner = ({ size = "default" }: { size?: "small" | "default" | "large" }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <Spin size={size} />
    <Text className="text-gray-400">Yuklanmoqda...</Text>
  </div>
);

export default function AdminChaptersPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedManga, setSelectedManga] = useState<number>();
  const [selectedAccessType, setSelectedAccessType] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [form] = Form.useForm();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [editPdfFile, setEditPdfFile] = useState<File | null>(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>("");
  const [isUploadingPdfToChapter, setIsUploadingPdfToChapter] = useState<number | null>(null);
  const [isCreatingWithPdf, setIsCreatingWithPdf] = useState(false);

  const {
    chapters,
    isLoadingChapters,
    chaptersError,
    refetchChapters,
    createChapter,
    isCreatingChapter,
    updateChapter,
    isUpdatingChapter,
    deleteChapter,
    isDeletingChapter,
    uploadChapterPdf,
    isUploadingPdf,
  } = useChapters();

  const { manga, isLoadingManga } = useMangas();

  // Yuklash holatlari
  const isLoading = isLoadingChapters || isCreatingChapter || isUploadingPdf || isCreatingWithPdf;

  const filteredChapters = Array.isArray(chapters) ? chapters.filter((chapter: any) => {
    const matchesSearch = !searchText || 
      chapter.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      chapter.manga_title?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesManga = !selectedManga || chapter.manga === selectedManga;
    const matchesAccessType = !selectedAccessType || chapter.access_type === selectedAccessType;

    return matchesSearch && matchesManga && matchesAccessType;
  }) : [];

  const stats = {
    total: chapters?.length || 0,
    free: chapters?.filter((c: any) => c.access_type === 'free')?.length || 0,
    paid: chapters?.filter((c: any) => c.access_type === 'paid')?.length || 0,
    threeDaysPaid: chapters?.filter((c: any) => c.access_type === '3_days_paid')?.length || 0,
    withPdf: chapters?.filter((c: any) => c.pdf_file)?.length || 0,
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedManga(undefined);
    setSelectedAccessType("");
  };

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <Badge count={id} style={{ backgroundColor: '#ff9900' }} />
      ),
    },
    {
      title: 'Manga',
      dataIndex: 'manga_title',
      key: 'manga_title',
      render: (mangaTitle: string, record: any) => {
        const mangaItem = manga?.find((m: any) => m.id === record.manga);
        return (
          <Text className="text-white font-medium">{mangaItem?.title || mangaTitle || 'Noma\'lum'}</Text>
        );
      },
    },
    {
      title: 'Bob nomi',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Text className="text-gray-300">{title || 'Nom berilmagan'}</Text>
      ),
    },
    {
      title: 'PDF fayl',
      dataIndex: 'pdf_file',
      key: 'pdf_file',
      render: (pdfFile: string, record: any) => (
        <div className="flex items-center">
          {isUploadingPdfToChapter === record.id ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#ff9900]"></div>
              <Tag color="orange">Yuklanmoqda...</Tag>
            </div>
          ) : pdfFile ? (
            <div className="flex items-center space-x-2">
              <FilePdfOutlined className="text-red-500" />
              <Tag color="green">Yuklangan</Tag>
              <Button
                type="text"
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfFile;
                  link.download = `chapter-${Date.now()}.pdf`;
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  setTimeout(() => {
                    safeRemoveChild(document.body, link);
                  }, 100);
                }}
                className="text-blue-500 hover:text-blue-400"
                title="Yuklab olish"
              />
              <Button
                type="text"
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => {
                  if (pdfFile && pdfFile.trim() !== '') {
                    setSelectedPdfUrl(pdfFile);
                    setIsPdfViewerOpen(true);
                  } else {
                    showToast('PDF fayl URL topilmadi', 'error');
                  }
                }}
                className="text-green-500 hover:text-green-400"
                title="Ko'rish"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CloseCircleOutlined className="text-red-500" />
              <Tag color="red">Yuklanmagan</Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kirish turi',
      dataIndex: 'access_type',
      key: 'access_type',
      render: (accessType: string, record: any) => (
        <div className="flex items-center space-x-2">
          <Tag 
            color={accessType === 'free' ? 'green' : accessType === '3_days_paid' ? 'blue' : 'orange'}
            icon={accessType === 'free' ? <GiftOutlined /> : <DollarOutlined />}
          >
            {accessType === 'free' ? 'Bepul' : accessType === '3_days_paid' ? '3 kunlik pullik' : 'Pullik'}
          </Tag>
          {(accessType === 'paid' || accessType === '3_days_paid') && record.price && (
            <Text className="text-yellow-500 font-medium">
              {record.price} so'm
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditChapter(record)}
            className="text-blue-500 hover:text-blue-400"
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            onClick={() => handlePdfUpload(record)}
            loading={isUploadingPdfToChapter === record.id}
            disabled={isUploadingPdfToChapter === record.id}
            className="text-green-500 hover:text-green-400"
            title={isUploadingPdfToChapter === record.id ? "PDF yuklanmoqda..." : "PDF qo'shish"}
          />
          <Popconfirm
            title="Bobni o'chirish"
            description="Haqiqatan ham bu bobni o'chirmoqchimisiz?"
            onConfirm={() => handleDeleteChapter(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-500 hover:text-red-400"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handlePdfUpload = (chapter: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setIsUploadingPdfToChapter(chapter.id);
          showToast(`PDF yuklanmoqda: ${file.name}`, 'success');
          
          if (file.size > 10 * 1024 * 1024) {
            showToast('PDF fayl hajmi 10MB dan katta bo\'lishi mumkin emas', 'error');
            setIsUploadingPdfToChapter(null);
            return;
          }
          
          const uploadResult = await uploadChapterPdf({ chapterId: chapter.id, file });
          
          setTimeout(async () => {
            await refetchChapters();
          }, 5000);
          showToast(`PDF muvaffaqiyatli yuklandi: ${file.name}`, 'success');
        } catch (error: any) {
          const errorMessage = error?.response?.data?.detail || 
                              error?.response?.data?.message || 
                              error?.response?.data?.error || 
                              'PDF yuklashda xatolik yuz berdi';
          showToast(`PDF yuklashda xatolik: ${errorMessage}`, 'error');
        } finally {
          setIsUploadingPdfToChapter(null);
        }
      }
    };
    input.click();
  };

  const handleDeleteChapter = async (id: number) => {
    try {
      await deleteChapter(id);
      refetchChapters();
      showToast('Bob muvaffaqiyatli o\'chirildi!', 'success');
    } catch (error: any) {
      showToast("Bobni o'chirishda xatolik yuz berdi", 'error');
    }
  };

  const handleEditChapter = (chapter: any) => {
    setSelectedChapter(chapter);
    form.setFieldsValue({
      title: chapter.title,
      access_type: chapter.access_type,
      price: chapter.price ? parseFloat(chapter.price) : undefined,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateChapter = async (values: any) => {
    try {
      const chapterData: ChapterCreate = {
        manga: values.manga,
        title: values.title,
        access_type: values.access_type,
        price: (values.access_type === 'paid' || values.access_type === '3_days_paid') ? values.price?.toString() : undefined,
      };

      if (pdfFile) {
        try {
          setIsCreatingWithPdf(true);
          
          const formData = new FormData();
          formData.append('manga', chapterData.manga.toString());
          formData.append('title', chapterData.title);
          formData.append('access_type', chapterData.access_type);
          if (chapterData.price) {
            formData.append('price', chapterData.price);
          }
          formData.append('pdf_file', pdfFile);
          
          const response = await adminService.createChapterWithPdf(formData);
          showToast('Bob va PDF muvaffaqiyatli yaratildi!', 'success');
        } catch (error) {
          console.log(error, 5)

          showToast('Bob yaratishda xatolik yuz berdi', 'error');
          return;
        } finally {
          setIsCreatingWithPdf(false);
        }
      } else {
        const newChapter = await createChapter(chapterData);
        showToast('Bob muvaffaqiyatli yaratildi!', 'success');
      }
      
      setIsCreateModalOpen(false);
      form.resetFields();
      setPdfFile(null);
      
      setTimeout(async () => {
        await refetchChapters();
      }, 100000);
    } catch (error: any) {
      console.log(error, 4)
      showToast('Bob yaratishda xatolik yuz berdi', 'error');
    }
  };

  const handleUpdateChapter = async (values: any) => {
    if (!selectedChapter) return;

    try {
      const chapterData: Partial<ChapterCreate> = {
        title: values.title,
        access_type: values.access_type,
        price: (values.access_type === 'paid' || values.access_type === '3_days_paid') ? values.price?.toString() : undefined,
      };

      await updateChapter({ id: selectedChapter.id, data: chapterData });
      
      // Agar yangi PDF fayl yuklangan bo'lsa
      if (editPdfFile) {
        try {
          setIsUploadingPdfToChapter(selectedChapter.id);
          await uploadChapterPdf({ chapterId: selectedChapter.id, file: editPdfFile });
          showToast('PDF fayl muvaffaqiyatli yangilandi!', 'success');
        } catch (error: any) {
          showToast('PDF fayl yangilashda xatolik yuz berdi', 'error');
        } finally {
          setIsUploadingPdfToChapter(null);
        }
      }

      setIsEditModalOpen(false);
      form.resetFields();
      setEditPdfFile(null);
      
      setTimeout(async () => {
        await refetchChapters();
      }, 1000);
      
      showToast('Bob muvaffaqiyatli yangilandi!', 'success');
    } catch (error: any) {
      showToast('Bobni yangilashda xatolik yuz berdi', 'error');
    }
  };

  // Asosiy loading holati
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6">
      {/* Elegant Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff9900] via-[#ff6600] to-[#ff4400] rounded-2xl flex items-center justify-center shadow-2xl">
                <FileTextOutlined className="text-white text-2xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <Title level={1} className="text-white mb-1 font-bold">
                Boblar 1
              </Title>
              <Text className="text-gray-400 text-lg">
                Manga boblari va PDF fayllarini professional boshqarish
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-[#ff9900] to-[#ff6600] border-none hover:from-[#ff6600] hover:to-[#ff4400] shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 text-white font-semibold"
            size="large"
            style={{ height: '48px', padding: '0 24px' }}
          >
            Yangi bob
          </Button>
        </div>
      </div>

      {/* Compact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Jami boblar</div>
              <div className="text-[#ff9900] text-4xl font-bold">{stats.total}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff9900] to-[#ff6600] rounded-xl flex items-center justify-center shadow-lg">
              <FileTextOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Bepul boblar</div>
              <div className="text-green-400 text-4xl font-bold">{stats.free}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <GiftOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Pullik boblar</div>
              <div className="text-yellow-400 text-4xl font-bold">{stats.paid}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">PDF yuklangan</div>
              <div className="text-red-400 text-4xl font-bold">{stats.withPdf}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <FilePdfOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Input
            prefix={<SearchOutlined className="text-[#ff9900] text-lg" />}
            placeholder="Bob nomi yoki manga bo'yicha qidirish..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="bg-[#1a1a1a] border-[#333] text-white hover:border-[#ff9900] focus:border-[#ff9900] rounded-xl text-lg"
            size="large"
            style={{ height: '56px' }}
          />
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="text-gray-500 text-sm">
              {filteredChapters.length} ta bob
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Select
            placeholder="Manga tanlash"
            value={selectedManga}
            onChange={setSelectedManga}
            allowClear
            loading={isLoadingManga}
            className="min-w-[200px]"
            showSearch
            size="large"
          >
            {manga?.map((mangaItem: any) => (
              <Option key={mangaItem.id} value={mangaItem.id}>
                {mangaItem.title}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Kirish turi"
            value={selectedAccessType}
            onChange={setSelectedAccessType}
            allowClear
            className="min-w-[150px]"
            size="large"
          >
            <Option value="free">Bepul</Option>
            <Option value="paid">Pullik</Option>
            <Option value="3_days_paid">3 kunlik pullik</Option>
          </Select>
          <Button
            icon={<FilterOutlined />}
            onClick={clearFilters}
            className="bg-gradient-to-r from-gray-600 to-gray-700 border-none hover:from-gray-500 hover:to-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="large"
          >
            Tozalash
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetchChapters()}
            loading={isLoadingChapters}
            className="bg-gradient-to-r from-[#ff9900] to-[#ff6600] border-none hover:from-[#ff6600] hover:to-[#ff4400] text-white shadow-lg hover:shadow-xl transition-all duration-300"
            size="large"
          >
            Yangilash
          </Button>
        </div>
      </div>

      {/* Elegant Table */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl border border-[#333] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-[#333]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-full"></div>
              <Title level={4} className="text-white mb-0">
                Boblar ro'yxati
              </Title>
            </div>
            <div className="text-gray-400 text-sm">
              {filteredChapters.length} ta bob topildi
            </div>
          </div>
        </div>
        <div className="p-6">
          {chaptersError ? (
            <Alert
              message="Xatolik"
              description="Boblarni yuklashda xatolik yuz berdi"
              type="error"
              showIcon
            />
          ) : (
            <Table
              rowKey="id"
              loading={isLoadingChapters}
              columns={columns}
              dataSource={filteredChapters}
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bob`,
                className: "custom-pagination"
              }}
              className="elegant-table"
              rowClassName="hover:bg-[#2a2a2a] transition-colors duration-200"
            />
          )}
        </div>
      </div>

      {/* Create Chapter Modal */}
      <Modal
        title="Yangi bob qo'shish"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setPdfFile(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateChapter}
        >
          <Form.Item
            name="manga"
            label="Manga"
            rules={[{ required: true, message: 'Manga tanlang!' }]}
          >
            <Select
              placeholder="Manga tanlang"
              loading={isLoadingManga}
              showSearch
            >
              {manga?.map((mangaItem: any) => (
                <Option key={mangaItem.id} value={mangaItem.id}>
                  {mangaItem.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="title"
            label="Bob nomi"
            rules={[{ required: true, message: 'Bob nomini kiriting!' }]}
          >
            <Input placeholder="Bob nomi" />
          </Form.Item>
          <Form.Item
            name="access_type"
            label="Kirish turi"
            rules={[{ required: true, message: 'Kirish turini tanlang!' }]}
          >
            <Select placeholder="Kirish turi">
              <Option value="free">Bepul</Option>
              <Option value="paid">Pullik</Option>
              <Option value="3_days_paid">3 kunlik pullik</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              const prev = prevValues?.access_type;
              const curr = currentValues?.access_type;
              return prev !== curr;
            }}
          >
            {({ getFieldValue }) => {
              const accessType = getFieldValue('access_type');
              if (accessType === 'paid' || accessType === '3_days_paid') {
                return (
                  <Form.Item
                    name="price"
                    label="Narx (so'm)"
                    rules={[{ required: true, message: "Iltimos, narxni kiriting" }]}
                  >
                    <Input placeholder="Narx (so'm)" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          
          <Form.Item label="PDF fayl">
            <div className="space-y-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPdfFile(file);
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
              />
              {pdfFile && (
                <div className="flex items-center space-x-2 text-green-600">
                  <FilePdfOutlined />
                  <span className="text-sm">{pdfFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Xoxlagan hajmdagi PDF faylni yuklashingiz mumkin
              </p>
            </div>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingChapter || isUploadingPdf || isCreatingWithPdf}
                className="bg-[#ff9900] border-[#ff9900] hover:bg-[#ff6600] hover:border-[#ff6600]"
              >
                {isCreatingChapter || isUploadingPdf || isCreatingWithPdf ? 'Yaratilmoqda...' : 'Yaratish'}
              </Button>
              <Button onClick={() => {
                setIsCreateModalOpen(false);
                setPdfFile(null);
              }}>
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Chapter Modal */}
      <Modal
        title="Bobni tahrirlash"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditPdfFile(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateChapter}
        >
          <Form.Item
            name="title"
            label="Bob nomi"
            rules={[{ required: true, message: 'Bob nomini kiriting!' }]}
          >
            <Input placeholder="Bob nomi" />
          </Form.Item>
          <Form.Item
            name="access_type"
            label="Kirish turi"
            rules={[{ required: true, message: 'Kirish turini tanlang!' }]}
          >
            <Select placeholder="Kirish turi">
              <Option value="free">Bepul</Option>
              <Option value="paid">Pullik</Option>
              <Option value="3_days_paid">3 kunlik pullik</Option>
            </Select>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => {
              const prev = prevValues?.access_type;
              const curr = currentValues?.access_type;
              return prev !== curr;
            }}
          >
            {({ getFieldValue }) => {
              const accessType = getFieldValue('access_type');
              if (accessType === 'paid' || accessType === '3_days_paid') {
                return (
                  <Form.Item
                    name="price"
                    label="Narx (so'm)"
                    rules={[{ required: true, message: "Iltimos, narxni kiriting" }]}
                  >
                    <Input placeholder="Narx (so'm)" />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>
          
          {/* PDF fayl yuklash qismi */}
          <Form.Item label="PDF fayl">
            <div className="space-y-3">
              {selectedChapter?.pdf_file && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
                  <FilePdfOutlined className="text-green-600" />
                  <span className="text-sm text-green-700">PDF fayl mavjud</span>
                  
                </div>
              )}
              
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditPdfFile(file);
                    }
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-black"
                />
                {editPdfFile && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <FilePdfOutlined />
                    <span className="text-sm">{editPdfFile.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(editPdfFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                Yangi PDF fayl yuklasangiz, avvalgisi almashtiriladi
              </p>
            </div>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingChapter || isUploadingPdfToChapter === selectedChapter?.id}
                className="bg-[#ff9900] border-[#ff9900] hover:bg-[#ff6600] hover:border-[#ff6600]"
              >
                {isUpdatingChapter || isUploadingPdfToChapter === selectedChapter?.id ? 'Yangilanmoqda...' : 'Yangilash'}
              </Button>
              <Button onClick={() => {
                setIsEditModalOpen(false);
                setEditPdfFile(null);
              }}>
                Bekor qilish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => {
          setIsPdfViewerOpen(false);
          setSelectedPdfUrl("");
        }}
        pdfUrl={selectedPdfUrl}
        title="PDF Ko'rish"
      />
    </div>
  );
}