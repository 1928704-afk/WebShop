import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();

  const handleAddCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
  };

  const defaultImage = `https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60`;

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.imageUrl || defaultImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 shadow-sm">
            {product.category}
          </span>
          {product.stockQuantity <= 5 && (
            <span className="absolute top-2 right-2 bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              품절임박 ({product.stockQuantity}개)
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 text-base line-clamp-1 group-hover:text-sky-600 transition">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs mt-1 line-clamp-2">
            {product.description || '최고의 품질과 만족을 드리는 엄선된 상품입니다.'}
          </p>
        </div>
      </div>

      <div className="p-4 pt-0 flex items-center justify-between mt-2">
        <div>
          <span className="text-xs text-gray-400 block">판매가</span>
          <span className="text-lg font-bold text-gray-900">
            {product.price.toLocaleString()}원
          </span>
        </div>

        <button
          onClick={handleAddCart}
          className="p-2.5 rounded-xl bg-gray-50 hover:bg-sky-500 hover:text-white text-gray-700 transition border border-gray-200 hover:border-transparent shadow-sm"
          title="장바구니 담기"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
