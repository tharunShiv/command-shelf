import React, { useState } from "react";
import { Dialog, DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AddCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommandAdded: () => void;
}

export function AddCommandModal({ isOpen, onClose, onCommandAdded }: AddCommandModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [syntax, setSyntax] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !syntax.trim()) {
      toast.error("Name and Command are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const electronApi = (window as any).electronAPI;
      if (!electronApi || !electronApi.addCustomCommand) {
        throw new Error("Electron API not available");
      }

      const newCommand = {
        id: crypto.randomUUID(),
        name: name.trim(),
        platform: "custom", // Or "all"
        category: "Custom",
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        variations: [
          {
            description: description.trim() || "Custom command",
            syntax: syntax.trim(),
            isPrimary: true
          }
        ],
        version: 1
      };

      const result = await electronApi.addCustomCommand(newCommand);
      
      if (result.success) {
        toast.success("Command added successfully");
        onCommandAdded();
        onClose();
        // Reset form
        setName("");
        setDescription("");
        setSyntax("");
        setTags("");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to add command:", error);
      toast.error("Failed to add command");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
        <DialogHeader>
          <DialogTitle>Add Custom Command</DialogTitle>
          <DialogDescription>
            Add a new custom command or script to your personal collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Script"
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="syntax">Command / Syntax</Label>
            <Textarea
              id="syntax"
              value={syntax}
              onChange={(e) => setSyntax(e.target.value)}
              placeholder="./myscript.sh --flag"
              className="col-span-3 font-mono text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this command do?"
              className="col-span-3"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags (Optional, comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="script, custom, automation"
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Command
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
