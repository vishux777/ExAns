// extractor.js - Module for extracting content from web pages

window.extractContent = function() {
  console.log("extractContent called.");
  let question = '';
  const options = [];
  const visitedElements = new Set(); // Avoid duplicates
  
  try {
    // Use different extraction methods to avoid detection patterns
    const method = Math.floor(Math.random() * 3);
    console.log("Using extraction method:", method);
    
    switch(method) {
      case 0:
        return extractUsingTraversal();
      case 1:
        return extractUsingQueries();
      case 2:
        return extractUsingElementTypes();
      default:
        return extractUsingQueries();
    }
  } catch (error) {
    console.error("Extraction error:", error);
    return { question: '', options: [] };
  }
  
  // Method 1: DOM Traversal with minimal queries
  function extractUsingTraversal() {
    let questionText = '';
    const optionsList = [];
    
    // Start from the body and traverse
    function traverse(node, depth = 0) {
      if (!node || depth > 15) return; // Limit depth to avoid infinite recursion
      
      // Check if this is a visible text node with content
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text.length > 5) {
          questionText += text + ' ';
        }
        return;
      }
      
      // Skip invisible elements
      if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden' || 
            style.opacity === '0') {
          return;
        }
        
        // Check for form elements that might contain options
        if (node.tagName === 'INPUT') {
          if ((node.type === 'radio' || node.type === 'checkbox') && 
              isElementVisible(node)) {
            const optionText = getOptionText(node);
            if (optionText) optionsList.push(optionText);
          }
        }
      }
      
      // Traverse children
      const children = node.childNodes;
      for (let i = 0; i < children.length; i++) {
        traverse(children[i], depth + 1);
      }
    }
    
    // Start traversal from body
    traverse(document.body);
    
    // Clean up the question text
    questionText = questionText.replace(/\s+/g, ' ').trim();
    
    return {
      question: questionText,
      options: optionsList
    };
  }
  
  // Method 2: Using targeted queries to find content
  function extractUsingQueries() {
    let questionText = '';
    const optionsList = [];
    
    // Extract main content - look for elements likely to contain questions
    const contentSelectors = [
      'main', 'article', '.question', '.problem', '.quiz-item',
      '[role="main"]', '.content', '.question-text', '.stem'
    ];
    
    // Try each selector until we find content
    for (const selector of contentSelectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        for (const el of elements) {
          if (isElementVisible(el) && !visitedElements.has(el)) {
            visitedElements.add(el);
            const text = el.innerText || el.textContent;
            if (text && text.trim().length > 15) {
              questionText += text.trim() + '\n';
            }
          }
        }
        if (questionText.length > 30) break; // We found enough content
      }
    }
    
    // If we still don't have enough content, look at headings and paragraphs
    if (questionText.length < 30) {
      const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, p');
      for (const el of textElements) {
        if (isElementVisible(el) && !visitedElements.has(el)) {
          visitedElements.add(el);
          const text = el.innerText || el.textContent;
          if (text && text.trim().length > 15) {
            questionText += text.trim() + '\n';
          }
        }
      }
    }
    
    // Get options from radio buttons and checkboxes
    const inputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    for (const input of inputs) {
      if (isElementVisible(input)) {
        const optionText = getOptionText(input);
        if (optionText) optionsList.push(optionText);
      }
    }
    
    // Also check for options in lists that might be part of a quiz
    const listItems = document.querySelectorAll('li.option, li.answer, .option, .answer-choice');
    for (const item of listItems) {
      if (isElementVisible(item) && !visitedElements.has(item)) {
        visitedElements.add(item);
        const text = item.innerText || item.textContent;
        if (text && text.trim().length > 0) {
          optionsList.push(text.trim());
        }
      }
    }
    
    return {
      question: questionText.trim(),
      options: optionsList
    };
  }
  
  // Method 3: Focus on specific element types
  function extractUsingElementTypes() {
    let questionText = '';
    const optionsList = [];
    const questionElements = [];
    
    // First pass: collect elements that might contain the question
    document.querySelectorAll('div, p, h1, h2, h3, span').forEach(el => {
      if (isElementVisible(el) && !visitedElements.has(el)) {
        const text = el.innerText || el.textContent || '';
        if (text.trim().length > 20 && 
            !el.querySelector('input') && 
            !el.closest('footer') && 
            !el.closest('header') && 
            !el.closest('nav')) {
          
          // Calculate a relevance score based on position and content
          const rect = el.getBoundingClientRect();
          const isInViewport = rect.top >= 0 && 
                               rect.left >= 0 && 
                               rect.bottom <= window.innerHeight && 
                               rect.right <= window.innerWidth;
          
          const hasQuestionMarks = (text.match(/\?/g) || []).length;
          const containsQuestionWords = /what|how|why|when|where|which|who|describe|explain/i.test(text);
          
          let score = 0;
          if (isInViewport) score += 5;
          score += hasQuestionMarks * 3;
          if (containsQuestionWords) score += 4;
          if (el.tagName === 'H1' || el.tagName === 'H2') score += 3;
          
          questionElements.push({element: el, score, text: text.trim()});
          visitedElements.add(el);
        }
      }
    });
    
    // Sort by relevance score and take the top elements
    questionElements.sort((a, b) => b.score - a.score);
    const topElements = questionElements.slice(0, 3); // Take top 3 most relevant elements
    
    // Combine their text
    questionText = topElements.map(item => item.text).join('\n');
    
    // Extract options from form elements and lists
    // Radio buttons and checkboxes
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
      if (isElementVisible(input)) {
        const optionText = getOptionText(input);
        if (optionText) optionsList.push(optionText);
      }
    });
    
    // List items that might be options
    document.querySelectorAll('li, .option').forEach(item => {
      // Check if this might be an option (short text, part of a list of similar items)
      if (isElementVisible(item) && !visitedElements.has(item)) {
        const text = item.innerText || item.textContent || '';
        if (text.trim().length > 0 && text.trim().length < 200) {
          const parent = item.parentElement;
          if (parent && parent.children.length >= 2) {
            // This is part of a list with multiple items, likely options
            optionsList.push(text.trim());
            visitedElements.add(item);
          }
        }
      }
    });
    
    return {
      question: questionText,
      options: optionsList
    };
  }
  
  // Helper function to check if an element is visible
  function isElementVisible(element) {
    if (!element) return false;
    
    // Check computed style
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0' || 
        parseInt(style.width) === 0 || 
        parseInt(style.height) === 0) {
      return false;
    }
    
    // Check if element is in viewport
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    return true;
  }
  
  // Helper function to get the text associated with a form option
  function getOptionText(input) {
    let label = '';
    
    // Check for label element
    if (input.labels && input.labels.length) {
      label = input.labels[0].innerText || input.labels[0].textContent;
    } 
    // Check for label with 'for' attribute
    else if (input.id && document.querySelector(`label[for="${input.id}"]`)) {
      label = document.querySelector(`label[for="${input.id}"]`).innerText || 
              document.querySelector(`label[for="${input.id}"]`).textContent;
    } 
    // Check parent element for text
    else if (input.parentElement) {
      // Exclude the text from any inputs inside the parent
      const clone = input.parentElement.cloneNode(true);
      const inputs = clone.querySelectorAll('input');
      inputs.forEach(el => el.remove());
      
      label = clone.innerText || clone.textContent;
    }
    
    return label ? label.trim() : '';
  }
};

window.getSelectedText = function() {
  console.log("getSelectedText called.");
  try {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        return selectedText;
      }
    }
    return '';
  } catch (error) {
    console.error("Error getting selected text:", error);
    return '';
  }
};

console.log("extractor.js loaded.");