import React from 'react';

export default function InvitationGenerator() {
  console.log('InvitationGenerator component rendered');
  
  // Get templateId from URL path
  const path = window.location.pathname;
  const templateId = path.includes('/generate-invitation/') 
    ? path.split('/generate-invitation/')[1] 
    : null;
  
  console.log('Path:', path);
  console.log('TemplateId:', templateId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4">
            Invitation Generator Test
          </h1>
          <div className="text-center space-y-4">
            <p className="text-lg">
              <strong>Path:</strong> {path}
            </p>
            <p className="text-lg">
              <strong>Template ID:</strong> {templateId || 'Not found'}
            </p>
            <p className="text-lg">
              <strong>Status:</strong> ✅ Component loaded successfully!
            </p>
            <p className="text-lg">
              <strong>Test URLs:</strong>
            </p>
            <div className="space-y-2 text-sm">
              <a href="/generate-invitation" className="block text-blue-600 hover:underline">
                • /generate-invitation (no template)
              </a>
              <a href="/generate-invitation/goan-romance" className="block text-blue-600 hover:underline">
                • /generate-invitation/goan-romance (with template)
              </a>
            </div>
            <div className="mt-8">
              <a 
                href="/" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}