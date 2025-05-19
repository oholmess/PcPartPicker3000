import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  getLaptopDataPromise,
  Laptop 
} from "@/services/laptopData";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simple k-means implementation
const kMeans = (data: any[], k: number, maxIterations = 10) => {
  // Convert laptops to feature vectors (normalized)
  const featureVectors = data.map(item => [
    item.normalizedRAM,
    item.normalizedScreenSize,
    item.normalizedPrice,
    item.normalizedProductType
  ]);
  
  // Initialize centroids randomly
  let centroids = Array(k).fill(0).map(() => {
    const randomIndex = Math.floor(Math.random() * featureVectors.length);
    return [...featureVectors[randomIndex]];
  });
  
  const assignments = Array(data.length).fill(0);
  
  // Iterate until convergence or max iterations
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign each point to nearest centroid
    let changed = false;
    for (let i = 0; i < featureVectors.length; i++) {
      const point = featureVectors[i];
      let minDistance = Infinity;
      let closestCluster = 0;
      
      for (let j = 0; j < centroids.length; j++) {
        const centroid = centroids[j];
        // Euclidean distance
        const distance = Math.sqrt(
          point.reduce((sum: number, val: number, idx: number) => {
            return sum + Math.pow(val - centroid[idx], 2);
          }, 0)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCluster = j;
        }
      }
      
      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        changed = true;
      }
    }
    
    // If no assignments changed, we're done
    if (!changed) break;
    
    // Recalculate centroids
    const newCentroids = Array(k).fill(0).map(() => Array(featureVectors[0].length).fill(0));
    const counts = Array(k).fill(0);
    
    for (let i = 0; i < featureVectors.length; i++) {
      const cluster = assignments[i];
      counts[cluster]++;
      
      for (let j = 0; j < featureVectors[i].length; j++) {
        newCentroids[cluster][j] += featureVectors[i][j];
      }
    }
    
    // Average out the centroids
    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        for (let j = 0; j < newCentroids[i].length; j++) {
          newCentroids[i][j] /= counts[i];
        }
      }
    }
    
    centroids = newCentroids;
  }
  
  // Assign clusters to data objects
  return data.map((item, i) => ({
    ...item,
    cluster: assignments[i]
  }));
};

// Simple PCA-like dimension reduction (actually just using 2 features for simplicity)
const reduceDimensions = (clusteredData: any[], xFeature: string, yFeature: string) => {
  return clusteredData.map(item => ({
    x: item[xFeature],
    y: item[yFeature],
    cluster: item.cluster,
    title: item.title,
    brand: item.brand,
    price: item.price,
    ram: item.ram,
    screenSize: item.screenSize,
    productType: item.productType
  }));
};

const Segmentation = () => {
  const [xAxis, setXAxis] = useState<string>("normalizedPrice");
  const [yAxis, setYAxis] = useState<string>("normalizedRAM");
  const [numClusters, setNumClusters] = useState<number>(3);

  // State for all laptop data
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        setAllLaptops(laptops);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare data for clustering
  const processedData = useMemo(() => {
    if (isLoading || allLaptops.length === 0) return []; // Check loading and data

    // Normalize features for better clustering
    const ramValues = allLaptops.map(laptop => laptop.ram);
    const minRam = Math.min(...ramValues);
    const maxRam = Math.max(...ramValues);
    
    const screenSizeValues = allLaptops.map(laptop => laptop.screenSize);
    const minScreenSize = Math.min(...screenSizeValues);
    const maxScreenSize = Math.max(...screenSizeValues);
    
    const priceValues = allLaptops.map(laptop => laptop.price);
    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);
    
    const productTypes = Array.from(new Set(allLaptops.map(laptop => laptop.productType)));
    
    const normalizedData = allLaptops.map(laptop => ({
      ...laptop,
      normalizedRAM: maxRam === minRam ? 0 : (laptop.ram - minRam) / (maxRam - minRam), // Added check for division by zero
      normalizedScreenSize: maxScreenSize === minScreenSize ? 0 : (laptop.screenSize - minScreenSize) / (maxScreenSize - minScreenSize), // Added check for division by zero
      normalizedPrice: maxPrice === minPrice ? 0 : (laptop.price - minPrice) / (maxPrice - minPrice), // Added check for division by zero
      normalizedProductType: productTypes.length === 0 ? 0 : productTypes.indexOf(laptop.productType) / productTypes.length // Added check for division by zero
    }));
    
    // Perform clustering
    const clusteredData = kMeans(normalizedData, numClusters);
    
    // Reduce dimensions for visualization
    return reduceDimensions(clusteredData, xAxis, yAxis);
  }, [allLaptops, isLoading, numClusters, xAxis, yAxis]); // Added isLoading and allLaptops

  // Colors for each cluster
  const clusterColors = ["#2563eb", "#7c3aed", "#dc2626", "#16a34a", "#ea580c"];
  
  // Group data by cluster
  const clusterGroups = useMemo(() => {
    const groups: Record<number, any[]> = {};
    
    processedData.forEach(item => {
      if (!groups[item.cluster]) {
        groups[item.cluster] = [];
      }
      groups[item.cluster].push(item);
    });
    
    return groups;
  }, [processedData]);

  // Count laptops in each cluster
  const clusterCounts = Object.entries(clusterGroups).map(([cluster, items]) => ({
    cluster: parseInt(cluster),
    count: items.length
  }));

  // Feature options for axis selection
  const featureOptions = [
    { value: "normalizedRAM", label: "RAM" },
    { value: "normalizedScreenSize", label: "Screen Size" },
    { value: "normalizedPrice", label: "Price" },
    { value: "normalizedProductType", label: "Product Type" }
  ];

  // Custom tooltip for scatter plot
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded shadow-lg">
          <p className="font-semibold">{data.title || 'N/A'}</p> {/* Added fallback for title */}
          <p>Brand: {data.brand || 'N/A'}</p> {/* Added fallback for brand */}
          <p>Price: ${data.price !== undefined ? data.price.toFixed(2) : 'N/A'}</p> {/* Added formatting and fallback */}
          <p>RAM: {data.ram !== undefined ? data.ram : 'N/A'}GB</p> {/* Added fallback */}
          <p>Screen: {data.screenSize !== undefined ? data.screenSize.toFixed(1) : 'N/A'}"</p> {/* Added formatting and fallback */}
          <p>Type: {data.productType || 'N/A'}</p> {/* Added fallback */}
          <p className="mt-2 font-semibold">Cluster: {(data.cluster !== undefined ? data.cluster + 1 : 'N/A')}</p> {/* Added fallback */}
        </div>
      );
    }
    return null;
  };

  if (isLoading) { // Added loading indicator
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-2xl text-muted-foreground">Loading segmentation data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Segmentation</h1>
        <p className="text-muted-foreground">
          Explore laptop clusters based on key specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle>K-Means Clustering Visualization</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
              <div>
                <Label htmlFor="x-axis">X-Axis Feature</Label>
                <Select value={xAxis} onValueChange={setXAxis}>
                  <SelectTrigger id="x-axis">
                    <SelectValue placeholder="Select feature for X-axis" />
                  </SelectTrigger>
                  <SelectContent>
                    {featureOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="y-axis">Y-Axis Feature</Label>
                <Select value={yAxis} onValueChange={setYAxis}>
                  <SelectTrigger id="y-axis">
                    <SelectValue placeholder="Select feature for Y-axis" />
                  </SelectTrigger>
                  <SelectContent>
                    {featureOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clusters">Number of Clusters</Label>
                <Select 
                  value={numClusters.toString()} 
                  onValueChange={val => setNumClusters(parseInt(val))}
                >
                  <SelectTrigger id="clusters">
                    <SelectValue placeholder="Number of clusters" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} clusters
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  }}
                >
                  <CartesianGrid />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name={featureOptions.find(f => f.value === xAxis)?.label} 
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: featureOptions.find(f => f.value === xAxis)?.label, 
                      position: 'insideBottom',
                      offset: -10
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name={featureOptions.find(f => f.value === yAxis)?.label}
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: featureOptions.find(f => f.value === yAxis)?.label, 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -5
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.entries(clusterGroups).map(([cluster, data]) => (
                    <Scatter
                      key={cluster}
                      name={`Cluster ${parseInt(cluster) + 1}`}
                      data={data}
                      fill={clusterColors[parseInt(cluster) % clusterColors.length]}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Cluster Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clusterCounts.map((item) => (
                <div key={item.cluster} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: clusterColors[item.cluster % clusterColors.length] }}
                    ></div>
                    <span className="font-medium">Cluster {item.cluster + 1}</span>
                  </div>
                  <Badge>{item.count} laptops</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Cluster Characteristics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(clusterGroups).map(([cluster, items]) => {
                // Calculate average specs for this cluster
                const avgPrice = items.reduce((sum, item) => sum + item.price, 0) / items.length;
                const avgRam = items.reduce((sum, item) => sum + item.ram, 0) / items.length;
                const avgScreenSize = items.reduce((sum, item) => sum + item.screenSize, 0) / items.length;
                
                // Most common product type
                const typeCounts: Record<string, number> = {};
                items.forEach(item => {
                  typeCounts[item.productType] = (typeCounts[item.productType] || 0) + 1;
                });
                const mostCommonType = Object.entries(typeCounts)
                  .sort(([,a], [,b]) => b - a)[0][0];
                
                return (
                  <div key={cluster} className="pb-4 border-b last:border-b-0">
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-4 h-4 rounded-full mr-2" 
                        style={{ backgroundColor: clusterColors[parseInt(cluster) % clusterColors.length] }}
                      ></div>
                      <h4 className="font-semibold">Cluster {parseInt(cluster) + 1}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Avg. Price:</div>
                      <div className="font-medium">${avgPrice.toFixed(2)}</div>
                      <div>Avg. RAM:</div>
                      <div className="font-medium">{avgRam.toFixed(1)} GB</div>
                      <div>Avg. Screen:</div>
                      <div className="font-medium">{avgScreenSize.toFixed(1)}"</div>
                      <div>Common Type:</div>
                      <div className="font-medium">{mostCommonType}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Segmentation;
