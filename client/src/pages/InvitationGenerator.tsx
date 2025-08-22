import React, { useState, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Heart, Sparkles, Upload, QrCode, ArrowLeft, Star, Crown, Palette, Edit, Wand2, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import OptimizedImage from '@/components/OptimizedImage';
import LiveInvitationEditor from '@/components/LiveInvitationEditor';
import WedMeGoodStyleEditor from '@/components/WedMeGoodStyleEditor';
import InvitationPreview from '@/components/InvitationPreview';
import EnhancedFormWizard from '@/components/InvitationGenerator/EnhancedFormWizard';
import InteractiveCardEditor from '@/components/InvitationGenerator/InteractiveCardEditor';
import EnhancedTemplateGallery from '@/components/InvitationGenerator/EnhancedTemplateGallery';
import TemplateSelector from '@/components/InvitationGenerator/TemplateGallery/TemplateSelector';
import type { EnhancedTemplate } from '@/components/InvitationGenerator/TemplateGallery/TemplateManager';
import { invitationTemplates as contentTemplates, TemplateConfig } from '../../../content-templates';

// Lazy load heavy components for better performance
const LazyInvitationPreview = lazy(() => import('@/components/InvitationPreview'));
const LazyInteractiveCardEditor = lazy(() => import('@/components/InvitationGenerator/InteractiveCardEditor'));
const LazyEnhancedTemplateGallery = lazy(() => import('@/components/InvitationGenerator/EnhancedTemplateGallery'));

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2 text-muted-foreground">Loading invitation tools...</span>
  </div>
);

const invitationTemplates: EnhancedTemplate[] = [
  {
    id: 'goan-romance',
    name: 'Goan Romance',
    category: 'christian',
    style: 'Traditional Elegance',
    description: 'Classic Goan wedding invitation with vibrant floral borders and traditional typography perfect for romantic ceremonies',
    previewUrl: '/templates/template-goan-romance.jpg',
    templateData: {
      layout: 'portrait',
      elements: {
        coupleNames: { x: 200, y: 150, fontSize: 28, fontFamily: 'Dancing Script' },
        ceremonyDetails: { x: 200, y: 250, fontSize: 16, fontFamily: 'Playfair Display' },
        receptionDetails: { x: 200, y: 300, fontSize: 16, fontFamily: 'Playfair Display' },
        contactInfo: { x: 200, y: 350, fontSize: 14, fontFamily: 'Playfair Display' },
        qrCode: { x: 200, y: 450, size: 60 }
      },
      colorSchemes: [
        { name: 'Romance', primary: '#DC143C', secondary: '#228B22', accent: '#FFD700', background: '#F5F5DC' }
      ],
      typography: {
        fonts: [
          { name: 'Script', family: 'Dancing Script', weights: [400, 600, 700], category: 'script' },
          { name: 'Serif', family: 'Playfair Display', weights: [400, 600, 700], category: 'serif' }
        ]
      }
    },
    features: ['Floral Border Design', 'Traditional Typography', 'Script Fonts', 'Cultural Elements', 'Romantic Theme'],
    colors: ['Crimson Red', 'Forest Green', 'Gold', 'Cream'],
    price: 'Free',
    popular: true,
    premium: false,
    isActive: true
  }
];

interface InvitationFormData {
  bibleVerse: string;
  bibleReference: string;
  groomName: string;
  groomFatherName: string;
  groomMotherName: string;
  brideName: string;
  brideFatherName: string;
  brideMotherName: string;
  ceremonyVenue: string;
  ceremonyDay: string;
  ceremonyDate: string;
  nuptialsTime: string;
  receptionVenue: string;
  receptionTime: string;
  address1: string;
  location1: string;
  contact1: string;
  address2: string;
  location2: string;
  contact2: string;
  qrCodeImage?: string;
  // Goan Romance specific fields
  scriptureText?: string;
  hostNames?: string;
  invitationMessage?: string;
  closingMessage?: string;
}

interface GenerationResult {
  downloadToken: string;
  filename: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function InvitationGenerator() {
  const [currentView, setCurrentView] = useState<'templates' | 'customize' | 'live-editor' | 'interactive-editor' | 'enhanced-gallery'>('enhanced-gallery');
  const [selectedTemplate, setSelectedTemplate] = useState<EnhancedTemplate | null>(null);
  const [formData, setFormData] = useState<InvitationFormData>({
    bibleVerse: "I have found the one whom my soul loves",
    bibleReference: "Song of Solomon 3:4",
    groomName: "",
    groomFatherName: "",
    groomMotherName: "",
    brideName: "",
    brideFatherName: "",
    brideMotherName: "",
    ceremonyVenue: "",
    ceremonyDay: "",
    ceremonyDate: "",
    nuptialsTime: "",
    receptionVenue: "",
    receptionTime: "",
    address1: "",
    location1: "",
    contact1: "",
    address2: "",
    location2: "",
    contact2: "",
    // Goan Romance specific fields
    scriptureText: "Two hearts become one",
    hostNames: "",
    invitationMessage: "Request the honour of your presence to celebrate and share the happiness blessings of the Holy union of our children",
    closingMessage: "Your Blessing is the only Precious Gift our heart desires",
  });

  const [generatedInvitation, setGeneratedInvitation] = useState<GenerationResult | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

  // Cultural themes data
  const culturalThemes = [
    {
      id: 'christian',
      name: 'christian',
      displayName: 'Christian',
      description: 'Traditional Christian wedding themes with Portuguese colonial influences',
      colors: ['#4169E1', '#FFFFFF', '#FFD700'],
      symbols: ['Cross', 'Church', 'Rings', 'Dove'],
      typography: ['Playfair Display', 'Lato', 'Dancing Script'],
      traditions: ['Church Ceremony', 'Bible Readings', 'Wedding Vows'],
      languages: ['English', 'Portuguese', 'Konkani']
    },
    {
      id: 'hindu',
      name: 'hindu',
      displayName: 'Hindu',
      description: 'Traditional Hindu wedding themes with sacred symbols and vibrant colors',
      colors: ['#DC143C', '#FFD700', '#F4C430'],
      symbols: ['Om', 'Mandala', 'Lotus', 'Kalash'],
      typography: ['Cinzel', 'Open Sans', 'Kalam'],
      traditions: ['Mandap Ceremony', 'Saptapadi', 'Mangalsutra'],
      languages: ['English', 'Hindi', 'Sanskrit', 'Konkani']
    },
    {
      id: 'muslim',
      name: 'muslim',
      displayName: 'Muslim',
      description: 'Islamic wedding themes with geometric patterns and elegant calligraphy',
      colors: ['#50C878', '#FFD700', '#FFFFFF'],
      symbols: ['Crescent', 'Star', 'Geometric Patterns', 'Calligraphy'],
      typography: ['Amiri', 'Noto Sans', 'Scheherazade'],
      traditions: ['Nikah Ceremony', 'Mehndi', 'Walima'],
      languages: ['English', 'Arabic', 'Urdu']
    },
    {
      id: 'secular',
      name: 'secular',
      displayName: 'Secular',
      description: 'Modern non-religious themes suitable for civil ceremonies and beach weddings',
      colors: ['#2F4F4F', '#F5F5DC', '#FF69B4'],
      symbols: ['Hearts', 'Rings', 'Flowers', 'Beach Elements'],
      typography: ['Montserrat', 'Source Sans Pro', 'Pacifico'],
      traditions: ['Civil Ceremony', 'Beach Wedding', 'Garden Party'],
      languages: ['English', 'Portuguese']
    }
  ];

  const generateMutation = useMutation({
    mutationFn: async (data: InvitationFormData): Promise<GenerationResult> => {
      // Client-side validation
      const requiredFields: (keyof InvitationFormData)[] = [
        'bibleVerse', 'bibleReference', 'groomName', 'groomFatherName', 'groomMotherName',
        'brideName', 'brideFatherName', 'brideMotherName', 'ceremonyVenue', 'ceremonyDay',
        'ceremonyDate', 'nuptialsTime', 'receptionVenue', 'receptionTime', 'address1',
        'location1', 'contact1', 'address2', 'location2', 'contact2'
      ];

      const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      console.log('Sending invitation data:', JSON.stringify(data, null, 2));
      
      const response = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        if (error.errors && Array.isArray(error.errors)) {
          const errorMessages = error.errors.map((err: any) => `${err.field}: ${err.message}`).join(', ');
          throw new Error(`Validation errors: ${errorMessages}`);
        }
        throw new Error(error.message || 'Failed to generate invitation');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setGeneratedInvitation(result);
    },
  });

  const handleInputChange = (field: keyof InvitationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleQrCodeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (PNG, JPG, etc.)');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, qrCodeImage: base64 }));
        setQrCodePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQrCode = () => {
    setFormData(prev => ({ ...prev, qrCodeImage: '' }));
    setQrCodePreview(null);
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    const requiredFields: { key: keyof InvitationFormData; label: string }[] = [
      { key: 'bibleVerse', label: 'Bible Verse' },
      { key: 'bibleReference', label: 'Bible Reference' },
      { key: 'groomName', label: "Groom's Name" },
      { key: 'groomFatherName', label: "Groom's Father's Name" },
      { key: 'groomMotherName', label: "Groom's Mother's Name" },
      { key: 'brideName', label: "Bride's Name" },
      { key: 'brideFatherName', label: "Bride's Father's Name" },
      { key: 'brideMotherName', label: "Bride's Mother's Name" },
      { key: 'ceremonyVenue', label: 'Ceremony Venue' },
      { key: 'ceremonyDay', label: 'Ceremony Day' },
      { key: 'ceremonyDate', label: 'Ceremony Date' },
      { key: 'nuptialsTime', label: 'Nuptials Time' },
      { key: 'receptionVenue', label: 'Reception Venue' },
      { key: 'receptionTime', label: 'Reception Time' },
      { key: 'address1', label: 'Address 1' },
      { key: 'location1', label: 'Location 1' },
      { key: 'contact1', label: 'Contact 1' },
      { key: 'address2', label: 'Address 2' },
      { key: 'location2', label: 'Location 2' },
      { key: 'contact2', label: 'Contact 2' },
    ];

    requiredFields.forEach(({ key, label }) => {
      if (!formData[key] || formData[key].trim() === '') {
        errors.push(label);
      }
    });

    return errors;
  };

  const handleGenerate = () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(`Please fill in the following required fields:\n\n${validationErrors.join('\n')}`);
      return;
    }
    generateMutation.mutate(formData);
  };

  const handleDownload = () => {
    if (generatedInvitation) {
      window.open(generatedInvitation.downloadUrl, '_blank');
      setGeneratedInvitation(null); // Clear after download since it's one-time use
    }
  };

  const handleTemplateSelect = (template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('customize');
  };

  const handleLiveEdit = (template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('live-editor');
  };

  const handleInteractiveEdit = (template: EnhancedTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('interactive-editor');
  };

  const handleTemplatePreview = (template: EnhancedTemplate) => {
    // TODO: Implement template preview modal
    console.log('Preview template:', template.name);
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
  };

  // Enhanced Template Gallery View
  if (currentView === 'enhanced-gallery') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LazyEnhancedTemplateGallery
          onTemplateSelect={handleInteractiveEdit}
          onPreview={handleTemplatePreview}
        />
      </Suspense>
    );
  }

  // Legacy Template Gallery View
  if (currentView === 'templates') {
    return (
      <TemplateSelector
        onTemplateSelect={handleLiveEdit}
        onAnalyticsEvent={(eventType, templateId, metadata) => {
          console.log('Analytics:', eventType, templateId, metadata);
          // TODO: Send analytics to server
        }}
      />
    );
  }

  // Interactive Card Editor View
  if (currentView === 'interactive-editor' && selectedTemplate) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LazyInteractiveCardEditor
          selectedTemplate={selectedTemplate}
          onComplete={(formData) => {
            console.log('Interactive editor completed with data:', formData);
            // TODO: Generate invitation with form data
            setCurrentView('enhanced-gallery');
          }}
          onBack={handleBackToTemplates}
        />
      </Suspense>
    );
  }

  // Live Editor View - Using WedMeGoodStyleEditor for Goan Romance, EnhancedFormWizard for others
  if (currentView === 'live-editor' && selectedTemplate) {
    // Check if this is the Goan Romance template and use the new WedMeGoodStyleEditor
    if (selectedTemplate.id === 'goan-romance') {
      const goanTemplate = contentTemplates.find(t => t.id === 'goan-romance');
      if (goanTemplate) {
        return (
          <WedMeGoodStyleEditor
            selectedTemplate={goanTemplate}
            onComplete={(formData) => {
              console.log('WedMeGood editor completed with data:', formData);
              // TODO: Generate invitation with form data
              setCurrentView('enhanced-gallery');
            }}
            onBack={handleBackToTemplates}
          />
        );
      }
    }
    
    // For other templates, use the existing EnhancedFormWizard
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedFormWizard
          selectedTemplate={selectedTemplate}
          culturalThemes={culturalThemes}
          onComplete={(formData) => {
            console.log('Form completed with data:', formData);
            // TODO: Generate invitation with form data
            setCurrentView('templates');
          }}
          onBack={handleBackToTemplates}
        />
      </Suspense>
    );
  }

  // Existing Form View (Customize)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={handleBackToTemplates}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Templates
            </Button>
            
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-4xl font-bold text-gray-800">Customize Your Invitation</h1>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
          
          {selectedTemplate && (
            <div className="flex items-center justify-center mb-4">
              <img
                src={selectedTemplate.previewUrl}
                alt={selectedTemplate.name}
                className="w-24 h-32 object-cover rounded-lg border shadow-md"
              />
            </div>
          )}
          <p className="text-gray-600 text-lg">Create beautiful Christian wedding invitations with blue floral design</p>
        </div>

        {generatedInvitation ? (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Your Invitation is Ready!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                Your beautiful wedding invitation has been generated successfully. 
                Click below to download your high-resolution image (perfect for WhatsApp sharing).
              </p>
              <div className="flex gap-4">
                <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Invitation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setGeneratedInvitation(null)}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Create Another
                </Button>
              </div>
              <p className="text-sm text-green-600 mt-2">
                Note: Download link expires in 24 hours and can only be used once for security.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-800">Fill in Your Wedding Details</CardTitle>
              {generateMutation.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
                  <p className="text-red-800 text-sm font-medium">Error generating invitation:</p>
                  <p className="text-red-700 text-sm mt-1">{generateMutation.error.message}</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bible Verse Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="bibleVerse" className="text-blue-800 font-semibold">Bible Verse</Label>
                  <Textarea
                    id="bibleVerse"
                    value={formData.bibleVerse}
                    onChange={(e) => handleInputChange('bibleVerse', e.target.value)}
                    placeholder="Enter your chosen Bible verse"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bibleReference" className="text-blue-800 font-semibold">Bible Reference</Label>
                  <Input
                    id="bibleReference"
                    value={formData.bibleReference}
                    onChange={(e) => handleInputChange('bibleReference', e.target.value)}
                    placeholder="e.g., Song of Solomon 3:4"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Couple Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-pink-800 text-lg">Groom Details</h3>
                  <div>
                    <Label htmlFor="groomName" className="text-pink-700">Groom's Name</Label>
                    <Input
                      id="groomName"
                      value={formData.groomName}
                      onChange={(e) => handleInputChange('groomName', e.target.value)}
                      placeholder="Enter groom's name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groomFatherName" className="text-pink-700">Father's Name</Label>
                    <Input
                      id="groomFatherName"
                      value={formData.groomFatherName}
                      onChange={(e) => handleInputChange('groomFatherName', e.target.value)}
                      placeholder="Enter father's name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="groomMotherName" className="text-pink-700">Mother's Name</Label>
                    <Input
                      id="groomMotherName"
                      value={formData.groomMotherName}
                      onChange={(e) => handleInputChange('groomMotherName', e.target.value)}
                      placeholder="Enter mother's name"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-pink-800 text-lg">Bride Details</h3>
                  <div>
                    <Label htmlFor="brideName" className="text-pink-700">Bride's Name</Label>
                    <Input
                      id="brideName"
                      value={formData.brideName}
                      onChange={(e) => handleInputChange('brideName', e.target.value)}
                      placeholder="Enter bride's name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brideFatherName" className="text-pink-700">Father's Name</Label>
                    <Input
                      id="brideFatherName"
                      value={formData.brideFatherName}
                      onChange={(e) => handleInputChange('brideFatherName', e.target.value)}
                      placeholder="Enter father's name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="brideMotherName" className="text-pink-700">Mother's Name</Label>
                    <Input
                      id="brideMotherName"
                      value={formData.brideMotherName}
                      onChange={(e) => handleInputChange('brideMotherName', e.target.value)}
                      placeholder="Enter mother's name"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Ceremony Details */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 text-lg">Ceremony Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ceremonyVenue" className="text-green-700">Ceremony Venue</Label>
                    <Input
                      id="ceremonyVenue"
                      value={formData.ceremonyVenue}
                      onChange={(e) => handleInputChange('ceremonyVenue', e.target.value)}
                      placeholder="e.g., Our Lady of Merces Church, Merces"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceremonyDay" className="text-green-700">Day</Label>
                    <Input
                      id="ceremonyDay"
                      value={formData.ceremonyDay}
                      onChange={(e) => handleInputChange('ceremonyDay', e.target.value)}
                      placeholder="e.g., Sunday"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ceremonyDate" className="text-green-700">Date</Label>
                    <Input
                      id="ceremonyDate"
                      value={formData.ceremonyDate}
                      onChange={(e) => handleInputChange('ceremonyDate', e.target.value)}
                      placeholder="e.g., 24th April 2025"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nuptialsTime" className="text-green-700">Time</Label>
                    <Input
                      id="nuptialsTime"
                      value={formData.nuptialsTime}
                      onChange={(e) => handleInputChange('nuptialsTime', e.target.value)}
                      placeholder="e.g., 3:30 p.m."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Reception Details */}
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 text-lg">Reception Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receptionVenue" className="text-purple-700">Reception Venue</Label>
                    <Input
                      id="receptionVenue"
                      value={formData.receptionVenue}
                      onChange={(e) => handleInputChange('receptionVenue', e.target.value)}
                      placeholder="e.g., Old Heritage, Pillar"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receptionTime" className="text-purple-700">Reception Time</Label>
                    <Input
                      id="receptionTime"
                      value={formData.receptionTime}
                      onChange={(e) => handleInputChange('receptionTime', e.target.value)}
                      placeholder="e.g., 7:00 p.m."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 text-lg">Contact 1</h3>
                  <div>
                    <Label htmlFor="address1" className="text-yellow-700">Address</Label>
                    <Input
                      id="address1"
                      value={formData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value)}
                      placeholder="Enter address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location1" className="text-yellow-700">Location</Label>
                    <Input
                      id="location1"
                      value={formData.location1}
                      onChange={(e) => handleInputChange('location1', e.target.value)}
                      placeholder="e.g., Merces - Vaddy Goa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact1" className="text-yellow-700">Mobile Number</Label>
                    <Input
                      id="contact1"
                      value={formData.contact1}
                      onChange={(e) => handleInputChange('contact1', e.target.value)}
                      placeholder="Enter mobile number"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 text-lg">Contact 2</h3>
                  <div>
                    <Label htmlFor="address2" className="text-yellow-700">Address</Label>
                    <Input
                      id="address2"
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                      placeholder="Enter address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location2" className="text-yellow-700">Location</Label>
                    <Input
                      id="location2"
                      value={formData.location2}
                      onChange={(e) => handleInputChange('location2', e.target.value)}
                      placeholder="e.g., St. Joseph Vaz Ward, Sancoale Goa"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact2" className="text-yellow-700">Mobile Number</Label>
                    <Input
                      id="contact2"
                      value={formData.contact2}
                      onChange={(e) => handleInputChange('contact2', e.target.value)}
                      placeholder="Enter mobile number"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Goan Romance Template Specific Fields */}
              {selectedTemplate?.id === 'goan-romance' && (
                <div className="space-y-4 p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800 text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Goan Romance Template Fields
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scriptureText" className="text-red-700">Scripture Text</Label>
                      <Input
                        id="scriptureText"
                        value={formData.scriptureText || ''}
                        onChange={(e) => handleInputChange('scriptureText', e.target.value)}
                        placeholder="e.g., Two hearts become one"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hostNames" className="text-red-700">Host Names</Label>
                      <Textarea
                        id="hostNames"
                        value={formData.hostNames || ''}
                        onChange={(e) => handleInputChange('hostNames', e.target.value)}
                        placeholder="Enter the names of the hosts (parents/family)"
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="invitationMessage" className="text-red-700">Invitation Message</Label>
                    <Textarea
                      id="invitationMessage"
                      value={formData.invitationMessage || ''}
                      onChange={(e) => handleInputChange('invitationMessage', e.target.value)}
                      placeholder="Enter the main invitation message"
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="closingMessage" className="text-red-700">Closing Message</Label>
                    <Input
                      id="closingMessage"
                      value={formData.closingMessage || ''}
                      onChange={(e) => handleInputChange('closingMessage', e.target.value)}
                      placeholder="e.g., Your Blessing is the only Precious Gift our heart desires"
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* QR Code Upload Section */}
              <div className="space-y-4 p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-800 text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  RSVP QR Code (Optional)
                </h3>
                <p className="text-indigo-600 text-sm">
                  Upload a QR code that guests can scan to RSVP online. The QR code will be positioned at the bottom center of your invitation.
                </p>
                
                {!qrCodePreview ? (
                  <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 text-indigo-400 mx-auto mb-2" />
                    <p className="text-indigo-600 mb-2">Upload QR Code Image</p>
                    <p className="text-sm text-indigo-500 mb-4">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrCodeUpload}
                      className="hidden"
                      id="qr-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('qr-upload')?.click()}
                      className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                    >
                      Choose File
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-indigo-200">
                    <OptimizedImage
                      src={qrCodePreview}
                      alt="QR Code Preview"
                      preset="small"
                      className="w-16 h-16 object-contain border border-gray-200 rounded"
                    />
                    <div className="flex-1">
                      <p className="text-indigo-800 font-medium">QR Code Ready!</p>
                      <p className="text-indigo-600 text-sm">This will appear at the bottom of your invitation</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeQrCode}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-center pt-6">
                <Button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
                >
                  {generateMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      Generate Beautiful Invitation
                    </>
                  )}
                </Button>
              </div>

              {generateMutation.error && (
                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                  Error: {generateMutation.error.message}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}