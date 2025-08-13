import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata = {
  title: "PromptSell - Buy & Sell AI Prompts",
  description: "Marketplace for buying and selling the best AI prompts",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body
        className='bg-[#f7f7f7] min-h-screen'
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {/* Navigation */}
          <Navigation />

          {/* Main Content */}
          <main className='min-h-screen'>{children}</main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
