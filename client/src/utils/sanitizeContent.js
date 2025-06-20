export const sanitizeContent = (html) => {
  if (!html) return '';

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove all Quill-specific classes
  const elementsWithQuillClasses = tempDiv.querySelectorAll('[class*="ql-"]');
  elementsWithQuillClasses.forEach(element => {
    element.removeAttribute('class');
  });

  // Remove all inline styles
  const elementsWithStyles = tempDiv.querySelectorAll('[style]');
  elementsWithStyles.forEach(element => {
    element.removeAttribute('style');
  });

  // Ensure proper HTML structure for lists
  const lists = tempDiv.querySelectorAll('ul, ol');
  lists.forEach(list => {
    // Remove any empty list items
    const items = list.querySelectorAll('li');
    items.forEach(item => {
      if (!item.innerHTML.trim()) {
        item.parentNode.removeChild(item);
      }
    });

    // Add proper list styling
    list.style.listStyleType = 'disc';
    list.style.paddingLeft = '2em';
    list.style.marginBottom = '1em';
  });

  // Style list items
  const listItems = tempDiv.querySelectorAll('li');
  listItems.forEach(item => {
    item.style.marginBottom = '0.5em';
  });

  // Style links
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    link.style.color = '#2196F3';
    link.style.textDecoration = 'none';
  });

  // Return the sanitized HTML
  return tempDiv.innerHTML;
}; 