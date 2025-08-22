import React from 'react';

export default function TestInvitationGenerator() {
  console.log('TestInvitationGenerator component rendered');
  
  // Get templateId from URL path
  const path = window.location.pathname;
  const templateId = path.split('/test-invitation/')[1];
  
  console.log('Path:', path);
  console.log('TemplateId:', templateId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4">
            Test Invitation Generator
          </h1>
          <div className="text-center space-y-4">
            <p className="text-lg">
              <strong>Path:</strong> {path}
            </p>
            <p className="text-lg">
              <strong>Template ID:</strong> {templateId || 'Not found'}
            </p>
            <p className="text-lg">
              <strong>Status:</strong> ✅ Test component loaded successfully!
            </p>
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
