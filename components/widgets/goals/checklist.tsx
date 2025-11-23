"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import type { GoalChecklistItem } from "@/lib/db/goals";

interface ChecklistProps {
  items: GoalChecklistItem[];
  onToggle: (id: number) => Promise<void>;
  onAdd: (text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onReorder?: (ids: number[]) => Promise<void>;
  onUpdateText?: (id: number, text: string) => Promise<void>;
  disabled?: boolean;
  readOnly?: boolean; // Hides add/delete but allows toggling
  placeholder?: string;
}

export function Checklist({
  items,
  onToggle,
  onAdd,
  onDelete,
  onReorder,
  onUpdateText,
  disabled = false,
  readOnly = false,
  placeholder = "Add an item...",
}: ChecklistProps) {
  const [newItemText, setNewItemText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sort items by order_index
  const sortedItems = [...items].sort((a, b) => a.order_index - b.order_index);

  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleAdd = async () => {
    if (!newItemText.trim() || isAdding) return;

    setIsAdding(true);
    try {
      await onAdd(newItemText.trim());
      setNewItemText("");
      inputRef.current?.focus();
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleEditKeyDown = async (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleStartEdit = (item: GoalChecklistItem) => {
    if (onUpdateText) {
      setEditingId(item.id);
      setEditingText(item.text);
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (onUpdateText && editingText.trim()) {
      await onUpdateText(id, editingText.trim());
    }
    setEditingId(null);
  };

  const handleReorder = async (newOrder: GoalChecklistItem[]) => {
    if (onReorder) {
      const ids = newOrder.map(item => item.id);
      await onReorder(ids);
    }
  };

  const completedCount = sortedItems.filter(item => item.completed).length;
  const totalCount = sortedItems.length;

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground">
          {completedCount}/{totalCount} completed
        </div>
      )}

      {/* Checklist items */}
      {onReorder ? (
        <Reorder.Group
          axis="y"
          values={sortedItems}
          onReorder={handleReorder}
          className="space-y-2"
        >
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="list-none"
              >
                <ChecklistItemRow
                  item={item}
                  isEditing={editingId === item.id}
                  editingText={editingText}
                  onEditingTextChange={setEditingText}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onStartEdit={() => handleStartEdit(item)}
                  onSaveEdit={() => handleSaveEdit(item.id)}
                  onEditKeyDown={(e) => handleEditKeyDown(e, item.id)}
                  disabled={disabled}
                  readOnly={readOnly}
                  editInputRef={editInputRef}
                  draggable
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ChecklistItemRow
                  item={item}
                  isEditing={editingId === item.id}
                  editingText={editingText}
                  onEditingTextChange={setEditingText}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onStartEdit={() => handleStartEdit(item)}
                  onSaveEdit={() => handleSaveEdit(item.id)}
                  onEditKeyDown={(e) => handleEditKeyDown(e, item.id)}
                  disabled={disabled}
                  readOnly={readOnly}
                  editInputRef={editInputRef}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add new item */}
      {!disabled && !readOnly && (
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isAdding}
            className="flex-1"
          />
          <Button
            onClick={handleAdd}
            disabled={!newItemText.trim() || isAdding}
            size="icon"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface ChecklistItemRowProps {
  item: GoalChecklistItem;
  isEditing: boolean;
  editingText: string;
  onEditingTextChange: (text: string) => void;
  onToggle: (id: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onEditKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  readOnly?: boolean;
  editInputRef: React.RefObject<HTMLInputElement | null>;
  draggable?: boolean;
}

function ChecklistItemRow({
  item,
  isEditing,
  editingText,
  onEditingTextChange,
  onToggle,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onEditKeyDown,
  disabled,
  readOnly = false,
  editInputRef,
  draggable,
}: ChecklistItemRowProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(item.id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-md border bg-background group",
        item.completed && "bg-muted/50"
      )}
    >
      {draggable && (
        <div className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
      )}

      <Checkbox
        checked={item.completed}
        onCheckedChange={handleToggle}
        disabled={disabled || isToggling}
        className="cursor-pointer"
      />

      {isEditing ? (
        <Input
          ref={editInputRef}
          value={editingText}
          onChange={(e) => onEditingTextChange(e.target.value)}
          onKeyDown={onEditKeyDown}
          onBlur={onSaveEdit}
          className="flex-1 h-7 text-sm"
        />
      ) : (
        <span
          className={cn(
            "flex-1 text-sm cursor-pointer",
            item.completed && "line-through text-muted-foreground"
          )}
          onDoubleClick={onStartEdit}
        >
          {item.text}
        </span>
      )}

      {!disabled && !readOnly && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
