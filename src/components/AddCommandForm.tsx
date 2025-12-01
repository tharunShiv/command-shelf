import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

interface AddCommandFormProps {
  onCancel: () => void;
  onCommandAdded: () => void;
}

export function AddCommandForm({ onCancel, onCommandAdded }: AddCommandFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [syntax, setSyntax] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation(); // Prevent CommandPalette from closing
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

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
        platform: "custom",
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
        // Form reset is handled by unmounting or parent
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
    <div className="flex flex-col h-full bg-card text-card-foreground overflow-hidden">
      <div 
        className="flex items-center gap-2 px-6 border-b border-border shrink-0"
        style={{ height: '50px' }}
      >
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold">Add Custom Command</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <form id="add-command-form" onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Script"
              autoFocus
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="syntax" className="text-sm font-medium">Command / Syntax</Label>
            <Textarea
              id="syntax"
              value={syntax}
              onChange={(e) => setSyntax(e.target.value)}
              placeholder="./myscript.sh --flag"
              className="font-mono text-sm min-h-[120px] resize-none"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this command do?"
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags" className="text-sm font-medium">Tags (Optional, comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="script, custom, automation"
              className="h-10"
            />
          </div>
        </form>
      </div>

      <div 
        className="px-6 border-t border-border flex justify-end items-center gap-3 bg-muted/20 shrink-0"
        style={{ height: '100px' }}
      >
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-10 px-4">
          Cancel
        </Button>
        <Button type="submit" form="add-command-form" disabled={isSubmitting} className="h-10 px-4">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Command
        </Button>
      </div>
    </div>
  );
}
