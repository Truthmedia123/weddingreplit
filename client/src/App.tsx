import React, { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// Note: Toaster is now handled by ToastProvider
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToastProvider } from "@/components/ui/toast";
<<<<<<< HEAD
import { AnalyticsProvider } from "@/components/Performance/Analytics";
import { PWAInstallPrompt, PWAUpdatePrompt, OfflineIndicator } from "@/components/PWA/ServiceWorker";
=======
>>>>>>> c5e9b79926bcd1565a2e058d377db7ca2e3028c5

import Layout from "@/components/Layout";

// Lazy load all page components for code splitting
const Home = lazy(() => import("@/pages/Home"));
const Categories = lazy(() => import("@/pages/Categories"));
const VendorCategory = lazy(() => import("@/pages/VendorCategory"));
const VendorProfile = lazy(() => import("@/pages/VendorProfile"));
const ListBusiness = lazy(() => import("@/pages/ListBusiness"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Wishlist = lazy(() => import("@/pages/Wishlist"));
const Couples = lazy(() => import("@/pages/Couples"));
const CreateRSVP = lazy(() => import("@/pages/CreateRSVP"));
const TrackRSVP = lazy(() => import("@/pages/TrackRSVP"));

const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("@/pages/TermsConditions"));
const CookiePolicy = lazy(() => import("@/pages/CookiePolicy"));
const IconsDownload = lazy(() => import("@/pages/IconsDownload"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Wrapper component for lazy-loaded pages
const LazyPage = ({ component: Component }: { component: React.ComponentType }) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={() => <LazyPage component={Home} />} />
        <Route path="/categories" component={() => <LazyPage component={Categories} />} />
        <Route path="/vendors/:category" component={() => <LazyPage component={VendorCategory} />} />
        <Route path="/vendor/:id" component={() => <LazyPage component={VendorProfile} />} />
        <Route path="/list-business" component={() => <LazyPage component={ListBusiness} />} />
        <Route path="/blog" component={() => <LazyPage component={Blog} />} />
        <Route path="/blog/:slug" component={() => <LazyPage component={BlogPost} />} />
        <Route path="/about" component={() => <LazyPage component={About} />} />
        <Route path="/contact" component={() => <LazyPage component={Contact} />} />
        <Route path="/wishlist" component={() => <LazyPage component={Wishlist} />} />
        <Route path="/couples/:slug" component={() => <LazyPage component={Couples} />} />

        <Route path="/create-rsvp" component={() => <LazyPage component={CreateRSVP} />} />
        <Route path="/track/:slug" component={() => <LazyPage component={TrackRSVP} />} />
        <Route path="/privacy-policy" component={() => <LazyPage component={PrivacyPolicy} />} />
        <Route path="/terms-conditions" component={() => <LazyPage component={TermsConditions} />} />
        <Route path="/cookie-policy" component={() => <LazyPage component={CookiePolicy} />} />
        <Route path="/icons-download" component={() => <LazyPage component={IconsDownload} />} />
        <Route component={() => <LazyPage component={NotFound} />} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
<<<<<<< HEAD
          <AnalyticsProvider>
            <TooltipProvider>
              <PerformanceOptimizations />
              <MobileOptimizations />
              {/* Toaster functionality is now provided by ToastProvider */}
              <Router />
              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <OfflineIndicator />
            </TooltipProvider>
          </AnalyticsProvider>
=======
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
>>>>>>> c5e9b79926bcd1565a2e058d377db7ca2e3028c5
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
