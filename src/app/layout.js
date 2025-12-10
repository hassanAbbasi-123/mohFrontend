import "./globals.css";
import { ReduxProvider } from "@/store/features/redux/ReduxProvider";
import LayoutContent from "@/components/layout/LayoutContent";
import AuthInitializer from "@/components/layout/AuthInitializer";
import { ChatProvider } from "@/context/ChatContext";
import ChatWrapper from "@/components/chat/ChatWrapper";

// ❌ REMOVE next/font/google (it causes 404 on Vercel)
// import { Inter } from "next/font/google";
// const inter = Inter({ subsets: ["latin"], display: "swap" });

// ✅ Use LOCAL INTER FONT defined in globals.css
// No import needed — globals.css already declares @font-face correctly

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
 
    >
      <body
        suppressHydrationWarning

        // ✅ Use Tailwind + globals.css fonts
        className="antialiased text-gray-900 bg-gray-50 font-sans"
      >
        <ReduxProvider>
          <AuthInitializer>
            <ChatProvider>
              <LayoutContent>
                {children}
              </LayoutContent>

              <ChatWrapper />
            </ChatProvider>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}
