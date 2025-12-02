"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Upload,
  Image,
  Tag,
  Popconfirm,
  message,
  Row,
  Col,
  Statistic,
  Divider,
  Tabs,
  List,
  Avatar,
  Typography,
  Alert,
  Spin,
  Rate,
  DatePicker,
  InputNumber,
  Tooltip,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  BookOutlined,
  FileTextOutlined,
  StarOutlined,
  CalendarOutlined,
  UserOutlined,
  TagsOutlined,
  PictureOutlined,
  FilePdfOutlined,
  DollarOutlined,
  GiftOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useMangas } from "@/hooks/admin/useMangas";
import { useCategories } from "@/hooks/admin/useCategories";
import { useGenres } from "@/hooks/admin/useGenres";
import { useAuthors } from "@/hooks/admin/useAuthors";
import { useAges } from "@/hooks/admin/useAges";
import { useChapters } from "@/hooks/admin/useChapters";
import { getMangaBySlug } from "@/lib/api/mangaService";
import type { ColumnsType } from "antd/es/table";
import type { MangaList, MangaCreate, MangaUpdate, ChapterCreate } from "@/lib/api/types";
import { showToast } from "@/lib/utils/toast";

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

export default function AdminMangaPage() {
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [selectedGenre, setSelectedGenre] = useState<number>();
  const [selectedAuthor, setSelectedAuthor] = useState<number>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedManga, setSelectedManga] = useState<MangaList | null>(null);
  const [form] = Form.useForm();
  const [chapterForm] = Form.useForm();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isCreateAuthorModalOpen, setIsCreateAuthorModalOpen] = useState(false);
  const [isCreateGenreModalOpen, setIsCreateGenreModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newGenreName, setNewGenreName] = useState("");

  const {
    manga,
    isLoadingManga,
    mangaError,
    refetchManga,
    createManga,
    isCreatingManga,
    updateManga,
    isUpdatingManga,
    deleteManga,
    isDeletingManga,
    getMangaDetail,
    getMangaChapters,
    createChapter,
    isCreatingChapter,
    updateChapter,
    isUpdatingChapter,
    deleteChapter,
    isDeletingChapter,

  } = useMangas();

  const { 
    categories, 
    isLoadingCategories, 
    createCategory, 
    isCreatingCategory 
  } = useCategories();
  const { 
    genres, 
    isLoadingGenres, 
    createGenre, 
    isCreatingGenre 
  } = useGenres();
  const { 
    authors, 
    isLoadingAuthors, 
    createAuthor, 
    isCreatingAuthor 
  } = useAuthors();
  const { 
    ages, 
    isLoadingAges, 
    createAge, 
    isCreatingAge 
  } = useAges();
  const { chapters: allChapters, isLoadingChapters } = useChapters();

  
  const mangaDetailQuery = getMangaDetail(selectedManga?.slug || '');
  const mangaChaptersQuery = getMangaChapters(selectedManga?.slug || '');

  const mangaDetail = mangaDetailQuery?.data;
  const mangaChapters = mangaChaptersQuery?.data || [];

  const filteredManga = Array.isArray(manga) ? manga.filter((item) => {
    const matchesSearch = !searchText || 
      item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.author?.name?.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesCategory = !selectedCategory || item.category?.id === selectedCategory;
    const matchesGenre = !selectedGenre || item.genres?.some(g => g.id === selectedGenre);
    const matchesAuthor = !selectedAuthor || item.author?.id === selectedAuthor;

    return matchesSearch && matchesStatus && matchesCategory && matchesGenre && matchesAuthor;
  }) : [];

  interface MangaStats {
    total: number;
    ongoing: number;
    completed: number;
    hiatus: number;
    frozen: number;
    avgRating: string;
  }
  interface Category {
      id: number;
      name: string;
    }

    interface Author {
      id: number;
      name: string;
    }

    interface Genre {
      id: number;
      name: string;
    }

    interface Age {
      id: number;
      name: string;
    }

  const stats: MangaStats = {
    total: manga?.length || 0,
    ongoing: manga?.filter((m: MangaList) => m.status === 'ongoing')?.length || 0,
    completed: manga?.filter((m: MangaList) => m.status === 'completed')?.length || 0,
    hiatus: manga?.filter((m: MangaList) => m.status === 'hiatus')?.length || 0,
    frozen: manga?.filter((m: MangaList) => m.status === 'frozen')?.length || 0,
    avgRating: manga?.length > 0
      ? (manga.reduce((sum: number, m: MangaList) => sum + (m.rating || 0), 0) / manga.length).toFixed(1)
      : '0',
  };

  const columns: ColumnsType<MangaList> = [
    {
      title: 'Rasm',
      dataIndex: 'cover',
      key: 'cover',
      width: 80,
      render: (cover: string, record) => (
        <Avatar
          size={50}
          shape="square"
          src={cover}
          icon={<BookOutlined />}
          style={{ backgroundColor: '#ff9900' }}
        />
      ),
    },
    {
      title: 'Nomi',
      dataIndex: 'title',
      key: 'manga_title',
      render: (title: string, record) => (
        <div>
          <div className="font-medium text-white">{title}</div>
          <div className="text-sm text-gray-400">#{record.id}</div>
        </div>
      ),
    },
    {
      title: 'Tarjimon',
      dataIndex: 'author',
      key: 'author',
      render: (author: any) => (
        <Text className="text-white">{author?.name || 'Noma\'lum'}</Text>
      ),
    },
    {
      title: 'Kategoriya',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => (
        <Tag color="blue">{category?.name}</Tag>
      ),
    },
    {
      title: 'Janrlar',
      dataIndex: 'genres',
      key: 'genres',
      render: (genres: any[]) => (
        <div className="flex flex-wrap gap-1">
          {genres?.slice(0, 2).map((genre) => (
            <Tag key={genre.id} color="purple">
              {genre.name}
            </Tag>
          ))}
          {genres?.length > 2 && (
            <Tag>+{genres.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          ongoing: { color: 'green', text: 'Davom etmoqda' },
          completed: { color: 'blue', text: 'Tugallangan' },
          hiatus: { color: 'orange', text: 'To\'xtatilgan' },
          frozen: { color: 'red', text: 'Muzlatilgan' }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Yil',
      dataIndex: 'year',
      key: 'year',
      render: (year: number) => (
        <Text className="text-white">{year}</Text>
      ),
    },
    {
      title: 'Reyting',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="flex items-center">
          <StarOutlined className="text-yellow-500 mr-1" />
          <Text className="text-white">{rating?.toFixed(1) || '0.0'}</Text>
        </div>
      ),
    },
    {
      title: 'Ko\'rishlar',
      dataIndex: 'views',
      key: 'views',
      render: (views: number) => (
        <Text className="text-white">{views?.toLocaleString() || '0'}</Text>
      ),
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleViewManga(record)}
            className="text-blue-500 hover:text-blue-400"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditManga(record)}
            className="text-green-500 hover:text-green-400"
          />
          <Popconfirm
            title="Mangani o'chirish"
            description="Haqiqatan ham bu mangani o'chirmoqchimisiz?"
            onConfirm={() => handleDeleteManga(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              loading={isDeletingManga}
              className="text-red-500 hover:text-red-400"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleDeleteChapter = async (id: number) => {
    try {
      await deleteChapter(id);
      if (mangaChaptersQuery) {
        mangaChaptersQuery.refetch();
      }
      showToast('Bob muvaffaqiyatli o\'chirildi!', 'success');
    } catch (error: any) {
      showToast('Bobni o\'chirishda xatolik yuz berdi', 'error');
    }
  };

  const handleViewManga = (manga: MangaList) => {
    setSelectedManga(manga);
    setIsViewModalOpen(true);
  };

  const handleEditManga = async (manga: MangaList) => {
    try {
      // To'liq manga ma'lumotlarini olish
      const fullMangaData = await getMangaBySlug(manga.slug);
      
      setSelectedManga(fullMangaData);
      form.setFieldsValue({
        title: fullMangaData.title,
        slug: fullMangaData.slug,
        title_uz: fullMangaData.title_uz || '',
        title_en: fullMangaData.title_en || '',
        description: fullMangaData.description || '',
        category: (fullMangaData.category as Category)?.id,
        author: (fullMangaData.author as Author)?.id,
        genres: (fullMangaData.genres as Genre[])?.map((g: Genre) => g.id),
        age: (fullMangaData.age as Age)?.id,
        year: fullMangaData.year,
        status: fullMangaData.status,
      });

    
      setIsEditModalOpen(true);
    } catch (error) {
      // Fallback to original manga data
      setSelectedManga(manga);
      form.setFieldsValue({
        title: manga.title,
        slug: manga.slug,
        title_uz: manga.title_uz || '',
        title_en: manga.title_en || '',
        description: manga.description || '',
        category: manga.category?.id,
        author: manga.author?.id,
        genres: manga.genres?.map(g => g.id),
        age: manga.age?.id,
        year: manga.year,
        status: manga.status,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteManga = async (id: number) => {
    try {
      await deleteManga(id);
      refetchManga();
    } catch (error: any) {
      showToast('Mangani o\'chirishda xatolik yuz berdi', 'error');
    }
  };

  const handleCreateManga = async (values: any) => {
    try {
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'genres' && Array.isArray(values[key])) {
            values[key].forEach((genreId: number) => {
              formData.append('genres', genreId.toString());
            });
          } else if (key === 'slug' && values[key]) {
            formData.append(key, values[key]);
          } else if (key !== 'slug') {
            formData.append(key, values[key]);
          }
        }
      });

      if (coverFile) {
        formData.append('cover', coverFile);
      }

      if (backgroundFile) {
        formData.append('background', backgroundFile);
      }

      await createManga(formData as any);
      setIsCreateModalOpen(false);
      form.resetFields();
      setCoverFile(null);
      setBackgroundFile(null);
      refetchManga();
      showToast('Manga muvaffaqiyatli yaratildi!', 'success');
    } catch (error: any) {
      showToast('Manga yaratishda xatolik yuz berdi', 'error');
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      showToast("Kategoriya nomini kiriting!", "error");
      return;
    }
    try {
      await createCategory({ name: newCategoryName.trim() });
      setNewCategoryName("");
      setIsCreateCategoryModalOpen(false);
    } catch (error) {
      // Silent fail
    }
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) {
      showToast("Tarjimon nomini kiriting!", "error");
      return;
    }
    try {
      await createAuthor({ name: newAuthorName.trim() });
      setNewAuthorName("");
      setIsCreateAuthorModalOpen(false);
    } catch (error) {
      // Silent fail
    }
  };

  const handleCreateGenre = async () => {
    if (!newGenreName.trim()) {
      showToast("Janr nomini kiriting!", "error");
      return;
    }
    try {
      await createGenre({ name: newGenreName.trim() });
      setNewGenreName("");
      setIsCreateGenreModalOpen(false);
    } catch (error) {
      // Silent fail
    }
  };

  const handleUpdateManga = async (values: any) => {
    if (!selectedManga) return;

    try {
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'genres' && Array.isArray(values[key])) {
            values[key].forEach((genreId: number) => {
              formData.append('genres', genreId.toString());
            });
          } else {
            formData.append(key, values[key]);
          }
        }
      });

      if (coverFile) {
        formData.append('cover', coverFile);
      }

      if (backgroundFile) {
        formData.append('background', backgroundFile);
      }

      await updateManga({ slug: selectedManga.slug, data: formData as any });
      setIsEditModalOpen(false);
      form.resetFields();
      setCoverFile(null);
      setBackgroundFile(null);
      refetchManga();
      showToast('Manga muvaffaqiyatli yangilandi!', 'success');
    } catch (error: any) {
      showToast('Mangani yangilashda xatolik yuz berdi', 'error');
    }
  };

  const handleCreateChapter = async (values: any) => {
    if (!selectedManga) return;

    try {
      const chapterData: ChapterCreate = {
        manga: selectedManga.id,
        title: values.title,
        access_type: values.access_type,
        price: (values.access_type === 'paid' || values.access_type === '3_days_paid') ? values.price?.toString() : undefined,
      };

      await createChapter(chapterData);
      chapterForm.resetFields();
      if (mangaChaptersQuery) {
        mangaChaptersQuery.refetch();
      }
      showToast('Bob muvaffaqiyatli yaratildi!', 'success');
    } catch (error: any) {
      console.log(error, 3)
      showToast('Bob yaratishda xatolik yuz berdi', 'error');

    }
  };

  const handleChapterPdfUpload = (chapter: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('pdf_file', file);
          
          await updateChapter({ id: chapter.id, data: formData });
          
          if (mangaChaptersQuery) {
            mangaChaptersQuery.refetch();
          }
          showToast('PDF muvaffaqiyatli yuklandi!', 'success');
        } catch (error) {
          // Silent fail
          showToast('PDF yuklashda xatolik yuz berdi', 'error');
        }
      }
    };
    input.click();
  };

  const handleEditChapter = (chapter: any) => {
    chapterForm.setFieldsValue({
      title: chapter.title,
      access_type: chapter.access_type,
      price: chapter.price ? parseFloat(chapter.price) : undefined,
    });
    
    Modal.confirm({
      title: 'Bobni tahrirlash',
      content: (
        <Form
          form={chapterForm}
          layout="vertical"
          className="mt-4"
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
            shouldUpdate={(prevValues, currentValues) => 
              prevValues?.access_type !== currentValues?.access_type
            }
          >
            {({ getFieldValue }) => {
              const accessType = getFieldValue('access_type');
              return (accessType === 'paid' || accessType === '3_days_paid') ? (
                <Form.Item
                  name="price"
                  label="Narx (so'm)"
                  rules={[{ required: true, message: "Iltimos, narxni kiriting" }]}
                >
                  <InputNumber
                    placeholder="Narx (so'm)"
                    min={0}
                    className="w-full"
                    addonAfter="so'm"
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        try {
          const values = await chapterForm.validateFields();
          const updateData = {
            title: values.title,
            access_type: values.access_type,
            price: (values.access_type === 'paid' || values.access_type === '3_days_paid') ? values.price?.toString() : undefined,
          };
          
          await updateChapter({ id: chapter.id, data: updateData });
          
          if (mangaChaptersQuery) {
            mangaChaptersQuery.refetch();
          }
          showToast('Bob muvaffaqiyatli yangilandi!', 'success');
        } catch (error) {
          showToast('Bobni yangilashda xatolik yuz berdi', 'error');
        }
      },
      okText: 'Saqlash',
      cancelText: 'Bekor qilish',
    });
  };

  const clearFilters = () => {
    setSearchText("");
    setSelectedStatus("");
    setSelectedCategory(undefined);
    setSelectedGenre(undefined);
    setSelectedAuthor(undefined);
  };

  const handleCoverUpload = (file: File) => {
    setCoverFile(file);
    return false; // Prevent automatic upload
  };

  const handleBackgroundUpload = (file: File) => {
    setBackgroundFile(file);
    return false; // Prevent automatic upload
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] p-6">
      {/* Elegant Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff9900] via-[#ff6600] to-[#ff4400] rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOutlined className="text-white text-2xl" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <Title level={1} className="text-white mb-1 font-bold">
                Manga
              </Title>
              <Text className="text-gray-400 text-lg">
                Barcha mangalarni professional boshqarish
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
            + Yangi manga
          </Button>
        </div>
      </div>

      {/* Compact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Jami manga</div>
              <div className="text-[#ff9900] text-4xl font-bold">{stats.total}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-[#ff9900] to-[#ff6600] rounded-xl flex items-center justify-center shadow-lg">
              <BookOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Davom etayotgan</div>
              <div className="text-green-400 text-4xl font-bold">{stats.ongoing}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">Tugagan</div>
              <div className="text-blue-400 text-4xl font-bold">{stats.completed}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircleOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-2xl p-6 border border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm font-medium mb-1">O'rtacha reyting</div>
              <div className="text-yellow-400 text-4xl font-bold">{stats.avgRating}</div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <StarOutlined className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search and Filters */}
      <Card 
        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300"
        bodyStyle={{ padding: '24px' }}
      >
        <div className="mb-4">
          <Title level={4} className="text-white mb-2 flex items-center">
            <FilterOutlined className="mr-2 text-[#ff9900]" />
            Qidiruv va filtrlar
          </Title>
        </div>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <div className="relative">
              <Input
                prefix={<SearchOutlined className="text-[#ff9900]" />}
                placeholder="Manga nomi yoki muallif bo'yicha qidirish..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="bg-[#0a0a0a] border-[#333] text-white hover:border-[#ff9900] focus:border-[#ff9900] rounded-lg"
                size="large"
              />
            </div>
          </Col>
          <Col xs={24} sm={3}>
            <Select
              placeholder="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              allowClear
              className="w-full"
              size="large"
            >
              <Option value="ongoing">🟢 Davom etmoqda</Option>
              <Option value="completed">🔵 Tugallangan</Option>
              <Option value="hiatus">🟠 To'xtatilgan</Option>
              <Option value="frozen">🔴 Muzlatilgan</Option>
            </Select>
          </Col>
          <Col xs={24} sm={3}>
            <Select
              placeholder="Kategoriya"
              value={selectedCategory}
              onChange={setSelectedCategory}
              allowClear
              loading={isLoadingCategories}
              className="w-full"
              size="large"
            >
              {categories?.map((category: { id: number; name: string }) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={3}>
            <Select
              placeholder="Janr"
              value={selectedGenre}
              onChange={setSelectedGenre}
              allowClear
              loading={isLoadingGenres}
              className="w-full"
              size="large"
            >
                {genres?.map((genre: { id: number; name: string }) => (
                <Option key={genre.id} value={genre.id}>
                  {genre.name}
                </Option>
                ))}
            </Select>
          </Col>
          <Col xs={24} sm={5}>
            <Space className="w-full">
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
                className="bg-[#2a2a2a] border-[#333] text-white hover:bg-[#333] hover:border-[#ff9900] rounded-lg"
                size="large"
              >
                Tozalash
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetchManga()}
                loading={isLoadingManga}
                className="bg-[#ff9900] border-[#ff9900] text-white hover:bg-[#ff6600] rounded-lg"
                size="large"
              >
                Yangilash
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
        {mangaError ? (
          <Alert
            message="Ma'lumotlarni yuklashda xatolik"
            description={mangaError?.message || 'Noma\'lum xatolik yuz berdi'}
            type="error"
            showIcon
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredManga}
            rowKey="id"
            loading={isLoadingManga}
            pagination={{
              total: filteredManga.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ta manga`,
            }}
            className="manga-table"
            scroll={{ x: 1200 }}
          />
        )}
      </Card>

      {/* Create Manga Modal */}
      <Modal
        title="Yangi manga qo'shish"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
          setCoverFile(null);
          setBackgroundFile(null);
        }}
        footer={null}
        width={800}
        className="manga-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateManga}
          className="space-y-4"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
          <Form.Item
            name="title"
                label={<span className="text-white">Manga nomi</span>}
                rules={[{ required: true, message: 'Manga nomini kiriting!' }]}
          >
                <Input className="bg-[#0a0a0a] border-[#2a2a2a] text-white" />
          </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="slug"
                label={<span className="text-white">Slug (ixtiyoriy)</span>}
                help="Agar kiritmasangiz, avtomatik yaratiladi"
              >
                <Input 
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
                  placeholder="Avtomatik yaratiladi"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Tarjima maydonlari - MAJBURIY */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <div className="text-orange-400 text-sm mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Tarjima maydonlari (MAJBURIY - Backend talab qiladi)
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title_uz"
                label={<span className="text-white">Manga nomi (O'zbekcha) *</span>}
                rules={[{ required: true, message: 'O\'zbekcha nomni kiriting!' }]}
              >
                <Input 
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
                  placeholder="O'zbekcha nomni kiriting"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title_en"
                label={<span className="text-white">Manga nomi (Inglizcha) *</span>}
                rules={[{ required: true, message: 'Inglizcha nomni kiriting!' }]}
              >
                <Input 
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
                  placeholder="Inglizcha nomni kiriting"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="category"
                label={<span className="text-white">Kategoriya</span>}
                rules={[{ required: true, message: 'Kategoriyani tanlang!' }]}
              >
                <Select
                  className="w-full"
                  loading={isLoadingCategories}
                  placeholder="Kategoriyani tanlang"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ padding: '0 8px 4px' }}>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setIsCreateCategoryModalOpen(true)}
                          style={{ width: '100%' }}
                          className="text-white hover:text-blue-400"
                        >
                          Yangi kategoriya qo'shish
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {categories?.map((category: Category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
          <Form.Item
            name="author"
                label={<span className="text-white">Tarjimon</span>}
                rules={[{ required: true, message: 'Tarjimonni tanlang!' }]}
          >
            <Select
                  className="w-full"
                  loading={isLoadingAuthors}
                  placeholder="Tarjimonni tanlang"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ padding: '0 8px 4px' }}>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setIsCreateAuthorModalOpen(true)}
                          style={{ width: '100%' }}
                          className="text-white hover:text-blue-400"
                        >
                          Yangi muallif qo'shish
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {authors?.map((author: Author) => (
                    <Option key={author.id} value={author.id}>
                      {author.name}
                    </Option>
                  ))}
                </Select>
          </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
          <Form.Item
            name="genres"
                label={<span className="text-white">Janrlar</span>}
                rules={[{ required: true, message: 'Janrlarni tanlang!' }]}
          >
            <Select
              mode="multiple"
                  className="w-full"
                  loading={isLoadingGenres}
                  placeholder="Janrlarni tanlang"
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <div style={{ padding: '0 8px 4px' }}>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => setIsCreateGenreModalOpen(true)}
                          style={{ width: '100%' }}
                          className="text-white hover:text-blue-400"
                        >
                          Yangi janr qo'shish
                        </Button>
                      </div>
                    </div>
                  )}
                >
                  {genres?.map((genre: Genre) => (
                    <Option key={genre.id} value={genre.id}>
                      {genre.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="age"
                label={<span className="text-white">Yosh chegarasi</span>}
                rules={[{ required: true, message: 'Yosh chegarasini tanlang!' }]}
              >
                <Select
                  className="w-full"
                  loading={isLoadingAges}
                  placeholder="Yosh chegarasini tanlang"
                >
                  {ages?.map((age) => (
                    <Option key={age.id} value={age.id}>
                      {age.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="year"
                label={<span className="text-white">Yil</span>}
                rules={[{ required: true, message: 'Yilni kiriting!' }]}
              >
                <InputNumber
                  min={1900}
                  max={new Date().getFullYear()}
                  className="w-full bg-[#0a0a0a] border-[#2a2a2a]"
            />
          </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label={<span className="text-white">Status</span>}
                rules={[{ required: true, message: 'Statusni tanlang!' }]}
              >
                <Select placeholder="Statusni tanlang">
                  <Option value="ongoing">Davom etmoqda</Option>
                  <Option value="completed">Tugallangan</Option>
                  <Option value="hiatus">To'xtatilgan</Option>
                  <Option value="frozen">Muzlatilgan</Option>
                </Select>
          </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="views"
                label={<span className="text-white">Ko'rishlar soni</span>}
              >
                <InputNumber
                  min={0}
                  className="w-full bg-[#0a0a0a] border-[#2a2a2a]"
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<span className="text-white">Ta'rif</span>}
            rules={[{ required: true, message: 'Ta\'rifni kiriting!' }]}
          >
            <TextArea
              rows={4}
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
              placeholder="Manga haqida ta'rif..."
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="text-white">Muqova rasmi</span>}>
                <Upload
                  beforeUpload={handleCoverUpload}
                  accept="image/*"
                  maxCount={1}
                  listType="picture-card"
                  className="cover-uploader"
                >
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Muqova</div>
                  </div>
                </Upload>
                {coverFile && (
                  <Text className="text-green-500 text-sm">
                    Fayl tanlandi: {coverFile.name}
                  </Text>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="text-white">Fon rasmi</span>}>
                <Upload
                  beforeUpload={handleBackgroundUpload}
                  accept="image/*"
                  maxCount={1}
                  listType="picture-card"
                  className="background-uploader"
                >
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Fon</div>
                  </div>
                </Upload>
                {backgroundFile && (
                  <Text className="text-green-500 text-sm">
                    Fayl tanlandi: {backgroundFile.name}
                  </Text>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 pt-4">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  form.resetFields();
                  setCoverFile(null);
                  setBackgroundFile(null);
                }}
                className="border-[#2a2a2a] text-white"
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreatingManga}
                className="bg-[#ff9900] border-[#ff9900]"
              >
                Yaratish
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Manga Modal */}
      <Modal
        title="Mangani tahrirlash"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          form.resetFields();
          setCoverFile(null);
          setBackgroundFile(null);
          setSelectedManga(null);
        }}
        footer={null}
        width={800}
        className="manga-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateManga}
          className="space-y-4"
        >
          {/* Same form fields as create modal */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title"
                label={<span className="text-white">Manga nomi</span>}
                rules={[{ required: true, message: 'Manga nomini kiriting!' }]}
              >
                <Input className="bg-[#0a0a0a] border-[#2a2a2a] text-white" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="slug"
                label={<span className="text-white">Slug</span>}
                rules={[{ required: true, message: 'Slug kiriting!' }]}
              >
                <Input className="bg-[#0a0a0a] border-[#2a2a2a] text-white" />
              </Form.Item>
            </Col>
          </Row>

          {/* Tarjima maydonlari - MAJBURIY */}
          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <div className="text-orange-400 text-sm mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Tarjima maydonlari (MAJBURIY - Backend talab qiladi)
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title_uz"
                label={<span className="text-white">Manga nomi (O'zbekcha) *</span>}
                rules={[{ required: true, message: 'O\'zbekcha nomni kiriting!' }]}
              >
                <Input 
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
                  placeholder="O'zbekcha nomni kiriting"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="title_en"
                label={<span className="text-white">Manga nomi (Inglizcha) *</span>}
                rules={[{ required: true, message: 'Inglizcha nomni kiriting!' }]}
              >
                <Input 
                  className="bg-[#0a0a0a] border-[#2a2a2a] text-white" 
                  placeholder="Inglizcha nomni kiriting"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="category"
                label={<span className="text-white">Kategoriya</span>}
                rules={[{ required: true, message: 'Kategoriyani tanlang!' }]}
              >
            <Select
                  className="w-full"
                  loading={isLoadingCategories}
                  placeholder="Kategoriyani tanlang"
                >
                  {categories?.map((category: Category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="author"
                label={<span className="text-white">Tarjimon</span>}
                rules={[{ required: true, message: 'Tarjimonni tanlang!' }]}
              >
                <Select
                  className="w-full"
                  loading={isLoadingAuthors}
                  placeholder="Tarjimonni tanlang"
                >
                  {authors?.map((author: Author) => (
                    <Option key={author.id} value={author.id}>
                      {author.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="genres"
                label={<span className="text-white">Janrlar</span>}
                rules={[{ required: true, message: 'Janrlarni tanlang!' }]}
              >
                <Select
                  mode="multiple"
                  className="w-full"
                  loading={isLoadingGenres}
                  placeholder="Janrlarni tanlang"
                >
                  {genres?.map((genre: Genre) => (
                    <Option key={genre.id} value={genre.id}>
                      {genre.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item
                name="age"
                label={<span className="text-white">Yosh chegarasi</span>}
                rules={[{ required: true, message: 'Yosh chegarasini tanlang!' }]}
              >
                <Select
                  className="w-full"
                  loading={isLoadingAges}
                  placeholder="Yosh chegarasini tanlang"
                >
                  {ages?.map((age) => (
                    <Option key={age.id} value={age.id}>
                      {age.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="year"
                label={<span className="text-white">Yil</span>}
                rules={[{ required: true, message: 'Yilni kiriting!' }]}
              >
                <InputNumber
                  min={1900}
                  max={new Date().getFullYear()}
                  className="w-full bg-[#0a0a0a] border-[#2a2a2a]"
            />
          </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="status"
                label={<span className="text-white">Status</span>}
                rules={[{ required: true, message: 'Statusni tanlang!' }]}
              >
                <Select placeholder="Statusni tanlang">
                  <Option value="ongoing">Davom etmoqda</Option>
                  <Option value="completed">Tugallangan</Option>
                  <Option value="hiatus">To'xtatilgan</Option>
                  <Option value="frozen">Muzlatilgan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                name="views"
                label={<span className="text-white">Ko'rishlar soni</span>}
              >
                <InputNumber
                  min={0}
                  className="w-full bg-[#0a0a0a] border-[#2a2a2a]"
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label={<span className="text-white">Ta'rif</span>}
            rules={[{ required: true, message: 'Ta\'rifni kiriting!' }]}
          >
            <Input
              className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
              placeholder="Manga haqida ta'rif..."
            />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="text-white">Muqova rasmi</span>}>
                {selectedManga?.cover && (
                  <div className="mb-2">
                    <Image
                      src={selectedManga.cover}
                      alt="Current cover"
                      width={100}
                      height={140}
                      className="object-cover rounded"
                    />
                    <Text className="text-gray-400 text-sm block">
                      Joriy muqova
                    </Text>
                  </div>
                )}
                <Upload
                  beforeUpload={handleCoverUpload}
                  accept="image/*"
                  maxCount={1}
                  listType="picture-card"
                >
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Yangi muqova</div>
                  </div>
            </Upload>
                {coverFile && (
                  <Text className="text-green-500 text-sm">
                    Yangi fayl: {coverFile.name}
                  </Text>
                )}
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label={<span className="text-white">Fon rasmi</span>}>
                <Upload
                  beforeUpload={handleBackgroundUpload}
                  accept="image/*"
                  maxCount={1}
                  listType="picture-card"
                >
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Yangi fon</div>
                  </div>
                </Upload>
                {backgroundFile && (
                  <Text className="text-green-500 text-sm">
                    Yangi fayl: {backgroundFile.name}
                  </Text>
                )}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0 pt-4">
            <Space className="w-full justify-end">
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  form.resetFields();
                  setCoverFile(null);
                  setBackgroundFile(null);
                  setSelectedManga(null);
                }}
                className="border-[#2a2a2a] text-white"
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingManga}
                className="bg-[#ff9900] border-[#ff9900]"
              >
                Yangilash
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Manga Modal */}
      <Modal
        title={selectedManga?.title}
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedManga(null);
        }}
        footer={null}
        width={1000}
        className="manga-view-modal"
      >
        {selectedManga && (
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Asosiy ma'lumotlar" key="info">
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <div className="text-center">
                    <Image
                      src={selectedManga.cover}
                      alt={selectedManga.title}
                      width={200}
                      height={280}
                      className="object-cover rounded-lg"
                      fallback="/images/manga-placeholder.jpg"
                    />
                  </div>
                </Col>
                <Col xs={24} sm={16}>
                  <div className="space-y-4">
                    <div>
                      <Title level={3} className="text-white mb-2">
                        {selectedManga.title}
                      </Title>
                      <div className="flex items-center space-x-4 mb-4">
                        <Tag color={
                          selectedManga.status === 'ongoing' ? 'green' :
                          selectedManga.status === 'completed' ? 'blue' :
                          selectedManga.status === 'hiatus' ? 'orange' :
                          selectedManga.status === 'frozen' ? 'red' : 'default'
                        }>
                          {selectedManga.status === 'ongoing' ? 'Davom etmoqda' :
                           selectedManga.status === 'completed' ? 'Tugallangan' :
                           selectedManga.status === 'hiatus' ? 'To\'xtatilgan' :
                           selectedManga.status === 'frozen' ? 'Muzlatilgan' : selectedManga.status}
                        </Tag>
                        <div className="flex items-center">
                          <StarOutlined className="text-yellow-500 mr-1" />
                          <Text className="text-white">
                            {selectedManga.rating?.toFixed(1) || '0.0'}
                          </Text>
                        </div>
                        <Text className="text-gray-400">
                          {selectedManga.views?.toLocaleString() || '0'} ko'rishlar
                        </Text>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Text className="text-gray-400">Tarjimon:</Text>
                        <div className="text-white">{selectedManga.author?.name}</div>
                      </div>
                      <div>
                        <Text className="text-gray-400">Kategoriya:</Text>
                        <div>
                          <Tag color="blue">{selectedManga.category?.name}</Tag>
                        </div>
                      </div>
                      <div>
                        <Text className="text-gray-400">Yil:</Text>
                        <div className="text-white">{selectedManga.year}</div>
                      </div>
                      <div>
                        <Text className="text-gray-400">Slug:</Text>
                        <div className="text-white font-mono text-sm">
                          {selectedManga.slug}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Text className="text-gray-400">Janrlar:</Text>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedManga.genres?.map((genre) => (
                          <Tag key={genre.id} color="purple">
                            {genre.name}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    {mangaDetail?.description && (
                      <div>
                        <Text className="text-gray-400">Ta'rif:</Text>
                        <div className="text-white mt-1">
                          {mangaDetail.description}
                        </div>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <FileTextOutlined />
                  Boblar ({mangaChapters?.length || 0})
                </span>
              } 
              key="chapters"
            >
              <div className="space-y-4">
                {/* Add Chapter Form */}
                <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                  <Title level={4} className="text-white mb-4">
                    Yangi bob qo'shish
                  </Title>
                  <Form
                    form={chapterForm}
                    layout="vertical"
                    onFinish={handleCreateChapter}
                    className="space-y-4"
                  >
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={8}>
                        <Form.Item
                          name="title"
                          label={<span className="text-white">Bob nomi</span>}
                          rules={[{ required: true, message: 'Bob nomini kiriting!' }]}
                        >
                          <Input 
                            placeholder="Bob nomi"
                            className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Form.Item
                          name="access_type"
                          label={<span className="text-white">Kirish turi</span>}
                          rules={[{ required: true, message: 'Kirish turini tanlang!' }]}
                        >
                          <Select placeholder="Kirish turi">
                            <Option value="free">Bepul</Option>
                            <Option value="paid">Pullik</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={6}>
                        <Form.Item
                          name="price"
                          label={<span className="text-white">Narx (so'm)</span>}
                        >
                          <InputNumber
                            placeholder="Narx (so'm)"
                            min={0}
                            className="w-full bg-[#1a1a1a] border-[#2a2a2a]"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={4} className="flex items-end">
                        <Form.Item>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={isCreatingChapter}
                            className="bg-[#ff9900] border-[#ff9900] w-full"
                          >
                            Qo'shish
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                </Card>

                {/* Chapters Management */}
                <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                  <Title level={4} className="text-white mb-4">
                    Boblar ro'yxati
                  </Title>
                  {mangaChapters && mangaChapters.length > 0 ? (
                    <div className="space-y-3">
                      {mangaChapters.map((chapter: any, index: number) => (
                        <Card
                          key={chapter.id}
                          className="bg-[#1a1a1a] border-[#2a2a2a]"
                          bodyStyle={{ padding: '16px' }}
                        >
                          <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={6}>
                              <div className="flex items-center space-x-3">
                                <Avatar 
                                  size="large" 
                                  className="bg-[#ff9900]"
                                >
                                  {index + 1}
                                </Avatar>
                                <div>
                                  <div className="text-white font-medium">
                                    {chapter.title}
                                  </div>
                                  <div className="text-gray-400 text-sm">
                                    ID: {chapter.id}
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col xs={24} sm={4}>
                              <div>
                                <Text className="text-gray-400 text-xs">Kirish turi</Text>
                                <div>
                                  <Tag 
                                    color={chapter.access_type === 'free' ? 'green' : chapter.access_type === '3_days_paid' ? 'blue' : 'orange'}
                                    icon={chapter.access_type === 'free' ? <GiftOutlined /> : <DollarOutlined />}
                                  >
                                    {chapter.access_type === 'free' ? 'Bepul' : chapter.access_type === '3_days_paid' ? '3 kunlik pullik' : 'Pullik'}
                                  </Tag>
                                </div>
                              </div>
                            </Col>
                            <Col xs={24} sm={4}>
                              {(chapter.access_type === 'paid' || chapter.access_type === '3_days_paid') && chapter.price && (
                                <div>
                                  <Text className="text-gray-400 text-xs">Narx</Text>
                                  <div className="text-yellow-500 font-medium">
                                    {chapter.price} so'm
                                  </div>
                                </div>
                              )}
                            </Col>
                            <Col xs={24} sm={4}>
                              <div>
                                <Text className="text-gray-400 text-xs">Xarid qilingan</Text>
                                <div>
                                  <Tag 
                                    color={chapter.is_purchased === true || chapter.is_purchased === 'true' ? 'green' : 'default'}
                                    icon={chapter.is_purchased === true || chapter.is_purchased === 'true' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                                  >
                                    {chapter.is_purchased === true || chapter.is_purchased === 'true' ? 'Ha' : 'Yo\'q'}
                                  </Tag>
                                </div>
                              </div>
                            </Col>
                            <Col xs={24} sm={6}>
                              <div>
                                <Text className="text-gray-400 text-xs">PDF fayl</Text>
                                <div className="flex items-center space-x-2 mt-1">
                                  {chapter.pdf_file ? (
                                    <>
                                      <Tag color="green" icon={<FilePdfOutlined />}>
                                        Yuklangan
                                      </Tag>
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => window.open(chapter.pdf_file, '_blank')}
                                        className="text-blue-500 hover:text-blue-400"
                                      >
                                        Ko'rish
                                      </Button>
                                    </>
                                  ) : (
                                    <Tag color="red" icon={<CloseCircleOutlined />}>
                                      Yuklanmagan
                                    </Tag>
                                  )}
                                </div>
                              </div>
                            </Col>
                            <Col xs={24} sm={4}>
                              <Space>
                                <Tooltip title="PDF yuklash">
                                  <Button
                                    type="text"
                                    icon={<UploadOutlined />}
                                    onClick={() => handleChapterPdfUpload(chapter)}
                                    className="text-purple-500 hover:text-purple-400"
                                  />
                                </Tooltip>
                                <Tooltip title="Tahrirlash">
                                  <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditChapter(chapter)}
                                    className="text-green-500 hover:text-green-400"
                                  />
                                </Tooltip>
                                <Popconfirm
                                  title="Bobni o'chirish"
                                  description="Haqiqatan ham bu bobni o'chirmoqchimisiz?"
                                  onConfirm={() => handleDeleteChapter(chapter.id)}
                                  okText="Ha"
                                  cancelText="Yo'q"
                                >
                                  <Tooltip title="O'chirish">
                                    <Button
                                      type="text"
                                      icon={<DeleteOutlined />}
                                      loading={isDeletingChapter}
                                      className="text-red-500 hover:text-red-400"
                                    />
                                  </Tooltip>
                                </Popconfirm>
                              </Space>
                            </Col>
                          </Row>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      description="Hozircha boblar yo'q"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      className="text-gray-400"
                    />
                  )}
                </Card>
              </div>
            </TabPane>

            <TabPane 
              tab={
                <span>
                  <StarOutlined />
                  Sharhlar ({mangaDetail?.reviews?.length || 0})
                </span>
              } 
              key="reviews"
            >
              <List
                dataSource={mangaDetail?.reviews || []}
                renderItem={(review: any) => (
                  <List.Item className="border-b border-[#2a2a2a]">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar icon={<UserOutlined />} />
                          <Text className="text-white font-medium">
                            {review.user || 'Foydalanuvchi'}
                          </Text>
                          <Rate disabled defaultValue={review.rating} />
                        </div>
                        <Text className="text-gray-400 text-sm">
                          {new Date(review.created_at).toLocaleDateString('uz-UZ')}
                        </Text>
                      </div>
                      <div className="text-gray-300">{review.text}</div>
                    </div>
                  </List.Item>
                )}
                locale={{
                  emptyText: (
                    <div className="text-center py-8">
                      <StarOutlined className="text-4xl text-gray-600 mb-2" />
                      <div className="text-gray-400">Hozircha sharhlar yo'q</div>
                    </div>
                  )
                }}
              />
            </TabPane>
          </Tabs>
        )}
      </Modal>

      <style jsx global>{`
        .manga-table .ant-table {
          background: #1a1a1a !important;
        }
        .manga-table .ant-table-thead > tr > th {
          background: #0a0a0a !important;
          border-bottom: 1px solid #2a2a2a !important;
          color: #fff !important;
        }
        .manga-table .ant-table-tbody > tr > td {
          background: #1a1a1a !important;
          border-bottom: 1px solid #2a2a2a !important;
        }
        .manga-table .ant-table-tbody > tr:hover > td {
          background: #2a2a2a !important;
        }
        .manga-modal .ant-modal-content {
          background: #1a1a1a !important;
        }
        .manga-modal .ant-modal-header {
          background: #1a1a1a !important;
          border-bottom: 1px solid #2a2a2a !important;
        }
        .manga-modal .ant-modal-title {
          color: #fff !important;
        }
        .cover-uploader .ant-upload-select,
        .background-uploader .ant-upload-select {
          background: #0a0a0a !important;
          border: 1px dashed #2a2a2a !important;
          color: #fff !important;
        }
        .cover-uploader .ant-upload-select:hover,
        .background-uploader .ant-upload-select:hover {
          border-color: #ff9900 !important;
        }
        .chapters-table .ant-table {
          background: #0a0a0a !important;
        }
        .chapters-table .ant-table-thead > tr > th {
          background: #1a1a1a !important;
          border-bottom: 1px solid #2a2a2a !important;
          color: #fff !important;
        }
        .chapters-table .ant-table-tbody > tr > td {
          background: #0a0a0a !important;
          border-bottom: 1px solid #2a2a2a !important;
        }
        .chapters-table .ant-table-tbody > tr:hover > td {
          background: #1a1a1a !important;
        }
      `}</style>

      {/* Create Category Modal */}
      <Modal
        title="Yangi kategoriya qo'shish"
        open={isCreateCategoryModalOpen}
        onCancel={() => {
          setIsCreateCategoryModalOpen(false);
          setNewCategoryName("");
        }}
        onOk={handleCreateCategory}
        confirmLoading={isCreatingCategory}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        className="manga-modal"
      >
        <Input
          placeholder="Kategoriya nomini kiriting"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
          onPressEnter={handleCreateCategory}
        />
      </Modal>

      {/* Create Author Modal */}
      <Modal
        title="Yangi muallif qo'shish"
        open={isCreateAuthorModalOpen}
        onCancel={() => {
          setIsCreateAuthorModalOpen(false);
          setNewAuthorName("");
        }}
        onOk={handleCreateAuthor}
        confirmLoading={isCreatingAuthor}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        className="manga-modal"
      >
        <Input
          placeholder="Tarjimon nomini kiriting"
          value={newAuthorName}
          onChange={(e) => setNewAuthorName(e.target.value)}
          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
          onPressEnter={handleCreateAuthor}
        />
      </Modal>

      {/* Create Genre Modal */}
      <Modal
        title="Yangi janr qo'shish"
        open={isCreateGenreModalOpen}
        onCancel={() => {
          setIsCreateGenreModalOpen(false);
          setNewGenreName("");
        }}
        onOk={handleCreateGenre}
        confirmLoading={isCreatingGenre}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        className="manga-modal"
      >
        <Input
          placeholder="Janr nomini kiriting"
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          className="bg-[#0a0a0a] border-[#2a2a2a] text-white"
          onPressEnter={handleCreateGenre}
        />
      </Modal>
    </div>
  );
} 