import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SocialShare({ url, title, description, className = '' }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const shareData = {
    title,
    text: description || title,
    url: fullUrl,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setIsOpen(false);
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareToWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${fullUrl}`)}`;
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden md:inline">Share</span>
      </Button>

      {isOpen && !navigator.share && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-50">
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="justify-start gap-2 text-left"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareToFacebook}
              className="justify-start gap-2 text-left"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareToTwitter}
              className="justify-start gap-2 text-left"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={shareToWhatsApp}
              className="justify-start gap-2 text-left"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}