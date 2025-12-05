import { useState, useEffect, useRef } from "react";
import { Send, Settings, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "@/components/ChatMessage";
import QuickActionChips from "@/components/QuickActionChips";
import BuddyNameModal from "@/components/BuddyNameModal";
import PersonalitySelector from "@/components/PersonalitySelector";
import DataIntegrationPanel from "@/components/DataIntegrationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskSuggestion {
  title: string;
  type: string;
  scheduled_at: string;
}

export type Personality = "friendly" | "strict" | "caring" | "sarcastic";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIBuddyScreen = () => {
  const [buddyName, setBuddyName] = useState(() => 
    localStorage.getItem("buddyName") || ""
  );
  const [personality, setPersonality] = useState<Personality>(() => 
    (localStorage.getItem("buddyPersonality") as Personality) || "friendly"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNameModal, setShowNameModal] = useState(!buddyName);
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (buddyName && messages.length === 0) {
      const greeting = getGreeting();
      addAIMessage(greeting);
    }
  }, [buddyName]);

  const getGreeting = () => {
    const greetings: Record<Personality, string> = {
      friendly: `Hey there! I'm ${buddyName}. How's your mind feeling right now?`,
      strict: `Hello. I'm ${buddyName}. Let's focus on your wellness goals today. What do you need help with?`,
      caring: `Hi sweetie! I'm ${buddyName}, and I'm here to support you. How's your heart doing today?`,
      sarcastic: `Oh look who decided to show up! I'm ${buddyName}. Ready to pretend we'll actually meditate today?`,
    };
    return greetings[personality];
  };

  const handleNameSubmit = (name: string) => {
    setBuddyName(name);
    localStorage.setItem("buddyName", name);
    setShowNameModal(false);
  };

  const handlePersonalityChange = (newPersonality: Personality) => {
    setPersonality(newPersonality);
    localStorage.setItem("buddyPersonality", newPersonality);
    setShowPersonalitySelector(false);
  };

  const addAIMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const { data, error } = await supabase.functions.invoke("unwind-chat", {
        body: { 
          messages: conversationHistory,
          buddyName: buddyName || "Unwind",
        },
      });

      if (error) throw error;

      addAIMessage(data.message);

      // Handle task creation if AI suggested one
      if (data.task) {
        await handleTaskCreation(data.task);
      }
    } catch (error) {
      console.error("Error calling AI:", error);
      toast({
        title: "Connection issue",
        description: "I'm having trouble connecting. Let me try again.",
        variant: "destructive",
      });
      addAIMessage("Hey, I'm having a moment here. Mind trying that again?");
    } finally {
      setIsTyping(false);
    }
  };

  const handleTaskCreation = async (task: TaskSuggestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Sign in needed",
          description: "Sign in to save tasks to your list.",
        });
        return;
      }

      const { error } = await supabase.from("productivity_items").insert({
        title: task.title,
        type: task.type,
        scheduled_at: task.scheduled_at,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Task added",
        description: `"${task.title}" added to your list.`,
      });
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Couldn't save task",
        description: "Something went wrong. Try again?",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const getPersonalityEmoji = () => {
    const emojis: Record<Personality, string> = {
      friendly: "😊",
      strict: "📋",
      caring: "💕",
      sarcastic: "😏",
    };
    return emojis[personality];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-sky/10 flex flex-col">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-lavender rounded-full flex items-center justify-center">
                <span className="text-lg">{getPersonalityEmoji()}</span>
              </div>
              <div>
                <h1 className="font-bold text-foreground">{buddyName || "AI Buddy"}</h1>
                <p className="text-xs text-muted-foreground capitalize">{personality} mode</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setShowPersonalitySelector(true)}
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>

      {/* Data Integration Panel Toggle */}
      <div className="max-w-md mx-auto w-full px-6 pt-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between text-sm text-muted-foreground"
          onClick={() => setShowDataPanel(!showDataPanel)}
        >
          <span>Your Progress Summary</span>
          {showDataPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        {showDataPanel && <DataIntegrationPanel onToggle={() => setShowDataPanel(false)} />}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-w-md mx-auto w-full">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            buddyName={buddyName}
            personality={personality}
          />
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">{buddyName} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-card/80 backdrop-blur-lg border-t border-border/50 p-4 max-w-md mx-auto w-full">
        <QuickActionChips onActionClick={handleQuickAction} />
        <div className="flex gap-2 mt-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background/50"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-primary text-primary-foreground"
            disabled={!inputValue.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <BuddyNameModal
        open={showNameModal}
        onSubmit={handleNameSubmit}
      />
      <PersonalitySelector
        open={showPersonalitySelector}
        currentPersonality={personality}
        onSelect={handlePersonalityChange}
        onClose={() => setShowPersonalitySelector(false)}
      />
    </div>
  );
};

export default AIBuddyScreen;
