// Supabase Vehicle type (matches database schema)
export type Vehicle = {
  id: string;              // UUID from Supabase
  dealer_id: string;       // UUID from Supabase
  vin: string;
  year: number;
  make: string;            // Required - fixes TypeError
  model: string;           // Required - fixes TypeError
  price: number;           // Required - fixes TypeError
  exterior_color?: string;
  interior_color?: string;
  mileage?: number;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  body_type?: string;
  status?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
  stock_number?: string;
  trim?: string;
  doors?: number;
  seats?: number;
  mpg_city?: number;
  mpg_highway?: number;
  features?: any;
  condition?: string;
  view_count?: number;
  horsepower?: number;
  torque?: number;
  acceleration_0_60?: number;
  msrp?: number;
  trim_package?: string;
  option_codes?: string;
};

// CopilotKit Car type (FIXED - required fields)
export type Car = {
  id: number | string;     // Required
  make: string;            // Required - fixes TypeError
  model: string;           // Required - fixes TypeError  
  year: number;            // Required - fixes TypeError
  color: string;           // Required with default
  price: number;           // Required - fixes TypeError
  image: {                 // Required with sensible defaults
    src: string;
    alt: string;
    author: string;
  };
};

// Transform Supabase Vehicle to CopilotKit Car
export function vehicleToCar(vehicle: Vehicle): Car {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.exterior_color || 'Not specified',
    price: vehicle.price,
    image: {
      src: `/images/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
      alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      author: vehicle.dealer_id || vehicle.make
    }
  };
}

export const cars: Car[] = [
  {
    id: 1,
    make: "Hyundai",
    model: "Kona",
    year: 2025,
    color: "Green",
    price: 25000,
    image: {
      src: "/images/hyundai-kona.jpg",
      alt: "Hyundai Kona",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 2,
    make: "Kia",
    model: "Tasman",
    year: 2025,
    color: "Green",
    price: 20000,
    image: {
      src: "/images/kia-tasman.jpg",
      alt: "Kia Tasman",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 3,
    make: "Kia",
    model: "EV6",
    year: 2025,
    color: "Gray",
    price: 22000,
    image: {
      src: "/images/kia-ev6.jpg",
      alt: "Kia EV6",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 4,
    make: "Kia",
    model: "EV9",
    year: 2025,
    color: "Blue",
    price: 18000,
    image: {
      src: "/images/kia-ev9.jpg",
      alt: "Kia EV9",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 5,
    make: "Hyundai",
    model: "Santa Fe",
    year: 2025,
    color: "Green",
    price: 15000,
    image: {
      src: "/images/hyundai-santa-fe.jpg",
      alt: "Hyundai Santa Fe",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 6,
    make: "Hyundai",
    model: "Santa Fe",
    year: 2025,
    color: "Brown",
    price: 27000,
    image: {
      src: "/images/hyundai-santa-fe-brown.jpg",
      alt: "Hyundai Santa Fe",
      author: "Hyundai Motor Group",
    },
  },
  {
    id: 7,
    make: "Hyundai",
    model: "Santa Fe",
    year: 2025,
    color: "Orange",
    price: 25000,
    image: {
      src: "/images/hyundai-santa-fe-orange.jpg",
      alt: "Hyundai Santa Fe",
      author: "Hyundai Motor Group",
    },
  },
];
