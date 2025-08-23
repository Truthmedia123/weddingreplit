import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive, 
  MemoryStick, 
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    dependencies: HealthCheck;
  };
  metrics: {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    systemLoad: number[];
  };
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
  details?: any;
}

interface PerformanceStats {
  summary: {
    totalMetrics: number;
    totalRequests: number;
    recentMetrics: number;
    recentRequests: number;
  };
  performance: {
    last5Minutes: StatsSummary;
    lastHour: StatsSummary;
  };
  requests: {
    last5Minutes: RequestStats;
    lastHour: RequestStats;
  };
  slowestOperations: Array<{
    name: string;
    duration: number;
    timestamp: string;
    metadata?: any;
  }>;
  errorRate: number;
}

interface StatsSummary {
  count: number;
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

interface RequestStats extends StatsSummary {
  statusCodes: Record<number, number>;
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/health');
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(`Failed to fetch health status: ${(err as Error).message}`);
    }
  };

  const fetchPerformanceStats = async () => {
    try {
      const response = await fetch('/api/monitoring/performance');
      if (!response.ok) {
        throw new Error(`Performance stats failed: ${response.status}`);
      }
      const data = await response.json();
      setPerformanceStats(data);
    } catch (err) {
      setError(`Failed to fetch performance stats: ${(err as Error).message}`);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchHealthStatus(), fetchPerformanceStats()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return 'text-green-600';
      case 'degraded':
      case 'warn':
        return 'text-yellow-600';
      case 'unhealthy':
      case 'fail':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
      case 'fail':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100  } ${  sizes[i]}`;
  };

  if (loading && !healthStatus) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time health and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {healthStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              {getStatusIcon(healthStatus.status)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(healthStatus.status)}`}>
                {healthStatus.status.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">
                Environment: {healthStatus.environment}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatUptime(healthStatus.uptime)}
              </div>
              <p className="text-xs text-muted-foreground">
                Version: {healthStatus.version}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {healthStatus.metrics.responseTime.toFixed(2)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Health check response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatBytes(healthStatus.metrics.memoryUsage.heapUsed)}
              </div>
              <p className="text-xs text-muted-foreground">
                of {formatBytes(healthStatus.metrics.memoryUsage.heapTotal)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          {healthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(healthStatus.checks).map(([name, check]) => (
                <Card key={name}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">
                      {name} Check
                    </CardTitle>
                    {getStatusIcon(check.status)}
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-semibold ${getStatusColor(check.status)}`}>
                      {check.status.toUpperCase()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {check.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Duration: {check.duration.toFixed(2)}ms
                    </p>
                    {check.details && (
                      <details className="mt-2">
                        <summary className="text-xs cursor-pointer">Details</summary>
                        <pre className="text-xs mt-1 p-2 bg-muted rounded">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {performanceStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Request Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Requests:</span>
                        <span className="font-semibold">{performanceStats.summary.totalRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recent (5min):</span>
                        <span className="font-semibold">{performanceStats.summary.recentRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Error Rate:</span>
                        <span className={`font-semibold ${performanceStats.errorRate > 5 ? 'text-red-600' : 'text-green-600'}`}>
                          {performanceStats.errorRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Response Times (5min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average:</span>
                        <span className="font-semibold">{performanceStats.requests.last5Minutes.avg.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P95:</span>
                        <span className="font-semibold">{performanceStats.requests.last5Minutes.p95.toFixed(2)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">P99:</span>
                        <span className="font-semibold">{performanceStats.requests.last5Minutes.p99.toFixed(2)}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status Codes (5min)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(performanceStats.requests.last5Minutes.statusCodes).map(([code, count]) => (
                        <div key={code} className="flex justify-between">
                          <span className="text-sm">{code}:</span>
                          <Badge variant={code.startsWith('2') ? 'default' : code.startsWith('4') || code.startsWith('5') ? 'destructive' : 'secondary'}>
                            {count}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Slowest Operations</CardTitle>
                  <CardDescription>Top 10 slowest operations in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {performanceStats.slowestOperations.map((op, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{op.name}</span>
                          <p className="text-xs text-muted-foreground">{op.timestamp}</p>
                        </div>
                        <Badge variant="outline">
                          {op.duration.toFixed(2)}ms
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {healthStatus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Memory Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Heap Used</span>
                        <span>{formatBytes(healthStatus.metrics.memoryUsage.heapUsed)}</span>
                      </div>
                      <Progress 
                        value={(healthStatus.metrics.memoryUsage.heapUsed / healthStatus.metrics.memoryUsage.heapTotal) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Heap Total:</span>
                        <p className="font-semibold">{formatBytes(healthStatus.metrics.memoryUsage.heapTotal)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">External:</span>
                        <p className="font-semibold">{formatBytes(healthStatus.metrics.memoryUsage.external)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">1 minute:</span>
                      <span className="font-semibold">{healthStatus.metrics.systemLoad[0]?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">5 minutes:</span>
                      <span className="font-semibold">{healthStatus.metrics.systemLoad[1]?.toFixed(2) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">15 minutes:</span>
                      <span className="font-semibold">{healthStatus.metrics.systemLoad[2]?.toFixed(2) || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}