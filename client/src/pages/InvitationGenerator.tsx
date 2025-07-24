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
  description: string;
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
  customizable: string[];
  thumbnail?: string;
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
  const [autoGenerateEnabled, setAutoGenerateEnabled] = useState(false);

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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate invitation if all required fields are filled and auto-generate is enabled
      if (autoGenerateEnabled && newData.templateId && newData.coupleNames && newData.weddingDate && newData.venue) {
        setTimeout(() => generateMutation.mutate(newData), 500); // Debounce
      }
      
      return newData;
    });
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates && Object.entries(templates).map(([key, template]) => (
                    <div
                      key={key}
                      className={`border rounded-lg cursor-pointer transition-all overflow-hidden ${
                        formData.templateId === key
                          ? 'border-rose-500 bg-rose-50 shadow-lg ring-2 ring-rose-200'
                          : 'border-gray-200 hover:border-rose-300 hover:shadow-md'
                      }`}
                      onClick={() => handleInputChange('templateId', key)}
                    >
                      {/* Template thumbnail */}
                      {template.thumbnail && (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={`/@assets/${template.thumbnail}`}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to color preview if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                          <div 
                            className="absolute inset-0 hidden"
                            style={{
                              background: `linear-gradient(135deg, ${template.colors.secondary}, ${template.colors.accent})`
                            }}
                          >
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center space-y-2">
                                <div 
                                  className="text-2xl font-bold"
                                  style={{ 
                                    color: template.colors.text,
                                    fontFamily: template.fonts.title
                                  }}
                                >
                                  Sample
                                </div>
                                <div 
                                  className="text-lg"
                                  style={{ 
                                    color: template.colors.primary,
                                    fontFamily: template.fonts.body
                                  }}
                                >
                                  &
                                </div>
                                <div 
                                  className="text-2xl font-bold"
                                  style={{ 
                                    color: template.colors.text,
                                    fontFamily: template.fonts.title
                                  }}
                                >
                                  Names
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {formData.templateId === key && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="default" className="bg-rose-500 text-white">
                                Selected
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{template.name}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed mt-1">
                            {template.description}
                          </p>
                        </div>
                        
                        {/* Color palette preview */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Colors:</span>
                          <div className="flex gap-1">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: template.colors.primary }}
                              title="Primary"
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: template.colors.secondary }}
                              title="Background"
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: template.colors.text }}
                              title="Text"
                            />
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                              style={{ backgroundColor: template.colors.accent }}
                              title="Accent"
                            />
                          </div>
                        </div>
                        
                        {/* Customizable options */}
                        <div className="flex flex-wrap gap-1">
                          {template.customizable.slice(0, 3).map((option) => (
                            <Badge key={option} variant="outline" className="text-xs">
                              {option.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </Badge>
                          ))}
                          {template.customizable.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.customizable.length - 3} more
                            </Badge>
                          )}
                        </div>
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
                  <div 
                    className="p-6 border rounded-lg relative overflow-hidden"
                    style={{
                      backgroundColor: selectedTemplate.colors.secondary,
                      border: `3px solid ${formData.customization?.primaryColor || selectedTemplate.colors.primary}`,
                      fontFamily: selectedTemplate.fonts.body
                    }}
                  >
                    {/* Template-specific background patterns */}
                    {selectedTemplate.layout === 'botanical' && (
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 left-4 w-16 h-16 rounded-full" style={{ backgroundColor: selectedTemplate.colors.accent }}></div>
                        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full" style={{ backgroundColor: selectedTemplate.colors.accent }}></div>
                      </div>
                    )}
                    
                    {selectedTemplate.layout === 'minimalist' && (
                      <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 w-px h-full" style={{ backgroundColor: selectedTemplate.colors.accent }}></div>
                        <div className="absolute top-0 right-1/4 w-px h-full" style={{ backgroundColor: selectedTemplate.colors.accent }}></div>
                      </div>
                    )}
                    
                    {selectedTemplate.layout === 'traditional-indian' && (
                      <div className="absolute inset-0 border-8 border-opacity-20" style={{ borderColor: selectedTemplate.colors.primary }}></div>
                    )}

                    <div className="text-center space-y-4 relative z-10">
                      {/* Opening line */}
                      <p 
                        className="text-sm italic opacity-80"
                        style={{ 
                          color: formData.customization?.textColor || selectedTemplate.colors.text,
                          fontFamily: selectedTemplate.fonts.body
                        }}
                      >
                        Together with our families
                      </p>
                      
                      {/* Couple names */}
                      {formData.coupleNames && (
                        <div className="space-y-2">
                          {formData.coupleNames.includes(' & ') ? (
                            <div className="space-y-1">
                              <h2 
                                className="text-3xl font-bold"
                                style={{ 
                                  color: formData.customization?.textColor || selectedTemplate.colors.text,
                                  fontFamily: selectedTemplate.fonts.title
                                }}
                              >
                                {formData.coupleNames.split(' & ')[0]}
                              </h2>
                              <p 
                                className="text-2xl italic"
                                style={{ color: formData.customization?.primaryColor || selectedTemplate.colors.primary }}
                              >
                                &
                              </p>
                              <h2 
                                className="text-3xl font-bold"
                                style={{ 
                                  color: formData.customization?.textColor || selectedTemplate.colors.text,
                                  fontFamily: selectedTemplate.fonts.title
                                }}
                              >
                                {formData.coupleNames.split(' & ')[1]}
                              </h2>
                            </div>
                          ) : (
                            <h2 
                              className="text-3xl font-bold"
                              style={{ 
                                color: formData.customization?.textColor || selectedTemplate.colors.text,
                                fontFamily: selectedTemplate.fonts.title
                              }}
                            >
                              {formData.coupleNames}
                            </h2>
                          )}
                        </div>
                      )}
                      
                      {/* Invitation text */}
                      <p 
                        className="text-sm italic"
                        style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}
                      >
                        request the pleasure of your company<br />
                        at their wedding celebration
                      </p>
                      
                      {/* Wedding date */}
                      {formData.weddingDate && (
                        <p 
                          className="text-xl font-semibold"
                          style={{ color: formData.customization?.primaryColor || selectedTemplate.colors.primary }}
                        >
                          {formData.weddingDate}
                        </p>
                      )}
                      
                      {/* Venue */}
                      {formData.venue && (
                        <div className="space-y-1">
                          <p 
                            className="text-sm italic"
                            style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}
                          >
                            at
                          </p>
                          <p 
                            className="text-lg font-medium"
                            style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}
                          >
                            {formData.venue}
                          </p>
                        </div>
                      )}
                      
                      {/* Personal message */}
                      {formData.message && (
                        <div className="pt-4 border-t border-opacity-20" style={{ borderColor: selectedTemplate.colors.accent }}>
                          <p 
                            className="text-sm italic"
                            style={{ color: formData.customization?.textColor || selectedTemplate.colors.text }}
                          >
                            {formData.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Auto-generate toggle */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Auto-Generate</p>
                      <p className="text-xs text-gray-600">Automatically generate invitation when details change</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoGenerateEnabled}
                        onChange={(e) => setAutoGenerateEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

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
                </div>

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