import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RamPriceChart from "@/components/charts/RamPriceChart";
import ScreenSizeDistribution from "@/components/charts/ScreenSizeDistribution";
import ProductTypePriceDistribution from "@/components/charts/ProductTypePriceDistribution";
import BrandDistributionChart from "@/components/charts/BrandDistributionChart";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laptop Market Analysis</h1>
          <p className="text-muted-foreground">
            Explore laptop offers, specifications, and market trends.
          </p>
        </div>
        <Link to="/prediction">
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            Make your wish...
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>RAM vs. Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <RamPriceChart />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Screen Size Distribution of Laptops</CardTitle>
          </CardHeader>
          <CardContent>
            <ScreenSizeDistribution />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Price Distribution by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTypePriceDistribution />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Brand Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandDistributionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
