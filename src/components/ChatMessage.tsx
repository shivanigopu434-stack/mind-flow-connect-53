import type { Personality, Message } from "@/screens/AIBuddyScreen";
import UnwindOrb from "@/components/UnwindOrb";

interface ChatMessageProps {
  message: Message;
  buddyName: string;
  personality: Personality;
}

const ChatMessage = ({ message, buddyName, personality }: ChatMessageProps) => {
  const isAI = message.role === "assistant";

  if (isAI) {
    return (
      <div className="flex items-start gap-3 animate-fade-in">
        <UnwindOrb size="md" animated={false} />
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
