import { useMemo, useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { 
  getLaptopDataPromise,
  Laptop 
} from "@/services/laptopData";

const BrandDistributionChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        if (laptops && laptops.length > 0) {
          const brandCounts = laptops.reduce<Record<string, number>>((acc, laptop) => {
            const brand = laptop.brand;
            acc[brand] = (acc[brand] || 0) + 1;
            return acc;
          }, {});

          const dataForChart = Object.entries(brandCounts)
            .map(([brand, value]) => ({
              name: brand,
              value
            }))
            .sort((a, b) => b.value - a.value);
          setChartData(dataForChart);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch brand distribution data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#2563eb', '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#0891b2'];

  if (isLoading) {
    return <div className="h-[400px] w-full flex justify-center items-center"><p>Loading chart...</p></div>;
  }

  if (chartData.length === 0) {
    return <div className="h-[400px] w-full flex justify-center items-center"><p>No data available for chart.</p></div>;
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
            label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
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
