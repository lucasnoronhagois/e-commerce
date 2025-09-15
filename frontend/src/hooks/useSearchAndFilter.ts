import { useState, useEffect, useMemo } from 'react';
import { normalizeText } from '../utils/formatters';

export interface SearchAndFilterOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  categoryField?: keyof T;
  defaultSortBy?: string;
  itemsPerPage?: number;
  searchFunction?: (item: T, searchTerm: string) => boolean;
  sortFunction?: (a: T, b: T, sortBy: string, sortOrder: 'asc' | 'desc') => number;
}

export interface SearchAndFilterState {
  searchTerm: string;
  selectedCategory: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
}

export interface SearchAndFilterActions {
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  handleSearch: () => void;
  resetFilters: () => void;
}

export interface SearchAndFilterResult<T> {
  filteredItems: T[];
  currentItems: T[];
  totalPages: number;
  state: SearchAndFilterState;
  actions: SearchAndFilterActions;
}

export function useSearchAndFilter<T>({
  items,
  searchFields,
  categoryField,
  defaultSortBy = 'name',
  itemsPerPage = 10,
  searchFunction,
  sortFunction
}: SearchAndFilterOptions<T>): SearchAndFilterResult<T> {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Função para filtrar itens
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if (searchFunction) {
          return searchFunction(item, searchTerm);
        }
        return searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            const normalizedSearchTerm = normalizeText(searchTerm);
            const normalizedValue = normalizeText(value);
            return normalizedValue.includes(normalizedSearchTerm);
          }
          return false;
        });
      });
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all' && categoryField) {
      filtered = filtered.filter(item => {
        const categoryValue = (item as any)[categoryField];
        // Handle nested objects for categoryField (e.g., product.category)
        if (typeof categoryValue === 'object' && categoryValue !== null) {
          return (categoryValue as any).category === selectedCategory;
        }
        return categoryValue === selectedCategory;
      });
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortFunction) {
        return sortFunction(a, b, sortBy, sortOrder);
      }

      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];

      let comparison = 0;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'pt-BR');
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        // Converter para string se necessário
        const aStr = String(aValue || '').toLowerCase();
        const bStr = String(bValue || '').toLowerCase();
        comparison = aStr.localeCompare(bStr, 'pt-BR');
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [items, searchTerm, selectedCategory, sortBy, sortOrder, searchFields, categoryField]);

  // Calcular paginação
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy, sortOrder]);

  const handleSearch = () => {
    // A busca é automática via useMemo, mas podemos adicionar lógica adicional aqui se necessário
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy(defaultSortBy);
    setSortOrder('asc');
    setCurrentPage(1);
  };

  const state: SearchAndFilterState = {
    searchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    currentPage,
    itemsPerPage
  };

  const actions: SearchAndFilterActions = {
    setSearchTerm,
    setSelectedCategory,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    handleSearch,
    resetFilters
  };

  return {
    filteredItems,
    currentItems,
    totalPages,
    state,
    actions
  };
}
