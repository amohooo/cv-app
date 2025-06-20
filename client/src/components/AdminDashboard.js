import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import FileUpload from './FileUpload';
import PasswordChange from './PasswordChange';
import AdminManagement from './AdminManagement';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './AdminDashboard.css';
import '../style/quill.css';
import { sanitizeContent } from '../utils/sanitizeContent';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { 
    pages, 
    createPage, 
    updatePage, 
    deletePage,
    createSection,
    updateSection,
    deleteSection,
    createCard,
    updateCard,
    deleteCard,
    loading, 
    error: contentError 
  } = useContent();
  
  const [selectedPage, setSelectedPage] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showAdminManagement, setShowAdminManagement] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: ''
  });
  const [sectionFormData, setSectionFormData] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [cardFormData, setCardFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    fileUrl: '',
    order: 0
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Quill configuration
  const Quill = ReactQuill.Quill;
  var Font = Quill.import("formats/font");
  Font.whitelist = ["Arial", "Lato", "Verdana", "Helvetica", "Monaco", "Roboto", "SanSerif", "Courier"];
  var Size = Quill.import('attributors/style/size');
  Size.whitelist = ['12px', '16px', '18px', '24px', '32px', '48px', '64px', '72px'];
  Quill.register(Size, true);
  Quill.register(Font, true);

  const modules = {
    toolbar: [
      // Headers
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ font: Font.whitelist }],
      [{ size: Size.whitelist }],
      // Text Style
      ['bold', 'italic', 'underline', 'strike'],
      // Lists
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      // Colors
      [{ 'color': [] }],
      [{ 'color': ['#0F5257'] }],
      // Background Colors
      [{ 'background': [] }],
      // Links and Media
      ['link'],
      // Clear Formatting
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link'
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Helper functions to check if user can edit content
  const canEditPage = (page) => {
    if (!user) return false;
    if (user.role === 'master') return true;
    return page.Admin && page.Admin.id === user.id;
  };

  const canEditSection = (section, page) => {
    if (!user) return false;
    if (user.role === 'master') return true;
    return page.Admin && page.Admin.id === user.id;
  };

  const canEditCard = (card, section, page) => {
    if (!user) return false;
    if (user.role === 'master') return true;
    return page.Admin && page.Admin.id === user.id;
  };

  // Check if user can create content in a page
  const canCreateInPage = (page) => {
    if (!user) return false;
    if (user.role === 'master') return true;
    return page.Admin && page.Admin.id === user.id;
  };

  // Handle page selection
  const handlePageSelect = (page) => {
    if (canCreateInPage(page)) {
      setSelectedPage(selectedPage?.id === page.id ? null : page);
      setSelectedSection(null);
      setSelectedCard(null);
    } else {
      setError('You can only manage content in pages you own');
    }
  };

  // Page handlers
  const handleCreatePage = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await createPage(formData);
      setFormData({ title: '', slug: '', description: ''});
      setSuccess('Page created successfully!');
    } catch (error) {
      console.error('Error creating page:', error);
      setError(error.response?.data?.error || 'Failed to create page');
    }
  };

  const handleUpdatePage = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await updatePage(selectedPage.id, formData);
      setSelectedPage(null);
      setIsEditing(false);
      setFormData({ title: '', slug: '', description: ''});
      setSuccess('Page updated successfully!');
    } catch (error) {
      console.error('Error updating page:', error);
      setError(error.response?.data?.error || 'Failed to update page');
    }
  };

  const handleDeletePage = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        setError('');
        setSuccess('');
        await deletePage(id);
        setSuccess('Page deleted successfully!');
      } catch (error) {
        console.error('Error deleting page:', error);
        setError(error.response?.data?.error || 'Failed to delete page');
      }
    }
  };

  const handleEditPage = (page) => {
    setSelectedPage(page);
    setIsEditing(true);
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description || ''
    });
  };

  // Section handlers
  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await createSection({
        ...sectionFormData,
        pageId: selectedPage.id
      });
      setSectionFormData({ title: '', description: '', order: 0 });
      setSuccess('Section created successfully!');
    } catch (error) {
      console.error('Error creating section:', error);
      setError(error.response?.data?.error || 'Failed to create section');
    }
  };

  const handleUpdateSection = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await updateSection(selectedSection.id, {
        ...sectionFormData,
        pageId: selectedPage.id
      });
      setSelectedSection(null);
      setSectionFormData({ title: '', description: '', order: 0 });
      setSuccess('Section updated successfully!');
    } catch (error) {
      console.error('Error updating section:', error);
      setError(error.response?.data?.error || 'Failed to update section');
    }
  };

  const handleDeleteSection = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        setError('');
        setSuccess('');
        await deleteSection(id, selectedPage.id);
        setSuccess('Section deleted successfully!');
      } catch (error) {
        console.error('Error deleting section:', error);
        setError(error.response?.data?.error || 'Failed to delete section');
      }
    }
  };

  const handleEditSection = (section) => {
    setSelectedSection(section);
    setSectionFormData({
      title: section.title,
      description: section.description || '',
      order: section.order
    });
    
    // Clear any selected card when switching sections
    setSelectedCard(null);
    setCardFormData({ title: '', content: '', imageUrl: '', fileUrl: '', order: 0 });
  };

  // Card handlers
  const handleCreateCard = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await createCard({
        ...cardFormData,
        sectionId: selectedSection.id
      });
      setCardFormData({ title: '', content: '', imageUrl: '', fileUrl: '', order: 0 });
      setSuccess('Card created successfully!');
    } catch (error) {
      console.error('Error creating card:', error);
      setError(error.response?.data?.error || 'Failed to create card');
    }
  };

  const handleUpdateCard = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await updateCard(selectedCard.id, {
        ...cardFormData,
        sectionId: selectedSection.id
      });
      setSelectedCard(null);
      setCardFormData({ title: '', content: '', imageUrl: '', fileUrl: '', order: 0 });
      setSuccess('Card updated successfully!');
    } catch (error) {
      console.error('Error updating card:', error);
      setError(error.response?.data?.error || 'Failed to update card');
    }
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        setError('');
        setSuccess('');
        await deleteCard(id, selectedSection.id);
        setSuccess('Card deleted successfully!');
      } catch (error) {
        console.error('Error deleting card:', error);
        setError(error.response?.data?.error || 'Failed to delete card');
      }
    }
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setCardFormData({
      title: card.title,
      content: card.content || '',
      imageUrl: card.imageUrl || '',
      fileUrl: card.fileUrl || '',
      order: card.order
    });
  };

  // Update the card form section
  const renderCardForm = () => (
    <form onSubmit={selectedCard ? handleUpdateCard : handleCreateCard} onClick={(e) => e.stopPropagation()}>
      <div className="form-group">
        <label htmlFor="card-title">Title</label>
        <input
          type="text"
          id="card-title"
          value={cardFormData.title}
          onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="card-content">Content</label>
        <ReactQuill
          theme="snow"
          value={cardFormData.content}
          onChange={(content) => setCardFormData({ ...cardFormData, content })}
          modules={modules}
          formats={formats}
          className="quill-editor"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <div className="form-group">
        <label>File Upload</label>
        <FileUpload
          existingFile={cardFormData.fileUrl}
          onFileUpload={(fileUrl, fileDetails) => {
            setCardFormData(prev => ({
              ...prev,
              fileUrl,
              // Store original filename if provided
              originalName: fileDetails?.originalName
            }));
          }}
        />
      </div>
      <div className="form-group">
        <label htmlFor="card-order">Order</label>
        <input
          type="number"
          id="card-order"
          value={cardFormData.order}
          onChange={(e) => setCardFormData({ ...cardFormData, order: parseInt(e.target.value) })}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      <button type="submit" className="submit-button" onClick={(e) => e.stopPropagation()}>
        {selectedCard ? 'Update Card' : 'Create Card'}
      </button>
      {selectedCard && (
        <button
          type="button"
          className="cancel-button"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCard(null);
            setCardFormData({ title: '', content: '', imageUrl: '', fileUrl: '', order: 0 });
          }}
        >
          Cancel
        </button>
      )}
    </form>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (contentError) {
    return (
      <div className="error-container">
        <div className="error-message">{contentError}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span className="username">{user?.username}</span>
            <span className={`role ${user?.role}`}>{user?.role}</span>
          </div>
        </div>
        <div className="dashboard-actions">
          {user?.role === 'master' && (
            <button
              className="admin-management-button"
              onClick={() => setShowAdminManagement(true)}
            >
              Manage Admins
            </button>
          )}
          <button
            className="password-change-button"
            onClick={() => setShowPasswordChange(true)}
          >
            Change Password
          </button>
        </div>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="error-message">
          {error}
          <button 
            className="error-close" 
            onClick={() => setError('')}
          >
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
          <button 
            className="success-close" 
            onClick={() => setSuccess('')}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Page Management */}
      <div className="page-form">
        <h2>{isEditing ? 'Edit Page' : 'Create New Page'}</h2>
        <form onSubmit={isEditing ? handleUpdatePage : handleCreatePage}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="slug">Slug</label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <ReactQuill
              theme="snow"
              value={formData.description}
              onChange={(content) => {
                // Clean the content and ensure proper paragraph structure
                const cleanContent = content
                  .replace(/<p><br><\/p>/g, '')
                  .replace(/<p>/g, '<p class="contact-item">');
                setFormData({ ...formData, description: cleanContent });
              }}
              modules={modules}
              formats={formats}
              className="quill-editor"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button type="submit" className="submit-button" onClick={(e) => e.stopPropagation()}>
            {isEditing ? 'Update Page' : 'Create Page'}
          </button>
          {isEditing && (
            <button
              type="button"
              className="cancel-button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPage(null);
                setIsEditing(false);
                setFormData({ title: '', slug: '', description: '', content: '' });
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Pages List */}
      <div className="pages-list">
        <h2>Pages</h2>
        {pages.length === 0 ? (
          <p>No pages found. Create your first page!</p>
        ) : (
          <div className="pages-grid">
            {pages.map((page) => (
              <div 
                key={page.id} 
                className={`page-card ${canCreateInPage(page) ? 'clickable' : 'read-only'} ${selectedPage?.id === page.id ? 'selected' : ''}`}
                onClick={() => canCreateInPage(page) && handlePageSelect(page)}
              >
                <div className="page-header">
                  <h3>{page.title}</h3>
                  {page.Admin && (
                    <div className="page-owner">
                      <span className="owner-label">Owner:</span>
                      <span className="owner-name">{page.Admin.username}</span>
                      {page.Admin.role === 'master' && (
                        <span className="owner-role master">Master Admin</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="page-description">
                  <div className="ql-snow">
                    <div 
                      className="ql-editor" 
                      dangerouslySetInnerHTML={{ __html: page.description }} 
                    />
                  </div>
                </div>
                <div className="page-actions">
                  {canEditPage(page) && (
                    <>
                      <button
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditPage(page);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(page.id);
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {!canEditPage(page) && (
                    <span className="read-only-indicator">Read Only</span>
                  )}
                </div>

                {/* Section Management for Selected Page */}
                {selectedPage?.id === page.id && canCreateInPage(page) && (
                  <div className="section-management" onClick={(e) => e.stopPropagation()}>
                    <h4>Sections</h4>
                    <form onSubmit={selectedSection ? handleUpdateSection : handleCreateSection}>
                      <div className="form-group">
                        <label htmlFor="section-title">Title</label>
                        <input
                          type="text"
                          id="section-title"
                          value={sectionFormData.title}
                          onChange={(e) => setSectionFormData({ ...sectionFormData, title: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="section-description">Description</label>
                        <ReactQuill
                          theme="snow"
                          id="section-description"
                          value={sectionFormData.description}
                          onChange={(content) => setSectionFormData({ ...sectionFormData, description: content })}
                          modules={modules}
                          formats={formats}
                          className="quill-editor"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="section-order">Order</label>
                        <input
                          type="number"
                          id="section-order"
                          value={sectionFormData.order}
                          onChange={(e) => setSectionFormData({ ...sectionFormData, order: parseInt(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <button type="submit" className="submit-button" onClick={(e) => e.stopPropagation()}>
                        {selectedSection ? 'Update Section' : 'Create Section'}
                      </button>
                      {selectedSection && (
                        <button
                          type="button"
                          className="cancel-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSection(null);
                            setSectionFormData({ title: '', description: '', order: 0 });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </form>

                    {/* Sections List */}
                    <div className="sections-list">
                      {(page.Sections || [])
                        .sort((a, b) => a.order - b.order)
                        .map((section) => (
                        <div key={section.id} className="section-card">
                          <h4 className="section-title">{section.title}</h4>
                          <div className="section-content content-display" dangerouslySetInnerHTML={{ __html: sanitizeContent(section.description) }} />
                          <div className="section-actions">
                            <div className="action-buttons">
                              {canEditSection(section, page) && (
                                <>
                                  <button className="edit-button" onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditSection(section);
                                  }}>Edit</button>
                                  <button className="delete-button" onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id);
                                  }}>Delete</button>
                                </>
                              )}
                              {!canEditSection(section, page) && (
                                <span className="read-only-indicator">Read Only</span>
                              )}
                            </div>
                          </div>
                          
                          {selectedSection?.id === section.id && canEditSection(section, page) && (
                            <div className="card-management">
                              <h6>Cards</h6>
                              {renderCardForm()}
                              <div className="cards-list">
                                {section.Cards && section.Cards.length > 0 ? (
                                  section.Cards
                                    .sort((a, b) => a.order - b.order)
                                    .map((card) => (
                                      <div key={card.id} className="card-item">
                                        <h6>{card.title}</h6>
                                        <div className="card-content content-display" dangerouslySetInnerHTML={{ __html: sanitizeContent(card.content) }} />
                                        {card.imageUrl && (
                                          <div className="card-image">
                                            <img src={card.imageUrl} alt={card.title} />
                                          </div>
                                        )}
                                        {card.fileUrl && (
                                          <div className="card-file">
                                            <a 
                                              href={card.fileUrl.startsWith('/api') ? card.fileUrl : card.fileUrl.startsWith('/') ? card.fileUrl : `/${card.fileUrl}`}
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              download={card.originalName || card.fileUrl.split('/').pop()}
                                            >
                                              {card.originalName || 'Download File'}
                                            </a>
                                          </div>
                                        )}
                                        <div className="card-actions">
                                          {canEditCard(card, section, page) && (
                                            <>
                                              <button
                                                className="edit-button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleEditCard(card);
                                                }}
                                              >
                                                Edit
                                              </button>
                                              <button
                                                className="delete-button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteCard(card.id);
                                                }}
                                              >
                                                Delete
                                              </button>
                                            </>
                                          )}
                                          {!canEditCard(card, section, page) && (
                                            <span className="read-only-indicator">Read Only</span>
                                          )}
                                        </div>
                                      </div>
                                    ))
                                ) : (
                                  <p>No cards found. Create a new card above.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <PasswordChange onClose={() => setShowPasswordChange(false)} />
      )}

      {/* Admin Management Modal */}
      {showAdminManagement && (
        <div className="admin-management-modal">
          <div className="admin-management-content">
            <div className="modal-header">
              <h2>Admin Management</h2>
              <button 
                className="close-button" 
                onClick={() => setShowAdminManagement(false)}
              >
                ×
              </button>
            </div>
            <AdminManagement />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 