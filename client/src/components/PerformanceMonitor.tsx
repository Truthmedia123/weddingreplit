import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  BarChart3,
  Activity
} from 'lucide-react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  fmp: number; // First Meaningful Paint
  loadTime: number; // Total page load time
  bundleSize: number; // JavaScript bundle size
  cacheHitRate: number; // Cache hit rate
  memoryUsage: number; // Memory usage
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  showDetails = false, 
  className = "" 
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(showDetails);

  // Core Web Vitals thresholds
  const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 }
  };

  const getPerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100;
    
    // FCP scoring (25% weight)
    if (metrics.fcp > thresholds.fcp.poor) score -= 25;
    else if (metrics.fcp > thresholds.fcp.good) score -= 12.5;
    
    // LCP scoring (25% weight)
    if (metrics.lcp > thresholds.lcp.poor) score -= 25;
    else if (metrics.lcp > thresholds.lcp.good) score -= 12.5;
    
    // FID scoring (25% weight)
    if (metrics.fid > thresholds.fid.poor) score -= 25;
    else if (metrics.fid > thresholds.fid.good) score -= 12.5;
    
    // CLS scoring (25% weight)
    if (metrics.cls > thresholds.cls.poor) score -= 25;
    else if (metrics.cls > thresholds.cls.good) score -= 12.5;
    
    return Math.max(0, score);
  }, []);

  const getMetricStatus = useCallback((metric: keyof typeof thresholds, value: number) => {
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'needs-improvement': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || localStorage.getItem('showPerformanceMonitor') === 'true') {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const measurePerformance = () => {
      // Measure Core Web Vitals
      let fcp = 0, lcp = 0, fid = 0, cls = 0, ttfb = 0, fmp = 0;

      // First Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          fcp = entries[entries.length - 1]?.startTime || 0;
        }).observe({ entryTypes: ['paint'] });
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          lcp = entries[entries.length - 1]?.startTime || 0;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // First Input Delay
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          fid = entries[entries.length - 1]?.processingStart - entries[entries.length - 1]?.startTime || 0;
        }).observe({ entryTypes: ['first-input'] });
      }

      // Cumulative Layout Shift
      if ('PerformanceObserver' in window) {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          cls = entries.reduce((sum, entry: any) => sum + entry.value, 0);
        }).observe({ entryTypes: ['layout-shift'] });
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // First Meaningful Paint (approximation)
      fmp = performance.now();

      // Total load time
      const loadTime = performance.now();

      // Bundle size estimation
      const bundleSize = performance.getEntriesByType('resource')
        .filter((entry: any) => entry.initiatorType === 'script')
        .reduce((sum, entry: any) => sum + entry.transferSize, 0);

      // Memory usage
      const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0;

      // Cache hit rate (approximation)
      const cacheHitRate = Math.random() * 100; // This would be calculated from actual cache stats

      setMetrics({
        fcp,
        lcp,
        fid,
        cls,
        ttfb,
        fmp,
        loadTime,
        bundleSize,
        cacheHitRate,
        memoryUsage
      });
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 animate-spin" />
            <span className="text-sm">Measuring performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceScore = getPerformanceScore(metrics);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5" />
          Performance Monitor
          <Badge variant={performanceScore >= 90 ? "default" : performanceScore >= 50 ? "secondary" : "destructive"}>
            {performanceScore.toFixed(0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Score</span>
            <span className="font-medium">{performanceScore.toFixed(0)}/100</span>
          </div>
          <Progress value={performanceScore} className="h-2" />
        </div>

        {/* Core Web Vitals */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Core Web Vitals
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'fcp', label: 'FCP', value: metrics.fcp, unit: 'ms' },
              { key: 'lcp', label: 'LCP', value: metrics.lcp, unit: 'ms' },
              { key: 'fid', label: 'FID', value: metrics.fid, unit: 'ms' },
              { key: 'cls', label: 'CLS', value: metrics.cls, unit: '' }
            ].map(({ key, label, value, unit }) => {
              const status = getMetricStatus(key as keyof typeof thresholds, value);
              return (
                <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <span className="text-sm">
                    {value.toFixed(unit === '' ? 3 : 0)}{unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Metrics */}
        {showFullDetails && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Additional Metrics
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">TTFB</div>
                <div className="font-medium">{metrics.ttfb.toFixed(0)}ms</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Load Time</div>
                <div className="font-medium">{metrics.loadTime.toFixed(0)}ms</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Bundle Size</div>
                <div className="font-medium">{(metrics.bundleSize / 1024).toFixed(1)}KB</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-xs text-gray-600">Memory</div>
                <div className="font-medium">{metrics.memoryUsage.toFixed(1)}MB</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullDetails(!showFullDetails)}
          >
            {showFullDetails ? 'Hide Details' : 'Show Details'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('showPerformanceMonitor');
              setIsVisible(false);
            }}
          >
            Hide Monitor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;
