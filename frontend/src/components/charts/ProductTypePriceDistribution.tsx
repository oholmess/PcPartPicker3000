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
  Scatter,
  Label
} from "recharts";
import { 
  getLaptopDataPromise,
  Laptop 
} from "@/services/laptopData";

const calculatePriceStats = (prices: number[]) => {
  if (prices.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, q1: 0, q3: 0 };
  }
  prices.sort((a, b) => a - b);
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
    min,
    max,
    avg: parseFloat(avg.toFixed(2)),
    median,
    q1,
    q3
  };
};

const ProductTypePriceDistribution = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const numberOfTopTypes = 7; // Display top 7 types + "Other"

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const allLaptops = await getLaptopDataPromise();
        if (allLaptops && allLaptops.length > 0) {

          // Count frequencies of each product type
          const typeCounts: Record<string, number> = {};
          allLaptops.forEach(laptop => {
            typeCounts[laptop.productType] = (typeCounts[laptop.productType] || 0) + 1;
          });

          const sortedTypesByFreq = Object.entries(typeCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([type]) => type);

          const topTypes = sortedTypesByFreq.slice(0, numberOfTopTypes);
          const otherTypes = sortedTypesByFreq.slice(numberOfTopTypes);

          const dataForChart = [];

          // Process top types
          for (const type of topTypes) {
            const laptopsOfType = allLaptops.filter(laptop => laptop.productType === type);
            const prices = laptopsOfType.map(laptop => laptop.price);
            dataForChart.push({
              type,
              ...calculatePriceStats(prices)
            });
          }

          // Process "Other" types if any
          if (otherTypes.length > 0) {
            const laptopsOfOtherTypes = allLaptops.filter(laptop => otherTypes.includes(laptop.productType));
            const pricesOfOtherTypes = laptopsOfOtherTypes.map(laptop => laptop.price);
            if (pricesOfOtherTypes.length > 0) {
                dataForChart.push({
                    type: "Other",
                    ...calculatePriceStats(pricesOfOtherTypes)
                });
            }
          }
          
          // Sort final chart data by average price or keep specific order if needed (e.g., top types first then Other)
          // For now, using the order: top types (by original freq), then Other.
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
            top: 10,      // Reduced top margin for the chart itself
            right: 30,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="type" 
            interval={0} // Show all labels
            angle={-30}    // Angle labels to prevent overlap
            textAnchor="end" // Anchor angled labels correctly
            height={70}    // Increase height of XAxis to accommodate angled labels
            dy={10}        // Push labels down a bit
          />
          <YAxis 
            domain={[0, 'dataMax + 100']} // Starts at 0
            tickFormatter={(value) => typeof value === 'number' ? `$${value.toFixed(0)}` : String(value)}
            width={80} // Explicitly set YAxis width
          >
            <Label 
              value="Price ($)" 
              angle={-90} 
              position="insideLeft" 
              style={{ textAnchor: 'middle' }}
              offset={-10} // Adjust offset to push label further left from ticks
            />
          </YAxis>
          <Tooltip 
            formatter={(value: any, name: string, props: any) => { // Using a more general type for value from props
              const val = props.payload && props.payload[name]; // Attempt to get the raw value if name is a dataKey
              const displayValue = typeof val === 'number' ? val : (typeof value === 'number' ? value : parseFloat(String(value)));

              if (typeof displayValue === 'number') {
                 // For specific dataKeys, we might want custom formatting
                if (name === 'min' || name === 'max' || name === 'avg' || name === 'median' || name === 'q1' || name === 'q3') {
                  return [`$${displayValue.toFixed(2)}`, name]; 
                }
                return [displayValue.toFixed(2), name]; // Default numeric formatting
              }
              return [String(value), name]; // Fallback for non-numeric
            }}
          />
          <Legend 
            verticalAlign="top" 
            wrapperStyle={{ 
              paddingTop: '10px', // Add padding above the legend
              paddingBottom: '20px' // Ensure enough space between legend and chart content
            }}
          />
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
