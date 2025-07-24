import { Download, ExternalLink, Copy, Check } from 'lucide-react';
import React, { useState } from 'react';

interface IconData {
  icons: string[];
  total_icons: number;
  source: string;
  website: string;
  download_svg: string;
  usage: string;
  categories_mapping: { [key: string]: string };
  instructions: {
    download: string;
    format: string;
    license: string;
    usage_react: string;
  };
  generated: string;
}

export default function IconsDownload() {
  const [copied, setCopied] = useState<string | null>(null);
  const [iconData, setIconData] = useState<IconData | null>(null);

  // Load the icon data
  React.useEffect(() => {
    fetch('/category-icons.json')
      .then(res => res.json())
      .then(data => setIconData(data))
      .catch(err => console.error('Failed to load icon data:', err));
  }, []);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const downloadJson = () => {
    if (!iconData) return;
    
    const blob = new Blob([JSON.stringify(iconData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thegoanwedding-category-icons.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!iconData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 to-sea-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading icon data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-sea-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Category Icons Download
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              All {iconData.total_icons} icons used in TheGoanWedding.com category system
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={downloadJson}
                className="bg-coral-600 hover:bg-coral-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download JSON
              </button>
              <a
                href={iconData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sea-blue-600 hover:bg-sea-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Visit Lucide Icons
              </a>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Source Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Source:</span> {iconData.source}</p>
                <p><span className="font-medium">Total Icons:</span> {iconData.total_icons}</p>
                <p><span className="font-medium">Format:</span> {iconData.instructions.format}</p>
                <p><span className="font-medium">License:</span> {iconData.instructions.license}</p>
                <p><span className="font-medium">Generated:</span> {iconData.generated}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Usage Instructions</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">{iconData.instructions.download}</p>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  {iconData.instructions.usage_react}
                  <button
                    onClick={() => copyToClipboard(iconData.instructions.usage_react, 'install')}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                  >
                    {copied === 'install' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Icons List */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">All Icons ({iconData.total_icons})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
              {iconData.icons.map((icon, index) => (
                <div
                  key={index}
                  className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg cursor-pointer transition-colors"
                  onClick={() => copyToClipboard(icon, icon)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-gray-700">{icon}</span>
                    {copied === icon ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Mapping */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Icon to Category Mapping</h3>
            <div className="grid gap-3">
              {Object.entries(iconData.categories_mapping).map(([icon, category]) => (
                <div key={icon} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {icon}
                  </span>
                  <span className="text-gray-700 text-sm">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>Icons are sourced from Lucide React and are available under the ISC License.</p>
            <p>For individual icon downloads, visit <a href={iconData.website} className="text-coral-600 hover:underline">lucide.dev</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}