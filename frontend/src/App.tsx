import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { OrdersPage } from './pages/OrdersPage';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
            <Navbar
              onOpenAuth={() => setIsAuthOpen(true)}
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
            />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage searchKeyword={searchKeyword} />} />
                <Route path="/cart" element={<CartPage onOpenAuth={() => setIsAuthOpen(true)} />} />
                <Route path="/orders" element={<OrdersPage />} />
              </Routes>
            </main>

            <footer className="bg-white border-t border-gray-200 py-8 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4 space-y-2">
                <p className="font-semibold text-gray-700">NewShop MSA Platform</p>
                <p>Spring Boot 3 • React 18 TypeScript • Redis • MySQL • Apache Kafka • Kubernetes</p>
                <p>© 2026 NewShop. All rights reserved.</p>
              </div>
            </footer>

            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
