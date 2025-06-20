import React, { createContext, useContext, useState, useEffect } from 'react';
import { pagesApi, sectionsApi, cardsApi } from '../services/api';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await pagesApi.getAll();
      setPages(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pages:', err);
      setError('Failed to fetch pages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get page by slug
  const getPageBySlug = async (slug) => {
    try {
      setLoading(true);
      const response = await pagesApi.getBySlug(slug);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error fetching page:', err);
      setError('Failed to fetch page. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Create a new page
  const createPage = async (pageData) => {
    try {
      setLoading(true);
      const response = await pagesApi.create(pageData);
      setPages([...pages, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error creating page:', err);
      setError('Failed to create page. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a page
  const updatePage = async (id, pageData) => {
    try {
      setLoading(true);
      const response = await pagesApi.update(id, pageData);
      setPages(pages.map(page => page.id === id ? response.data : page));
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error updating page:', err);
      setError('Failed to update page. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a page
  const deletePage = async (id) => {
    try {
      setLoading(true);
      await pagesApi.delete(id);
      setPages(pages.filter(page => page.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting page:', err);
      setError('Failed to delete page. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Section Management
  const createSection = async (sectionData) => {
    try {
      setLoading(true);
      const response = await sectionsApi.create(sectionData);
      
      // Extract page from response
      const { page, section } = response.data;
      
      if (page) {
        // If page is returned, update the pages state
        setPages(pages.map(p => p.id === page.id ? page : p));
      } else {
        // Fallback for backward compatibility
        setPages(pages.map(p => {
          if (p.id === sectionData.pageId) {
            return {
              ...p,
              Sections: [...(p.Sections || []), section]
            };
          }
          return p;
        }));
      }
      
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error creating section:', err);
      setError('Failed to create section. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (id, sectionData) => {
    try {
      setLoading(true);
      const response = await sectionsApi.update(id, sectionData);
      
      // Extract page from response
      const { page, section } = response.data;
      
      if (page) {
        // If page is returned, update the pages state
        setPages(pages.map(p => p.id === page.id ? page : p));
      } else {
        // Fallback for backward compatibility
        setPages(pages.map(p => {
          if (p.id === sectionData.pageId) {
            return {
              ...p,
              Sections: p.Sections.map(s => s.id === id ? section : s)
            };
          }
          return p;
        }));
      }
      
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error updating section:', err);
      setError('Failed to update section. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id, pageId) => {
    try {
      setLoading(true);
      const response = await sectionsApi.delete(id);
      const { page } = response.data;
      setPages(pages.map(p => p.id === page.id ? page : p));
      setError(null);
    } catch (err) {
      console.error('Error deleting section:', err);
      setError('Failed to delete section. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Card Management
  const createCard = async (cardData) => {
    try {
      setLoading(true);
      const response = await cardsApi.create(cardData);
      const { page } = response.data;
      setPages(pages.map(p => p.id === page.id ? page : p));
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error creating card:', err);
      setError('Failed to create card. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCard = async (id, cardData) => {
    try {
      setLoading(true);
      const response = await cardsApi.update(id, cardData);
      const { page } = response.data;
      setPages(pages.map(p => p.id === page.id ? page : p));
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error updating card:', err);
      setError('Failed to update card. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (id, sectionId) => {
    try {
      setLoading(true);
      const response = await cardsApi.delete(id);
      const { page } = response.data;
      setPages(pages.map(p => p.id === page.id ? page : p));
      setError(null);
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete card. Please try again later.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const value = {
    pages,
    loading,
    error,
    fetchPages,
    getPageBySlug,
    createPage,
    updatePage,
    deletePage,
    createSection,
    updateSection,
    deleteSection,
    createCard,
    updateCard,
    deleteCard
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}; 