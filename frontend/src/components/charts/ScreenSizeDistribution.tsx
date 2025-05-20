import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from "recharts";

const ScreenSizeDistribution = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/laptop_screen_sizes.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const screenSizesInches: number[] = await response.json();

        if (screenSizesInches && screenSizesInches.length > 0) {
          const screenSizeCounts = screenSizesInches.reduce<Record<string, number>>((acc, size_in) => {
            const sizeKey = size_in.toString();
            acc[sizeKey] = (acc[sizeKey] || 0) + 1;
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
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="size"
            name="Screen Size"
            label={{ value: "Screen Size (inches)", position: "insideBottom", offset: -25 }}
            tickFormatter={(value) => `${value}"`}
          />
          <YAxis allowDecimals={false}>
            <Label value="Frequency" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
          </YAxis>
          <Tooltip formatter={(value: any) => [value, "Frequency"]} />
          <Bar dataKey="count" name="Frequency" fill="#7c3aed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScreenSizeDistribution;
