import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Eye, 
  EyeOff, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings,
  FileText,
  Image,
  Printer
} from 'lucide-react';

interface InvitationPage {
  id: string;
  title: string;
  type: 'main' | 'rsvp' | 'reception' | 'mehendi' | 'sangeet' | 'haldi';
  background: string;
  elements: any[];
  sampleData: {
    coupleNames: string;
    date: string;
    venue: string;
    time: string;
    parents: string;
    specialMessage: string;
  };
}

interface SuitePreviewProps {
  invitationPages: InvitationPage[];
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function SuitePreview({ 
  invitationPages, 
  onBack, 
  onDownload, 
  onShare 
}: SuitePreviewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showGuides, setShowGuides] = useState(true);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'jpg'>('png');

  const currentPage = invitationPages[currentPageIndex];

  const handlePreviousPage = () => {
    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
  };

  const handleNextPage = () => {
    setCurrentPageIndex(Math.min(invitationPages.length - 1, currentPageIndex + 1));
  };

  const handleZoomIn = () => {
    setZoom(Math.min(2, zoom + 0.1));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(0.5, zoom - 0.1));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Editor
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Invitation Suite Preview
                </h1>
                <p className="text-sm text-gray-600">
                  Review your complete wedding invitation suite before export
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowGuides(!showGuides)}
                className="flex items-center gap-2"
              >
                {showGuides ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showGuides ? 'Hide' : 'Show'} Guides
              </Button>
              <Button
                variant="outline"
                onClick={onShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                onClick={onDownload}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Suite
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {invitationPages.map((page, index) => (
                <Button
                  key={page.id}
                  variant={currentPageIndex === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPageIndex(index)}
                  className="min-w-[120px]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{index + 1}</span>
                    <span className="text-xs">{page.title}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPageIndex === invitationPages.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetZoom}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Preview Area */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{currentPage.title}</h2>
                  <p className="text-sm text-gray-600">Page {currentPageIndex + 1} of {invitationPages.length}</p>
                </div>
                <Badge variant="secondary">{currentPage.type.toUpperCase()}</Badge>
              </div>
              
              <div className="flex justify-center">
                <div
                  className="relative bg-white shadow-2xl"
                  style={{
                    width: 400 * zoom,
                    height: 600 * zoom,
                    backgroundImage: `url(${currentPage.background})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  {currentPage.elements.map((element) => (
                    <div
                      key={element.id}
                      className="absolute"
                      style={{
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.width}%`,
                        height: `${element.height}%`,
                        fontSize: element.fontSize * zoom,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        textAlign: element.textAlign,
                        transform: `translate(-50%, -50%) rotate(${element.rotation}deg)`,
                        transformOrigin: 'center',
                        opacity: element.opacity,
                        zIndex: element.zIndex,
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.2'
                      }}
                    >
                      {element.content}
                    </div>
                  ))}

                  {/* Design Guides */}
                  {showGuides && (
                    <>
                      <div className="absolute inset-0 border-2 border-blue-500 border-dashed opacity-30 pointer-events-none" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-50 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 opacity-50 pointer-events-none" />
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500 opacity-50 pointer-events-none" />
                      <div className="absolute top-0 right-0 w-1 h-full bg-red-500 opacity-50 pointer-events-none" />
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Export Options */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Export Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'png' | 'pdf' | 'jpg')}
                      className="w-full mt-1 p-2 border rounded"
                    >
                      <option value="png">PNG (High Quality)</option>
                      <option value="pdf">PDF (Print Ready)</option>
                      <option value="jpg">JPG (Web Optimized)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Resolution</label>
                    <select className="w-full mt-1 p-2 border rounded">
                      <option value="high">High (300 DPI)</option>
                      <option value="medium">Medium (150 DPI)</option>
                      <option value="low">Low (72 DPI)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Include All Pages</label>
                    <div className="mt-2 space-y-2">
                      {invitationPages.map((page, index) => (
                        <label key={page.id} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{page.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onDownload}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Download All Pages
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onDownload}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Download Current Page
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={onDownload}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print Suite
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Page Thumbnails */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">All Pages</h3>
                <div className="space-y-2">
                  {invitationPages.map((page, index) => (
                    <div
                      key={page.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        currentPageIndex === index ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentPageIndex(index)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-12 bg-cover bg-center rounded border"
                          style={{ backgroundImage: `url(${page.background})` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{page.title}</p>
                          <p className="text-xs text-gray-500">{page.type}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {invitationPages.length} pages in suite
            </span>
            <span className="text-sm text-gray-600">
              Format: {exportFormat.toUpperCase()}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              Back to Editor
            </Button>
            <Button onClick={onDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download Complete Suite
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
