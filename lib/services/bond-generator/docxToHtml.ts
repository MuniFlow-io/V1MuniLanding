/**
 * DOCX to HTML Converter Service
 * Converts bond form DOCX templates to HTML for visual tagging
 *
 * ATOMIC SERVICE: One job - convert DOCX buffer to HTML string
 * INPUT: Buffer (DOCX file)
 * OUTPUT: ServiceResult<{ html: string; rawText: string }>
 * SIDE EFFECTS: None (pure conversion)
 *
 * ENHANCED: Comprehensive style mapping for accurate document rendering
 */

import { failure, ServiceResult, success } from '@/lib/errors/ApiError';
import { logger } from '@/lib/logger';
import * as mammoth from 'mammoth';

export interface DocxToHtmlResult {
  html: string;
  rawText: string;
  messages: string[];
}

/**
 * Convert DOCX buffer to HTML with comprehensive formatting preservation
 * Uses mammoth.js with extensive style mappings
 *
 * @param docxBuffer - DOCX file buffer
 * @returns HTML string with preserved formatting
 */
export async function convertDocxToHtml(
  docxBuffer: Buffer
): Promise<ServiceResult<DocxToHtmlResult>> {
  logger.info('Converting DOCX to HTML with enhanced formatting');

  try {
    // Convert with comprehensive style map for accurate rendering
    const result = await mammoth.convertToHtml(
      { buffer: docxBuffer },
      {
        // Comprehensive style mappings for legal document formatting
        styleMap: [
          // Headings
          "p[style-name='Heading 1'] => h1.doc-heading-1:fresh",
          "p[style-name='Heading 2'] => h2.doc-heading-2:fresh",
          "p[style-name='Heading 3'] => h3.doc-heading-3:fresh",
          "p[style-name='Heading 4'] => h4.doc-heading-4:fresh",
          "p[style-name='Heading 5'] => h5.doc-heading-5:fresh",
          "p[style-name='Heading 6'] => h6.doc-heading-6:fresh",

          // Title styles
          "p[style-name='Title'] => h1.doc-title:fresh",
          "p[style-name='*Title-Bold'] => h1.doc-title-bold:fresh",
          "p[style-name='*Title-BoldItal'] => h1.doc-title-bold-italic:fresh",

          // Body text variants
          "p[style-name='Body Text'] => p.doc-body",
          "p[style-name='BodyText'] => p.doc-body",
          "p[style-name='Body Text Continued'] => p.doc-body-continued",
          "p[style-name='BodyTextContinued'] => p.doc-body-continued",
          "p[style-name='Body Text spacing 1.5'] => p.doc-body-spaced",
          "p[style-name='BodyTextspacing15'] => p.doc-body-spaced",
          "p[style-name='*BodyTxt-0.5\"'] => p.doc-body-indent",
          "p[style-name='00 Body Text .5'] => p.doc-body-indent",
          "p[style-name='No Spacing'] => p.doc-no-spacing",

          // Text formatting
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => em",
          'u => u.doc-underline',
          'strike => s.doc-strikethrough',

          // Lists
          "p[style-name='List Paragraph'] => p.doc-list-para",

          // Special formatting for blanks/underscores
          "r[style-name='Underline'] => span.doc-blank-space",
        ],

        // Preserve tables with full structure
        includeDefaultStyleMap: true,

        // Convert images to embedded data URLs
        convertImage: mammoth.images.imgElement((image) => {
          return image.read('base64').then((imageBuffer) => {
            return {
              src: `data:${image.contentType};base64,${imageBuffer}`,
            };
          });
        }),
      }
    );

    // Extract raw text for reference
    const textResult = await mammoth.extractRawText({ buffer: docxBuffer });

    if (!result.value) {
      return failure('CONVERSION_ERROR', 'DOCX conversion returned empty HTML');
    }

    // Enhanced HTML wrapper with comprehensive CSS for legal document formatting
    const styledHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      background: #fff;
      padding: 2rem;
      max-width: 100%;
      margin: 0;
    }
    
    @media (min-width: 768px) {
      body {
        padding: 3rem 4rem;
        max-width: 8.5in;
        margin: 0 auto;
      }
    }
    
    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      page-break-after: avoid;
      line-height: 1.4;
    }
    
    h1.doc-title,
    h1.doc-heading-1 { font-size: 16pt; text-align: center; }
    h1.doc-title-bold { font-size: 16pt; font-weight: bold; text-align: center; }
    h1.doc-title-bold-italic { font-size: 16pt; font-weight: bold; font-style: italic; text-align: center; }
    h2.doc-heading-2 { font-size: 14pt; }
    h3.doc-heading-3 { font-size: 13pt; }
    h4.doc-heading-4 { font-size: 12pt; }
    h5.doc-heading-5 { font-size: 11pt; }
    h6.doc-heading-6 { font-size: 10pt; }
    
    /* Paragraphs */
    p {
      margin-bottom: 1rem;
      text-align: left;
      text-indent: 0;
    }
    
    p.doc-body {
      margin-bottom: 1.5rem;
    }
    
    p.doc-body-continued {
      margin-bottom: 6pt;
      text-indent: 0;
    }
    
    p.doc-body-spaced {
      line-height: 1.5;
      margin-bottom: 12pt;
    }
    
    p.doc-body-indent {
      text-indent: 0.5in;
    }
    
    p.doc-no-spacing {
      margin-bottom: 0;
      line-height: 1;
    }
    
    p.doc-list-para {
      margin-left: 0.5in;
      text-indent: -0.25in;
    }
    
    /* Text formatting */
    strong {
      font-weight: bold;
    }
    
    em {
      font-style: italic;
    }
    
    u.doc-underline {
      text-decoration: underline;
    }
    
    s.doc-strikethrough {
      text-decoration: line-through;
    }
    
    /* Blank spaces - make them selectable and visible */
    span.doc-blank-space {
      background-color: transparent;
      border-bottom: 1px solid #000;
      min-width: 2in;
      display: inline-block;
      padding: 0 2px;
    }
    
    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 12pt 0;
      font-size: inherit;
    }
    
    td, th {
      border: 1px solid #000;
      padding: 6pt;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    
    /* Lists */
    ul, ol {
      margin-left: 0.5in;
      margin-bottom: 12pt;
    }
    
    li {
      margin-bottom: 6pt;
    }
    
    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 12pt auto;
    }
    
    /* Selection highlighting for tagging */
    ::selection {
      background-color: #4CAF50;
      color: white;
    }
    
    ::-moz-selection {
      background-color: #4CAF50;
      color: white;
    }
    
    /* Tagged text highlighting */
    .tagged-text {
      background-color: #F3E8FF;
      border: 2px solid #47006C;
      border-radius: 4px;
      padding: 2px 6px;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
      display: inline-block;
    }
    
    .tagged-text:hover {
      background-color: #E0D1F5;
      border-color: #35024F;
      box-shadow: 0 2px 8px rgba(71, 0, 108, 0.15);
    }
    
    .tagged-text[data-tag]::after {
      content: attr(data-tag);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: #47006C;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10pt;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .tagged-text[data-tag]:hover::after {
      opacity: 1;
    }
    
    /* Print styles */
    @media print {
      body {
        padding: 0;
        max-width: none;
      }
      
      .tagged-text {
        border: none;
        background: none;
      }
    }
  </style>
</head>
<body>
  ${result.value}
  
  <script>
    // Enable text selection for manual tagging
    document.body.style.userSelect = 'text';
    document.body.style.cursor = 'text';
    
    // Send selection events to parent for tagging
    document.addEventListener('mouseup', function() {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        window.parent.postMessage({
          type: 'TEXT_SELECTED',
          text: selection.toString(),
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          }
        }, '*');
      }
    });
    
    // Handle clicking on tagged text to remove/change tag
    document.addEventListener('click', function(event) {
      const target = event.target;
      if (target.classList && target.classList.contains('tagged-text')) {
        event.preventDefault();
        event.stopPropagation();
        
        // Notify parent that user wants to change this tag
        window.parent.postMessage({
          type: 'TAG_CLICKED',
          tagId: target.getAttribute('data-tag-id'),
          currentTag: target.getAttribute('data-tag'),
          text: target.textContent,
        }, '*');
      }
    });
    
    // Listen for tag assignment from parent
    window.addEventListener('message', function(event) {
      if (event.data.type === 'ASSIGN_TAG') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.className = 'tagged-text';
          span.setAttribute('data-tag', event.data.tag);
          span.setAttribute('data-tag-id', event.data.tagId);
          
          try {
            range.surroundContents(span);
            selection.removeAllRanges();
            
            // Notify parent that tag was applied
            window.parent.postMessage({
              type: 'TAG_APPLIED',
              tagId: event.data.tagId,
              tag: event.data.tag,
              text: span.textContent,
            }, '*');
          } catch (e) {
            logger.error('Bond Generator: Failed to apply tag in iframe', {
              tagId: event.data.tagId,
              error: e instanceof Error ? e.message : 'Unknown error',
            });
          }
        }
      } else if (event.data.type === 'REMOVE_TAG') {
        // Find and remove the tagged span, restore original text
        const selector = '[data-tag-id="' + event.data.tagId + '"]';
        const taggedElement = document.querySelector(selector);
        if (taggedElement) {
          const text = taggedElement.textContent;
          const textNode = document.createTextNode(text);
          taggedElement.parentNode.replaceChild(textNode, taggedElement);
          
          // Notify parent that tag was removed
          window.parent.postMessage({
            type: 'TAG_REMOVED',
            tagId: event.data.tagId,
          }, '*');
        }
      }
    });
  </script>
</body>
</html>
    `;

    // Collect warnings from mammoth
    const warnings = result.messages.map((m) => m.message);
    if (warnings.length > 0) {
      logger.warn('DOCX conversion warnings', { warnings });
    }

    logger.info('DOCX converted to HTML successfully', {
      htmlLength: styledHtml.length,
      textLength: textResult.value.length,
      warningCount: warnings.length,
    });

    return success({
      html: styledHtml,
      rawText: textResult.value,
      messages: warnings,
    });
  } catch (error) {
    logger.error('DOCX to HTML conversion failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return failure('CONVERSION_ERROR', 'Failed to convert DOCX to HTML', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
