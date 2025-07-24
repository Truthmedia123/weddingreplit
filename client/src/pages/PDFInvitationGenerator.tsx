import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Heart, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PDFTemplate {
  name: string;
  description: string;
  template: string;
  customizable: string[];
  layout: string;
}

interface PDFTemplates {
  [key: string]: PDFTemplate;
}

interface PDFInvitationData {
  templateId: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  time?: string;
  message?: string;
  customization?: {
    primaryColor?: string;
    textColor?: string;
    font?: string;
  };
}

export default function PDFInvitationGenerator() {
  const [formData, setFormData] = useState<PDFInvitationData>({
    templateId: '',
    coupleNames: '',
    weddingDate: '',
    venue: '',
    time: '',
    message: '',
    customization: {}
  });

  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery<PDFTemplates>({
    queryKey: ['/api/invite/templates'],
    queryFn: async () => {
      const response = await fetch('/api/invite/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Generate invitation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: PDFInvitationData) => {
      const response = await apiRequest('POST', '/api/invite/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setDownloadUrl(data.downloadUrl);
    }
  });

  const handleGenerate = () => {
    if (formData.templateId && formData.coupleNames && formData.weddingDate && formData.venue) {
      generateMutation.mutate(formData);
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wedding-invitation-${formData.coupleNames.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Clear download URL after successful download
        setDownloadUrl('');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const selectedTemplate = templates && formData.templateId ? templates[formData.templateId] : null;

  if (templatesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Goan Wedding Invitations
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Create beautiful, personalized PDF wedding invitations using our Goan-inspired templates
          </p>
          <p className="text-sm text-orange-600 font-medium">
            🔒 Your secure download link will self-destruct after one use for privacy
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Template Selection & Form */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {templates && Object.entries(templates).map(([id, template]) => (
                    <div
                      key={id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.templateId === id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, templateId: id }))}
                    >
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="mt-2">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {template.layout} layout
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Wedding Details Form */}
            <Card>
              <CardHeader>
                <CardTitle>Wedding Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="coupleNames">Couple Names *</Label>
                  <Input
                    id="coupleNames"
                    placeholder="e.g., Simmi & Rahul"
                    value={formData.coupleNames}
                    onChange={(e) => setFormData(prev => ({ ...prev, coupleNames: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <Input
                    id="weddingDate"
                    placeholder="e.g., December 02, 2025"
                    value={formData.weddingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, weddingDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="venue">Venue *</Label>
                  <Input
                    id="venue"
                    placeholder="e.g., 123 Road, Mumbai, Maharashtra"
                    value={formData.venue}
                    onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                  />
                </div>

                {selectedTemplate?.customizable.includes('time') && (
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      placeholder="e.g., ONE O'CLOCK IN THE AFTERNOON"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                )}

                {selectedTemplate?.customizable.includes('message') && (
                  <div>
                    <Label htmlFor="message">Custom Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Join us for an evening of celebration..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview & Generate */}
          <div className="space-y-6">
            {/* Template Preview */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border rounded-lg p-6 min-h-[400px] shadow-sm">
                    <div className="text-center space-y-4">
                      {selectedTemplate.layout === 'save-the-date' && (
                        <>
                          <h2 className="text-2xl font-bold">SAVE THE DATE</h2>
                          <div className="space-y-2">
                            {formData.coupleNames ? (
                              <>
                                <h3 className="text-xl font-semibold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[0] || 'Your Name'}</h3>
                                <p className="text-lg">AND</p>
                                <h3 className="text-xl font-semibold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[1] || 'Partner Name'}</h3>
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl font-semibold">Your Name</h3>
                                <p className="text-lg">AND</p>
                                <h3 className="text-xl font-semibold">Partner Name</h3>
                              </>
                            )}
                          </div>
                          <p className="text-sm">ARE GETTING MARRIED ON</p>
                          <p className="text-lg font-semibold">{formData.weddingDate || 'Your Wedding Date'}</p>
                        </>
                      )}

                      {selectedTemplate.layout === 'simple' && (
                        <>
                          <h2 className="text-2xl font-bold">Invitation</h2>
                          <h3 className="text-xl font-semibold">{formData.coupleNames || 'Your Names'}</h3>
                          <p className="text-lg">{formData.weddingDate || 'Your Wedding Date'}</p>
                        </>
                      )}

                      {selectedTemplate.layout === 'family' && (
                        <>
                          <p className="text-sm">TOGETHER WITH THEIR FAMILIES</p>
                          <div className="space-y-2">
                            {formData.coupleNames ? (
                              <>
                                <h3 className="text-2xl font-bold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[0] || 'Your Name'}</h3>
                                <p className="text-xl">&</p>
                                <h3 className="text-2xl font-bold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[1] || 'Partner Name'}</h3>
                              </>
                            ) : (
                              <>
                                <h3 className="text-2xl font-bold">Your Name</h3>
                                <p className="text-xl">&</p>
                                <h3 className="text-2xl font-bold">Partner Name</h3>
                              </>
                            )}
                          </div>
                          <p className="text-sm">we invite you to join our wedding</p>
                          <p className="text-lg font-semibold">{formData.weddingDate || 'Your Wedding Date'}</p>
                          {formData.time && <p className="text-sm">{formData.time}</p>}
                          <p className="text-sm">Venue: {formData.venue || 'Your Venue'}</p>
                        </>
                      )}

                      {selectedTemplate.layout === 'detailed' && (
                        <>
                          <p className="text-sm">SAVE THE DATE FOR THE WEDDING OF</p>
                          <div className="space-y-2">
                            {formData.coupleNames ? (
                              <>
                                <h3 className="text-xl font-bold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[0] || 'Your Name'}</h3>
                                <p className="text-lg">&</p>
                                <h3 className="text-xl font-bold">{formData.coupleNames.split(/\s+(?:and|&)\s+/i)[1] || 'Partner Name'}</h3>
                              </>
                            ) : (
                              <>
                                <h3 className="text-xl font-bold">Your Name</h3>
                                <p className="text-lg">&</p>
                                <h3 className="text-xl font-bold">Partner Name</h3>
                              </>
                            )}
                          </div>
                          {formData.message && (
                            <p className="text-xs text-gray-600 mt-4">{formData.message}</p>
                          )}
                          <p className="text-lg font-semibold">{formData.weddingDate || 'Your Wedding Date'}</p>
                          <p className="text-sm">{formData.venue || 'Your Venue'}</p>
                          <p className="text-xs mt-4">Warm regards,<br />Family</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={!formData.templateId || !formData.coupleNames || !formData.weddingDate || !formData.venue || generateMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {generateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Heart className="h-4 w-4 mr-2" />
                    )}
                    Generate PDF Invitation
                  </Button>

                  {generateMutation.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">
                        {generateMutation.error instanceof Error ? generateMutation.error.message : 'Failed to generate invitation'}
                      </p>
                    </div>
                  )}

                  {downloadUrl && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-green-800">PDF Invitation Ready!</p>
                          <p className="text-sm text-green-600">Your personalized wedding invitation is ready for download.</p>
                        </div>
                        <Button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          variant="outline"
                          size="sm"
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          Download PDF
                        </Button>
                      </div>
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-700">
                          🔒 This download link expires after 24 hours and can only be used once for security.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}