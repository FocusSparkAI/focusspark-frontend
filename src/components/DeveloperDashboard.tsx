import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Home,
  Code,
  Database,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Server,
  Key,
} from 'lucide-react';
import { toast } from 'sonner';

interface DeveloperDashboardProps {
  onNavigate: (page: string) => void;
}

const apiEndpoints = [
  {
    category: 'Authentication',
    endpoints: [
      { method: 'POST', path: '/auth/signup', description: 'Create new user account' },
      { method: 'POST', path: '/auth/login', description: 'Sign in with email/password' },
      { method: 'POST', path: '/auth/oauth/google', description: 'Google OAuth login' },
      { method: 'POST', path: '/auth/logout', description: 'Sign out current user' },
      { method: 'POST', path: '/auth/reset-password', description: 'Password recovery' },
    ],
  },
  {
    category: 'Focus Services',
    endpoints: [
      { method: 'POST', path: '/ai/summarize', description: 'Generate document summary' },
      { method: 'POST', path: '/focus/analyze', description: 'Analyze focus session metrics' },
      { method: 'POST', path: '/focus/recommend', description: 'Generate focus recommendations' },
      { method: 'POST', path: '/notes/summarize', description: 'Create study note summary' },
    ],
  },
  {
    category: 'Data Management',
    endpoints: [
      { method: 'GET', path: '/api/sessions', description: 'Fetch focus sessions' },
      { method: 'POST', path: '/api/sessions', description: 'Create new session' },
      { method: 'GET', path: '/api/goals', description: 'Get study goals' },
      { method: 'POST', path: '/api/goals', description: 'Create study goal' },
      { method: 'GET', path: '/api/achievements', description: 'Get user achievements' },
      { method: 'PUT', path: '/api/achievements/:id', description: 'Update achievement' },
    ],
  },
];

const databaseTables = [
  {
    name: 'users',
    columns: ['id', 'email', 'name', 'avatar_url', 'created_at', 'settings'],
  },
  {
    name: 'sessions',
    columns: ['id', 'user_id', 'duration', 'focus_score', 'distractions', 'created_at'],
  },
  {
    name: 'study_goals',
    columns: ['id', 'user_id', 'title', 'target_minutes', 'created_at'],
  },
  {
    name: 'achievements',
    columns: ['id', 'user_id', 'badge_id', 'unlocked_at', 'progress'],
  },
  {
    name: 'focus_reports',
    columns: ['id', 'user_id', 'session_id', 'score', 'summary', 'created_at'],
  },
];

export function DeveloperDashboard({ onNavigate }: DeveloperDashboardProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [showApiKeys, setShowApiKeys] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('dashboard')}
              className="hover:bg-accent"
            >
              <Home className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="gradient-text flex items-center gap-2">
                <Code className="w-6 h-6" />
                Developer Dashboard
              </h1>
              <p className="text-sm text-secondary">API Reference & System Schema</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="api" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
            <TabsTrigger value="database">Database Schema</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>

          {/* API Endpoints Tab */}
          <TabsContent value="api" className="space-y-6">
            {apiEndpoints.map((category, idx) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="w-5 h-5 text-blue-400" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.endpoints.map((endpoint) => (
                      <div
                        key={`${endpoint.method}-${endpoint.path}`}
                        className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                endpoint.method === 'GET'
                                  ? 'default'
                                  : endpoint.method === 'POST'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className={`w-16 justify-center ${
                                endpoint.method === 'GET'
                                  ? 'bg-green-500/20 text-green-400'
                                  : endpoint.method === 'POST'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm">{endpoint.path}</code>
                          </div>
                          <button
                            onClick={() => copyToClipboard(endpoint.path)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {copiedEndpoint === endpoint.path ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-secondary" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-secondary pl-20">{endpoint.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Base URL Card */}
            <Card className="bg-card border-blue-500/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm mb-1">
                      <strong>Base URL:</strong>
                    </p>
                    <code className="text-sm text-blue-400">
                      https://api.focusspark.com/v1
                    </code>
                    <p className="text-xs text-secondary mt-2">
                      All endpoints are prefixed with the base URL. Authentication requires
                      Bearer token in Authorization header.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Schema Tab */}
          <TabsContent value="database" className="space-y-6">
            {databaseTables.map((table, idx) => (
              <motion.div
                key={table.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-card border-border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      Table: <code className="text-purple-400">{table.name}</code>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {table.columns.map((column) => (
                        <div
                          key={column}
                          className="p-3 rounded-lg bg-muted/50 text-center group hover:bg-purple-500/10 transition-colors"
                        >
                          <code className="text-sm text-purple-400">{column}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Supabase Info */}
            <Card className="bg-card border-purple-500/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm mb-2">
                      <strong>Database Provider:</strong> Supabase (PostgreSQL)
                    </p>
                    <p className="text-xs text-secondary mb-2">
                      Row Level Security (RLS) enabled on all tables. Users can only access
                      their own data.
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowApiKeys(!showApiKeys)}
                        className="gap-2"
                      >
                        {showApiKeys ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        {showApiKeys ? 'Hide' : 'Show'} API Keys
                      </Button>
                    </div>
                    {showApiKeys && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-3 rounded-lg bg-black/20 space-y-2"
                      >
                        <div>
                          <p className="text-xs text-secondary mb-1">Backend URL:</p>
                          <code className="text-xs break-all">
                            https://your-backend.example.com
                          </code>
                        </div>
                        <div>
                          <p className="text-xs text-secondary mb-1">Anon Key:</p>
                          <code className="text-xs break-all">eyJhb...</code>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-card border-green-500/50 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-green-400" />
                    Privacy-First Architecture
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-green-400 mt-2" />
                      <div>
                        <p className="text-sm mb-1">
                          <strong>Focus Detection (TensorFlow.js)</strong>
                        </p>
                        <p className="text-xs text-secondary">
                          All face/eye tracking runs locally in the browser using TensorFlow.js.
                          No raw images or video frames are ever stored or transmitted. Only
                          aggregated focus scores (0-100%) are saved if user opts in.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-2" />
                      <div>
                        <p className="text-sm mb-1">
                          <strong>Data Encryption</strong>
                        </p>
                        <p className="text-xs text-secondary">
                          All data transmitted to/from servers uses TLS 1.3. Passwords are
                          hashed with bcrypt. Sensitive fields are encrypted at rest using
                          AES-256.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-purple-400 mt-2" />
                      <div>
                        <p className="text-sm mb-1">
                          <strong>Data Ownership</strong>
                        </p>
                        <p className="text-xs text-secondary">
                          Users can export all their data as CSV/JSON at any time. Account
                          deletion permanently removes all user data within 30 days (GDPR
                          compliant).
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2" />
                      <div>
                        <p className="text-sm mb-1">
                          <strong>AI Model Privacy</strong>
                        </p>
                        <p className="text-xs text-secondary">
                          AI conversations are processed via OpenAI API with
                          zero-data-retention agreement. No training on user data. Users can
                          opt for local-only AI models (smaller, offline-capable).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Checklist */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-blue-400" />
                  Security Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {[
                    'OAuth 2.0 with Google/GitHub/Microsoft',
                    'JWT tokens with 24h expiry',
                    'Rate limiting (100 req/min per user)',
                    'CSRF protection on all forms',
                    'Content Security Policy (CSP) headers',
                    'XSS protection via sanitized inputs',
                    'SQL injection prevention (parameterized queries)',
                    'Regular security audits & penetration testing',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
