import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  getLaptopDataPromise, // Changed: Was laptopData
  getCPUs, 
  getGPUs, 
  getOSes, 
  Laptop 
} from "@/services/laptopData";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

// KNN Algorithm implementation (simplified)
const findSimilarLaptops = (
  queryLaptop: Partial<Laptop>, 
  laptopData: Laptop[], 
  k: number = 5
): Laptop[] => {
  if (!queryLaptop || !laptopData || laptopData.length === 0) {
    return [];
  }

  // Calculate distances between the query laptop and all laptops in the dataset
  const distances = laptopData.map(laptop => {
    // Calculate weighted Euclidean distance
    let distance = 0;
    
    // RAM (weight: 0.2)
    if (queryLaptop.ram !== undefined) {
      const ramDiff = (laptop.ram - queryLaptop.ram) / 64; // Normalize by max RAM
      distance += 0.2 * ramDiff * ramDiff;
    }
    
    // Storage (weight: 0.15)
    if (queryLaptop.storage !== undefined) {
      const storageDiff = (laptop.storage - queryLaptop.storage) / 2048; // Normalize by max storage
      distance += 0.15 * storageDiff * storageDiff;
    }
    
    // Screen size (weight: 0.15)
    if (queryLaptop.screenSize !== undefined) {
      const screenDiff = (laptop.screenSize - queryLaptop.screenSize) / 4; // Normalize by range
      distance += 0.15 * screenDiff * screenDiff;
    }
    
    // CPU (weight: 0.2)
    if (queryLaptop.cpu !== undefined) {
      // Simple match/no match
      distance += queryLaptop.cpu === laptop.cpu ? 0 : 0.2;
    }
    
    // GPU (weight: 0.2)
    if (queryLaptop.gpu !== undefined) {
      // Simple match/no match
      distance += queryLaptop.gpu === laptop.gpu ? 0 : 0.2;
    }
    
    // OS (weight: 0.1)
    if (queryLaptop.os !== undefined) {
      // Simple match/no match
      distance += queryLaptop.os === laptop.os ? 0 : 0.1;
    }
    
    return {
      laptop,
      distance: Math.sqrt(distance)
    };
  });
  
  // Sort by distance (ascending) and take the k nearest neighbors
  return distances
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(item => ({
      ...item.laptop,
      similarityScore: Math.round((1 - item.distance) * 100) // Convert distance to similarity score
    }));
};

const Prescriptive = () => {
  // State for form inputs (similar to prediction page)
  const [ram, setRam] = useState<number>(16);
  const [storage, setStorage] = useState<number>(512);
  const [cpu, setCpu] = useState<string>("");
  const [gpu, setGpu] = useState<string>("");
  const [screenSize, setScreenSize] = useState<number>(15.6);
  const [os, setOs] = useState<string>("");
  const [similarLaptops, setSimilarLaptops] = useState<(Laptop & { similarityScore?: number })[]>([]);

  // State for all laptop data and dropdown options
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [cpuOptions, setCpuOptions] = useState<string[]>([]);
  const [gpuOptions, setGpuOptions] = useState<string[]>([]);
  const [osOptions, setOsOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Added loading state

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        setAllLaptops(laptops);

        const cpus = await getCPUs();
        setCpuOptions(cpus);
        if (cpus.length > 0 && cpu === "") setCpu(cpus[0]);

        const gpus = await getGPUs();
        setGpuOptions(gpus);
        if (gpus.length > 0 && gpu === "") setGpu(gpus[0]);

        const oses = await getOSes();
        setOsOptions(oses);
        if (oses.length > 0 && os === "") setOs(oses[0]);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        // Optionally, set some error state here
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Removed cpu, gpu, os from dependencies as initial setting is handled in fetchData

  // Find similar laptops
  const findSimilar = () => {
    if (isLoading || allLaptops.length === 0) return; // Don't run if loading or no data
    const queryLaptop = {
      ram,
      storage,
      cpu,
      gpu,
      screenSize,
      os,
    };
    
    const results = findSimilarLaptops(queryLaptop, allLaptops, 5); // Changed: Use allLaptops state
    setSimilarLaptops(results);
  };

  if (isLoading) { // Added loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-muted-foreground">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Similar Offers</h1>
        <p className="text-muted-foreground">
          Find laptops similar to your desired specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-md lg:col-span-1">
          <CardHeader>
            <CardTitle>Your Preferences</CardTitle>
            <CardDescription>
              Specify the laptop features you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ram">RAM (GB)</Label>
                <span className="text-sm font-medium">{ram} GB</span>
              </div>
              <Slider
                id="ram"
                min={4}
                max={64}
                step={4}
                value={[ram]}
                onValueChange={(value) => setRam(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="storage">Storage (GB)</Label>
                <span className="text-sm font-medium">{storage} GB</span>
              </div>
              <Slider
                id="storage"
                min={128}
                max={2048}
                step={128}
                value={[storage]}
                onValueChange={(value) => setStorage(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cpu">CPU</Label>
              <Select value={cpu} onValueChange={setCpu} disabled={isLoading || cpuOptions.length === 0}>
                <SelectTrigger id="cpu">
                  <SelectValue placeholder="Select CPU" />
                </SelectTrigger>
                <SelectContent>
                  {cpuOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="gpu">GPU</Label>
              <Select value={gpu} onValueChange={setGpu} disabled={isLoading || gpuOptions.length === 0}>
                <SelectTrigger id="gpu">
                  <SelectValue placeholder="Select GPU" />
                </SelectTrigger>
                <SelectContent>
                  {gpuOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="screenSize">Screen Size (inches)</Label>
                <span className="text-sm font-medium">{screenSize.toFixed(1)}"</span>
              </div>
              <Slider
                id="screenSize"
                min={13.3}
                max={17.3}
                step={0.1}
                value={[screenSize]}
                onValueChange={(value) => setScreenSize(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="os">Operating System</Label>
              <Select value={os} onValueChange={setOs} disabled={isLoading || osOptions.length === 0}>
                <SelectTrigger id="os">
                  <SelectValue placeholder="Select OS" />
                </SelectTrigger>
                <SelectContent>
                  {osOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={findSimilar}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading} // Added disabled state
            >
              Find Similar Laptops
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md lg:col-span-2">
          <CardHeader>
            <CardTitle>Similar Laptops</CardTitle>
            <CardDescription>
              Closest matches to your specifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {similarLaptops.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Model</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Similarity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {similarLaptops.map((laptop) => (
                      <TableRow key={laptop.id}>
                        <TableCell className="font-medium">
                          <div>{laptop.title}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                              {laptop.ram}GB
                            </Badge>
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              {laptop.storage}GB
                            </Badge>
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                              {laptop.screenSize}"
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${laptop.price}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <Progress value={laptop.similarityScore} className="h-2" />
                            <span className="text-xs font-medium">{laptop.similarityScore}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 py-8">
                <p className="text-muted-foreground">
                  Enter your preferences and click "Find Similar Laptops" to see matches.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {similarLaptops.length > 0 && (
          <Card className="shadow-md lg:col-span-3">
            <CardHeader>
              <CardTitle>Detailed Comparison</CardTitle>
              <CardDescription>
                Explore specifications of recommended laptops in detail.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="specs">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="price">Price Comparison</TabsTrigger>
                </TabsList>
                <TabsContent value="specs" className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>CPU</TableHead>
                        <TableHead>GPU</TableHead>
                        <TableHead>RAM</TableHead>
                        <TableHead>Storage</TableHead>
                        <TableHead>Screen</TableHead>
                        <TableHead>OS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {similarLaptops.map((laptop) => (
                        <TableRow key={`spec-${laptop.id}`}>
                          <TableCell className="font-medium">{laptop.brand}</TableCell>
                          <TableCell>{laptop.cpu}</TableCell>
                          <TableCell>{laptop.gpu}</TableCell>
                          <TableCell>{laptop.ram} GB</TableCell>
                          <TableCell>{laptop.storage} GB</TableCell>
                          <TableCell>{laptop.screenSize}"</TableCell>
                          <TableCell>{laptop.os}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="price" className="mt-4">
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={similarLaptops.map(laptop => ({
                          name: laptop.brand,
                          price: laptop.price,
                          similarity: laptop.similarityScore
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value, name) => [name === 'price' ? `$${value}` : `${value}%`, name === 'price' ? 'Price' : 'Similarity']} />
                        <Legend />
                        <Bar dataKey="price" name="Price" fill="#4f46e5" />
                        <Bar dataKey="similarity" name="Similarity %" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prescriptive;
