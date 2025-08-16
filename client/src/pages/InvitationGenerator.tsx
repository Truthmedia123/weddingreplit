import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Download, Heart, Sparkles, Upload, QrCode, ArrowLeft, Star, Crown, Palette, Edit } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import OptimizedImage from '@/components/OptimizedImage';
import LiveInvitationEditor from '@/components/LiveInvitationEditor';
import InvitationPreview from '@/components/InvitationPreview';

interface InvitationTemplate {
  id: string;
  name: string;
  category: string;
  style: string;
  description: string;
  previewImage: string;
  features: string[];
  price: string;
  popular?: boolean;
  premium?: boolean;
  colors: string[];
}

const invitationTemplates: InvitationTemplate[] = [
  {
    id: 'goan-beach-bliss',
    name: 'Goan Beach Bliss',
    category: 'Beach Wedding',
    style: 'Tropical Paradise',
    description: 'Stunning beach wedding invitation with golden sunset, palm trees, and ocean waves perfect for Goan ceremonies',
    previewImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Beach Sunset Theme', 'Palm Tree Silhouettes', 'Ocean Wave Borders', 'Tropical Typography'],
    price: 'Free',
    popular: true,
    colors: ['Coral', 'Turquoise', 'Gold']
  },
  {
    id: 'portuguese-heritage',
    name: 'Portuguese Heritage',
    category: 'Traditional',
    style: 'Colonial Elegance',
    description: 'Elegant design inspired by Portuguese colonial architecture with azulejo tile patterns and traditional motifs',
    previewImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Azulejo Tile Patterns', 'Colonial Architecture', 'Bilingual Support', 'Heritage Colors'],
    price: '₹399',
    premium: true,
    colors: ['Royal Blue', 'White', 'Gold']
  },
  {
    id: 'tropical-floral-paradise',
    name: 'Tropical Floral Paradise',
    category: 'Floral',
    style: 'Botanical Beauty',
    description: 'Vibrant tropical flowers with hibiscus, frangipani, and lush Goan greenery in watercolor style',
    previewImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Hand-painted Florals', 'Watercolor Effects', 'Tropical Botanicals', 'Vibrant Colors'],
    price: '₹299',
    colors: ['Magenta', 'Emerald', 'Sunshine Yellow']
  },
  {
    id: 'modern-goan-chic',
    name: 'Modern Goan Chic',
    category: 'Modern',
    style: 'Contemporary Coastal',
    description: 'Clean, sophisticated design blending modern typography with subtle Goan coastal elements',
    previewImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Minimalist Layout', 'Coastal Elements', 'Modern Typography', 'Clean Design'],
    price: '₹249',
    colors: ['Navy', 'Rose Gold', 'Cream']
  },
  {
    id: 'royal-goan-mandala',
    name: 'Royal Goan Mandala',
    category: 'Luxury',
    style: 'Regal Splendor',
    description: 'Opulent design with intricate mandala patterns, royal motifs, and gold embossing fit for a palace wedding',
    previewImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Intricate Mandalas', 'Gold Embossing', 'Royal Motifs', 'Luxury Finish'],
    price: '₹699',
    premium: true,
    colors: ['Deep Purple', 'Gold', 'Crimson']
  },
  {
    id: 'vintage-goan-charm',
    name: 'Vintage Goan Charm',
    category: 'Vintage',
    style: 'Old World Romance',
    description: 'Nostalgic design capturing old Goa charm with vintage illustrations and classic Portuguese elements',
    previewImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Vintage Illustrations', 'Portuguese Elements', 'Sepia Tones', 'Classic Borders'],
    price: '₹199',
    colors: ['Sepia', 'Antique Gold', 'Cream']
  },
  {
    id: 'bohemian-beach-dreams',
    name: 'Bohemian Beach Dreams',
    category: 'Boho',
    style: 'Free-spirited Coastal',
    description: 'Dreamy bohemian design with feathers, dreamcatchers, and coastal elements perfect for beach ceremonies',
    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Boho Elements', 'Feather Details', 'Coastal Vibes', 'Dreamy Typography'],
    price: '₹349',
    colors: ['Dusty Rose', 'Sage Green', 'Sand']
  },
  {
    id: 'elegant-rose-gold-goa',
    name: 'Elegant Rose Gold Goa',
    category: 'Elegant',
    style: 'Sophisticated Glamour',
    description: 'Sophisticated rose gold design with delicate florals, marble textures, and Goan architectural elements',
    previewImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Rose Gold Foiling', 'Marble Textures', 'Delicate Florals', 'Architectural Elements'],
    price: '₹449',
    premium: true,
    colors: ['Rose Gold', 'Blush Pink', 'White']
  },
  {
    id: 'rustic-goan-countryside',
    name: 'Rustic Goan Countryside',
    category: 'Rustic',
    style: 'Natural Charm',
    description: 'Charming rustic design with natural textures, countryside elements, and earthy Goan tones',
    previewImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Natural Textures', 'Countryside Elements', 'Earthy Tones', 'Rustic Typography'],
    price: '₹149',
    colors: ['Terracotta', 'Forest Green', 'Cream']
  },
  {
    id: 'art-deco-goan-glamour',
    name: 'Art Deco Goan Glamour',
    category: 'Glamour',
    style: 'Vintage Luxury',
    description: 'Glamorous 1920s Art Deco design with geometric patterns, gold accents, and colonial influences',
    previewImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Art Deco Patterns', 'Geometric Designs', 'Gold Accents', 'Colonial Influence'],
    price: '₹399',
    colors: ['Black', 'Gold', 'Champagne']
  },
  {
    id: 'destination-goa-passport',
    name: 'Destination Goa Passport',
    category: 'Destination',
    style: 'Travel Adventure',
    description: 'Unique passport-style invitation perfect for destination weddings in Goa with travel stamps and maps',
    previewImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Passport Design', 'Travel Stamps', 'Goa Map Elements', 'Adventure Theme'],
    price: '₹449',
    popular: true,
    colors: ['Navy Blue', 'Red', 'Gold']
  },
  {
    id: 'watercolor-goan-sunset',
    name: 'Watercolor Goan Sunset',
    category: 'Artistic',
    style: 'Dreamy Watercolor',
    description: 'Dreamy watercolor design capturing beautiful Goan sunsets with soft washes and artistic brush strokes',
    previewImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Watercolor Sunset', 'Soft Gradients', 'Artistic Brushstrokes', 'Dreamy Colors'],
    price: '₹299',
    colors: ['Orange', 'Pink', 'Purple']
  },
  {
    id: 'goan-catholic-traditional',
    name: 'Goan Catholic Traditional',
    category: 'Religious',
    style: 'Sacred Tradition',
    description: 'Traditional Catholic wedding invitation with religious symbols, church elements, and Goan heritage',
    previewImage: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Religious Symbols', 'Church Elements', 'Traditional Layout', 'Sacred Typography'],
    price: '₹249',
    colors: ['Ivory', 'Gold', 'Deep Blue']
  },
  {
    id: 'romantic-goan-script',
    name: 'Romantic Goan Script',
    category: 'Romantic',
    style: 'Love Story',
    description: 'Romantic calligraphy with flowing script fonts, heart motifs, and coastal romantic elements',
    previewImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Script Calligraphy', 'Heart Motifs', 'Romantic Elements', 'Coastal Romance'],
    price: '₹249',
    colors: ['Blush Pink', 'Gold', 'White']
  },
  {
    id: 'luxury-laser-cut-goa',
    name: 'Luxury Laser Cut Goa',
    category: 'Luxury',
    style: 'Premium Craftsmanship',
    description: 'Exquisite laser-cut invitation with intricate Goan patterns, premium materials, and 3D effects',
    previewImage: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
    features: ['Laser Cut Details', 'Intricate Patterns', 'Premium Materials', '3D Effects'],
    price: '₹899',
    premium: true,
    colors: ['White', 'Gold', 'Blush']
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
}

interface GenerationResult {
  downloadToken: string;
  filename: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function InvitationGenerator() {
  const [currentView, setCurrentView] = useState<'templates' | 'customize' | 'live-editor'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<InvitationTemplate | null>(null);
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
  });

  const [generatedInvitation, setGeneratedInvitation] = useState<GenerationResult | null>(null);
  const [qrCodePreview, setQrCodePreview] = useState<string | null>(null);

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
    setFormData(prev => ({ ...prev, qrCodeImage: undefined }));
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

  const handleTemplateSelect = (template: InvitationTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('customize');
  };

  const handleLiveEdit = (template: InvitationTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('live-editor');
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
    setSelectedTemplate(null);
  };

  // Template Gallery View
  if (currentView === 'templates') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-4xl font-bold text-gray-800">Choose Your Wedding Invitation</h1>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select from our beautiful collection of Goan wedding invitation templates. 
              Each design can be fully customized with your details.
            </p>
          </div>

          {/* Template Categories */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['All', 'Floral', 'Traditional', 'Modern', 'Vintage', 'Artistic', 'Luxury', 'Beach', 'Rustic', 'Boho', 'Glamour', 'Destination', 'Romantic'].map((category) => (
              <Button
                key={category}
                variant="outline"
                className="rounded-full px-4 py-2 text-sm hover:bg-pink-100 hover:border-pink-300 transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {invitationTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden bg-white border-0 rounded-2xl"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="relative">
                  <div className="w-full h-72 flex items-center justify-center bg-gray-50">
                    <InvitationPreview 
                      template={template} 
                      width={200} 
                      height={280} 
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {template.popular && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Popular
                      </Badge>
                    )}
                    {template.premium && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg">
                        <Crown className="w-3 h-3 mr-1 fill-current" />
                        Premium
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 font-bold shadow-lg">
                      {template.price}
                    </Badge>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLiveEdit(template);
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Live Edit
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline" 
                        className="bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white border-white/50 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Customize
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{template.name}</h3>
                    <Badge variant="outline" className="text-xs ml-2 shrink-0">{template.category}</Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-3 text-sm leading-relaxed">{template.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        {feature}
                      </Badge>
                    ))}
                    {template.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        +{template.features.length - 2} more
                      </Badge>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {template.colors.slice(0, 3).map((color) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ 
                              backgroundColor: color.toLowerCase().includes('gold') ? '#FFD700' :
                                             color.toLowerCase().includes('rose') ? '#F43F5E' :
                                             color.toLowerCase().includes('coral') ? '#FF7F7F' :
                                             color.toLowerCase().includes('turquoise') ? '#40E0D0' :
                                             color.toLowerCase().includes('emerald') ? '#50C878' :
                                             color.toLowerCase().includes('royal') ? '#4169E1' :
                                             color.toLowerCase().includes('purple') ? '#8A2BE2' :
                                             color.toLowerCase().includes('crimson') ? '#DC143C' :
                                             color.toLowerCase().includes('sage') ? '#9CAF88' :
                                             color.toLowerCase().includes('blush') ? '#FFC0CB' :
                                             color.toLowerCase().includes('navy') ? '#000080' :
                                             color.toLowerCase().includes('champagne') ? '#F7E7CE' :
                                             color.toLowerCase().includes('saffron') ? '#F4C430' :
                                             color.toLowerCase()
                            }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{template.style}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Need a custom design? Our designers can create something unique for you.
            </p>
            <Button variant="outline" className="rounded-full px-8 py-3">
              Request Custom Design
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Live Editor View
  if (currentView === 'live-editor' && selectedTemplate) {
    return (
      <LiveInvitationEditor
        template={{
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          previewImage: selectedTemplate.previewImage,
          baseElements: []
        }}
        onSave={(data) => {
          console.log('Saving invitation data:', data);
          // Handle save logic here
        }}
        onBack={handleBackToTemplates}
      />
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
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src={selectedTemplate.previewImage}
                alt={selectedTemplate.name}
                className="w-16 h-20 object-cover rounded border"
              />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">{selectedTemplate.name}</h2>
                <p className="text-gray-600">{selectedTemplate.category} • {selectedTemplate.price}</p>
              </div>
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