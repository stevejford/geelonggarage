import { useState, useEffect } from "react";
import { UIConsistencyChecker, ConsistencyCheckResult } from "@/utils/uiConsistencyChecker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, CheckCircle2, Search, Filter, RefreshCw } from "lucide-react";

export default function UIConsistencyPage() {
  const [results, setResults] = useState<ConsistencyCheckResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ConsistencyCheckResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique categories and severities for filtering
  const categories = [...new Set(results.map(result => result.category))];
  const severities = [...new Set(results.map(result => result.severity))];

  // Run the consistency check
  const runConsistencyCheck = () => {
    setIsLoading(true);
    
    // Simulate async operation
    setTimeout(() => {
      const checker = new UIConsistencyChecker();
      const checkResults = checker.runAllChecks();
      setResults(checkResults);
      setFilteredResults(checkResults);
      setIsLoading(false);
    }, 1000);
  };

  // Filter results based on search query and selected filters
  useEffect(() => {
    let filtered = [...results];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result => 
        result.element.toLowerCase().includes(query) || 
        result.issue.toLowerCase().includes(query) ||
        result.recommendation.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(result => selectedCategories.includes(result.category));
    }
    
    // Apply severity filter
    if (selectedSeverities.length > 0) {
      filtered = filtered.filter(result => selectedSeverities.includes(result.severity));
    }
    
    setFilteredResults(filtered);
  }, [searchQuery, selectedCategories, selectedSeverities, results]);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Toggle severity selection
  const toggleSeverity = (severity: string) => {
    setSelectedSeverities(prev => 
      prev.includes(severity) 
        ? prev.filter(s => s !== severity) 
        : [...prev, severity]
    );
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Run the check on component mount
  useEffect(() => {
    runConsistencyCheck();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">UI Consistency Check</h1>
          <p className="text-gray-500 mt-1">
            Identify and fix UI inconsistencies across the application
          </p>
        </div>
        <Button 
          onClick={runConsistencyCheck} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Running Check...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Run Check
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consistency Check Results</CardTitle>
            <CardDescription>
              Found {filteredResults.length} issues out of {results.length} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search issues..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters ({selectedCategories.length + selectedSeverities.length})
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Issues ({filteredResults.length})</TabsTrigger>
                <TabsTrigger value="high">High Severity ({filteredResults.filter(r => r.severity === 'high').length})</TabsTrigger>
                <TabsTrigger value="medium">Medium Severity ({filteredResults.filter(r => r.severity === 'medium').length})</TabsTrigger>
                <TabsTrigger value="low">Low Severity ({filteredResults.filter(r => r.severity === 'low').length})</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="md:col-span-1 space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Categories</h3>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`} 
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label htmlFor={`category-${category}`}>{category}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Severity</h3>
                    <div className="space-y-2">
                      {severities.map(severity => (
                        <div key={severity} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`severity-${severity}`} 
                            checked={selectedSeverities.includes(severity)}
                            onCheckedChange={() => toggleSeverity(severity)}
                          />
                          <Label htmlFor={`severity-${severity}`} className="capitalize">{severity}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <TabsContent value="all" className="mt-0">
                    <div className="space-y-4">
                      {filteredResults.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                          <h3 className="text-lg font-medium">No issues found</h3>
                          <p className="text-gray-500">All UI elements are consistent or no matching results for your filters</p>
                        </div>
                      ) : (
                        filteredResults.map((result, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{result.element}</CardTitle>
                                  <CardDescription>{result.location}</CardDescription>
                                </div>
                                <Badge className={getSeverityColor(result.severity)}>
                                  {result.severity === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium">Issue:</span>
                                  <p className="text-sm">{result.issue}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Recommendation:</span>
                                  <p className="text-sm">{result.recommendation}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="high" className="mt-0">
                    <div className="space-y-4">
                      {filteredResults.filter(r => r.severity === 'high').length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                          <h3 className="text-lg font-medium">No high severity issues found</h3>
                          <p className="text-gray-500">Great job! No critical UI inconsistencies detected</p>
                        </div>
                      ) : (
                        filteredResults
                          .filter(r => r.severity === 'high')
                          .map((result, index) => (
                            <Card key={index}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-base">{result.element}</CardTitle>
                                    <CardDescription>{result.location}</CardDescription>
                                  </div>
                                  <Badge className={getSeverityColor(result.severity)}>
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    High
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm font-medium">Issue:</span>
                                    <p className="text-sm">{result.issue}</p>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium">Recommendation:</span>
                                    <p className="text-sm">{result.recommendation}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="medium" className="mt-0">
                    <div className="space-y-4">
                      {filteredResults
                        .filter(r => r.severity === 'medium')
                        .map((result, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{result.element}</CardTitle>
                                  <CardDescription>{result.location}</CardDescription>
                                </div>
                                <Badge className={getSeverityColor(result.severity)}>
                                  Medium
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium">Issue:</span>
                                  <p className="text-sm">{result.issue}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Recommendation:</span>
                                  <p className="text-sm">{result.recommendation}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="low" className="mt-0">
                    <div className="space-y-4">
                      {filteredResults
                        .filter(r => r.severity === 'low')
                        .map((result, index) => (
                          <Card key={index}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base">{result.element}</CardTitle>
                                  <CardDescription>{result.location}</CardDescription>
                                </div>
                                <Badge className={getSeverityColor(result.severity)}>
                                  Low
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium">Issue:</span>
                                  <p className="text-sm">{result.issue}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Recommendation:</span>
                                  <p className="text-sm">{result.recommendation}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-gray-500">
              Last checked: {new Date().toLocaleString()}
            </div>
            <Button variant="outline" onClick={() => window.print()}>
              Export Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
