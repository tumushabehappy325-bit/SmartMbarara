import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import SubmitReport from "@/pages/submit-report";
import PublicReports from "@/pages/public-reports";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminAllReports from "@/pages/admin-all-reports";
import AdminReportDetail from "@/pages/admin-report-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/report" component={SubmitReport} />
        <Route path="/reports" component={PublicReports} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/all-reports" component={AdminAllReports} />
        <Route path="/admin/reports/:id" component={AdminReportDetail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
