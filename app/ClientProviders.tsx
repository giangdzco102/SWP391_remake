"use client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import AntdThemeProvider from "@/components/AntdThemeProvider";
import NotiAuth from "@/components/popup/NotiAuth";
import Auth from "@/components/popup/Auth";
import Loading from "./loading";
import { ToastProvider } from "@/utils/toast-provider";
import AuthProvider from "@/components/AuthProvider";
import { Layout } from "antd";
import Header from "@/components/ui/Header";
import { ProviderModal } from "@/components/popup/ProviderModal";
import { Footer } from "@/components/ui/Footer";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <AntdThemeProvider>
        <ToastProvider>
          <Layout className="relative">
            <main className="bg-background">
              <Loading />
              <AuthProvider>
                <div className="overflow-hidden flex flex-col">
                  <Header />
                  {children}
                  <Footer />
                </div>
                <ProviderModal />
              </AuthProvider>
            </main>
          </Layout>
          <NotiAuth />
          <Auth />
        </ToastProvider>
      </AntdThemeProvider>
    </ThemeProvider>
  );
}
