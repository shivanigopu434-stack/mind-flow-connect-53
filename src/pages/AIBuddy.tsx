import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import BuddyNameModal from "@/components/BuddyNameModal";
import PersonalitySelector from "@/components/PersonalitySelector";
import ChatMessage from "@/components/ChatMessage";
import QuickActionChips from "@/components/QuickActionChips";
import DataIntegrationPanel from "@/components/DataIntegrationPanel";

export type Personality = "friendly" | "strict" | "caring" | "sarcastic";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AIBuddy = () => {
  const navigate = useNavigate();
  const [buddyName, setBuddyName] = useState<string | null>(null);
  const [userName] = useState("Jaya"); // This would come from user profile
  const [personality, setPersonality] = useState<Personality>("friendly");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPersonalitySelector, setShowPersonalitySelector] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if buddy has a name, if not show modal
    const storedBuddyName = localStorage.getItem("buddyName");
    if (!storedBuddyName) {
      setShowNameModal(true);
    } else {
      setBuddyName(storedBuddyName);
      // Add initial greeting
      addAIMessage(getGreeting(storedBuddyName, userName, personality));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const getGreeting = (buddy: string, user: string, pers: Personality) => {
    const greetings = {
      friendly: `Hey ${user}, I'm ${buddy}! 🌟 Ready to make today amazing?`,
      strict: `${user}. I'm ${buddy}. Focus. No excuses. Let's get to work.`,
      caring: `Hi ${user}, I'm ${buddy}. 🤗 You're doing great. Let's move one small step forward together.`,
      sarcastic: `Oh wow, ${user}. I'm ${buddy}. Productivity looks good on you today... if you actually do something. 😏`,
    };
    return greetings[pers];
  };

  const handleNameSubmit = (name: string) => {
    setBuddyName(name);
    localStorage.setItem("buddyName", name);
    setShowNameModal(false);
    addAIMessage(getGreeting(name, userName, personality));
  };

  const handlePersonalityChange = (newPersonality: Personality) => {
    setPersonality(newPersonality);
    localStorage.setItem("buddyPersonality", newPersonality);
    setShowPersonalitySelector(false);
    
    const responses = {
      friendly: "Awesome! I'm all about good vibes and support now! 🌈",
      strict: "Strict mode activated. Time to cut the noise and focus.",
      caring: "I'm here for you, always. Let's take care of yourself first. 💙",
      sarcastic: "Oh great, sarcasm mode. This should be fun... for me. 😏",
    };
    addAIMessage(responses[newPersonality]);
  };

  const addAIMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
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
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = getAIResponse(inputValue, personality, buddyName || "Buddy");
      setIsTyping(false);
      addAIMessage(responses);
    }, 1500);
  };

  const getAIResponse = (input: string, pers: Personality, buddy: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("motivate")) {
      const motivations = {
        friendly: "You've got this! Every small step is progress. Keep shining! ✨",
        strict: "Stop waiting for motivation. Discipline beats motivation every time. Move.",
        caring: "I believe in you. You're stronger than you think. Take it one breath at a time. 💙",
        sarcastic: "Oh, you need motivation? How about the fact that time is passing and you're asking me instead of doing? 😏",
      };
      return motivations[pers];
    }

    if (lowerInput.includes("task") || lowerInput.includes("reminder") || lowerInput.includes("goal")) {
      return "I can help you with that! Use the quick action buttons below to add tasks, reminders, or goals. 🎯";
    }

    const defaultResponses = {
      friendly: `That's interesting! I'm here to help you crush your goals. What can I do for you today? 🌟`,
      strict: `Got it. Now let's turn that into action. What's the next step?`,
      caring: `I hear you. Let's work through this together. What matters most to you right now? 💙`,
      sarcastic: `Fascinating story. Now, are we actually going to be productive, or...? 😏`,
    };
    return defaultResponses[pers];
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const getPersonalityEmoji = (pers: Personality) => {
    const emojis = {
      friendly: "🧡",
      strict: "💪",
      caring: "🤗",
      sarcastic: "😏",
    };
    return emojis[pers];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender via-background to-sky flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">
                {buddyName || "AI Buddy"}
              </h1>
              <span className="text-xl">{getPersonalityEmoji(personality)}</span>
            </div>
            <p className="text-xs text-muted-foreground capitalize">{personality} mode</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPersonalitySelector(true)}
          className="hover:bg-accent"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            buddyName={buddyName || "Buddy"}
            personality={personality}
          />
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center ring-2 ring-primary/30 animate-pulse">
              <span className="text-lg">🧠</span>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] border border-border">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Data Integration Panel */}
      {showDataPanel && <DataIntegrationPanel onToggle={() => setShowDataPanel(false)} />}

      {/* Input Area */}
      <div className="bg-card/80 backdrop-blur-sm border-t border-border px-4 py-3 space-y-3">
        <QuickActionChips onActionClick={handleQuickAction} />
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={`Type or ask ${buddyName || "your buddy"} anything…`}
            className="flex-1 bg-background/50 border-border focus-visible:ring-primary"
          />
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!inputValue.trim()}
          >
            <Send className="h-4 w-4" />
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

export default AIBuddy;
