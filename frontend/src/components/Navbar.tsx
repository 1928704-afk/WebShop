import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, User as UserIcon, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenAuth: () => void;
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, searchKeyword, onSearchChange }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-2xl tracking-tight">
            <ShoppingBag className="w-7 h-7 text-sky-500" />
            <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
              NewShop
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
            <input
              type="text"
              placeholder="찾고 계신 상품을 검색해보세요..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Orders Link */}
            {isAuthenticated && (
              <Link
                to="/orders"
                className="flex items-center gap-1.5 text-gray-700 hover:text-sky-600 text-sm font-medium transition"
              >
                <Package className="w-5 h-5 text-gray-500" />
                <span className="hidden md:inline">주문 내역</span>
              </Link>
            )}

            {/* Cart Link */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-sky-600 transition"
              aria-label="장바구니"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-500 rounded-full">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* User Auth Action */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">환영합니다</p>
                  <p className="text-sm font-semibold text-gray-800">{user.name} 님</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-rose-500 rounded-lg hover:bg-gray-100 transition"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium transition shadow-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
