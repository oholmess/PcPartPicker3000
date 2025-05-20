import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { 
  getLaptopDataPromise,
  Laptop
} from "@/services/laptopData";

const OfferComparisonChart = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const laptops = await getLaptopDataPromise();
        if (laptops && laptops.length > 0) {
          const titleCounts = laptops.reduce((acc, laptop) => {
            const title = laptop.title;
            acc[title] = (acc[title] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const dataForChart = Object.entries(titleCounts)
            .map(([title, count]) => ({
              name: title.length > 30 ? title.substring(0, 27) + "..." : title,
              frequency: count
            }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 10);
          setChartData(dataForChart);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Failed to fetch offer comparison data:", error);
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
