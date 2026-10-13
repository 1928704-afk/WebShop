import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { productApi } from '../api/products';
import { ShoppingBag, Sparkles, Filter, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HomePageProps {
  searchKeyword: string;
}

const CATEGORIES = ['전체', '전자제품', '패션의류', '식품', '리빙/생활', '도서'];

// 초기 더미 상품 데이터 (백엔드 연동 전 또는 초기 DB 준비용)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Apple 맥북 프로 16인치 M3 Max',
    description: '전문가를 위한 극한의 성능, Liquid Retina XDR 디스플레이 탑재',
    price: 3990000,
    stockQuantity: 15,
    category: '전자제품',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: '소니 WH-1000XM5 노이즈 캔슬링 헤드폰',
    description: '업계 최고 수준의 노이즈 캔슬링과 고해상도 프리미엄 사운드',
    price: 449000,
    stockQuantity: 28,
    category: '전자제품',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: '클래식 미니멀 오버핏 코튼 셔츠',
    description: '편안한 착용감과 단정한 실루엣의 데일리 프리미엄 셔츠',
    price: 59000,
    stockQuantity: 4,
    category: '패션의류',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: '유기농 프리미엄 콜드브루 원두 1kg',
    description: '부드러운 산미와 깊은 풍미를 자랑하는 스페셜티 커피 원두',
    price: 32000,
    stockQuantity: 50,
    category: '식품',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: '북유럽 스타일 우드 감성 스탠드 조명',
    description: '따뜻한 전구색 빛으로 아늑한 공간을 연출하는 인테리어 조명',
    price: 89000,
    stockQuantity: 12,
    category: '리빙/생활',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  },
  {
    id: 6,
    name: '스프링부트 & 리액트로 완성하는 MSA 교과서',
    description: '대규모 트래픽 처리를 위한 마이크로서비스 설계와 분산 아키텍처 실무',
    price: 38000,
    stockQuantity: 80,
    category: '도서',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60',
    createdAt: new Date().toISOString()
  }
];

export const HomePage: React.FC<HomePageProps> = ({ searchKeyword }) => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchKeyword]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const cat = selectedCategory === '전체' ? undefined : selectedCategory;
      const res = await productApi.getProducts(cat, searchKeyword || undefined, 0, 20);
      if (res && res.content && res.content.length > 0) {
        setProducts(res.content);
      } else {
        // 백엔드 DB가 비어있는 초기 상태일 경우 모의 데이터로 필터링 제공
        let filtered = MOCK_PRODUCTS;
        if (selectedCategory !== '전체') {
          filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (searchKeyword) {
          filtered = filtered.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()));
        }
        setProducts(filtered);
      }
    } catch (err) {
      // 오프라인 / 초기 기동 시 모의 데이터 폴백
      let filtered = MOCK_PRODUCTS;
      if (selectedCategory !== '전체') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      if (searchKeyword) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()));
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-12 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Cloud Commerce
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            스프링부트 & 리액트 <br />
            차세대 MSA 쇼핑몰
          </h1>
          <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
            Kafka 이벤트 기반 사가 패턴, Redis 분산 캐싱, 도커 및 쿠버네티스로 견고하게 설계된 대용량 트랜잭션 플랫폼을 경험해보세요.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100 h-72">
              <div className="bg-gray-200 h-40 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">검색 조건에 맞는 상품이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative grid md:grid-cols-2">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-square bg-gray-100 overflow-hidden">
              <img
                src={selectedProduct.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-600">
                  {selectedProduct.category}
                </span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  {selectedProduct.description}
                </p>
                <div className="mt-4">
                  <span className="text-xs text-gray-400 block">잔여 재고</span>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedProduct.stockQuantity}개 남음
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-sm text-gray-500">판매가격</span>
                  <span className="text-2xl font-black text-gray-900">
                    {selectedProduct.price.toLocaleString()}원
                  </span>
                </div>

                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl transition shadow-md"
                >
                  장바구니에 담기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
