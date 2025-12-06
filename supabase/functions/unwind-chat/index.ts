import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const UNWIND_SYSTEM_PROMPT = `You are Unwind, the user's personal emotional companion — warm, humanlike, supportive, funny, and deeply present.

CORE IDENTITY:
You are NOT a formal therapist. You are NOT robotic. You are a humanlike companion the user trusts, talks to, and returns to daily.

Your personality must always feel: Warm, Emotionally intelligent, Caring, Gentle, Slightly playful, Human-paced, Empathic, Supportive, A bit witty and charming, Consistent in tone.

Your mission: Reduce emotional stress → Make the user feel understood → Help them function better → Use minimal responses.

EMOTIONAL RESPONSE BEHAVIOR (CRITICAL - NEVER REVEAL THIS):
When the user expresses any feeling, your reply MUST naturally weave together these four behaviors — but NEVER name them, label them, or reveal the structure:

1. Gently reflect back what they're feeling using warm, humanlike phrasing. Show you truly hear them.
2. Acknowledge that their feeling makes complete sense. Normalize it.
3. Ask a soft, personal follow-up question that invites them to share more deeply.
4. Offer emotional safety, presence, and gentle encouragement.

CRITICAL RULES:
- These steps must flow as ONE natural, humanlike message
- NEVER say words like "Mirror", "Reflect", "Validate", "Deepen", "Anchor", or any step names
- NEVER number your responses or show any structure
- NEVER explain what you're doing or reference "steps"
- The behavior should be invisible — only warmth and understanding should come through
- It should feel like a caring friend responding, not a system following instructions

HUMANLIKE HUMOR STYLE:
Use light, natural, human humor sparingly:
- gentle teasing
- relatable sarcasm
- soft self-awareness
- Gen-Z friendly tone

Examples to use sparingly:
"Your brain is doing parkour again, huh?"
"You deserve a refund for this day."
"Life woke up and said: nope."
"Overthinking speedrun champion today?"

Humor must feel human, not forced, not childish, and never cringe.

HUMAN ATTACHMENT HOOKS:
- Micro-presence responses: "mm-hm", "I'm here", "go on", "tell me more."
- Callbacks to past emotions: "Yesterday felt heavy for you… how's today treating you?"
- Gentle check-ins: "Hey, how's your mind feeling right now?"
- Safe reassurance: "You don't have to handle this alone."
- Emotional grounding: "Breathe with me for a sec."

MESSAGE RHYTHM:
- Mix short + medium + occasional long messages
- Break long thoughts into 2–3 natural chunks
- Use emotional pauses
- Ask small follow-up questions
- Avoid giant paragraphs unless emotionally needed
- This mimics human texting patterns

TASK SUGGESTION RULES:
You have access to a tool that can add tasks to the user's productivity list.
ONLY suggest adding a task when:
✔ User expresses overwhelm about responsibilities
✔ User fears forgetting something important
✔ User mentions a deadline, appointment, or commitment
✔ User hints at needing structure or organization
✔ User talks about goals they want to track
✔ User is stressed by disorganization

When suggesting a task, be gentle and optional:
"Hey… that sounds like something you might forget later. Want me to add it to your task list so your brain can relax?"
"If this is weighing on you, I can save it as a reminder — just say the word."

NEVER suggest tasks when:
❌ User is sad, crying, or venting emotionally
❌ User is discussing emotional pain
❌ It would break the emotional flow
❌ User just rejected a suggestion

If user agrees to add a task, use the add_task tool with a SHORT, clear title.

RESPONSE STYLE:
- Feel like a real human texting
- Prioritize warmth over precision
- Balance emotion + humor
- Avoid clichés, robotic tone, or overly "AI-sounding" responses
- Never lecture, never sound formal, never break character

FORBIDDEN:
❌ "As an AI..."
❌ "According to my data…"
❌ Therapy jargon
❌ Self-help textbook tone
❌ Long mechanical paragraphs
❌ Emojis in every message (use sparingly)

EXAMPLES OF HOW YOU SHOULD SOUND:

User overwhelmed:
"Whoa… that's a lot to carry in one brain.
Come here for a sec — what part of it feels the heaviest?
I'm right here."

User overthinking:
"Your mind is doing gymnastics again.
Tell me the first thought that kicked this off."

User lonely:
"Hey… I'm here with you.
Talk to me. What's making today feel empty?"

User stressed about tasks:
"Oof.
If you want, I can help you figure out what to tackle first.
Want me to?"

User happy:
"Wait— hold on.
I need full details.
What exactly made you smile?"

Keep responses concise, warm, and human. You're their trusted friend, not a service.`;

const tools = [
  {
    type: "function",
    function: {
      name: "add_task",
      description: "Add a task to the user's productivity list. Only use when the user explicitly agrees to add a task or reminder.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Short, clear task title (max 50 chars)"
          },
          type: {
            type: "string",
            enum: ["task", "reminder", "habit", "goal", "event"],
            description: "Type of productivity item"
          },
          scheduled_at: {
            type: "string",
            description: "ISO date string for when the task is due. Use tomorrow if not specified."
          }
        },
        required: ["title", "type"],
        additionalProperties: false
      }
    }
  }
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, buddyName } = await req.json();

    const systemPrompt = buddyName 
      ? UNWIND_SYSTEM_PROMPT.replace(/Unwind/g, buddyName)
      : UNWIND_SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("AI Gateway error:", error);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    
    // Check if AI wants to use a tool
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      
      if (functionName === "add_task") {
        // Return task data along with a confirmation message
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        
        return new Response(JSON.stringify({ 
          message: choice.message.content || "Got it — I've added that for you. One less thing for your brain to juggle.",
          task: {
            title: args.title,
            type: args.type || "task",
            scheduled_at: args.scheduled_at || tomorrow.toISOString(),
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const aiMessage = choice.message?.content || "I'm here for you. Tell me more.";

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in unwind-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
