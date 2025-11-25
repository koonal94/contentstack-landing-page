/**
 * Strips HTML tags from a string, extracting only the text content
 * Useful for RTE (Rich Text Editor) fields that return HTML like <p>text</p>
 * 
 * @param {string} html - The HTML string to strip
 * @returns {string} - The plain text content without HTML tags
 */
export function stripHtml(html) {
  if (!html || typeof html !== 'string') {
    return html
  }
  
  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    // Browser: Use DOM API for accurate parsing
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    const text = tmp.textContent || tmp.innerText || ''
    return text.trim()
  } else {
    // Server/Node: Use regex to strip HTML tags (less accurate but works everywhere)
    return html
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/&#39;/g, "'") // Replace &#39; with '
      .trim()
  }
}

/**
 * Strips only <p> tags from a string, keeping other HTML intact
 * Useful when you want to remove paragraph tags but preserve other formatting
 * 
 * @param {string} html - The HTML string
 * @returns {string} - The HTML string with <p> tags removed
 */
export function stripPTags(html) {
  if (!html || typeof html !== 'string') {
    return html
  }
  
  // Remove opening and closing <p> tags
  return html
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '')
    .trim()
}

