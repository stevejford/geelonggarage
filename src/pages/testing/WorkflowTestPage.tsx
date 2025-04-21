import { useState } from "react";
import { useConvex } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { WorkflowTester } from "@/utils/workflowTesting";
import { useToast } from "@/components/ui/use-toast";

export default function WorkflowTestPage() {
  const convex = useConvex();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const runWorkflowTest = async () => {
    setIsRunning(true);
    setResults(null);
    setErrors([]);
    setSuccess(null);
    setCurrentStep("Initializing test...");

    try {
      const tester = new WorkflowTester(convex);
      
      // Set up event listeners for step updates
      const originalConsoleLog = console.log;
      console.log = (message: string, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string' && message.includes('...')) {
          setCurrentStep(message);
        }
      };
      
      // Run the test
      const testResults = await tester.runCompleteWorkflow();
      
      // Restore console.log
      console.log = originalConsoleLog;
      
      // Update state with results
      setResults(testResults.results);
      setErrors(testResults.errors);
      setSuccess(testResults.success);
      
      // Show toast notification
      if (testResults.success) {
        toast({
          title: "Workflow Test Completed Successfully",
          description: "The end-to-end workflow test has completed without errors.",
          variant: "default",
        });
      } else {
        toast({
          title: "Workflow Test Failed",
          description: `The test encountered ${testResults.errors.length} error(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error running workflow test:", error);
      setErrors([`Unexpected error: ${error instanceof Error ? error.message : String(error)}`]);
      setSuccess(false);
      
      toast({
        title: "Workflow Test Failed",
        description: "An unexpected error occurred while running the test.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">End-to-End Workflow Testing</h1>
          <p className="text-gray-500 mt-1">
            Test the complete workflow from Lead to Invoice
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Test</CardTitle>
            <CardDescription>
              This test will create a lead and follow the complete workflow through to invoice payment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                The test will perform the following steps:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li className="flex items-center gap-2">
                  Create a test lead
                  {currentStep?.includes("Creating test lead") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.lead && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Convert lead to contact and account
                  {currentStep?.includes("Converting lead") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.contact && results?.account && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Create a quote
                  {currentStep?.includes("Creating quote") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.quote && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Convert quote to work order
                  {currentStep?.includes("Converting quote to work order") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.workOrder && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Complete work order
                  {currentStep?.includes("Completing work order") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.workOrder?.status === "Completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Convert work order to invoice
                  {currentStep?.includes("Converting work order to invoice") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.invoice && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
                <li className="flex items-center gap-2">
                  Process invoice (mark as sent and paid)
                  {currentStep?.includes("Processing invoice") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {results?.invoice?.status === "Paid" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {success === true && (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Test Passed
                </Badge>
              )}
              {success === false && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                  <XCircle className="h-4 w-4 mr-1" /> Test Failed
                </Badge>
              )}
            </div>
            <Button 
              onClick={runWorkflowTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  Run Workflow Test
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Test Errors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTitle>Error {index + 1}</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {results && Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Details of the entities created during the test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="border rounded-md p-4">
                    <h3 className="font-medium text-lg capitalize mb-2">{key}</h3>
                    <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto max-h-60">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
