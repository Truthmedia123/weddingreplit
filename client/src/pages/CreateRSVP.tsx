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
import { Calendar, Clock, MapPin, Heart, Users, Mail, Phone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const createRSVPSchema = z.object({
  brideName: z.string().min(1, "Bride name is required"),
  groomName: z.string().min(1, "Groom name is required"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  ceremonyTime: z.string().min(1, "Ceremony time is required"),
  receptionTime: z.string().optional(),
  venue: z.string().min(1, "Venue is required"),
  venueAddress: z.string().min(1, "Venue address is required"),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  story: z.string().optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  maxGuests: z.string().transform((val) => parseInt(val) || 100),
  rsvpDeadline: z.string().optional(),
});

type CreateRSVPForm = z.infer<typeof createRSVPSchema>;

export default function CreateRSVP() {
  const [createdWedding, setCreatedWedding] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateRSVPForm>({
    resolver: zodResolver(createRSVPSchema),
    defaultValues: {
      brideName: "",
      groomName: "",
      weddingDate: "",
      ceremonyTime: "",
      receptionTime: "",
      venue: "",
      venueAddress: "",
      contactEmail: "",
      contactPhone: "",
      story: "",
      coverImage: "",
      maxGuests: "100",
      rsvpDeadline: "",
    },
  });

  const createWeddingMutation = useMutation({
    mutationFn: async (data: CreateRSVPForm) => {
      const slug = `${data.brideName.toLowerCase().replace(/\s+/g, '-')}-${data.groomName.toLowerCase().replace(/\s+/g, '-')}-${new Date(data.weddingDate).getFullYear()}`;
      
      const response = await fetch("/api/weddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          slug,
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
                  <Label htmlFor="ceremonyTime">Ceremony Time *</Label>
                  <Input
                    id="ceremonyTime"
                    type="time"
                    {...form.register("ceremonyTime")}
                  />
                  {form.formState.errors.ceremonyTime && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.ceremonyTime.message}</p>
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    type="url"
                    {...form.register("coverImage")}
                    placeholder="https://example.com/image.jpg"
                  />
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