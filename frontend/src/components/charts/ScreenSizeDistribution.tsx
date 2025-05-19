import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { 
  getLaptopDataPromise,
  Laptop
} from "@/services/laptopData";

const ScreenSizeDistribution = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        if (laptops && laptops.length > 0) {
          const screenSizeCounts = laptops.reduce<Record<string, number>>((acc, laptop) => {
            const size = laptop.screenSize.toString();
            acc[size] = (acc[size] || 0) + 1;
            return acc;
          }, {});

          const dataForChart = Object.entries(screenSizeCounts)
            .map(([size, count]) => ({
              size: `${size}"`,
              count
            }))
            .sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
          setChartData(dataForChart);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch screen size distribution data:", error);
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
