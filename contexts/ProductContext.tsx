
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import type { Product } from '../types';
import socket from '../src/socket';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => Product | undefined;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = 'app_products_local';

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Camiseta Classic White',
    description: 'Camiseta 100% algodão branca com corte premium.',
    price: 89.90,
    stock_quantity: 50,
    image_url: 'https://picsum.photos/seed/shirt1/400/400',
    category: 'Camisas',
    sizes: ['P', 'M', 'G', 'GG']
  },
  {
    id: 2,
    name: 'Polo Navy Blue',
    description: 'Camisa polo azul marinho em tecido piquet.',
    price: 129.90,
    stock_quantity: 30,
    image_url: 'https://picsum.photos/seed/polo1/400/400',
    category: 'Camisas',
    sizes: ['M', 'G', 'GG']
  },
  {
    id: 3,
    name: 'Camiseta Black Premium',
    description: 'Camiseta preta com acabamento de luxo.',
    price: 99.90,
    stock_quantity: 25,
    image_url: 'https://picsum.photos/seed/shirt2/400/400',
    category: 'Camisetas',
    sizes: ['P', 'M', 'G']
  }
];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (e) {
      setError("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const onProductsUpdated = (updatedProducts: Product[]) => {
      console.log("Products updated via socket:", updatedProducts.length, "products");
      setProducts(updatedProducts);
    };

    const onConnect = () => {
      console.log("Socket connected, refetching products...");
      fetchProducts();
    };

    const onConnectError = (err: any) => {
      console.error("Socket connection error in ProductContext:", err);
    };

    socket.on("products_updated", onProductsUpdated);
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);

    // Fallback polling every 60 seconds
    const interval = setInterval(() => {
      console.log("Polling products as fallback...");
      fetchProducts();
    }, 60000);

    return () => {
      socket.off("products_updated", onProductsUpdated);
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      clearInterval(interval);
    };
  }, [fetchProducts]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch (e) {
      console.error("Erro ao adicionar produto", e);
    }
  };

  const updateProduct = async (productData: Product) => {
    try {
      await fetch(`/api/products/${productData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
    } catch (e) {
      console.error("Erro ao atualizar produto", e);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error("Erro ao deletar produto", e);
    }
  };
  
  const getProductById = (id: number): Product | undefined => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct, getProductById, searchTerm, setSearchTerm }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
