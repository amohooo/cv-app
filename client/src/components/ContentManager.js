import React, { useState } from 'react';
import { useContentContext } from '../context/ContentContext';

const ContentManager = () => {
  const {
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
    deleteCard
  } = useContentContext();

  const [newPage, setNewPage] = useState({
    title: '',
    slug: '',
    order: 0
  });

  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      await createPage(newPage);
      setNewPage({ title: '', slug: '', order: 0 });
    } catch (err) {
      console.error('Error creating page:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Content Manager</h2>
      
      {/* Create Page Form */}
      <form onSubmit={handleCreatePage}>
        <input
          type="text"
          placeholder="Page Title"
          value={newPage.title}
          onChange={(e) => setNewPage({ ...newPage, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Page Slug"
          value={newPage.slug}
          onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
        />
        <input
          type="number"
          placeholder="Order"
          value={newPage.order}
          onChange={(e) => setNewPage({ ...newPage, order: parseInt(e.target.value) })}
        />
        <button type="submit">Create Page</button>
      </form>

      {/* Display Pages */}
      <div>
        {pages.map(page => (
          <div key={page.id}>
            <h3>{page.title}</h3>
            <p>Slug: {page.slug}</p>
            <p>Order: {page.order}</p>
            
            {/* Display Sections */}
            {page.Sections?.map(section => (
              <div key={section.id}>
                <h4>{section.title}</h4>
                <p>{section.description}</p>
                
                {/* Display Cards */}
                {section.Cards?.map(card => (
                  <div key={card.id}>
                    <h5>{card.title}</h5>
                    <p>{card.content}</p>
                    {card.imageUrl && <img src={card.imageUrl} alt={card.title} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManager; 