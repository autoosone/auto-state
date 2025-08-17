import { ShowCar, ShowCars } from "@/components/generative-ui/show-car";
import { Car } from "@/lib/types";
import { useGlobalState } from "@/lib/stages";
import {
  useCopilotAction,
  useCopilotReadable,
  useCopilotAdditionalInstructions,
} from "@copilotkit/react-core";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
  useStageBuildCar is a hook that will add this stage to the state machine. It is responsible for:
  - Helping the user select a car from SUPABASE DATABASE.
  - Storing the selected car in the global state.
  - Moving to the next stage, sellFinancing.
*/
export function useStageBuildCar() {
  const { setSelectedCar, stage, setStage } = useGlobalState();
  const [availableVehicles, setAvailableVehicles] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles from Supabase when stage becomes active
  useEffect(() => {
    const loadVehicles = async () => {
      if (stage === "buildCar") {
        console.log("🚗 Loading vehicles from Supabase...");
        try {
          const { data, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('status', 'available')
            .order('make', { ascending: true });
          
          if (error) {
            console.error('❌ Error loading vehicles:', error);
            return;
          }
          
          // Transform Supabase data to match Car type using safe transformer
          const transformedCars: Car[] = data
            .filter(vehicle => vehicle.make && vehicle.model && vehicle.year && vehicle.price) // Filter out incomplete records
            .map(vehicle => ({
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              year: parseInt(vehicle.year) || new Date().getFullYear(),
              color: vehicle.exterior_color || vehicle.color || 'Not specified',
              price: parseFloat(vehicle.price) || 0,
              image: {
                src: `/images/${vehicle.make.toLowerCase()}-${vehicle.model.toLowerCase().replace(/\s+/g, '-')}.jpg`,
                alt: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                author: vehicle.dealer_id || vehicle.make
              }
            }));
          
          console.log(`✅ Loaded ${transformedCars.length} vehicles from Supabase`);
          console.log('Available makes:', [...new Set(transformedCars.map(c => c.make))].join(', '));
          
          setAvailableVehicles(transformedCars);
          setIsLoading(false);
        } catch (error) {
          console.error('❌ Failed to load vehicles:', error);
          setIsLoading(false);
        }
      }
    };
    
    loadVehicles();
  }, [stage]);

  // Conditionally add additional instructions for the agent's prompt.
  useCopilotAdditionalInstructions(
    {
      instructions:
        `CURRENT STATE: You are now helping the user select a car from our REAL INVENTORY IN SUPABASE. 
        We have ${availableVehicles.length} vehicles available including BMW, Mercedes-Benz, Honda, Toyota, and more.
        TO START, say 'Thank you for that information! What sort of car would you like to see?'. 
        We have luxury vehicles like BMW 330i ($62,000), BMW X3 ($68,000), BMW M4 ($95,600), Mercedes-Benz C300 ($65,000), 
        as well as affordable options from Honda, Toyota, Nissan, and more.
        If user asks for BMW, you MUST show them our BMW inventory!`,
      available: stage === "buildCar" ? "enabled" : "disabled",
    },
    [stage, availableVehicles.length],
  );

  // Conditionally add REAL vehicle inventory from Supabase for the agent
  useCopilotReadable(
    {
      description: `Real Vehicle Inventory from Supabase Database (${availableVehicles.length} vehicles)`,
      value: {
        totalVehicles: availableVehicles.length,
        availableMakes: [...new Set(availableVehicles.map(v => v.make))],
        vehicles: availableVehicles,
        loading: isLoading,
        bmwVehicles: availableVehicles.filter(v => v.make === 'BMW'),
        luxuryVehicles: availableVehicles.filter(v => 
          ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Land Rover'].includes(v.make || '')
        )
      },
      available: stage === "buildCar" ? "enabled" : "disabled",
    },
    [stage, availableVehicles, isLoading],
  );

  // Conditionally add an action to show a single car.
  useCopilotAction(
    {
      name: "showCar",
      description:
        "Show a single car from our REAL SUPABASE inventory. Use this when showing BMW or other vehicles.",
      available: stage === "buildCar" ? "enabled" : "disabled",
      parameters: [
        {
          name: "car",
          type: "object",
          description: "The car to show from our database",
          attributes: [
            {
              name: "id",
              type: "number",
              description: "The car id",
            },
            {
              name: "make",
              type: "string",
              description: "The car make (BMW, Mercedes-Benz, Honda, etc.)",
            },
            {
              name: "model",
              type: "string",
              description: "The car model",
            },
            {
              name: "year",
              type: "number",
              description: "The car year",
            },
            {
              name: "color",
              type: "string",
              description: "The car color",
            },
            {
              name: "price",
              type: "number",
              description: "The car price",
            },
            {
              name: "image",
              type: "object",
              description: "The car image",
              attributes: [
                {
                  name: "src",
                  type: "string",
                  description: "The car image source",
                },
                {
                  name: "alt",
                  type: "string",
                  description: "The car image alt text",
                },
                {
                  name: "author",
                  type: "string",
                  description: "The car image author",
                },
              ],
            },
          ],
        },
      ],
      handler: async ({ car }) => {
        console.log("🚗 Showing car from Supabase:", car);
        if (car && car.make && car.model) {
          setSelectedCar(car);
        } else {
          console.error("❌ Invalid car data received:", car);
        }
      },
      render: ({ status, args }) => {
        if (!args.car) {
          return (
            <div className="p-4 text-red-500">
              Error: No car data received
            </div>
          );
        }
        return (
          <ShowCar
            status={status}
            car={args.car}
            onSelect={() => {
              if (args.car && args.car.make && args.car.model) {
                setSelectedCar(args.car);
                setStage("sellFinancing");
              }
            }}
          />
        );
      },
    },
    [stage, setSelectedCar, setStage],
  );

  // Conditionally add an action to show multiple cars.
  useCopilotAction(
    {
      name: "showMultipleCars",
      description: "Show multiple cars from our SUPABASE inventory. Use this to show BMW options or compare vehicles.",
      available: stage === "buildCar" ? "enabled" : "disabled",
      parameters: [
        {
          name: "cars",
          type: "object[]",
          description: "The cars to show from our database",
          attributes: [
            {
              name: "id",
              type: "number",
              description: "The car id",
            },
            {
              name: "make",
              type: "string",
              description: "The car make",
            },
            {
              name: "model",
              type: "string",
              description: "The car model",
            },
            {
              name: "year",
              type: "number",
              description: "The car year",
            },
            {
              name: "color",
              type: "string",
              description: "The car color",
            },
            {
              name: "price",
              type: "number",
              description: "The car price",
            },
            {
              name: "image",
              type: "object",
              description: "The car image",
              attributes: [
                {
                  name: "src",
                  type: "string",
                  description: "The car image source",
                },
                {
                  name: "alt",
                  type: "string",
                  description: "The car image alt text",
                },
                {
                  name: "author",
                  type: "string",
                  description: "The car image author",
                },
              ],
            },
          ],
        },
      ],
      handler: async ({ cars }) => {
        console.log(`🚗 Showing ${cars?.length || 0} cars from Supabase`);
        if (!cars || !Array.isArray(cars)) {
          console.error("❌ Invalid cars data received:", cars);
        }
      },
      render: ({ status, args }) => {
        if (!args.cars || !Array.isArray(args.cars)) {
          return (
            <div className="p-4 text-red-500">
              Error: No cars data received
            </div>
          );
        }
        return (
          <ShowCars
            status={status}
            cars={args.cars}
            onSelect={(car: Car) => {
              if (car && car.make && car.model) {
                setSelectedCar(car);
                setStage("sellFinancing");
              }
            }}
          />
        );
      },
    },
    [stage, setSelectedCar, setStage],
  );
}
