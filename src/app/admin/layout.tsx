"use client";

import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, Button } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { AdminGuard } from "@/components/common/AdminGuard";
import AntdProvider from "@/lib/providers/AntdProvider";
import {
  BookOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";

const { Sider, Content, Header } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAdminAuth();

  if (pathname === "/admin/login") {
    return <AntdProvider>{children}</AntdProvider>;
  }

  const items = [
    {
      key: "/admin",
      icon: <DatabaseOutlined />,
      label: "Dashboard",
      path: "/admin",
    },
    {
      key: "content",
      icon: <BookOutlined />,
      label: "Kontent boshqaruvi",
      children: [
        { key: "/admin/manga", icon: <BookOutlined />, label: "Manga", path: "/admin/manga" },
        { key: "/admin/chapters", icon: <FileTextOutlined />, label: "Boblar", path: "/admin/chapters" },
        { key: "/admin/categories", icon: <AppstoreOutlined />, label: "Kategoriyalar", path: "/admin/categories" },
        { key: "/admin/genres", icon: <TagsOutlined />, label: "Janrlar", path: "/admin/genres" },
        { key: "/admin/authors", icon: <UserOutlined />, label: "Tarjimonlar", path: "/admin/authors" },
      ],
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Foydalanuvchilar",
      children: [
        { key: "/admin/users", icon: <UserOutlined />, label: "Foydalanuvchilar", path: "/admin/users" },
        { key: "/admin/purchases", icon: <ShoppingCartOutlined />, label: "Xaridlar", path: "/admin/purchases" },
        { key: "/admin/reviews", icon: <FileTextOutlined />, label: "Sharhlar", path: "/admin/reviews" },
        { key: "/admin/comments", icon: <FileTextOutlined />, label: "Commentlar", path: "/admin/comments" },
      ],
    },
  ];

  const flatItems = items.flatMap((item) => (item.children ? item.children : item));

  const fixedItems = items.map((item) => {
    if (item.children) {
      return {
        ...item,
        children: item.children.map((child: any) => ({
          ...child,
          key: child.key || `/admin/${child.label?.toLowerCase?.().replace(/\s+/g, "-")}`,
        })),
      };
    }
    return {
      ...item,
      key: item.key || `/admin/${item.label?.toLowerCase?.().replace(/\s+/g, "-")}`,
    };
  });

  const breadcrumbItems = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean)
    .map((seg, idx, arr) => {
      const url = "/admin/" + arr.slice(0, idx + 1).join("/");
      const menuItem = flatItems.find((i: any) => i.key === url);
      return {
        key: url,
        title: menuItem?.label || seg,
        href: url,
      };
    });

  const openKeys = items
    .filter((item) => item.children?.some((child: any) => pathname.startsWith(child.key)))
    .map((item) => item.key);

  const userMenuItems = [
    {
      key: "1",
      label: "Profil",
      icon: <UserOutlined />,
    },
    {
      type: "divider" as const,
    },
    {
      key: "3",
      label: "Chiqish",
      icon: <LogoutOutlined />,
      onClick: () => {
        logout();
        router.push("/");
      },
    },
  ];

  const siderWidth = 250;
  const siderCollapsedWidth = 80;

  return (
    <AdminGuard>
      <AntdProvider>
        <Layout style={{ minHeight: "100vh" }}>
          {/* LEFT SIDEBAR */}
          <Sider
            theme="dark"
            collapsible
            collapsed={collapsed}
            onCollapse={(c) => setCollapsed(c)}
            width={siderWidth}
            collapsedWidth={siderCollapsedWidth}
            breakpoint="lg"
            style={{
              background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
              boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
              zIndex: 100,
              position: "fixed",
              height: "100vh",
              left: 0,
              top: 0,
            }}
            trigger={null}
          >
            <div className="h-20 flex items-center justify-center text-white text-lg font-bold mb-4 border-b border-[#2a2a2a] bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a]">
              <Link href="/admin" className="flex items-center">
                <img src="/images/logo.png" alt="Topmanga Logo" className="h-8 w-auto" />
                {!collapsed && (
                  <div className="ml-3">
                    <div className="text-gray-400 text-xs">Admin Panel</div>
                  </div>
                )}
              </Link>
            </div>

            <Menu
              theme="dark"
              selectedKeys={[pathname]}
              defaultOpenKeys={collapsed ? [] : openKeys}
              mode="inline"
              items={fixedItems}
              onClick={(e) => {
                if (e.key && typeof e.key === "string") {
                  router.push(e.key);
                }
              }}
              style={{
                background: "transparent",
                borderRight: 0,
                fontSize: 14,
              }}
              className="px-2 custom-menu"
            />

            <div className="absolute bottom-20 left-0 right-0 p-4 border-t border-[#2a2a2a] bg-gradient-to-t from-[#0a0a0a] to-transparent">
              <Link
                href="/"
                className="flex items-center text-gray-300 hover:text-[#ff9900] transition-colors duration-200 p-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                <HomeOutlined className="mr-3 text-lg" />
                {!collapsed && <span className="font-medium">Saytga o'tish</span>}
              </Link>
            </div>

            <div className="absolute bottom-4 left-0 right-0 p-4">
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full flex items-center text-gray-300 hover:text-red-400 transition-colors duration-200 p-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                <LogoutOutlined className="mr-3 text-lg" />
                {!collapsed && <span className="font-medium">Chiqish</span>}
              </button>
            </div>
          </Sider>

          {/* MAIN AREA (HEADER + CONTENT) */}
          <Layout
            className="admin-main-layout"
            style={{
              marginLeft: collapsed ? siderCollapsedWidth : siderWidth,
              transition: "margin-left 0.2s ease",
              minHeight: "100vh",
              background: "#0a0a0a",
            }}
          >
            <Header
              style={{
                background: "linear-gradient(90deg, #0a0a0a 0%, #1a1a1a 100%)",
                padding: "0 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #2a2a2a",
                height: 64,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "sticky",
                top: 0,
                zIndex: 99,
              }}
            >
              <div className="flex items-center">
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{
                    fontSize: 18,
                    color: "#fff",
                    marginRight: 16,
                    background: "transparent",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: 8,
                    transition: "all 0.2s",
                  }}
                  className="hover:bg-[#2a2a2a]"
                />
                <Breadcrumb
                  items={[
                    {
                      key: "/admin",
                      title: (
                        <span
                          className="text-white hover:text-[#ff9900] transition-colors cursor-pointer"
                          onClick={() => router.push("/admin")}
                        >
                          <HomeOutlined />
                        </span>
                      ),
                    },
                    ...breadcrumbItems.map((item) => ({
                      ...item,
                      title: (
                        <span
                          className="text-white hover:text-[#ff9900] transition-colors cursor-pointer"
                          onClick={() => router.push(item.href)}
                        >
                          {item.title}
                        </span>
                      ),
                    })),
                  ]}
                  separator={<span className="text-gray-500">/</span>}
                  style={{ color: "#fff" }}
                />
              </div>

              <div className="flex items-center space-x-4">
                <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                  <Space className="cursor-pointer hover:bg-[#2a2a2a] p-2 rounded-lg transition-colors">
                    <Avatar
                      style={{
                        backgroundColor: "#ff9900",
                        border: "2px solid #2a2a2a",
                        boxShadow: "0 0 10px rgba(255, 153, 0, 0.3)",
                      }}
                      icon={<UserOutlined />}
                      size="large"
                    />
                    {user?.username && (
                      <span className="text-white hidden md:inline font-medium">{user.username}</span>
                    )}
                  </Space>
                </Dropdown>
              </div>
            </Header>

            <Content
              style={{
                padding: "24px 24px 40px",
                background: "#0a0a0a",
                overflow: "auto",
              }}
            >
              <div
                className="admin-content-wrapper"
                style={{
                  width: "100%",
                  maxWidth: 1400,
                  margin: "0 auto",
                }}
              >
                {children}
              </div>
            </Content>
          </Layout>
        </Layout>

        {/* RESPONSIVE FIXES */}
        <style jsx global>{`
          @media (max-width: 992px) {
            .ant-layout-sider {
              position: fixed !important;
              height: 100vh !important;
              left: 0 !important;
              top: 0 !important;
              z-index: 1000 !important;
            }
            .admin-main-layout {
              margin-left: 0 !important;
            }
          }
        `}</style>
      </AntdProvider>
    </AdminGuard>
  );
}
