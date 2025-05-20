import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  getLaptopDataPromise,
  getCPUs, 
  getGPUs, 
  getOSes, 
  Laptop 
} from "@/services/laptopData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ScatterChart, Scatter, ZAxis, Cell } from "recharts";

import { getPricePrediction } from "@/util/cloud_function";

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
  const [deviceType, setDeviceType] = useState<string>("laptop");
  const [ram, setRam] = useState<number>(16);
  const [storage, setStorage] = useState<number>(512);
  const [cpu, setCpu] = useState<string>("");
  const [clockSpeed, setClockSpeed] = useState<number>(2.8);
  const [cores, setCores] = useState<number>(4);
  const [ramType, setRamType] = useState<string>("DDR4");
  const [ramFrequency, setRamFrequency] = useState<number>(2666);
  const [gpu, setGpu] = useState<string>("");
  const [screenSize, setScreenSize] = useState<number>(15.6);
  const [os, setOs] = useState<string>("");
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [bluetoothVersion, setBluetoothVersion] = useState<string>("1");
  //only for desktops
  const [psuWattage, setPsuWattage] = useState<number>(0);
  //only for laptops
  const [batteryWattHours, setBatteryWattHours] = useState<number>(0);
  const [cameraResolution, setCameraResolution] = useState<string>("1080");
  const [screenTechnology, setScreenTechnology] = useState<string>("IPS");
  const [screenResolution, setScreenResolution] = useState<string>("1920 x 1080");

  // State for all laptop data and dropdown options
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [cpuOptions, setCpuOptions] = useState<string[]>([]);
  const [gpuOptions, setGpuOptions] = useState<string[]>([]);
  const [osOptions, setOsOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const bluetoothOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        setAllLaptops(laptops);

        const cpus = await getCPUs();
        setCpuOptions(cpus);
        if (cpus.length > 0) setCpu(cpus[0]);

        const gpus = await getGPUs();
        setGpuOptions(gpus);
        if (gpus.length > 0) setGpu(gpus[0]);

        const oses = await getOSes();
        setOsOptions(oses);
        if (oses.length > 0) setOs(oses[0]);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []); // Removed cpu, gpu, os from dependency array as they are set inside

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
    if (isLoading || allLaptops.length === 0) return []; // Changed: Use allLaptops state and check loading
    
    return allLaptops.map(laptop => ({
      ram: laptop.ram,
      price: laptop.price,
      brand: laptop.brand
    }));
  }, [allLaptops, isLoading]); // Added isLoading and allLaptops to dependencies

  // Price prediction function (simplified simulation)
  // const predictPrice = () => {
  //   if (isLoading) return; // Don't predict if loading

  //   // Base price based on CPU
  //   let basePrice = 500;
  //   if (cpu.includes("i7") || cpu.includes("Ryzen 7") || cpu.includes("M2")) {
  //     basePrice = 800;
  //   } else if (cpu.includes("i5") || cpu.includes("Ryzen 5") || cpu.includes("M1")) {
  //     basePrice = 650;
  //   }
    
  //   // Adjust for RAM
  //   const ramPrice = ram * 15;
    
  //   // Adjust for storage
  //   const storagePrice = storage * 0.1;
    
  //   // Adjust for GPU
  //   let gpuPrice = 0;
  //   if (gpu.includes("RTX 30") || gpu.includes("RX 6")) {
  //     gpuPrice = 300;
  //   } else if (gpu.includes("Iris") || gpu.includes("M1") || gpu.includes("M2")) {
  //     gpuPrice = 150;
  //   }
    
  //   // Adjust for screen size
  //   const screenPrice = screenSize * 20;
    
  //   // Adjust for OS
  //   let osPrice = 0;
  //   if (os === "macOS") {
  //     osPrice = 200;
  //   } else if (os === "Windows 11") {
  //     osPrice = 100;
  //   }
    
  //   // Adjust for clock speed
  //   const clockPrice = clockSpeed * 50;
    
  //   // Calculate final price with some randomness
  //   const calculatedPrice = basePrice + ramPrice + storagePrice + gpuPrice + screenPrice + osPrice + clockPrice;
  //   const finalPrice = Math.round(calculatedPrice * (0.95 + Math.random() * 0.1));
    
  //   setPredictedPrice(finalPrice);
  // };

  if (isLoading) { // Added loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-muted-foreground">Loading prediction tools...</p>
      </div>
    );
  }

  const predictPrice = async () => {
    let data = {};

    if (deviceType === "desktop") {
      data = {
        "device_type": deviceType,
        "feature_values": {
          "procesador": cpu,
          "procesador_frecuencia_turbo_max_ghz": clockSpeed,
          "procesador_numero_nucleos": cores,
          "disco_duro_capacidad_de_memoria_ssd_gb": storage,
          "ram_memoria_gb": ram,
          "ram_tipo": ramType,
          "ram_frecuencia_de_la_memoria_mhz": ramFrequency,
          "sistema_operativo_sistema_operativo": os,
          "comunicaciones_version_bluetooth": bluetoothVersion,
          "alimentacion_wattage_binned": psuWattage

        }
      }
    }
    else if (deviceType === "laptop") {
      data = {
        "device_type": deviceType,
        "feature_values": {
          "procesador": cpu,
          "procesador_frecuencia_turbo_max_ghz": clockSpeed,
          "procesador_numero_nucleos": cores,
          "disco_duro_capacidad_de_memoria_ssd_gb": storage,
          "ram_memoria_gb": ram,
          "ram_tipo": ramType,
          "ram_frecuencia_de_la_memoria_mhz": ramFrequency,
          "sistema_operativo_sistema_operativo": os,
          "comunicaciones_version_bluetooth": bluetoothVersion,
          "alimentacion_vatios_hora": batteryWattHours,
          "camara_resolucion_pixeles": cameraResolution,
          "pantalla_tecnologia": screenTechnology,
          "pantalla_resolucion_pixeles": screenResolution,
        }
      }
    }

    try {
      const response = await getPricePrediction(data);
      console.log(response.data)
      setPredictedPrice(response.data.predicted_price);
    } catch (error) {            
      console.error("Failed to get price prediction:",{message: error.message,
      responseData: error.response?.data,
      status: error.response?.status,
      fullError: error});
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Price Prediction</h1>
        <p className="text-muted-foreground">
          Estimate computer prices based on specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Computer Specifications</CardTitle>
            <CardDescription>
              Enter the specifications to predict the price.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Select value={deviceType} onValueChange={setDeviceType} disabled={isLoading}>
                <SelectTrigger id="deviceType">
                  <SelectValue placeholder="Select Device Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="laptop">Laptop</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              <div className="flex justify-between items-center">
                <Label htmlFor="cores">Cores</Label>
                <span className="text-sm font-medium">{cores}</span>
              </div>
              <Slider
                id="cores"
                min={1}
                max={16}
                step={1}
                value={[cores]}
                onValueChange={(value) => setCores(value[0])}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ramType">Ram Type</Label>
              <Select value={ramType} onValueChange={setRamType} disabled={isLoading}>
                <SelectTrigger id="ramType">
                  <SelectValue placeholder="Select Ram Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DDR4">DDR4</SelectItem>
                  <SelectItem value="DDR5">DDR5</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ramFrequency">Ram Frequency (MHz)</Label>
                <span className="text-sm font-medium">{ramFrequency} MHz</span>
              </div>
              <Slider
                id="ramFrequency"
                min={2666}
                max={4800}
                step={100}
                value={[ramFrequency]}
                onValueChange={(value) => setRamFrequency(value[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
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

            {/* <div className="space-y-2">
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
            </div> */}

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="bluetoothVersion">Bluetooth Version</Label>
              <Select value={bluetoothVersion} onValueChange={setBluetoothVersion} disabled={isLoading}>
                <SelectTrigger id="bluetoothVersion">
                  <SelectValue placeholder="Select Bluetooth Version" />
                </SelectTrigger>
                <SelectContent>
                  {bluetoothOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {deviceType === "laptop" && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="batteryWattHours">Battery Watt Hours</Label>
                    <span className="text-sm font-medium">{batteryWattHours} Wh</span>
                  </div>
                  <Slider
                    id="batteryWattHours"
                    min={0}
                    max={1000}
                    step={10}
                    value={[batteryWattHours]}
                    onValueChange={(value) => setBatteryWattHours(value[0])}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cameraResolution">Camera Resolution</Label>
                  <Select value={cameraResolution} onValueChange={setCameraResolution} disabled={isLoading}>
                    <SelectTrigger id="cameraResolution">
                      <SelectValue placeholder="Select Camera Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1080", "2160", "4320"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bluetoothVersion">Bluetooth Version</Label>
                  <Select value={screenTechnology} onValueChange={setScreenTechnology} disabled={isLoading}>
                    <SelectTrigger id="screenTechnology">
                      <SelectValue placeholder="Select Screen Technology" />
                    </SelectTrigger>
                    <SelectContent>
                      {["IPS", "OLED", "VA"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenResolution">Screen Resolution</Label>
                  <Select value={screenResolution} onValueChange={setScreenResolution} disabled={isLoading}>
                    <SelectTrigger id="screenResolution">
                      <SelectValue placeholder="Select Screen Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1920 x 1080", "2560 x 1440", "3840 x 2160"].map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {deviceType === "desktop" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="psuWattage">PSU Wattage</Label>
                  <span className="text-sm font-medium">{psuWattage} W</span>
                </div>
                <Slider
                  id="psuWattage"
                  min={0}
                  max={1000}
                  step={10}
                  value={[psuWattage]}
                  onValueChange={(value) => setPsuWattage(value[0])}
                  className="w-full"
                />
              </div>
            )}

            <CardFooter>
              <Button onClick={predictPrice} className="w-full" disabled={isLoading}>Predict Price</Button>
            </CardFooter>

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
                Correlation between RAM and copmuter prices.
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
