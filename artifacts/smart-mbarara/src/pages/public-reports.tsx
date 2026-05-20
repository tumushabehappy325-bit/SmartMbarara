import { useState } from "react";
import { useListReports } from "@workspace/api-client-react";
import { ReportStatus, ReportInputCategory } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { MapPin, Calendar, Search, Building } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicReports() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const { data: reports, isLoading } = useListReports({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    status: status !== "all" ? status : undefined,
  });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Public Reports</h1>
        <p className="text-muted-foreground mt-2">
          Track civic issues reported by the community across Mbarara.
        </p>
      </div>

      <div className="bg-card p-4 rounded-lg shadow-sm border border-border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports..." 
              className="pl-9" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-reports"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-filter-category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(ReportInputCategory).map((cat) => (
                <SelectItem key={cat} value={cat as string}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger data-testid="select-filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(ReportStatus).map((stat) => (
                <SelectItem key={stat} value={stat as string}>{stat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3 border-b border-border/50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
                        {report.category}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <CardTitle className="text-base leading-snug line-clamp-2 mt-2">{report.description}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 flex-1 flex flex-col justify-between text-sm">
                    <div className="space-y-3">
                      <div className="flex items-start text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{report.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Building className="mr-2 h-4 w-4 text-secondary-foreground shrink-0" />
                        <span>{report.department}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-2 h-4 w-4 shrink-0" />
                        <span>{format(new Date(report.createdAt), "MMM d, yyyy h:mm a")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
              <h3 className="text-lg font-medium text-foreground mb-2">No reports found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
