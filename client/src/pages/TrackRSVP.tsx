import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Calendar, MapPin, Mail, Phone, Download, Share } from "lucide-react";
import type { Wedding, Rsvp } from "@shared/schema";

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

export default function TrackRSVP() {
  const [, params] = useRoute("/track/:slug");
  const slug = params?.slug;

  const { data: wedding, isLoading: weddingLoading } = useQuery<Wedding>({
    queryKey: ["/api/weddings", slug],
    enabled: !!slug,
  });

  const { data: rsvps = [], isLoading: rsvpsLoading } = useQuery<Rsvp[]>({
    queryKey: ["/api/weddings", wedding?.id, "rsvps"],
    enabled: !!wedding?.id,
  });

  if (weddingLoading || rsvpsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading RSVP data...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RSVP Not Found</h1>
          <p className="text-gray-600">The RSVP page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const totalGuests = rsvps.reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 1), 0);
  const ceremonyAttendees = rsvps.filter(rsvp => rsvp.attendingCeremony).reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 1), 0);
  const receptionAttendees = rsvps.filter(rsvp => rsvp.attendingReception).reduce((sum, rsvp) => sum + (rsvp.numberOfGuests || 1), 0);

  const exportToCSV = () => {
    const headers = ['Guest Name', 'Email', 'Phone', 'Number of Guests', 'Attending Ceremony', 'Attending Reception', 'Dietary Restrictions', 'Message', 'RSVP Date'];
    const csvData = rsvps.map(rsvp => [
      rsvp.guestName,
      rsvp.guestEmail,
      rsvp.guestPhone || '',
      rsvp.numberOfGuests || 1,
      rsvp.attendingCeremony ? 'Yes' : 'No',
      rsvp.attendingReception ? 'Yes' : 'No',
      rsvp.dietaryRestrictions || '',
      rsvp.message || '',
      rsvp.createdAt ? new Date(rsvp.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wedding.brideName}-${wedding.groomName}-rsvps.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const shareRSVPPage = () => {
    const rsvpUrl = `${window.location.origin}/couples/${wedding.slug}`;
    if (navigator.share) {
      navigator.share({
        title: `${wedding.brideName} & ${wedding.groomName}'s Wedding`,
        text: 'Please RSVP for our wedding!',
        url: rsvpUrl,
      });
    } else {
      navigator.clipboard.writeText(rsvpUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {wedding.brideName} & {wedding.groomName}'s Wedding
          </h1>
          <p className="text-gray-600">RSVP Dashboard</p>
        </div>

        {/* Wedding Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-red-500" />
              Wedding Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {new Date(wedding.weddingDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Nuptials: {formatTime12Hour(wedding.ceremonyTime)}</span>
              </div>
              {wedding.receptionTime && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Reception: {formatTime12Hour(wedding.receptionTime)}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{wedding.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{wedding.contactEmail}</span>
              </div>
              {wedding.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{wedding.contactPhone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total RSVPs</p>
                  <p className="text-2xl font-bold text-gray-900">{rsvps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Guests</p>
                  <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nuptials</p>
                  <p className="text-2xl font-bold text-gray-900">{ceremonyAttendees}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reception</p>
                  <p className="text-2xl font-bold text-gray-900">{receptionAttendees}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
          <Button onClick={shareRSVPPage} variant="outline" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share RSVP Page
          </Button>
        </div>

        {/* RSVP Summary - Guest details are private */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {rsvps.length === 0 ? 'No RSVPs Yet' : `${rsvps.length} RSVP${rsvps.length > 1 ? 's' : ''} Received`}
              </h3>
              <p className="text-gray-600 mb-4">
                {rsvps.length === 0 
                  ? 'Share your RSVP page to start receiving responses.' 
                  : `Total of ${totalGuests} guest${totalGuests > 1 ? 's' : ''} expected to attend your wedding.`
                }
              </p>
              <div className="text-sm text-gray-500">
                <p>Guest details are kept private for privacy and security.</p>
                <p>Use the "Export to CSV" button above to download full guest information.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}