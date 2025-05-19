
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { laptopData, Laptop } from "@/services/laptopData";

const ScreenSizeDistribution = () => {
  const chartData = useMemo(() => {
    // Group laptops by screen size and count
    const screenSizeCounts = laptopData.reduce<Record<string, number>>((acc, laptop) => {
      const size = laptop.screenSize.toString();
      acc[size] = (acc[size] || 0) + 1;
      return acc;
    }, {});

    // Convert to array for chart
    return Object.entries(screenSizeCounts)
      .map(([size, count]) => ({
        size: `${size}"`,
        count
      }))
      .sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
  }, []);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="size" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="Frequency" fill="#7c3aed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScreenSizeDistribution;
