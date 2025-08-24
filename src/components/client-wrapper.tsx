"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { GlobalStateProvider } from "@/lib/stages";
import { CarSalesChat } from "@/components/car-sales-chat";
import { ReactNode } from "react";

export function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <CopilotKit
      publicApiKey={process.env.NEXT_PUBLIC_CPK_PUBLIC_API_KEY || "ck_pub_634ad133985d5452f3b0203ac2ff7ddd"}
      showDevConsole={false}
    >
      <GlobalStateProvider>
        <div className="h-full w-full min-h-screen grid grid-cols-1 lg:grid-cols-[35fr,65fr] p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
          <div className="overflow-y-auto rounded-xl border min-h-[400px] lg:min-h-[600px]">
            {children}
          </div>
          <div className="flex justify-center items-start overflow-y-auto rounded-xl min-h-[500px] lg:min-h-[600px]">
            <CarSalesChat className="w-full h-full" />
          </div>
        </div>
      </GlobalStateProvider>
    </CopilotKit>
  );
}