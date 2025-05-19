
import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { laptopData, getCPUs, getGPUs, getOSes, Laptop } from "@/services/laptopData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ScatterChart, Scatter, ZAxis, Cell } from "recharts";

// Sample feature importance (simulated)
const featureImportance = [
  { feature: "CPU", importance: 0.28 },
  { feature: "GPU", importance: 0.22 },
  { feature: "RAM", importance: 0.18 },
  { feature: "Storage", importance: 0.12 },
  { feature: "Screen Size", importance: 0.10 },
  { feature: "OS", importance: 0.06 },
  { feature: "Clock Speed", importance: 0.04 }
].sort((a, b) => b.importance - a.importance);

const Prediction = () => {
  // State for form inputs
  const [ram, setRam] = useState<number>(16);
  const [storage, setStorage] = useState<number>(512);
  const [cpu, setCpu] = useState<string>("");
  const [clockSpeed, setClockSpeed] = useState<number>(2.8);
  const [gpu, setGpu] = useState<string>("");
  const [screenSize, setScreenSize] = useState<number>(15.6);
  const [os, setOs] = useState<string>("");
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);

  // Options for dropdowns
  const cpuOptions = useMemo(() => getCPUs(), []);
  const gpuOptions = useMemo(() => getGPUs(), []);
  const osOptions = useMemo(() => getOSes(), []);

  // Set defaults on initial load
  useEffect(() => {
    if (cpuOptions.length > 0 && cpu === "") {
      setCpu(cpuOptions[0]);
    }
    if (gpuOptions.length > 0 && gpu === "") {
      setGpu(gpuOptions[0]);
    }
    if (osOptions.length > 0 && os === "") {
      setOs(osOptions[0]);
    }
  }, [cpuOptions, gpuOptions, osOptions, cpu, gpu, os]);

  // Correlation data for visualization
  const correlationData = useMemo(() => {
    return [
      { feature: "RAM", correlation: 0.68, price: 0 },
      { feature: "Storage", correlation: 0.52, price: 0 },
      { feature: "Screen Size", correlation: 0.41, price: 0 },
      { feature: "Clock Speed", correlation: 0.35, price: 0 }
    ].map(item => {
      // Add some variance to make scatter plot more interesting
      const priceVariance = Math.random() * 1000 + 500;
      return {
        ...item,
        price: item.correlation * 2500 + priceVariance
      };
    });
  }, []);

  // Scatter plot data showing price vs feature values
  const scatterData = useMemo(() => {
    if (!laptopData) return [];
    
    return laptopData.map(laptop => ({
      ram: laptop.ram,
      price: laptop.price,
      brand: laptop.brand
    }));
  }, []);

  // Price prediction function (simplified simulation)
  const predictPrice = () => {
    // Base price based on CPU
    let basePrice = 500;
    if (cpu.includes("i7") || cpu.includes("Ryzen 7") || cpu.includes("M2")) {
      basePrice = 800;
    } else if (cpu.includes("i5") || cpu.includes("Ryzen 5") || cpu.includes("M1")) {
      basePrice = 650;
    }
    
    // Adjust for RAM
    const ramPrice = ram * 15;
    
    // Adjust for storage
    const storagePrice = storage * 0.1;
    
    // Adjust for GPU
    let gpuPrice = 0;
    if (gpu.includes("RTX 30") || gpu.includes("RX 6")) {
      gpuPrice = 300;
    } else if (gpu.includes("Iris") || gpu.includes("M1") || gpu.includes("M2")) {
      gpuPrice = 150;
    }
    
    // Adjust for screen size
    const screenPrice = screenSize * 20;
    
    // Adjust for OS
    let osPrice = 0;
    if (os === "macOS") {
      osPrice = 200;
    } else if (os === "Windows 11") {
      osPrice = 100;
    }
    
    // Adjust for clock speed
    const clockPrice = clockSpeed * 50;
    
    // Calculate final price with some randomness
    const calculatedPrice = basePrice + ramPrice + storagePrice + gpuPrice + screenPrice + osPrice + clockPrice;
    const finalPrice = Math.round(calculatedPrice * (0.95 + Math.random() * 0.1));
    
    setPredictedPrice(finalPrice);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Prediction</h1>
        <p className="text-muted-foreground">
          Estimate laptop prices based on specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Laptop Specifications</CardTitle>
            <CardDescription>
              Enter the specifications to predict the price.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-2">
              <Label htmlFor="cpu">CPU</Label>
              <Select value={cpu} onValueChange={setCpu}>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="clockSpeed">Clock Speed (GHz)</Label>
                <span className="text-sm font-medium">{clockSpeed.toFixed(1)} GHz</span>
              </div>
              <Slider
                id="clockSpeed"
                min={2.0}
                max={4.5}
                step={0.1}
                value={[clockSpeed]}
                onValueChange={(value) => setClockSpeed(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpu">GPU</Label>
              <Select value={gpu} onValueChange={setGpu}>
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

            <div className="space-y-2">
              <Label htmlFor="os">Operating System</Label>
              <Select value={os} onValueChange={setOs}>
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

            <Button 
              onClick={predictPrice}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Predict Price
            </Button>

            {predictedPrice !== null && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 text-center">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  Estimated Price
                </h3>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                  ${predictedPrice.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Based on current market trends
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>
                Impact of each specification on the laptop price.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureImportance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 'dataMax + 0.05']} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <YAxis type="category" dataKey="feature" width={80} />
                    <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Importance']} />
                    <Bar dataKey="importance" fill="#4f46e5">
                      {featureImportance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#7c3aed'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Price vs. RAM</CardTitle>
              <CardDescription>
                Correlation between RAM and laptop prices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="ram" 
                      name="RAM" 
                      unit="GB"
                      domain={['dataMin - 2', 'dataMax + 2']}
                      label={{ value: 'RAM (GB)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="price" 
                      name="Price" 
                      unit="$"
                      label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis range={[60, 60]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name) => [name === 'RAM' ? `${value} GB` : `$${value}`, name]} />
                    <Legend />
                    <Scatter name="Laptops" data={scatterData} fill="#2563eb" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
