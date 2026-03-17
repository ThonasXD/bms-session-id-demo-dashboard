// =============================================================================
// BMS Session KPI Dashboard - Overview Page (Redesigned Command Center)
// =============================================================================

import { useState, useCallback } from 'react'
import {
  RefreshCw,
  Database,
  Clock,
  Shield,
  Server,
  Globe,
  User,
  Building,
  CalendarDays,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KpiCardGrid } from '@/components/dashboard/KpiCardGrid'
import { DepartmentTable } from '@/components/dashboard/DepartmentTable'
import { useBmsSessionContext } from '@/contexts/BmsSessionContext'
import { formatDate, formatDateTime } from '@/utils/dateUtils'
import { cn } from '@/lib/utils'

function formatExpiryDays(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  if (days > 0) {
    return `${days}d ${hours}h`
  }
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

function truncateUrl(url: string, maxLength = 40): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

export default function Overview() {
  const { session, refreshSession } = useBmsSessionContext()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshSession()
      setLastUpdated(new Date())
    } finally {
      // Small delay so the user sees the spinner
      setTimeout(() => setIsRefreshing(false), 600)
    }
  }, [refreshSession])

  const today = formatDate(new Date())

  // ---------------------------------------------------------------------------
  // Session info rows helper
  // ---------------------------------------------------------------------------
  const sessionInfoRows: Array<{
    icon: React.ReactNode
    label: string
    value: string | React.ReactNode
  }> = session
    ? [
        {
          icon: <Database className="h-4 w-4" />,
          label: 'Database Type',
          value: (
            <Badge variant="secondary" className="font-mono text-xs">
              {session.databaseType.toUpperCase()}
            </Badge>
          ),
        },
        {
          icon: <Server className="h-4 w-4" />,
          label: 'Database Name',
          value: session.databaseName || 'N/A',
        },
        {
          icon: <Clock className="h-4 w-4" />,
          label: 'Session Expiry',
          value: `Expires in ${formatExpiryDays(session.expirySeconds)}`,
        },
        {
          icon: <User className="h-4 w-4" />,
          label: 'User / Role',
          value: `${session.userInfo.name} (${session.userInfo.position})`,
        },
        {
          icon: <Building className="h-4 w-4" />,
          label: 'Hospital Code',
          value: (
            <span className="font-mono text-sm">
              {session.userInfo.hospitalCode || 'N/A'}
            </span>
          ),
        },
        {
          icon: <Shield className="h-4 w-4" />,
          label: 'System Version',
          value: session.systemInfo.version || 'N/A',
        },
        {
          icon: <Globe className="h-4 w-4" />,
          label: 'Environment',
          value: (
            <Badge
              variant={
                session.systemInfo.environment?.toLowerCase() === 'production'
                  ? 'default'
                  : 'secondary'
              }
              className="text-xs"
            >
              {session.systemInfo.environment || 'Unknown'}
            </Badge>
          ),
        },
      ]
    : []

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------------------------- */}
      {/* 1. Welcome Banner                                                    */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {today}
            </span>
            <span className="text-muted-foreground/40">|</span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last updated {formatDateTime(lastUpdated)}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 gap-1.5 sm:mt-0"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 2. KPI Card Grid                                                     */}
      {/* ------------------------------------------------------------------- */}
      <KpiCardGrid />

      {/* ------------------------------------------------------------------- */}
      {/* 3. Two-column section: Department Workload + Session Info             */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Department Workload (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Department Workload</CardTitle>
            <CardDescription>
              Today's visit distribution by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DepartmentTable />
          </CardContent>
        </Card>

        {/* Right: Session Info (1/3 width) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Info</CardTitle>
            <CardDescription>
              Active connection details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-4">
                {sessionInfoRows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      {row.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {row.label}
                      </p>
                      <div className="mt-0.5 truncate text-sm font-medium">
                        {row.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active session. Connect with a session ID to view details.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. Connection details footer bar                                     */}
      {/* ------------------------------------------------------------------- */}
      {session && (
        <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              API: {truncateUrl(session.apiUrl)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Connected: {formatDateTime(session.connectedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Database className="h-3 w-3" />
              {session.databaseType.toUpperCase()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
