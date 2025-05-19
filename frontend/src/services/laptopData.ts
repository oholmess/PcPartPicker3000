export interface Laptop {
  id: number;
  title: string;
  brand: string;
  series: string;
  offerCount: number;
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

// Fetch laptop data from the JSON file
export const fetchLaptopData = async (): Promise<Laptop[]> => {
  try {
    const response = await fetch('/laptop_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Add offerCount to each laptop object
    return data.map((laptop: any) => ({
      ...laptop,
      offerCount: laptop.offerCount !== undefined ? laptop.offerCount : 0, // Use existing if present, else default to 0
    }));
  } catch (error) {
    console.error("Could not fetch laptop data:", error);
    return []; // Return empty array on error
  }
};

// Store the promise of fetched data to avoid multiple fetches
const laptopDataPromise: Promise<Laptop[]> = fetchLaptopData();

// Export a direct way to get the promise if needed, or for components to await
export const getLaptopDataPromise = (): Promise<Laptop[]> => laptopDataPromise;

// Helper functions for data processing, now asynchronous
export const getBrands = async (): Promise<string[]> => {
  const data = await laptopDataPromise;
  return Array.from(new Set(data.map(laptop => laptop.brand)));
};

export const getProductTypes = async (): Promise<string[]> => {
  const data = await laptopDataPromise;
  return Array.from(new Set(data.map(laptop => laptop.productType)));
};

export const getCPUs = async (): Promise<string[]> => {
  const data = await laptopDataPromise;
  return Array.from(new Set(data.map(laptop => laptop.cpu)));
};

export const getGPUs = async (): Promise<string[]> => {
  const data = await laptopDataPromise;
  return Array.from(new Set(data.map(laptop => laptop.gpu)));
};

export const getOSes = async (): Promise<string[]> => {
  const data = await laptopDataPromise;
  return Array.from(new Set(data.map(laptop => laptop.os)));
};
