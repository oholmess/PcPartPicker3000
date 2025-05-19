
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { laptopData } from "@/services/laptopData";

const OfferComparisonChart = () => {
  const chartData = useMemo(() => {
    // Get top 15 models by offer count
    return laptopData
      .sort((a, b) => b.offerCount - a.offerCount)
      .slice(0, 15)
      .map((laptop) => ({
        name: laptop.title.length > 30 ? laptop.title.substring(0, 27) + "..." : laptop.title,
        offers: laptop.offerCount
      }));
  }, []);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend />
          <Bar dataKey="offers" name="Number of Offers" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OfferComparisonChart;
