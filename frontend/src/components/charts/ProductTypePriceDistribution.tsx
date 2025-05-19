
import { useMemo } from "react";
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
import { laptopData, Laptop } from "@/services/laptopData";

const ProductTypePriceDistribution = () => {
  const chartData = useMemo(() => {
    // Group laptops by product type and calculate min, max, avg, median, q1, q3 prices
    const productTypes = Array.from(new Set(laptopData.map(laptop => laptop.productType)));
    
    return productTypes.map(type => {
      const laptops = laptopData.filter(laptop => laptop.productType === type);
      const prices = laptops.map(laptop => laptop.price).sort((a, b) => a - b);
      
      const min = prices[0];
      const max = prices[prices.length - 1];
      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const median = prices.length % 2 === 0 
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];
      const q1 = prices[Math.floor(prices.length / 4)];
      const q3 = prices[Math.floor(prices.length * 3 / 4)];
      
      return {
        type,
        min,
        max,
        avg,
        median,
        q1,
        q3
      };
    });
  }, []);

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
