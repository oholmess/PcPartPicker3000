
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { laptopData } from "@/services/laptopData";

const OfferComparisonChart = () => {
  const chartData = useMemo(() => {
    // Count occurrences of each laptop title
    const titleCounts = laptopData.reduce((acc, laptop) => {
      const title = laptop.title;
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array, sort by frequency and take top 10
    return Object.entries(titleCounts)
      .map(([title, count]) => ({
        name: title.length > 30 ? title.substring(0, 27) + "..." : title,
        frequency: count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
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
          <Bar dataKey="frequency" name="Frequency" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OfferComparisonChart;
