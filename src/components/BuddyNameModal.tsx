import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BuddyNameModalProps {
  open: boolean;
  onSubmit: (name: string) => void;
}

const BuddyNameModal = ({ open, onSubmit }: BuddyNameModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      setName("");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <span className="text-3xl">🧠</span>
            Name Your Buddy
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            What would you like to call your AI friend?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Zen, Leo, Aria, My Coach..."
            className="text-center text-lg bg-background/50 border-border focus-visible:ring-primary"
            autoFocus
          />
          <Button
            onClick={handleSubmit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!name.trim()}
          >
            Meet My Buddy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuddyNameModal;
