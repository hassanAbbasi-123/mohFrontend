import "./globals.css";
import { ReduxProvider } from "@/store/features/redux/ReduxProvider";
import LayoutContent from "@/components/layout/LayoutContent";
import AuthInitializer from "@/components/layout/AuthInitializer";
import { ChatProvider } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper"; // 👈 import client wrapper

export const metadata = {
  title: "Moh Capital Overseas",
  description: "Reliable Supplier of Premium-quality Garlic-Onion Exporter ",
   icons: {
    icon: "/favicon.png",       // ← your custom tab icon
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        style={{
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        }}
        className="antialiased text-gray-900 bg-gray-50"
      >
        <ReduxProvider>
          <AuthInitializer>
            <ChatProvider>
              <LayoutContent>{children}</LayoutContent>
              {/* 👇 Now safe, because ChatWrapper is client-only */}
              <ChatWrapper />
            </ChatProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
