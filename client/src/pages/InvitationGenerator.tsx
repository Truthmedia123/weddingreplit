import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, FileText, Calendar, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const invitationSchema = z.object({
  templateId: z.string().min(1, 'Please select a template'),
  brideName: z.string().min(1, 'Bride name is required'),
  groomName: z.string().min(1, 'Groom name is required'),
  weddingDate: z.string().min(1, 'Wedding date is required'),
  venue: z.string().min(1, 'Venue is required'),
  time: z.string().optional(),
  familyMessage: z.string().optional(),
  coupleMessage: z.string().optional(),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InvitationTemplate {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  previewImage?: string;
}

export default function InvitationGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [step, setStep] = useState(1);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);

  // Fetch invitation templates
  const { data: templates, isLoading: templatesLoading } = useQuery<InvitationTemplate[]>({
    queryKey: ['/api/invitation/templates'],
  });

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      templateId: '',
      brideName: '',
      groomName: '',
      weddingDate: '',
      venue: '',
      time: '',
      familyMessage: '',
      coupleMessage: '',
    },
  });

  // Generate invitation mutation
  const generateMutation = useMutation({
    mutationFn: async (data: InvitationFormData) => {
      const response = await apiRequest('/api/invitation/generate', 'POST', data);
      return response as unknown as { downloadUrl: string; expiresIn: number; downloadToken: string };
    },
    onSuccess: (data) => {
      setDownloadLink(data.downloadUrl);
      setExpiryTime(Date.now() + data.expiresIn);
      setStep(3);
    },
  });

  const onSubmit = (data: InvitationFormData) => {
    generateMutation.mutate(data);
  };

  const selectedTemplateData = templates?.find(t => t.slug === selectedTemplate);

  const categorizedTemplates = templates ? {
    'save-the-date': templates.filter(t => t.category === 'save-the-date'),
    'wedding-invitation': templates.filter(t => t.category === 'wedding-invitation')
  } : { 'save-the-date': [], 'wedding-invitation': [] };

  const formatTimeRemaining = () => {
    if (!expiryTime) return '';
    const remaining = expiryTime - Date.now();
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wedding Invitation Generator
          </h1>
          <p className="text-gray-600">
            Create beautiful, personalized wedding invitations and save-the-date cards
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span>Choose Template</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span>Add Details</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span>Download</span>
            </div>
          </div>
        </div>

        {/* Step 1: Template Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Choose Your Template
                </CardTitle>
                <CardDescription>
                  Select a beautiful template for your wedding invitation or save-the-date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Save the Date Templates */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Save the Date</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorizedTemplates['save-the-date'].map((template) => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all ${selectedTemplate === template.slug ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                        onClick={() => {
                          setSelectedTemplate(template.slug);
                          form.setValue('templateId', template.slug);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-pink-50 border-2 border-dashed border-blue-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            {template.previewImage ? (
                              <img 
                                src={template.previewImage} 
                                alt={template.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <div className="text-xs text-blue-600 font-medium">{template.name}</div>
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Save the Date
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Wedding Invitation Templates */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Wedding Invitations</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categorizedTemplates['wedding-invitation'].map((template) => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all ${selectedTemplate === template.slug ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
                        onClick={() => {
                          setSelectedTemplate(template.slug);
                          form.setValue('templateId', template.slug);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="aspect-[3/4] bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-200 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            {template.previewImage ? (
                              <img 
                                src={template.previewImage} 
                                alt={template.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="text-center">
                                <FileText className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                <div className="text-xs text-purple-600 font-medium">{template.name}</div>
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          <Badge variant="default" className="mt-2 text-xs">
                            Wedding Invitation
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <Button 
                    onClick={() => setStep(2)} 
                    disabled={!selectedTemplate}
                  >
                    Continue to Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Form Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Wedding Details
              </CardTitle>
              <CardDescription>
                Enter your wedding information to personalize your {selectedTemplateData?.name?.toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brideName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bride's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bride's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="groomName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Groom's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter groom's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="weddingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Wedding Date
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Ceremony Time (Optional)
                          </FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Venue
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter wedding venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="familyMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a special message from families (optional)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coupleMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Message (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add a personal message from the couple (optional)" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      Back to Templates
                    </Button>
                    <Button type="submit" disabled={generateMutation.isPending}>
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Invitation'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Download */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Your Invitation is Ready!
              </CardTitle>
              <CardDescription>
                Download your personalized wedding invitation. This link will expire in 5 minutes and can only be used once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  🔒 <strong>Security Notice:</strong> Your download link is secure and will self-destruct after one use or 5 minutes for your privacy.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                {downloadLink && (
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      Time remaining: <span className="font-mono font-semibold">{formatTimeRemaining()}</span>
                    </div>
                    <Button asChild size="lg" className="w-full md:w-auto">
                      <a href={downloadLink} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Invitation PDF
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStep(1);
                    setSelectedTemplate('');
                    setDownloadLink(null);
                    setExpiryTime(null);
                    form.reset();
                  }}
                >
                  Create Another Invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {generateMutation.isError && (
          <Alert className="mt-4">
            <AlertDescription>
              Failed to generate invitation. Please try again.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}