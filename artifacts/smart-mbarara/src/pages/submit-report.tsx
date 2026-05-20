import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateReport, getListReportsQueryKey, getGetRecentActivityQueryKey, getGetStatsSummaryQueryKey, getGetStatsByCategoryQueryKey, getGetStatsByStatusQueryKey } from "@workspace/api-client-react";
import { ReportInputCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  category: z.nativeEnum(ReportInputCategory, { required_error: "Please select a category." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imagePath: z.string().optional(),
  location: z.string().min(5, { message: "Please provide a more specific location." }).optional().or(z.literal('')),
});

export default function SubmitReport() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createReport = useCreateReport();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      category: undefined,
      description: "",
      imagePath: "",
      location: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createReport.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({
            title: "Report submitted successfully",
            description: "Thank you for helping improve Mbarara. Your report has been logged.",
          });
          queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsByCategoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsByStatusQueryKey() });
          setLocation("/reports");
        },
        onError: (error) => {
          toast({
            title: "Failed to submit report",
            description: error.message || "An error occurred while submitting your report.",
            variant: "destructive",
          });
        },
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-bold text-foreground">Report an Issue</h1>
        <p className="text-muted-foreground mt-2">
          Help us maintain Mbarara city by reporting civic issues. Provide as much detail as possible to help authorities address the problem quickly.
        </p>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md">
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
          <CardDescription>Fill out the form below to submit a new report.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormDescription>Leave blank to report anonymously.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="07XX XXX XXX" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormDescription>For follow-up questions if needed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select an issue category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ReportInputCategory).map(([key, value]) => (
                          <SelectItem key={key} value={value as string}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., High Street, near Central Market" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormDescription>Be as specific as possible to help teams find the issue.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the issue in detail..." 
                        className="min-h-[120px] resize-y" 
                        {...field} 
                        data-testid="textarea-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-image" />
                    </FormControl>
                    <FormDescription>A link to a photo of the issue.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full md:w-auto" disabled={createReport.isPending} data-testid="button-submit">
                {createReport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
