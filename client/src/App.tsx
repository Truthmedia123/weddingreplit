import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import PerformanceOptimizations from "@/components/PerformanceOptimizations";
import { MobileOptimizations } from "@/components/MobileOptimizations";

import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import VendorCategory from "@/pages/VendorCategory";
import VendorProfile from "@/pages/VendorProfile";
import ListBusiness from "@/pages/ListBusiness";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Wishlist from "@/pages/Wishlist";
import Couples from "@/pages/Couples";
import CreateRSVP from "@/pages/CreateRSVP";
import TrackRSVP from "@/pages/TrackRSVP";
import PDFInvitationGenerator from "@/pages/PDFInvitationGenerator";

import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsConditions from "@/pages/TermsConditions";
import CookiePolicy from "@/pages/CookiePolicy";
import IconsDownload from "@/pages/IconsDownload";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/categories" component={Categories} />
        <Route path="/vendors/:category" component={VendorCategory} />
        <Route path="/vendor/:id" component={VendorProfile} />
        <Route path="/list-business" component={ListBusiness} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/couples/:slug" component={Couples} />
        <Route path="/create-rsvp" component={CreateRSVP} />
        <Route path="/track/:slug" component={TrackRSVP} />
        <Route path="/generate-invitation" component={PDFInvitationGenerator} />

        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-conditions" component={TermsConditions} />
        <Route path="/cookie-policy" component={CookiePolicy} />
        <Route path="/icons-download" component={IconsDownload} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PerformanceOptimizations />
        <MobileOptimizations />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
