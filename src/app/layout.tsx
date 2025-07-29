import './globals.css';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Providers from './Providers';

export const metadata = {
  title: 'Client Portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden">
        <Providers>
          <div className="flex h-full">
            {/* Sidebar: left 20% with logo */}
            <div className="w-1/5 min-w-[200px] h-full">
              <Sidebar />
            </div>

            {/* Main content area */}
            <div className="flex flex-col flex-1">
              {/* Header bar: sits at top */}
              <div className="h-16 flex-shrink-0">
                <Header />
              </div>

              {/* Page content below header */}
              <div className="flex-1 overflow-auto bg-gray-50 p-6">
                {children}
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}