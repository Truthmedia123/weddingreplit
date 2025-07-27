import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Download, Heart, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

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
  ceremonyTime: string;
  receptionVenue: string;
  receptionTime: string;
  address1: string;
  location1: string;
  contact1: string;
  address2: string;
  location2: string;
  contact2: string;
}

interface GenerationResult {
  downloadToken: string;
  filename: string;
  downloadUrl: string;
  expiresAt: string;
}

export default function InvitationGenerator() {
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
    ceremonyTime: "",
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

  const generateMutation = useMutation({
    mutationFn: async (data: InvitationFormData): Promise<GenerationResult> => {
      const response = await fetch('/api/invitation/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
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

  const handleGenerate = () => {
    generateMutation.mutate(formData);
  };

  const handleDownload = () => {
    if (generatedInvitation) {
      window.open(generatedInvitation.downloadUrl, '_blank');
      setGeneratedInvitation(null); // Clear after download since it's one-time use
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-pink-500" />
            <h1 className="text-4xl font-bold text-gray-800">Wedding Invitation Generator</h1>
            <Sparkles className="h-8 w-8 text-blue-500" />
          </div>
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
                    <Label htmlFor="ceremonyTime" className="text-green-700">Time</Label>
                    <Input
                      id="ceremonyTime"
                      value={formData.ceremonyTime}
                      onChange={(e) => handleInputChange('ceremonyTime', e.target.value)}
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