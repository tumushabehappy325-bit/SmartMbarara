import { useGetStatsSummary, useGetStatsByCategory, useGetStatsByStatus, useGetRecentActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import { StatusBadge } from "@/components/status-badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(142 40% 30%)", // primary
  "hsl(40 85% 55%)", // secondary
  "hsl(180 50% 45%)", 
  "hsl(20 70% 55%)",
  "hsl(280 40% 50%)",
  "hsl(330 40% 50%)",
  "hsl(80 50% 45%)",
  "hsl(210 50% 45%)"
];

const STATUS_COLORS = {
  "Pending": "hsl(40 85% 55%)", // amber
  "In Progress": "hsl(210 100% 50%)", // blue
  "Resolved": "hsl(142 70% 40%)" // green
};

export default function AdminDashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetStatsSummary();
  const { data: byCategory, isLoading: isLoadingCategory } = useGetStatsByCategory();
  const { data: byStatus, isLoading: isLoadingStatus } = useGetStatsByStatus();
  const { data: recentActivity, isLoading: isLoadingActivity } = useGetRecentActivity();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Real-time civic issue statistics for Mbarara City.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.total || 0}</div>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.pending || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.inProgress || 0}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? <Skeleton className="h-8 w-16" /> : <div className="text-3xl font-bold">{summary?.resolved || 0}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Reports by Category</CardTitle>
              <CardDescription>Breakdown of civic issues reported across different sectors.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {isLoadingCategory ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (byCategory && byCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCategory} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="category" 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      axisLine={false} 
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">No category data available</div>
              ))}
            </CardContent>
          </Card>

          <Card className="h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Current resolution status of all reports.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
              {isLoadingStatus ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-[250px] w-[250px] rounded-full" />
                </div>
              ) : (byStatus && byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="status"
                    >
                      {byStatus.map((entry, index) => (
                        <PieCell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || COLORS[0]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">No status data available</div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest submitted reports</CardDescription>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/all-reports">
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-6">
                {isLoadingActivity ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-2">
                      <div className="flex justify-between"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-5 w-20" /></div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((report) => (
                    <div key={report.id} className="group border-b border-border/50 last:border-0 pb-4 last:pb-0">
                      <Link href={`/admin/reports/${report.id}`} className="block hover:bg-muted/30 -mx-2 px-2 py-2 rounded-md transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-foreground">{report.category}</span>
                          <StatusBadge status={report.status} />
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {report.description}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          {format(new Date(report.createdAt), "MMM d, h:mm a")}
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
