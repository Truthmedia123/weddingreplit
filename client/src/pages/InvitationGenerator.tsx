import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Heart, Calendar, MapPin, MessageSquare, Palette, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Template {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    accent: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  layout: string;
}

interface Templates {
  [key: string]: Template;
}

interface InvitationData {
  templateId: string;
  coupleNames: string;
  weddingDate: string;
  venue: string;
  message?: string;
  customization?: {
    primaryColor?: string;
    textColor?: string;
    font?: string;
  };
}

export default function InvitationGenerator() {
  const [formData, setFormData] = useState<InvitationData>({
    templateId: '',
    coupleNames: '',
    weddingDate: '',
    venue: '',
    message: '',
    customization: {}
  });

  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery<Templates>({
    queryKey: ['/api/invite/templates'],
    queryFn: async () => {
      const response = await fetch('/api/invite/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return response.json();
    }
  });

  // Generate invitation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: InvitationData) => {
      const response = await apiRequest('POST', '/api/invite/generate', data);
      return response.json();
    },
    onSuccess: (data) => {
      setDownloadUrl(data.downloadUrl);
    }
  });

  const handleInputChange = (field: keyof InvitationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomizationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      customization: {
        ...prev.customization,
        [field]: value
      }
    }));
  };

  const handleGenerate = () => {
    if (!formData.templateId || !formData.coupleNames || !formData.weddingDate || !formData.venue) {
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wedding-invitation-${formData.coupleNames.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Clear download URL after successful download
      setDownloadUrl('');
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (templatesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  const selectedTemplate = templates && formData.templateId ? templates[formData.templateId] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Wedding Invitations
          </h1>
          <p className="text-lg text-gray-600">
            Create beautiful, personalized wedding invitations with our elegant templates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  Choose Template
                </CardTitle>
                <CardDescription>
                  Select from our collection of elegant wedding invitation designs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {templates && Object.entries(templates).map(([key, template]) => (
                    <div
                      key={key}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.templateId === key
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                      onClick={() => handleInputChange('templateId', key)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <div className="flex gap-2 mt-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: template.colors.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: template.colors.secondary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: template.colors.accent }}
                            />
                          </div>
                        </div>
                        {formData.templateId === key && (
                          <Badge variant="default">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Wedding Details
                </CardTitle>
                <CardDescription>
                  Enter your wedding information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="coupleNames">Couple Names</Label>
                  <Input
                    id="coupleNames"
                    placeholder="John & Jane"
                    value={formData.coupleNames}
                    onChange={(e) => handleInputChange('coupleNames', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weddingDate">Wedding Date</Label>
                  <Input
                    id="weddingDate"
                    placeholder="Saturday, June 15th, 2024"
                    value={formData.weddingDate}
                    onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="venue">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="Paradise Beach Resort, North Goa"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Personal Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Join us for a celebration of love..."
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    Customize Colors
                  </CardTitle>
                  <CardDescription>
                    Personalize your invitation colors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="primaryColor"
                        type="color"
                        className="w-20 h-10"
                        value={formData.customization?.primaryColor || selectedTemplate.colors.primary}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder={selectedTemplate.colors.primary}
                        value={formData.customization?.primaryColor || ''}
                        onChange={(e) => handleCustomizationChange('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="textColor"
                        type="color"
                        className="w-20 h-10"
                        value={formData.customization?.textColor || selectedTemplate.colors.text}
                        onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                      />
                      <Input
                        type="text"
                        placeholder={selectedTemplate.colors.text}
                        value={formData.customization?.textColor || ''}
                        onChange={(e) => handleCustomizationChange('textColor', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview & Generation Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview & Generate</CardTitle>
                <CardDescription>
                  Review your invitation and generate the final design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate && (
                  <div className="p-6 border rounded-lg" style={{
                    background: `linear-gradient(to bottom, ${selectedTemplate.colors.accent}, ${selectedTemplate.colors.secondary})`,
                    border: `4px solid ${formData.customization?.primaryColor || selectedTemplate.colors.primary}`
                  }}>
                    <div className="text-center space-y-3">
                      <p className="text-sm font-serif italic" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                        Together with our families
                      </p>
                      {formData.coupleNames && (
                        <div>
                          {formData.coupleNames.includes(' & ') ? (
                            <div>
                              <h2 className="text-2xl font-bold font-serif" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                                {formData.coupleNames.split(' & ')[0]}
                              </h2>
                              <p className="text-xl font-serif italic" style={{ color: formData.customization?.primaryColor || selectedTemplate.colors.primary }}>
                                &
                              </p>
                              <h2 className="text-2xl font-bold font-serif" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                                {formData.coupleNames.split(' & ')[1]}
                              </h2>
                            </div>
                          ) : (
                            <h2 className="text-2xl font-bold font-serif" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                              {formData.coupleNames}
                            </h2>
                          )}
                        </div>
                      )}
                      <p className="text-sm font-serif italic" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                        request the pleasure of your company<br />
                        at their wedding celebration
                      </p>
                      {formData.weddingDate && (
                        <p className="text-lg font-bold" style={{ color: formData.customization?.primaryColor || selectedTemplate.colors.primary }}>
                          {formData.weddingDate}
                        </p>
                      )}
                      {formData.venue && (
                        <div>
                          <p className="text-sm" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>at</p>
                          <p className="text-base font-semibold" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                            {formData.venue}
                          </p>
                        </div>
                      )}
                      {formData.message && (
                        <p className="text-sm italic mt-4" style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}>
                          {formData.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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
                  Generate Invitation
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
                        <p className="font-semibold text-green-800">Invitation Ready!</p>
                        <p className="text-sm text-green-600">Your invitation has been generated and is ready for download.</p>
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
                        Download
                      </Button>
                    </div>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-700">
                        ⚠️ This download link expires after 24 hours and can only be used once for security.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}