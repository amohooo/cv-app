import { useState, useEffect } from 'react';
import { pagesApi, sectionsApi, cardsApi } from '../services/api';

export const useContent = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all pages with their sections and cards
  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await pagesApi.getAll();
      setPages(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Page operations
  const createPage = async (pageData) => {
    try {
      const response = await pagesApi.create(pageData);
      setPages([...pages, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePage = async (id, pageData) => {
    try {
      const response = await pagesApi.update(id, pageData);
      setPages(pages.map(page => page.id === id ? response.data : page));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePage = async (id) => {
    try {
      await pagesApi.delete(id);
      setPages(pages.filter(page => page.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Section operations
  const createSection = async (sectionData) => {
    try {
      const response = await sectionsApi.create(sectionData);
      // The API returns { section: createdSection, page: updatedPage }
      // We need to update the entire pages array with the updated page
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === sectionData.pageId ? response.data.page : page
        ));
      }
      return response.data.section;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      const response = await sectionsApi.update(id, sectionData);
      // The API returns { section: updatedSection, page: updatedPage }
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === sectionData.pageId ? response.data.page : page
        ));
      }
      return response.data.section;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteSection = async (id, pageId) => {
    try {
      const response = await sectionsApi.delete(id);
      // The API returns { message: 'Section deleted successfully', page: updatedPage }
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === pageId ? response.data.page : page
        ));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Card operations
  const createCard = async (cardData) => {
    try {
      const response = await cardsApi.create(cardData);
      // The API returns { card: createdCard, page: updatedPage }
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === response.data.page.id ? response.data.page : page
        ));
      }
      return response.data.card;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCard = async (id, cardData) => {
    try {
      const response = await cardsApi.update(id, cardData);
      // The API returns { card: updatedCard, page: updatedPage }
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === response.data.page.id ? response.data.page : page
        ));
      }
      return response.data.card;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCard = async (id, sectionId) => {
    try {
      const response = await cardsApi.delete(id);
      // The API returns { message: 'Card deleted successfully', page: updatedPage }
      if (response.data.page) {
        setPages(pages.map(page => 
          page.id === response.data.page.id ? response.data.page : page
        ));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  return {
    pages,
    loading,
    error,
    createPage,
    updatePage,
    deletePage,
    createSection,
    updateSection,
    deleteSection,
    createCard,
    updateCard,
    deleteCard,
    refreshPages: fetchPages
  };
}; 