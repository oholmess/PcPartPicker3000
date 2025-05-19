
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

// Generate realistic laptop data
const generateLaptopData = (count: number): Laptop[] => {
  const brands = ["HP", "Dell", "Lenovo", "Asus", "Acer", "Apple", "MSI", "Samsung", "Microsoft"];
  const seriesOptions = ["Pavilion", "Inspiron", "ThinkPad", "ZenBook", "Predator", "MacBook Pro", "GF", "Galaxy Book", "Surface"];
  const productTypes = ["Gaming", "Multimedia", "Business", "Ultrabook", "Convertible", "Studio"];
  const cpus = [
    "Intel Core i3-1115G4", "Intel Core i5-1135G7", "Intel Core i7-1165G7", 
    "AMD Ryzen 3 5300U", "AMD Ryzen 5 5500U", "AMD Ryzen 7 5700U", 
    "Apple M1", "Apple M1 Pro", "Apple M2"
  ];
  const gpus = [
    "Intel UHD Graphics", "Intel Iris Xe", "NVIDIA GeForce RTX 3050", 
    "NVIDIA GeForce RTX 3060", "AMD Radeon Graphics", "AMD Radeon RX 6600M",
    "Apple M1 GPU", "Apple M1 Pro GPU", "Apple M2 GPU"
  ];
  const oses = ["Windows 10", "Windows 11", "macOS", "Chrome OS", "Linux"];

  const data: Laptop[] = [];

  for (let i = 0; i < count; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const laptopSeries = brand === "Apple" 
      ? ["MacBook Air", "MacBook Pro"][Math.floor(Math.random() * 2)]
      : seriesOptions[Math.floor(Math.random() * seriesOptions.length)];
    
    const productType = productTypes[Math.floor(Math.random() * productTypes.length)];
    
    // Adjust price ranges based on product type and brand
    let basePrice = 0;
    if (brand === "Apple") {
      basePrice = 1000 + Math.floor(Math.random() * 2000);
    } else if (productType === "Gaming") {
      basePrice = 800 + Math.floor(Math.random() * 1500);
    } else if (productType === "Business" || productType === "Ultrabook") {
      basePrice = 700 + Math.floor(Math.random() * 1300);
    } else {
      basePrice = 500 + Math.floor(Math.random() * 700);
    }
    
    // RAM options (more likely to be 8GB or 16GB)
    const ramOptions = [4, 8, 8, 16, 16, 16, 32, 32, 64];
    const ram = ramOptions[Math.floor(Math.random() * ramOptions.length)];
    
    // Adjust price based on RAM
    const ramPrice = (ram - 8) * 40;
    
    // Storage options
    const storageOptions = [256, 512, 512, 1024, 1024, 2048];
    const storage = storageOptions[Math.floor(Math.random() * storageOptions.length)];
    
    // Adjust price based on storage
    const storagePrice = (storage - 512) * 0.1;
    
    // Select CPU based on price range
    let cpu = "";
    if (brand === "Apple") {
      cpu = ["Apple M1", "Apple M1 Pro", "Apple M2"][Math.floor(Math.random() * 3)];
    } else {
      cpu = cpus[Math.floor(Math.random() * (cpus.length - 3))];
    }
    
    // Select GPU based on product type
    let gpu = "";
    if (productType === "Gaming") {
      gpu = gpus.filter(g => g.includes("NVIDIA") || g.includes("AMD Radeon RX"))[Math.floor(Math.random() * 3)];
    } else if (brand === "Apple") {
      gpu = gpus.filter(g => g.includes("Apple"))[Math.floor(Math.random() * 3)];
    } else {
      gpu = gpus.filter(g => g.includes("Intel") || g.includes("AMD Radeon Graphics"))[Math.floor(Math.random() * 3)];
    }
    
    // Select OS based on brand
    let os = "";
    if (brand === "Apple") {
      os = "macOS";
    } else {
      os = oses.filter(o => o !== "macOS")[Math.floor(Math.random() * 4)];
    }
    
    // Determine screen size
    let screenSize = 0;
    if (productType === "Gaming") {
      screenSize = [15.6, 17.3][Math.floor(Math.random() * 2)];
    } else if (productType === "Ultrabook" || productType === "Convertible") {
      screenSize = [13.3, 14, 15.6][Math.floor(Math.random() * 3)];
    } else {
      screenSize = [13.3, 14, 15.6, 17.3][Math.floor(Math.random() * 4)];
    }
    
    // Adjust price based on screen size
    const screenPrice = (screenSize - 14) * 50;
    
    // Calculate final price with some randomness
    const finalPrice = Math.round((basePrice + ramPrice + storagePrice + screenPrice) * (0.9 + Math.random() * 0.2));
    
    // Generate clock speed based on CPU
    let clockSpeed = 0;
    if (cpu.includes("i3")) {
      clockSpeed = 2.4 + Math.random() * 0.6;
    } else if (cpu.includes("i5")) {
      clockSpeed = 2.6 + Math.random() * 0.8;
    } else if (cpu.includes("i7")) {
      clockSpeed = 2.8 + Math.random() * 1.0;
    } else if (cpu.includes("Ryzen 3")) {
      clockSpeed = 2.6 + Math.random() * 0.7;
    } else if (cpu.includes("Ryzen 5")) {
      clockSpeed = 2.7 + Math.random() * 0.9;
    } else if (cpu.includes("Ryzen 7")) {
      clockSpeed = 3.0 + Math.random() * 1.2;
    } else {
      clockSpeed = 3.2 + Math.random() * 0.6;
    }
    clockSpeed = parseFloat(clockSpeed.toFixed(1));
    
    // Generate offer count (more popular products have more offers)
    let offerCount = 0;
    if (finalPrice < 700) {
      offerCount = 1 + Math.floor(Math.random() * 5);
    } else if (finalPrice < 1200) {
      offerCount = 3 + Math.floor(Math.random() * 7);
    } else {
      offerCount = 2 + Math.floor(Math.random() * 4);
    }
    
    // Generate title
    const title = `${brand} ${laptopSeries} ${screenSize}" - ${cpu} - ${ram}GB RAM - ${storage}GB - ${os}`;

    data.push({
      id: i + 1,
      title,
      brand,
      series: laptopSeries,
      offerCount,
      screenSize,
      price: finalPrice,
      productType,
      ram,
      storage,
      cpu,
      clockSpeed,
      gpu,
      os
    });
  }

  return data;
};

// Export 100 laptop data entries
export const laptopData: Laptop[] = generateLaptopData(100);

// Helper functions for data processing
export const getBrands = (): string[] => {
  return Array.from(new Set(laptopData.map(laptop => laptop.brand)));
};

export const getProductTypes = (): string[] => {
  return Array.from(new Set(laptopData.map(laptop => laptop.productType)));
};

export const getCPUs = (): string[] => {
  return Array.from(new Set(laptopData.map(laptop => laptop.cpu)));
};

export const getGPUs = (): string[] => {
  return Array.from(new Set(laptopData.map(laptop => laptop.gpu)));
};

export const getOSes = (): string[] => {
  return Array.from(new Set(laptopData.map(laptop => laptop.os)));
};
