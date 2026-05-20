import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { MapPin, Calendar, ArrowRight, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { useListReports } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: reports, isLoading } = useListReports();
  const recentReports = reports?.slice(0, 3) || [];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548625361-9a7b9150027f?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-24 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="bg-secondary text-primary font-bold mb-6 hover:bg-secondary/90">Official Civic Platform</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight mb-6">
              Report issues. <br />
              Improve Mbarara. <br />
              Build our city together.
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl leading-relaxed">
              Notice a pothole, broken street light, or uncollected waste? Report it directly to the city authorities through our transparent civic tracking system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary" className="text-primary font-bold px-8 h-14 text-lg" asChild>
                <Link href="/report" data-testid="button-hero-report">
                  Submit a Report
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 px-8 h-14 text-lg" asChild>
                <Link href="/reports" data-testid="button-hero-view-reports">
                  View Public Reports
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">A simple, transparent process to get city issues resolved efficiently.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldAlert className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Report an Issue</CardTitle>
                <CardDescription className="text-base mt-2">
                  Spot a problem in your neighborhood? Take a photo, describe the issue, and pin the location.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle>2. Authorities Assigned</CardTitle>
                <CardDescription className="text-base mt-2">
                  Your report is automatically routed to the correct city department (Water, Roads, Waste, etc.).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-none shadow-md">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4 dark:bg-green-900/30">
                  <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-400" />
                </div>
                <CardTitle>3. Track Resolution</CardTitle>
                <CardDescription className="text-base mt-2">
                  Follow the progress publicly as authorities mark the issue as 'In Progress' and finally 'Resolved'.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-foreground mb-2">Recent Community Reports</h2>
              <p className="text-muted-foreground">Transparency in action. See what your neighbors are reporting.</p>
            </div>
            <Button variant="ghost" className="hidden sm:flex" asChild>
              <Link href="/reports">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentReports.map(report => (
                <Card key={report.id} className="flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-sm">
                        {report.category}
                      </span>
                      <StatusBadge status={report.status} />
                    </div>
                    <CardTitle className="text-lg line-clamp-1">{report.description.substring(0, 50)}...</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {report.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-foreground/80">
                        <MapPin className="mr-2 h-4 w-4 text-primary" />
                        <span className="line-clamp-1">{report.location || "Location not specified"}</span>
                      </div>
                      <div className="flex items-center text-foreground/80">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        <span>{format(new Date(report.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {recentReports.length === 0 && !isLoading && (
                <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  No reports submitted yet.
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/reports">
                View All Reports <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Inline Badge since we don't have it imported at the top
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}