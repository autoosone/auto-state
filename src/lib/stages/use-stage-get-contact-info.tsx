import { ContactInfo } from "@/components/generative-ui/contact-info";
import { useGlobalState } from "@/lib/stages";
import { useCopilotAction, useCopilotAdditionalInstructions } from "@copilotkit/react-core";
import { supabase } from "@/lib/supabase";

export interface UseGetContactInfoStateOptions {
  enabled: boolean;
  onNextState: () => void;
}

/**
  useStateGetContactInfo is a hook that will add this stage to the state machine. It is responsible for:
  - Getting the contact information of the user.
  - Storing the contact information in the global state.
  - Saving the contact information to Supabase.
  - Moving to the next stage, buildCar.
*/
export function useStageGetContactInfo() {
  const { setContactInfo, stage, setStage, sessionId, dbSessionId } = useGlobalState();

  // Conditionally add additional instructions for the agent's prompt.
  useCopilotAdditionalInstructions(
    {
      instructions: "CURRENT STATE: You are now getting the contact information of the user.",
      available: stage === "getContactInfo" ? "enabled" : "disabled",
    },
    [stage],
  );

  // Render the ContactInfo component and wait for the user's response.
  useCopilotAction(
    {
      name: "getContactInformation",
      description: "Get the contact information of the user",
      available: stage === "getContactInfo" ? "enabled" : "disabled",
      renderAndWaitForResponse: ({ status, respond }) => {
        return (
          <ContactInfo
            status={status}
            onSubmit={async (name, email, phone) => {
              console.log('📝 Submitting contact info:', { name, email, phone });
              
              // Save to local state first
              setContactInfo({ name, email, phone });
              
              // Save to database if we have a session
              if (dbSessionId) {
                try {
                  const { data, error } = await supabase
                    .from('contact_info')
                    .insert({
                      session_id: dbSessionId,
                      name,
                      email,
                      phone,
                      created_at: new Date().toISOString()
                    })
                    .select()
                    .single();
                  
                  if (error) {
                    console.error('❌ Failed to save contact info:', error);
                  } else {
                    console.log('✅ Contact info saved to database:', data);
                    
                    // Update session progress
                    await supabase
                      .from('car_sales_sessions')
                      .update({ 
                        contact_info_completed: true,
                        last_activity: new Date().toISOString()
                      })
                      .eq('id', dbSessionId);
                    
                    console.log('✅ Session progress updated');
                  }
                } catch (error) {
                  console.error('❌ Database error:', error);
                }
              }

              // Let the agent know that the user has submitted their contact information.
              respond?.("User has submitted their contact information.");

              // Move the state machine to the next stage
              setStage("buildCar");
            }}
          />
        );
      },
    },
    [stage, sessionId, dbSessionId],
  );
}
