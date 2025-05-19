
import { useMemo } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { laptopData, Laptop } from "@/services/laptopData";

const BrandDistributionChart = () => {
  const chartData = useMemo(() => {
    // Group laptops by brand and count
    const brandCounts = laptopData.reduce<Record<string, number>>((acc, laptop) => {
      const brand = laptop.brand;
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    // Convert to array for chart
    return Object.entries(brandCounts)
      .map(([brand, value]) => ({
        name: brand,
        value
      }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#0891b2'];

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={130}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} models`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandDistributionChart;
