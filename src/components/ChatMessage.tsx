import type { Personality } from "@/pages/AIBuddy";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  buddyName: string;
  personality: Personality;
}

const ChatMessage = ({ message, buddyName, personality }: ChatMessageProps) => {
  const isAI = message.role === "assistant";

  const getPersonalityGradient = (pers: Personality) => {
    const gradients = {
      friendly: "from-peach to-mint",
      strict: "from-sky to-lavender",
      caring: "from-mint to-calm",
      sarcastic: "from-lavender to-peach",
    };
    return gradients[pers];
  };

  if (isAI) {
    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPersonalityGradient(personality)} flex items-center justify-center ring-2 ring-primary/30`}>
          <span className="text-lg">🧠</span>
        </div>
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] border border-border">
          <p className="text-sm text-foreground">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 justify-end animate-fade-in">
      <div className="bg-gradient-to-r from-primary to-accent rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
        <p className="text-sm text-white">{message.content}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
