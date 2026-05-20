import { useGetReport, useUpdateReportStatus, getGetReportQueryKey, getListReportsQueryKey, getGetStatsSummaryQueryKey, getGetStatsByStatusQueryKey } from "@workspace/api-client-react";
import { ReportStatus } from "@workspace/api-client-react";
import { useParams, useLocation, Link } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Calendar, Building, Phone, User, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: report, isLoading } = useGetReport(id, {
    query: {
      enabled: !isNaN(id) && id > 0,
    }
  });

  const updateStatus = useUpdateReportStatus();

  if (isNaN(id) || id <= 0) {
    return <div className="p-8 text-center">Invalid report ID</div>;
  }

  const handleStatusChange = (newStatus: ReportStatus) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: (data) => {
          toast({ title: "Status updated", description: `Report status changed to ${newStatus}` });
          // Opt for targeted cache updates over mass invalidation to avoid UI flicker
          queryClient.setQueryData(getGetReportQueryKey(id), data);
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsByStatusQueryKey() });
        },
        onError: () => {
          toast({ title: "Update failed", description: "Could not update the report status.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report) {
    return <div className="p-8 text-center text-muted-foreground">Report not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setLocation("/admin")} className="-ml-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
          {report.status !== "In Progress" && report.status !== "Resolved" && (
            <Button 
              variant="outline" 
              className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
              onClick={() => handleStatusChange("In Progress" as ReportStatus)}
              disabled={updateStatus.isPending}
              data-testid="btn-mark-progress"
            >
              {updateStatus.isPending && updateStatus.variables?.data.status === "In Progress" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark In Progress
            </Button>
          )}
          {report.status !== "Resolved" && (
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusChange("Resolved" as ReportStatus)}
              disabled={updateStatus.isPending}
              data-testid="btn-mark-resolved"
            >
              {updateStatus.isPending && updateStatus.variables?.data.status === "Resolved" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark Resolved
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-sm">
                  {report.category}
                </span>
                <StatusBadge status={report.status} />
              </div>
              <CardTitle className="text-2xl mt-2">Report Details</CardTitle>
              <CardDescription>Submitted on {format(new Date(report.createdAt), "MMMM d, yyyy 'at' h:mm a")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-md border border-border/50 text-foreground text-base leading-relaxed mb-6 whitespace-pre-wrap">
                {report.description}
              </div>

              {report.imagePath && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Attached Image</h3>
                  <div className="rounded-md overflow-hidden border border-border">
                    <img 
                      src={report.imagePath} 
                      alt="Report attachment" 
                      className="w-full h-auto max-h-[400px] object-contain bg-muted"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f1f5f9/a1a1aa?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meta Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Location</p>
                  <p className="text-muted-foreground">{report.location || "Not provided"}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start">
                <Building className="h-4 w-4 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Assigned Department</p>
                  <p className="text-muted-foreground">{report.department}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-muted-foreground mr-3 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Report ID</p>
                  <p className="text-muted-foreground font-mono">#{report.id.toString().padStart(5, '0')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center">
                <User className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <p className="text-foreground">{report.name || "Anonymous Citizen"}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-muted-foreground mr-3 shrink-0" />
                <div>
                  <p className="text-foreground">{report.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
