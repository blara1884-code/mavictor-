import type { Product } from '../types';

// A URL base do seu servidor backend.
// Ela pode vir de uma variável de ambiente em um projeto real.
const API_URL = 'http://localhost:3001/api'; // Exemplo: ajuste para a sua URL

/**
 * Função auxiliar para tratar as respostas da API.
 * Ela verifica se a resposta foi bem-sucedida e extrai o JSON.
 * Lança um erro se a resposta da rede não for 'ok'.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(errorData.message || `Erro na API: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Objeto 'api' que contém todos os métodos para interagir com o backend.
 * Cada método corresponde a uma operação na API (ex: buscar produtos, criar um produto).
 */
export const api = {
  /**
   * Busca todos os produtos do backend.
   * Corresponde a uma chamada GET para /products.
   */
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`);
    return handleResponse<Product[]>(response);
  },

  /**
   * Busca um único produto pelo seu ID.
   * Corresponde a uma chamada GET para /products/:id.
   */
  getProductById: async (id: string): Promise<Product | undefined> => {
    const response = await fetch(`${API_URL}/products/${id}`);
    return handleResponse<Product>(response);
  },

  /**
   * Adiciona um novo produto ao banco de dados.
   * Corresponde a uma chamada POST para /products.
   */
  addProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    return handleResponse<Product>(response);
  },

  /**
   * Atualiza um produto existente.
   * Corresponde a uma chamada PUT para /products/:id.
   */
  updateProduct: async (updatedProduct: Product): Promise<Product> => {
    const response = await fetch(`${API_URL}/products/${updatedProduct.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct),
    });
    return handleResponse<Product>(response);
  },

  /**
   * Deleta um produto pelo seu ID.
   * Corresponde a uma chamada DELETE para /products/:id.
   */
  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    // O delete pode não retornar um corpo, então tratamos de forma diferente
    if (!response.ok) {
      throw new Error('Falha ao deletar produto');
    }
    return { success: true };
  },

  // Você continuaria adicionando os outros métodos aqui...
  // login: async (email, pass) => { ... },
  // createOrder: async (orderData) => { ... },
};
