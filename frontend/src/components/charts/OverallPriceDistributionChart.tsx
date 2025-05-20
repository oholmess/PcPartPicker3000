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

interface PriceDistributionDataPoint {
  priceRange: string; // e.g., "$0-$499"
  count: number;
}

const BIN_SIZE = 500; // Group prices into bins of $500
const MAX_PRICE_FOR_BINS = 5000; // Consider prices up to $5000 for defined bins, others go into "5000+"

const OverallPriceDistributionChart: React.FC = () => {
  const [chartData, setChartData] = useState<PriceDistributionDataPoint[]>([]);
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

        const priceBins: Record<string, number> = {};
        const numBins = Math.ceil(MAX_PRICE_FOR_BINS / BIN_SIZE);

        for (let i = 0; i < numBins; i++) {
          const lowerBound = i * BIN_SIZE;
          const upperBound = (i + 1) * BIN_SIZE -1;
          priceBins[`$${lowerBound}-$${upperBound}`] = 0;
        }
        priceBins[`$${MAX_PRICE_FOR_BINS}+`] = 0;


        laptops.forEach((laptop) => {
          const price = laptop.price;
          if (typeof price === 'number') {
            if (price >= MAX_PRICE_FOR_BINS) {
              priceBins[`$${MAX_PRICE_FOR_BINS}+`] += 1;
            } else {
              const binIndex = Math.floor(price / BIN_SIZE);
              const lowerBound = binIndex * BIN_SIZE;
              const upperBound = (binIndex + 1) * BIN_SIZE - 1;
              const binName = `$${lowerBound}-$${upperBound}`;
              if (priceBins[binName] !== undefined) {
                priceBins[binName] += 1;
              }
            }
          }
        });

        const processedData: PriceDistributionDataPoint[] = Object.entries(priceBins)
          .map(([priceRange, count]) => ({
            priceRange,
            count,
          }))
          // Ensure order of bins for the chart
          .sort((a, b) => {
            if (a.priceRange.includes('+')) return 1;
            if (b.priceRange.includes('+')) return -1;
            const aLower = parseInt(a.priceRange.split('-')[0].substring(1));
            const bLower = parseInt(b.priceRange.split('-')[0].substring(1));
            return aLower - bLower;
          });
        
        setChartData(processedData);

      } catch (err) {
        console.error("Failed to process Price Distribution data:", err);
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
          left: 20, // Adjusted left margin for Y-axis label
          bottom: 40, // Increased bottom margin for X-axis labels
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="priceRange"
          angle={-30} // Angle labels to prevent overlap
          textAnchor="end" // Anchor angled labels correctly
          interval={0} // Show all labels
          height={70} // Increase height to accommodate angled labels
        >
          <Label value="Price Range ($)" offset={-5} position="insideBottom" dy={10}/>
        </XAxis>
        <YAxis allowDecimals={false} width={80}>
          <Label value="Number of Laptops" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip
          formatter={(value: any, name: string) => {
            if (name === "Number of Laptops") return [value, "Laptops"];
            return [value, name];
          }}
          labelFormatter={(label: string) => `Price: ${label}`}
        />
        <Legend verticalAlign="top" align="right" />
        <Bar dataKey="count" name="Number of Laptops" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OverallPriceDistributionChart;