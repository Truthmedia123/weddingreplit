import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Heart, Upload, X, Download, MessageCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatLongDate } from "@/utils/dateTime";

import { useToast } from "@/hooks/use-toast";

const createRSVPSchema = z.object({
  brideName: z.string().min(1, "Bride name is required"),
  groomName: z.string().min(1, "Groom name is required"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  nuptialsTime: z.string().min(1, "Nuptials time is required"),
  receptionTime: z.string().optional(),
  venue: z.string().min(1, "Venue is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  contactPhone2: z.string().optional(),
  story: z.string().optional(),
  coverImage: z.string().optional(),
  maxGuests: z.string().min(1).transform((val) => parseInt(val) || 100),
  rsvpDeadline: z.string().optional(),
});

type CreateRSVPForm = z.infer<typeof createRSVPSchema>;

export default function CreateRSVP() {
  const [createdWedding, setCreatedWedding] = useState<any>(null);

  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateRSVPForm>({
    resolver: zodResolver(createRSVPSchema),
    defaultValues: {
      brideName: "",
      groomName: "",
      weddingDate: "",
      nuptialsTime: "",
      receptionTime: "",
      venue: "",
      venueAddress: "",
      contactEmail: "",
      contactPhone: "",
      contactPhone2: "",
      story: "",
      coverImage: "",
      maxGuests: "100",
      rsvpDeadline: "",
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    form.setValue("coverImage", "");
  };

  const createWeddingMutation = useMutation({
    mutationFn: async (data: CreateRSVPForm) => {
      const slug = `${data.brideName.toLowerCase().replace(/\s+/g, '-')}-${data.groomName.toLowerCase().replace(/\s+/g, '-')}-${new Date(data.weddingDate).getFullYear()}`;
      
      // Use the image preview (base64) as the cover image if available
      const coverImageUrl = imagePreview || "";
      
      const response = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slug,
          coverImage: coverImageUrl,
          weddingDate: new Date(data.weddingDate).toISOString(),
          rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline).toISOString() : null,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create wedding");
      return response.json();
    },
    onSuccess: (wedding) => {
      setCreatedWedding(wedding);
      toast({
        title: "RSVP Page Created!",
        description: "Your wedding RSVP page has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weddings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create RSVP page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateRSVPForm) => {
    createWeddingMutation.mutate(data);
  };

  const downloadRSVPInfo = () => {
    if (!createdWedding) return;
    
    const rsvpInfo = `
${createdWedding.brideName} & ${createdWedding.groomName}'s Wedding

Wedding Date: ${formatLongDate(createdWedding.weddingDate)}
Nuptials Time: ${createdWedding.nuptialsTime}
Reception Time: ${createdWedding.receptionTime || 'TBD'}
Venue: ${createdWedding.venue}
Address: ${createdWedding.venueAddress}

RSVP Link: ${window.location.origin}/couples/${createdWedding.slug}
Track RSVPs: ${window.location.origin}/track/${createdWedding.slug}

Contact: ${createdWedding.contactEmail}
${createdWedding.contactPhone ? `Phone: ${createdWedding.contactPhone}` : ''}

${createdWedding.story ? `Our Story: ${createdWedding.story}` : ''}
    `.trim();

    const blob = new Blob([rsvpInfo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${createdWedding.brideName}-${createdWedding.groomName}-wedding-info.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareViaWhatsApp = () => {
    if (!createdWedding) return;
    
    const rsvpUrl = `${window.location.origin}/couples/${createdWedding.slug}`;
    const message = `🎊 We're getting married! 💒

${createdWedding.brideName} & ${createdWedding.groomName}

📅 Date: ${formatLongDate(createdWedding.weddingDate)}
🕐 Time: ${createdWedding.nuptialsTime}
📍 Venue: ${createdWedding.venue}

Please RSVP here: ${rsvpUrl}

We can't wait to celebrate with you! 💕`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (createdWedding) {
    const rsvpUrl = `${window.location.origin}/couples/${createdWedding.slug}`;
    const trackUrl = `${window.location.origin}/track/${createdWedding.slug}`;

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              RSVP Page Created Successfully!
            </h1>
            <p className="text-lg text-gray-600">
              Your wedding RSVP page is now live and ready to share
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Share Your RSVP Page
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium">RSVP Page Link</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="text"
                      readOnly
                      value={rsvpUrl}
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      className="ml-2"
                      onClick={() => navigator.clipboard.writeText(rsvpUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={shareViaWhatsApp}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share via WhatsApp
                  </Button>
                  <Button 
                    onClick={downloadRSVPInfo}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Info
                  </Button>
                </div>

                <div>
                  <Label className="text-sm font-medium">Track RSVPs</Label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="text"
                      readOnly
                      value={trackUrl}
                      className="flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      className="ml-2"
                      onClick={() => navigator.clipboard.writeText(trackUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href={`/couples/${createdWedding.slug}`}>
                    <Button className="flex-1">View RSVP Page</Button>
                  </Link>
                  <Link href={`/track/${createdWedding.slug}`}>
                    <Button variant="outline" className="flex-1">Track Responses</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  QR Code for Easy Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG value={rsvpUrl} size={200} />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Share this QR code on your wedding invitations or social media
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Wedding RSVP Page
          </h1>
          <p className="text-lg text-gray-600">
            Share your special day with guests through a beautiful, personalized RSVP page
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wedding Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="brideName">Bride's Name *</Label>
                  <Input
                    id="brideName"
                    {...form.register("brideName")}
                    placeholder="Enter bride's name"
                  />
                  {form.formState.errors.brideName && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.brideName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="groomName">Groom's Name *</Label>
                  <Input
                    id="groomName"
                    {...form.register("groomName")}
                    placeholder="Enter groom's name"
                  />
                  {form.formState.errors.groomName && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.groomName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="weddingDate">Wedding Date *</Label>
                  <Input
                    id="weddingDate"
                    type="date"
                    {...form.register("weddingDate")}
                  />
                  {form.formState.errors.weddingDate && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.weddingDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                  <Input
                    id="rsvpDeadline"
                    type="date"
                    {...form.register("rsvpDeadline")}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nuptialsTime">Nuptials Time *</Label>
                  <Input
                    id="nuptialsTime"
                    type="time"
                    {...form.register("nuptialsTime")}
                  />
                  {form.formState.errors.nuptialsTime && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.nuptialsTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="receptionTime">Reception Time</Label>
                  <Input
                    id="receptionTime"
                    type="time"
                    {...form.register("receptionTime")}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue">Venue Name *</Label>
                <Input
                  id="venue"
                  {...form.register("venue")}
                  placeholder="Wedding venue name"
                />
                {form.formState.errors.venue && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.venue.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="venueAddress">Venue Address *</Label>
                <Input
                  id="venueAddress"
                  {...form.register("venueAddress")}
                  placeholder="Full venue address"
                />
                {form.formState.errors.venueAddress && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.venueAddress.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    {...form.register("contactEmail")}
                    placeholder="your.email@example.com"
                  />
                  {form.formState.errors.contactEmail && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    {...form.register("contactPhone")}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactPhone2">Contact Phone 2 (Optional)</Label>
                <Input
                  id="contactPhone2"
                  type="tel"
                  {...form.register("contactPhone2")}
                  placeholder="+91 98765 43211"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="coverImage">Cover Image</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="coverImage"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                        </div>
                        <Input
                          id="coverImage"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Cover preview"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxGuests">Expected Guests</Label>
                  <Input
                    id="maxGuests"
                    type="number"
                    {...form.register("maxGuests")}
                    placeholder="100"
                    min="1"
                    defaultValue="100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="story">Your Love Story</Label>
                <Textarea
                  id="story"
                  {...form.register("story")}
                  placeholder="Share your love story with your guests..."
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createWeddingMutation.isPending}
              >
                {createWeddingMutation.isPending ? "Creating..." : "Create RSVP Page"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}