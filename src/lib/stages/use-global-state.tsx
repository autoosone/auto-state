import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Car, ContactInfo, CardInfo, Order, defaultOrders, FinancingInfo } from "@/lib/types";
import { useCopilotReadable } from "@copilotkit/react-core";
import { supabase } from "@/lib/supabase";

export type Stage =
  | "buildCar"
  | "getContactInfo"
  | "sellFinancing"
  | "getFinancingInfo"
  | "getPaymentInfo"
  | "confirmOrder";

interface GlobalState {
  sessionId: string;
  dbSessionId: number | null;
  stage: Stage;
  setStage: React.Dispatch<React.SetStateAction<Stage>>;
  selectedCar: Car | null;
  setSelectedCar: React.Dispatch<React.SetStateAction<Car | null>>;
  contactInfo: ContactInfo | null;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfo | null>>;
  cardInfo: CardInfo | null;
  setCardInfo: React.Dispatch<React.SetStateAction<CardInfo | null>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  financingInfo: FinancingInfo | null;
  setFinancingInfo: React.Dispatch<React.SetStateAction<FinancingInfo | null>>;
}

export const GlobalStateContext = createContext<GlobalState | null>(null);

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
}

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("");
  const [dbSessionId, setDbSessionId] = useState<number | null>(null);
  const [stage, setStage] = useState<Stage>("getContactInfo");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [financingInfo, setFinancingInfo] = useState<FinancingInfo | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🚀 Creating new session:', newSessionId);
      
      try {
        const { data, error } = await supabase
          .from('car_sales_sessions')
          .insert({
            session_id: newSessionId,
            current_stage: 'getContactInfo',
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ Session creation error:', error);
          // Continue without database for now
          setSessionId(newSessionId);
        } else {
          console.log('✅ Session created in database:', data);
          setSessionId(newSessionId);
          setDbSessionId(data.id);
        }
      } catch (error) {
        console.error('❌ Session creation failed:', error);
        // Continue without database
        setSessionId(newSessionId);
      }
    };
    
    initSession();
  }, []);

  // Update stage in database when it changes
  useEffect(() => {
    if (sessionId && dbSessionId) {
      const updateStage = async () => {
        console.log(`📝 Updating stage to: ${stage}`);
        
        const { error } = await supabase
          .from('car_sales_sessions')
          .update({ 
            current_stage: stage,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbSessionId);
        
        if (error) {
          console.error('❌ Stage update failed:', error);
        } else {
          console.log('✅ Stage updated in database:', stage);
        }
      };
      
      updateStage();
    }
  }, [stage, dbSessionId]);

  // Make all state readable by CopilotKit
  useCopilotReadable({
    description: "Currently Specified Information",
    value: {
      sessionId,
      dbSessionId,
      contactInfo,
      selectedCar,
      cardInfo,
      financingInfo,
      orders,
      currentStage: stage,
    },
  });

  return (
    <GlobalStateContext.Provider
      value={{
        sessionId,
        dbSessionId,
        stage,
        setStage,
        selectedCar,
        setSelectedCar,
        contactInfo,
        setContactInfo,
        cardInfo,
        setCardInfo,
        orders,
        setOrders,
        financingInfo,
        setFinancingInfo,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
}
