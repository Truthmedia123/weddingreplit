/**
 * ⚡ Performance Optimizations Component
 * 
 * This component monitors bundle performance and provides optimization insights.
 */

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  chunkCount: number;
  cacheHitRate: number;
}

interface BundleInfo {
  name: string;
  size: number;
  loadTime: number;
}

const PerformanceOptimizations = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [bundles, setBundles] = useState<BundleInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_SHOW_PERFORMANCE === 'true') {
      setIsVisible(true);
    }

    // Measure initial load performance
    const measurePerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        // Calculate bundle metrics
        const jsResources = resources.filter(r => r.name.includes('.js'));
        const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const totalLoadTime = jsResources.reduce((sum, r) => sum + r.duration, 0);
        
        const bundleInfo: BundleInfo[] = jsResources.map(r => ({
          name: r.name.split('/').pop() || 'unknown',
          size: r.transferSize || 0,
          loadTime: r.duration
        }));

        setBundles(bundleInfo);
        
        setMetrics({
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          bundleSize: totalSize,
          chunkCount: jsResources.length,
          cacheHitRate: calculateCacheHitRate(jsResources)
        });
      }
    };

    // Calculate cache hit rate
    const calculateCacheHitRate = (resources: PerformanceResourceTiming[]): number => {
      const cached = resources.filter(r => r.transferSize === 0).length;
      return (cached / resources.length) * 100;
    };

    // Wait for page to fully load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Monitor for route changes
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          measurePerformance();
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    return () => {
      observer.disconnect();
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  if (!isVisible || !metrics) {
    return null;
  }

  const getPerformanceScore = (): number => {
    let score = 100;
    
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.bundleSize > 1024 * 1024) score -= 15; // > 1MB
    if (metrics.chunkCount > 10) score -= 10;
    if (metrics.cacheHitRate < 50) score -= 10;
    
    return Math.max(0, score);
  };

  const score = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Load Time:</span>
          <span className={metrics.loadTime > 3000 ? 'text-red-600' : 'text-green-600'}>
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Bundle Size:</span>
          <span className={metrics.bundleSize > 1024 * 1024 ? 'text-red-600' : 'text-green-600'}>
            {(metrics.bundleSize / 1024 / 1024).toFixed(2)}MB
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Chunks:</span>
          <span className={metrics.chunkCount > 10 ? 'text-yellow-600' : 'text-green-600'}>
            {metrics.chunkCount}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Cache Hit Rate:</span>
          <span className={metrics.cacheHitRate < 50 ? 'text-red-600' : 'text-green-600'}>
            {metrics.cacheHitRate.toFixed(0)}%
          </span>
        </div>
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Performance Score:</span>
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {score}/100
            </span>
          </div>
        </div>
      </div>
      
      {bundles.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-800">
            Bundle Details ({bundles.length})
          </summary>
          <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {bundles.map((bundle, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className="text-gray-600 truncate">{bundle.name}</span>
                <span className="text-gray-800">
                  {(bundle.size / 1024).toFixed(1)}KB
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
      
      {score < 70 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <strong>Optimization needed:</strong>
          <ul className="mt-1 list-disc list-inside">
            {metrics.loadTime > 3000 && <li>Reduce load time</li>}
            {metrics.bundleSize > 1024 * 1024 && <li>Optimize bundle size</li>}
            {metrics.chunkCount > 10 && <li>Consolidate chunks</li>}
            {metrics.cacheHitRate < 50 && <li>Improve caching</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizations;