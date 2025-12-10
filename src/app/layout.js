import "./globals.css";
import { ReduxProvider } from "@/store/features/redux/ReduxProvider";
import LayoutContent from "@/components/layout/LayoutContent";
import AuthInitializer from "@/components/layout/AuthInitializer";
import { ChatProvider } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper";

// ✅ Add Inter Font (Fixes 404 font errors)
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], display: "swap" });

// ✅ Metadata with custom favicon
export const metadata = {
  title: "Moh Capital Overseas",
  description: "Reliable Supplier of Premium-quality Garlic-Onion Exporter",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // ✅ Apply Inter font class (Fixes missing font errors)
      className={inter.className}
    >
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
              
              <ChatWrapper />
            </ChatProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
