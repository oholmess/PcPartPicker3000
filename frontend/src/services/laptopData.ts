export interface Laptop {
  id: number;
  title: string;
  brand: string;
  series: string;
  screenSize: number; // in inches
  price: number;
  productType: string;
  ram: number; // in GB
  storage: number; // in GB
  cpu: string;
  clockSpeed: number; // in GHz
  gpu: string;
  os: string;
}

// Export a function to fetch laptop data
export const fetchLaptopData = async (): Promise<Laptop[]> => {
  try {
    const response = await fetch('/laptop_data.json'); // Path relative to public folder
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Laptop[] = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch laptop data:", error);
    return []; // Return an empty array in case of an error
  }
};

// Helper functions for data processing
// Components should call fetchLaptopData first, then pass the result to these functions.

export const getBrands = (laptops: Laptop[]): string[] => {
  if (!laptops || laptops.length === 0) return [];
  return Array.from(new Set(laptops.map(laptop => laptop.brand).filter(Boolean)));
};

export const getProductTypes = (laptops: Laptop[]): string[] => {
  if (!laptops || laptops.length === 0) return [];
  return Array.from(new Set(laptops.map(laptop => laptop.productType).filter(Boolean)));
};

export const getCPUs = (laptops: Laptop[]): string[] => {
  if (!laptops || laptops.length === 0) return [];
  return Array.from(new Set(laptops.map(laptop => laptop.cpu).filter(Boolean)));
};

export const getGPUs = (laptops: Laptop[]): string[] => {
  if (!laptops || laptops.length === 0) return [];
  return Array.from(new Set(laptops.map(laptop => laptop.gpu).filter(Boolean)));
};

export const getOSes = (laptops: Laptop[]): string[] => {
  if (!laptops || laptops.length === 0) return [];
  return Array.from(new Set(laptops.map(laptop => laptop.os).filter(Boolean)));
};
