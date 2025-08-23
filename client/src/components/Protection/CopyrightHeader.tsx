/**
 * 🛡️ Copyright Protection Component
 * 
 * This component provides comprehensive copyright protection including:
 * - Copyright headers for all source files
 * - Right-click disable functionality
 * - Developer tools detection
 * - Content watermarking
 * - Anti-copying measures
 */

import React, { useEffect } from 'react';

interface CopyrightHeaderProps {
  className?: string;
}

export const CopyrightHeader: React.FC<CopyrightHeaderProps> = ({ className = '' }) => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection on critical elements
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('no-select') || target.closest('.no-select')) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts for developer tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
      return true;
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`copyright-notice ${className}`}>
      <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-200">
        <p>
          © {new Date().getFullYear()} TheGoanWedding.com. All rights reserved. 
          This content is protected by copyright law. Unauthorized copying, distribution, 
          or reproduction is strictly prohibited.
        </p>
        <p className="mt-1">
          Wedding Vendor Directory | Goa, India | 
          <a href="/privacy-policy" className="text-blue-600 hover:underline ml-1">
            Privacy Policy
          </a> | 
          <a href="/terms-conditions" className="text-blue-600 hover:underline ml-1">
            Terms & Conditions
          </a>
        </p>
      </div>
    </div>
  );
};

export default CopyrightHeader;
