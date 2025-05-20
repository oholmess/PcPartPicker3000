import React, { useState, useEffect, useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getLaptopDataPromise, Laptop } from '@/services/laptopData';

interface ModelFrequency {
  name: string;
  frequency: number;
}

const TopModelsChart: React.FC = () => {
  const [modelData, setModelData] = useState<ModelFrequency[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const laptops = await getLaptopDataPromise();
        if (!laptops || laptops.length === 0) {
          setError("No laptop data available.");
          setModelData([]);
          setIsLoading(false);
          return;
        }

        const frequencyMap = new Map<string, number>();
        laptops.forEach((laptop) => {
          const title = laptop.title || "Unknown Model";
          frequencyMap.set(title, (frequencyMap.get(title) || 0) + 1);
        });

        const sortedModels = Array.from(frequencyMap.entries())
          .map(([name, frequency]) => ({ name, frequency }))
          .sort((a, b) => b.frequency - a.frequency);

        setModelData(sortedModels.slice(0, 20));
      } catch (err) {
        console.error("Failed to process model data:", err);
        setError("Failed to load model data.");
        setModelData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    // For dot chart, each point needs x and y. We use index for y to spread them out.
    // The actual name will be shown in the tooltip or potentially a Y-axis label formatter if needed.
    return modelData.map((model, index) => ({
      x: model.frequency,
      y: index, // Using index for y-axis positioning
      name: model.name,
      frequency: model.frequency,
    }));
  }, [modelData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (modelData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400 + modelData.length * 10}> {/* Adjust height based on number of items */}
      <ScatterChart
        margin={{
          top: 20,
          right: 20,
          bottom: 40, // Increased bottom margin for X-axis label
          left: 150, // Increased left margin for Y-axis labels (model names)
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          type="number" 
          dataKey="x" 
          name="Frequency" 
          label={{ value: "Frequency", position: "insideBottom", offset: -25 }} 
          allowDecimals={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          name="Model"
          interval={0}
          tickFormatter={(tick, index) => modelData[index]?.name || ''}
          width={150} // Ensure enough space for long model names
          tick={{ fontSize: 10, width: 150, textAnchor: 'end' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value: any, name: string, props: any) => {
            if (name === "Model") return props.payload.name;
            if (name === "Frequency") return props.payload.frequency;
            return value;
          }}
          labelFormatter={(label: number) => modelData[label]?.name || 'Model'}
        />
        <Scatter name="Laptops" data={chartData} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default TopModelsChart; 