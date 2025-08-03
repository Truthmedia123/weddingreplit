import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { formatTime12Hour, formatFullDate, formatShortDate } from "@/utils/dateTime";
import type { Wedding, Rsvp } from "@shared/schema";

export default function Couples() {
  const { slug } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [rsvpForm, setRsvpForm] = useState({
    guestName: "",
    guestPhone: "",
    attendingCeremony: true,
    attendingReception: true,
    numberOfGuests: 1,
    message: ""
  });

  const { data: wedding, isLoading } = useQuery<Wedding>({
    queryKey: [`/api/weddings/${slug}`],
  });

  const { data: rsvps } = useQuery<Rsvp[]>({
    queryKey: [`/api/weddings/${wedding?.id}/rsvps`],
    enabled: !!wedding?.id,
  });

  const createRsvpMutation = useMutation({
    mutationFn: async (rsvpData: typeof rsvpForm) => {
      const response = await fetch(`/api/weddings/${wedding!.id}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...rsvpData, guestEmail: ""}),
      });
      if (!response.ok) throw new Error('Failed to create RSVP');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/weddings/${wedding!.id}/rsvps`] });
      toast({ title: "RSVP submitted successfully!" });
      setShowRsvpForm(false);
      setRsvpForm({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        attendingCeremony: true,
        attendingReception: true,
        numberOfGuests: 1,
        dietaryRestrictions: "",
        message: ""
      });
    },
    onError: () => {
      toast({ title: "Failed to submit RSVP", variant: "destructive" });
    }
  });

  const handleSubmitRsvp = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!rsvpForm.guestName.trim()) {
      toast({ title: "Please enter your full name", variant: "destructive" });
      return;
    }
    
    if (!rsvpForm.guestPhone.trim()) {
      toast({ title: "Please enter your phone number", variant: "destructive" });
      return;
    }
    
    createRsvpMutation.mutate(rsvpForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wedding details...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Wedding Not Found</h1>
          <p className="text-gray-600">The wedding invitation you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const weddingDate = new Date(wedding.weddingDate);
  const isRsvpOpen = true; // Always allow RSVP for now

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: wedding.coverImage 
              ? `url(${wedding.coverImage})` 
              : "url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&h=1200')"
          }}
        ></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <p className="wedding-script text-3xl mb-4 text-yellow-300">
            You're Invited to Celebrate
          </p>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight">
            <span className="block">{wedding.brideName}</span>
            <span className="wedding-script text-yellow-400 text-4xl md:text-5xl mx-8">&</span>
            <span className="block">{wedding.groomName}</span>
          </h1>
          
          <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl p-8 inline-block">
            <div className="flex items-center justify-center gap-8 text-lg">
              <div className="text-center">
                <i className="fas fa-calendar-alt text-red-500 text-2xl mb-2"></i>
                <p className="font-semibold">{formatFullDate(weddingDate)}</p>
              </div>
              
              <div className="text-center">
                <i className="fas fa-clock text-teal-500 text-2xl mb-2"></i>
                <p className="font-semibold">{formatTime12Hour(wedding.nuptialsTime)}</p>
              </div>
              
              <div className="text-center">
                <i className="fas fa-map-marker-alt text-red-500 text-2xl mb-2"></i>
                <p className="font-semibold">{wedding.venue}</p>
              </div>
            </div>
          </div>
          
          {isRsvpOpen && (
            <div className="mt-8">
              <Button
                onClick={() => setShowRsvpForm(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl transform hover:scale-105 transition-all"
              >
                <i className="fas fa-heart mr-3"></i>RSVP Now
              </Button>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Our Story */}
            {wedding.story && (
              <Card className="border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold text-center wedding-script text-red-600">
                    Our Love Story
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed text-lg">{wedding.story}</p>
                </CardContent>
              </Card>
            )}




          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Wedding Details */}
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold wedding-script text-red-600">
                  Wedding Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <i className="fas fa-calendar-alt text-red-500 mt-1"></i>
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-gray-600">{formatFullDate(weddingDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <i className="fas fa-clock text-teal-500 mt-1"></i>
                  <div>
                    <p className="font-semibold">Nuptials</p>
                    <p className="text-gray-600">{formatTime12Hour(wedding.nuptialsTime)}</p>
                  </div>
                </div>

                {wedding.receptionTime && (
                  <div className="flex items-start gap-3">
                    <i className="fas fa-glass-cheers text-yellow-500 mt-1"></i>
                    <div>
                      <p className="font-semibold">Reception</p>
                      <p className="text-gray-600">{formatTime12Hour(wedding.receptionTime)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <i className="fas fa-map-marker-alt text-red-500 mt-1"></i>
                  <div>
                    <p className="font-semibold">Venue</p>
                    <p className="text-gray-600">{wedding.venue}</p>
                    <p className="text-sm text-gray-500">{wedding.venueAddress}</p>
                  </div>
                </div>

                {wedding.rsvpDeadline && (
                  <div className="flex items-start gap-3">
                    <i className="fas fa-exclamation-circle text-yellow-500 mt-1"></i>
                    <div>
                      <p className="font-semibold">RSVP Deadline</p>
                      <p className="text-gray-600">
                        {formatShortDate(wedding.rsvpDeadline)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold wedding-script text-teal-600">
                  Questions?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-envelope text-red-500"></i>
                  <a href={`mailto:${wedding.contactEmail}`} className="text-gray-600 hover:text-red-500">
                    {wedding.contactEmail}
                  </a>
                </div>
                
                {wedding.contactPhone && (
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-red-500"></i>
                    <a href={`tel:${wedding.contactPhone}`} className="text-gray-600 hover:text-red-500">
                      {wedding.contactPhone}
                    </a>
                  </div>
                )}
                
                {wedding.contactPhone2 && (
                  <div className="flex items-center gap-3">
                    <i className="fas fa-phone text-red-500"></i>
                    <a href={`tel:${wedding.contactPhone2}`} className="text-gray-600 hover:text-red-500">
                      {wedding.contactPhone2}
                    </a>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* RSVP Modal */}
      {showRsvpForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold wedding-script text-red-600">
                  RSVP for {wedding.brideName} & {wedding.groomName}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowRsvpForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitRsvp} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guestName">Full Name *</Label>
                    <Input
                      id="guestName"
                      value={rsvpForm.guestName}
                      onChange={(e) => setRsvpForm({...rsvpForm, guestName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="guestPhone">Phone Number *</Label>
                    <Input
                      id="guestPhone"
                      type="tel"
                      value={rsvpForm.guestPhone}
                      onChange={(e) => setRsvpForm({...rsvpForm, guestPhone: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="numberOfGuests">Number of Guests</Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min="1"
                    max="10"
                    value={rsvpForm.numberOfGuests}
                    onChange={(e) => setRsvpForm({...rsvpForm, numberOfGuests: parseInt(e.target.value)})}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Attendance</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="attendingCeremony"
                      checked={rsvpForm.attendingCeremony}
                      onCheckedChange={(checked) => 
                        setRsvpForm({...rsvpForm, attendingCeremony: checked as boolean})
                      }
                    />
                    <Label htmlFor="attendingCeremony">I will attend the nuptials ceremony</Label>
                  </div>
                  
                  {wedding.receptionTime && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="attendingReception"
                        checked={rsvpForm.attendingReception}
                        onCheckedChange={(checked) => 
                          setRsvpForm({...rsvpForm, attendingReception: checked as boolean})
                        }
                      />
                      <Label htmlFor="attendingReception">I will attend the reception</Label>
                    </div>
                  )}
                </div>



                <div>
                  <Label htmlFor="message">Message for the Couple</Label>
                  <Textarea
                    id="message"
                    value={rsvpForm.message}
                    onChange={(e) => setRsvpForm({...rsvpForm, message: e.target.value})}
                    placeholder="Send your best wishes to the happy couple"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={createRsvpMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  >
                    {createRsvpMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-heart mr-2"></i>
                        Submit RSVP
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowRsvpForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}