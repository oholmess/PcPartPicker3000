import { useMemo, useState, useEffect } from "react";
import { 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Scatter 
} from "recharts";
import { 
  getLaptopDataPromise,
  Laptop 
} from "@/services/laptopData";

const ProductTypePriceDistribution = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allLaptops = await getLaptopDataPromise();
        if (allLaptops && allLaptops.length > 0) {
          const productTypes = Array.from(new Set(allLaptops.map(laptop => laptop.productType)));
          
          const dataForChart = productTypes.map(type => {
            const laptopsOfType = allLaptops.filter(laptop => laptop.productType === type);
            const prices = laptopsOfType.map(laptop => laptop.price).sort((a, b) => a - b);
            
            if (prices.length === 0) {
              return {
                type,
                min: 0, max: 0, avg: 0, median: 0, q1: 0, q3: 0
              };
            }

            const min = prices[0];
            const max = prices[prices.length - 1];
            const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
            let median, q1, q3;

            if (prices.length === 1) {
              median = q1 = q3 = prices[0];
            } else {
              median = prices.length % 2 === 0 
                ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                : prices[Math.floor(prices.length / 2)];
              q1 = prices[Math.floor(prices.length / 4)];
              q3 = prices[Math.floor(prices.length * 3 / 4)];
            }
            
            return {
              type,
              min,
              max,
              avg: parseFloat(avg.toFixed(2)),
              median,
              q1,
              q3
            };
          });
          setChartData(dataForChart);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch product type price distribution data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="h-[400px] w-full flex justify-center items-center"><p>Loading chart...</p></div>;
  }

  if (chartData.length === 0) {
    return <div className="h-[400px] w-full flex justify-center items-center"><p>No data available for chart.</p></div>;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis 
            label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip 
            formatter={(value: number) => ['$' + value.toFixed(2), '']}
          />
          <Legend />
          <Bar dataKey="q1" stackId="a" fill="#2563eb" name="25th Percentile" />
          <Bar dataKey="median" stackId="a" fill="#4f46e5" name="Median" />
          <Bar dataKey="q3" stackId="a" fill="#7c3aed" name="75th Percentile" />
          <Scatter dataKey="min" fill="#dc2626" name="Minimum" />
          <Scatter dataKey="max" fill="#16a34a" name="Maximum" />
          <Line type="monotone" dataKey="avg" stroke="#ea580c" name="Average" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductTypePriceDistribution;
