"use client";

import React from "react";
import { Card, Col, Row, Statistic, List, Avatar, Progress, Tag, Alert, Empty } from "antd";
import { 
  BookOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  StarOutlined,
  EyeOutlined,
  FireOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useStats } from "@/hooks/admin/useStats";
import { useMangas } from "@/hooks/admin/useMangas";
import { useCategories } from "@/hooks/admin/useCategories";
import { useGenres } from "@/hooks/admin/useGenres";
import { useAuthors } from "@/hooks/admin/useAuthors";
import { useUsersCount } from "@/hooks/admin/useUsers";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AdminDashboard() {
  const router = useRouter();
  const { stats, isLoadingStats, statsError } = useStats();
  const { manga, isLoadingManga, mangaError } = useMangas();
  const { categories, isLoadingCategories, categoriesError } = useCategories();
  const { genres, isLoadingGenres, genresError } = useGenres();
  const { authors, isLoadingAuthors, authorsError } = useAuthors();
  const { data: usersCount, isLoading: isLoadingUsers, error: usersError } = useUsersCount();

  if (Array.isArray(manga)) {
    const ongoingCount = manga.filter(m => m.status === 'ongoing' || m.status === 'active' || m.status === 'publishing').length;
    const completedCount = manga.filter(m => m.status === 'completed' || m.status === 'finished').length;
  }

  const isLoading = isLoadingStats || isLoadingManga || isLoadingCategories || isLoadingGenres || isLoadingAuthors || isLoadingUsers;
  const hasErrors = statsError || mangaError || categoriesError || genresError || authorsError || usersError;

  const totalManga = Array.isArray(manga) ? manga.length : 0;
  const totalCategories = Array.isArray(categories) ? categories.length : 0;
  const totalGenres = Array.isArray(genres) ? genres.length : 0;
  const totalAuthors = Array.isArray(authors) ? authors.length : 0;
  const totalUsers = usersCount?.count || 0;

  const navigateToPage = (path: string) => {
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400 text-lg">Topmanga platformasining umumiy statistikasi</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-[#1a1a1a] px-4 py-2 rounded-lg border border-[#2a2a2a]">
              <div className="text-sm text-gray-400">Jami ma'lumotlar</div>
              <div className="text-white font-bold text-lg">
                {totalManga + totalCategories + totalGenres + totalUsers + totalAuthors}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error alerts */}
      {hasErrors && (
        <div className="space-y-2 mb-4">
          <Alert
            message="Ma'lumotlarni yuklashda xatolik yuz berdi"
            description="Ba'zi ma'lumotlar ko'rsatilmayapti. Iltimos, sahifani yangilang yoki keyinroq urinib ko'ring."
            type="warning"
            showIcon
            icon={<ExclamationCircleOutlined />}
          />
          {statsError && (
            <Alert
              message="Statistika yuklashda xatolik"
              description={statsError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
          {mangaError && (
            <Alert
              message="Manga ma'lumotlarini yuklashda xatolik"
              description={mangaError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
          {categoriesError && (
            <Alert
              message="Kategoriyalarni yuklashda xatolik"
              description={categoriesError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
          {genresError && (
            <Alert
              message="Janrlarni yuklashda xatolik"
              description={genresError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
          {authorsError && (
            <Alert
              message="Tarjimonlarni yuklashda xatolik"
              description={authorsError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
          {usersError && (
            <Alert
              message="Foydalanuvchilarni yuklashda xatolik"
              description={usersError?.message || 'Noma\'lum xatolik'}
              type="error"
            />
          )}
        </div>
      )}

      {/* Main Statistics Cards */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/manga')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Jami manga</span>}
                  value={totalManga}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Platformadagi manga</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-lg flex items-center justify-center shadow-lg">
                <BookOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/categories')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Kategoriyalar</span>}
                  value={totalCategories}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Manga kategoriyalari</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <FileTextOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/users')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Foydalanuvchilar</span>}
                  value={totalUsers}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Ro'yxatdan o'tgan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <UserOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/genres')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Janrlar</span>}
                  value={totalGenres}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Manga janrlari</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <StarOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/authors')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Tarjimonlar</span>}
                  value={totalAuthors}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Manga mualliflari</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <TrophyOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/manga')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Faol manga</span>}
                  value={Array.isArray(manga) ? manga.filter(m => m.status === 'ongoing' || m.status === 'active' || m.status === 'publishing').length : 0}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Davom etayotgan</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <EyeOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/manga')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">Tugatilgan</span>}
                  value={Array.isArray(manga) ? manga.filter(m => m.status === 'completed' || m.status === 'finished').length : 0}
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Yakunlangan manga</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
                <ClockCircleOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer"
            bodyStyle={{ padding: '24px' }}
            onClick={() => navigateToPage('/admin/manga')}
          >
            <div className="flex items-center justify-between">
              <div>
                <Statistic
                  title={<span className="text-gray-300 text-sm font-medium">O'rtacha reyting</span>}
                  value={Array.isArray(manga) && manga.length > 0 
                    ? (manga.reduce((sum, m) => sum + (m.rating || 0), 0) / manga.length).toFixed(1)
                    : 0
                  }
                  valueStyle={{ color: '#ff9900', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div className="text-gray-500 text-xs mt-1">Platforma reytingi</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <StarOutlined className="text-white text-xl" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Popular Genres and Authors */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span className="text-white flex items-center text-lg font-semibold">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <FireOutlined className="text-white" />
                </div>
                Mashhur janrlar
              </span>
            }
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            {Array.isArray(genres) && genres.length > 0 ? (
              <List
                dataSource={genres.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item className="border-b border-[#333] last:border-b-0 py-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-lg flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-gray-400 text-sm">Janr #{item.id}</div>
                        </div>
                      </div>
                      <Tag color="orange" className="font-medium">#{item.id}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Janrlar mavjud emas" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span className="text-white flex items-center text-lg font-semibold">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <TrophyOutlined className="text-white" />
                </div>
                Top mualliflar
              </span>
            }
            className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            {Array.isArray(authors) && authors.length > 0 ? (
              <List
                dataSource={authors.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item className="border-b border-[#333] last:border-b-0 py-3 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{item.name}</div>
                          <div className="text-gray-400 text-sm">Tarjimon #{item.id}</div>
                        </div>
                      </div>
                      <Tag color="blue" className="font-medium">#{item.id}</Tag>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="Tarjimonlar mavjud emas" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Manga */}
      <Card 
        title={
          <span className="text-white flex items-center text-lg font-semibold">
            <div className="w-8 h-8 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-lg flex items-center justify-center mr-3">
              <BookOutlined className="text-white" />
            </div>
            So'nggi manga
          </span>
        }
        className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border-[#333] hover:border-[#ff9900] transition-all duration-300"
        bodyStyle={{ padding: '20px' }}
      >
        {Array.isArray(manga) && manga.length > 0 ? (
          <List
            dataSource={manga.slice(0, 5)}
            renderItem={(item) => (
              <List.Item className="border-b border-[#333] last:border-b-0 py-4 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ff9900] to-[#ff6600] rounded-lg flex items-center justify-center mr-4 shadow-lg overflow-hidden">
                      {item.cover ? (
                        <img 
                          src={item.cover} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {item.title?.charAt(0) || 'M'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg">{item.title}</div>
                      <div className="text-gray-400 text-sm">
                        Tarjimon: {item.author?.name || 'Noma\'lum'}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Ko'rishlar: {item.views || 0} • Reyting: {item.rating || 0}/5
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Tag 
                      color={(item.status === 'ongoing' || item.status === 'active' || item.status === 'publishing') ? 'green' : 'red'} 
                      className="font-medium px-3 py-1"
                    >
                      {(item.status === 'ongoing' || item.status === 'active' || item.status === 'publishing') ? '🟢 Faol' : '🔴 Tugatilgan'}
                    </Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="Manga mavjud emas" />
        )}
      </Card>
    </div>
  );
} 