import { useState } from "react";
import { useConvex } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, BarChart3, PieChart, LineChart } from "lucide-react";
import { ChartDataTester } from "@/utils/chartDataTester";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ChartDataTestPage() {
  const convex = useConvex();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  // Configuration state
  const [leadCount, setLeadCount] = useState(10);
  const [contactCount, setContactCount] = useState(5);
  const [accountCount, setAccountCount] = useState(3);
  const [quoteCount, setQuoteCount] = useState(8);
  const [workOrderCount, setWorkOrderCount] = useState(6);
  const [invoiceCount, setInvoiceCount] = useState(7);

  const runChartDataTest = async () => {
    setIsRunning(true);
    setResults(null);
    setErrors([]);
    setSuccess(null);
    setCurrentStep("Initializing test...");

    try {
      const tester = new ChartDataTester(convex);

      // Customize tester configuration
      tester["config"] = {
        ...tester["config"],
        leads: leadCount,
        contacts: contactCount,
        accounts: accountCount,
        quotes: quoteCount,
        workOrders: workOrderCount,
        invoices: invoiceCount
      };

      // Set up event listeners for step updates
      const originalConsoleLog = console.log;
      console.log = (message: string, ...args: any[]) => {
        originalConsoleLog(message, ...args);
        if (typeof message === 'string' && message.includes('...')) {
          setCurrentStep(message);
        }
      };

      // Run the test
      const testResults = await tester.generateChartData();

      // Restore console.log
      console.log = originalConsoleLog;

      // Update state with results
      setResults(testResults.results);
      setErrors(testResults.errors);
      setSuccess(testResults.success);

      // Show toast notification
      if (testResults.success) {
        toast({
          title: "Chart Data Generation Completed",
          description: "Test data for charts has been successfully generated.",
          variant: "default",
        });
      } else {
        toast({
          title: "Chart Data Generation Failed",
          description: `The process encountered ${testResults.errors.length} error(s).`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating chart data:", error);
      setErrors([`Unexpected error: ${error instanceof Error ? error.message : String(error)}`]);
      setSuccess(false);

      toast({
        title: "Chart Data Generation Failed",
        description: "An unexpected error occurred during data generation.",
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
          <h1 className="text-2xl font-bold">Chart Data Test Generator</h1>
          <p className="text-gray-500 mt-1">
            Generate test data for chart visualizations
          </p>
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800 text-sm">
            <strong>Note:</strong> This tool creates test data with the correct schema for your database.
            <ul className="list-disc ml-5 mt-1">
              <li><strong>Account fields:</strong> name, type, address, city, state, zip, notes</li>
              <li><strong>Contact fields:</strong> firstName, lastName, email, phone, address, city, state, zip, notes</li>
              <li><strong>Contact-Account relationships:</strong> Created using the linkContactToAccount mutation</li>
              <li><strong>Quote fields:</strong> contactId, accountId, issueDate, expiryDate, lineItems, notes</li>
              <li><strong>Quote status:</strong> Set using the changeQuoteStatus mutation after creation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Chart Data Generator
            </CardTitle>
            <CardDescription>
              This tool will generate test data with various statuses to ensure charts display properly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Entity Counts</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="lead-count">Leads: {leadCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="lead-count"
                          min={1}
                          max={20}
                          step={1}
                          value={[leadCount]}
                          onValueChange={(value) => setLeadCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={leadCount}
                          onChange={(e) => setLeadCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={20}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="contact-count">Contacts: {contactCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="contact-count"
                          min={1}
                          max={15}
                          step={1}
                          value={[contactCount]}
                          onValueChange={(value) => setContactCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={contactCount}
                          onChange={(e) => setContactCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="account-count">Accounts: {accountCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="account-count"
                          min={1}
                          max={10}
                          step={1}
                          value={[accountCount]}
                          onValueChange={(value) => setAccountCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={accountCount}
                          onChange={(e) => setAccountCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={10}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Transaction Counts</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="quote-count">Quotes: {quoteCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="quote-count"
                          min={1}
                          max={15}
                          step={1}
                          value={[quoteCount]}
                          onValueChange={(value) => setQuoteCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={quoteCount}
                          onChange={(e) => setQuoteCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="workorder-count">Work Orders: {workOrderCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="workorder-count"
                          min={1}
                          max={15}
                          step={1}
                          value={[workOrderCount]}
                          onValueChange={(value) => setWorkOrderCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={workOrderCount}
                          onChange={(e) => setWorkOrderCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="invoice-count">Invoices: {invoiceCount}</Label>
                      </div>
                      <div className="flex gap-2">
                        <Slider
                          id="invoice-count"
                          min={1}
                          max={15}
                          step={1}
                          value={[invoiceCount]}
                          onValueChange={(value) => setInvoiceCount(value[0])}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={invoiceCount}
                          onChange={(e) => setInvoiceCount(Number(e.target.value))}
                          className="w-16"
                          min={1}
                          max={15}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Generation Process</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    Create test accounts
                    {currentStep?.includes("Creating test accounts") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.accounts && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                  <li className="flex items-center gap-2">
                    Create test contacts
                    {currentStep?.includes("Creating test contacts") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.contacts && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                  <li className="flex items-center gap-2">
                    Create test leads with various statuses
                    {currentStep?.includes("Creating test leads") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.leads && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                  <li className="flex items-center gap-2">
                    Create test quotes with various statuses
                    {currentStep?.includes("Creating test quotes") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.quotes && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                  <li className="flex items-center gap-2">
                    Create test work orders with various statuses
                    {currentStep?.includes("Creating test work orders") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.workOrders && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                  <li className="flex items-center gap-2">
                    Create test invoices with various statuses
                    {currentStep?.includes("Creating test invoices") && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                    {results?.invoices && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              {success === true && (
                <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Data Generation Complete
                </Badge>
              )}
              {success === false && (
                <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-200">
                  <XCircle className="h-4 w-4 mr-1" /> Data Generation Failed
                </Badge>
              )}
            </div>
            <Button
              onClick={runChartDataTest}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Data...
                </>
              ) : (
                <>
                  Generate Chart Data
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
                Generation Errors
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
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-500" />
                Generation Results
              </CardTitle>
              <CardDescription>
                Summary of the test data created for chart visualization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(results).map(([key, value]) => (
                  <div key={key} className="border rounded-md p-4">
                    <h3 className="font-medium text-lg capitalize mb-2 flex items-center gap-2">
                      {key === 'leads' && <Users className="h-4 w-4 text-blue-500" />}
                      {key === 'contacts' && <Users className="h-4 w-4 text-green-500" />}
                      {key === 'accounts' && <Building className="h-4 w-4 text-purple-500" />}
                      {key === 'quotes' && <FileText className="h-4 w-4 text-yellow-500" />}
                      {key === 'workOrders' && <ClipboardList className="h-4 w-4 text-indigo-500" />}
                      {key === 'invoices' && <Receipt className="h-4 w-4 text-red-500" />}
                      {key}
                    </h3>
                    <p className="text-2xl font-bold">
                      {Array.isArray(value) ? value.length : 0} <span className="text-sm text-gray-500">created</span>
                    </p>
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

// Import these icons for the results section
import { Users, Building, FileText, ClipboardList, Receipt } from "lucide-react";
