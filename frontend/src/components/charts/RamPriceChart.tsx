import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { getLaptopDataPromise, Laptop } from '@/services/laptopData';

interface RamPriceDataPoint {
  ram: number;
  averagePrice: number;
  count: number;
}

const RamPriceChart: React.FC = () => {
  const [chartData, setChartData] = useState<RamPriceDataPoint[]>([]);
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
          setChartData([]);
          setIsLoading(false);
          return;
        }

        const ramPriceMap = new Map<number, { totalPrice: number; count: number }>();

        laptops.forEach((laptop) => {
          const ram = laptop.ram;
          const price = laptop.price;

          if (typeof ram === 'number' && typeof price === 'number') {
            if (!ramPriceMap.has(ram)) {
              ramPriceMap.set(ram, { totalPrice: 0, count: 0 });
            }
            const current = ramPriceMap.get(ram)!;
            current.totalPrice += price;
            current.count += 1;
          }
        });

        const processedData: RamPriceDataPoint[] = Array.from(ramPriceMap.entries())
          .map(([ram, data]) => ({
            ram,
            averagePrice: data.count > 0 ? parseFloat((data.totalPrice / data.count).toFixed(2)) : 0,
            count: data.count,
          }))
          .sort((a, b) => a.ram - b.ram);

        setChartData(processedData);
      } catch (err) {
        console.error("Failed to process RAM vs. Price data:", err);
        setError("Failed to load chart data.");
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">No data to display.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="ram"
          name="RAM"
          tickFormatter={(value) => `${value} GB`}
        >
          <Label value="RAM (GB)" offset={-25} position="insideBottom" />
        </XAxis>
        <YAxis 
          type="number" 
          dataKey="averagePrice"
          name="Average Price" 
          unit="$"
          tickFormatter={(value) => `$${value.toFixed(0)}`}
          domain={[0, 'dataMax + 100']}
        >
          <Label value="Average Price ($)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip
          cursor={{ fill: 'transparent' }}
          formatter={(value: any, name: string, props: any) => {
            if (name === "Average Price") return [`$${Number(value).toFixed(2)}`, name];
            if (name === "RAM") return [`${props.payload.ram} GB`, name];
            if (name === "Count") return [props.payload.count, name];
            return [value, name];
          }}
          labelFormatter={(label: number) => `RAM: ${label} GB`}
        />
        <Legend verticalAlign="top" height={36}/>
        <Bar dataKey="averagePrice" name="Average Price" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RamPriceChart; 