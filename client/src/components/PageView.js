import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import './PageView.css';

const PageView = () => {
  const { slug } = useParams();
  const { pages, loading, error } = useContent();
  const [page, setPage] = useState(null);

  useEffect(() => {
    if (pages && pages.length > 0) {
      const foundPage = pages.find(p => p.slug === slug);
      setPage(foundPage);
    }
  }, [pages, slug]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!page) {
    return <div className="not-found">Page not found</div>;
  }

  return (
    <div className="page-view">
      <h1>{page.title}</h1>
      {page.description && (
        <div className="page-description">
          <div className="ql-snow">
            <div 
              className="ql-editor" 
              dangerouslySetInnerHTML={{ __html: page.description }} 
            />
          </div>
        </div>
      )}
      
      {page.Sections && page.Sections.length > 0 && (
        <div className="sections">
          {(page.Sections || [])
            .sort((a, b) => a.order - b.order)
            .map(section => (
            <div key={section.id} className="section">
              <h2>{section.title}</h2>
              <div className="card-content">
                <div className="ql-snow">
                  <div 
                    className="ql-editor" 
                    dangerouslySetInnerHTML={{ __html: section.description }} 
                  />
                </div>
              </div>
              
              {section.Cards && section.Cards.length > 0 && (
                <div className="cards">
                  {(section.Cards || [])
                    .sort((a, b) => a.order - b.order)
                    .map(card => (
                    <div key={card.id} className="card">
                      <h3>{card.title}</h3>
                      <div className="card-content">
                        <div className="ql-snow">
                          <div 
                            className="ql-editor" 
                            dangerouslySetInnerHTML={{ __html: card.content }} 
                          />
                        </div>
                      </div>
                      {card.imageUrl && (
                        <div className="card-image">
                          <img src={card.imageUrl} alt={card.title} />
                        </div>
                      )}
                      {card.fileUrl && (
                        <div className="card-file">
                          <a 
                            href={`/api${card.fileUrl}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            download={card.fileUrl.split('/').pop()}
                          >
                            Download File
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageView; 