import React, { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { fetchLaptopData, Laptop } from "@/services/laptopData";

const BrandDistributionChart = () => {
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchLaptopData();
        setLaptops(data);
        setError(null);
      } catch (err) {
        setError("Failed to load laptop data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (laptops.length === 0) return [];
    // Group laptops by brand and count
    const brandCounts = laptops.reduce<Record<string, number>>((acc, laptop) => {
      const brand = laptop.brand;
      if (brand) { // Ensure brand is not null or empty
        acc[brand] = (acc[brand] || 0) + 1;
      }
      return acc;
    }, {});

    type ChartEntry = { name: string; value: number };

    // Convert to array for chart
    return Object.entries(brandCounts)
      .map(([brand, value]): ChartEntry => ({
        name: brand,
        value
      }))
      .sort((a: ChartEntry, b: ChartEntry) => b.value - a.value);
  }, [laptops]); // Depend on laptops state

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#0891b2'];

  if (isLoading) {
    return <div className="h-[400px] w-full flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="h-[400px] w-full flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (chartData.length === 0) {
    return <div className="h-[400px] w-full flex items-center justify-center">No data available to display chart.</div>;
  }

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
            label={({ name, percent }) => {
              if (typeof percent === 'number') {
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }
              return name; // Fallback if percent is not a number
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} models`, name as string]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BrandDistributionChart;
