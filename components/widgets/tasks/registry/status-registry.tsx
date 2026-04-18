"use client";

import { useState } from "react";
import { TaskStatusRecord } from "@/lib/db/tasks";
import { PlusCircle, GripVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

interface StatusRegistryProps {
  initialStatuses: TaskStatusRecord[];
  onChanged?: () => void;
}

export function StatusRegistry({ initialStatuses, onChanged }: StatusRegistryProps) {
  const [statuses, setStatuses] = useState<TaskStatusRecord[]>(initialStatuses);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchStatuses = async () => {
    try {
      const response = await fetch("/api/task-statuses?customOnly=true");
      if (response.ok) {
        const data = await response.json();
        setStatuses(data.custom || []);
      }
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
    }
  };

  const handleAddStatus = async () => {
    if (!newName.trim()) return;
    try {
      const response = await fetch("/api/task-statuses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (response.ok) {
        setNewName("");
        setIsAdding(false);
        await fetchStatuses();
        onChanged?.();
        toast.success("Status added");
      }
    } catch (error) {
      toast.error("Failed to add status");
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingName.trim()) return;
    try {
      const response = await fetch(`/api/task-statuses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (response.ok) {
        setEditingId(null);
        await fetchStatuses();
        onChanged?.();
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete status? Associated tasks will revert to 'active'.")) return;
    try {
      const response = await fetch(`/api/task-statuses/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchStatuses();
        onChanged?.();
        toast.success("Status deleted");
      }
    } catch (error) {
      toast.error("Failed to delete status");
    }
  };

  return (
    <div className="bg-media-surface-container-low p-8 rounded-xl shadow-sm h-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-lg font-black uppercase tracking-widest text-media-primary">Task Statuses</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="cursor-pointer flex items-center gap-2 text-media-secondary font-bold text-xs uppercase tracking-widest hover:underline"
        >
          <PlusCircle className="w-4 h-4" />
          Add Status
        </button>
      </div>

      <div className="space-y-3">
        {/* Predefined Statuses (Visual only, usually not editable) */}
        {['Drafting', 'In Synthesis', 'Under Review', 'Published'].map((label, i) => (
          <div key={label} className={`group flex items-center gap-4 p-4 bg-media-surface rounded-lg border border-media-outline-variant/30 transition-all ${i === 1 ? 'border-l-4 border-l-media-secondary' : i === 2 ? 'border-l-4 border-l-media-primary' : i === 3 ? 'border-l-4 border-l-media-primary-fixed-dim' : ''}`}>
             {!label.includes('Drafting') && i === 0 && <div className="w-2 h-10 rounded-full bg-media-outline-variant/40"></div>}
             {i === 0 && <div className="w-2 h-10 rounded-full bg-media-outline-variant/40"></div>}
            <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
              <div>
                <div className={`text-[10px] uppercase tracking-widest mb-1 ${i === 1 ? 'text-media-secondary' : i === 2 ? 'text-media-primary' : 'text-media-on-surface-variant'}`}>Status Label</div>
                <div className="font-bold text-media-primary">{label}</div>
              </div>
              <div className="hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-media-on-surface-variant mb-1">Description</div>
                <div className="text-sm text-media-on-surface-variant truncate">
                  {i === 0 ? 'Initial ideation and research' : 
                   i === 1 ? 'Active production and writing' :
                   i === 2 ? 'Pending editorial approval' : 'Finalized and distributed'}
                </div>
              </div>
              <div className="flex justify-end gap-3 items-center">
                <div className={`w-6 h-6 rounded-full cursor-pointer hover:ring-2 ring-offset-2 ring-media-outline ${i === 1 ? 'bg-media-secondary ring-media-secondary' : i === 2 ? 'bg-media-primary ring-media-primary' : i === 3 ? 'bg-media-primary-fixed-dim ring-media-primary-fixed-dim' : 'bg-media-outline-variant/40'}`}></div>
                <GripVertical className="w-4 h-4 text-media-on-surface-variant/40 group-hover:text-media-primary cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        ))}

        {/* Custom Statuses */}
        {statuses.map((status) => (
          <div key={status.id} className="group flex items-center gap-4 p-4 bg-media-surface rounded-lg border border-media-outline-variant/30 hover:border-media-secondary/40 transition-all">
            <div className="w-2 h-10 rounded-full bg-media-secondary/20"></div>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-3 gap-4 items-center">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-media-secondary mb-1">Custom Status</div>
                {editingId === status.id ? (
                  <input
                    autoFocus
                    className="w-full bg-transparent border-none p-0 font-bold text-media-primary focus:ring-0"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(status.id)}
                    onBlur={() => setEditingId(null)}
                  />
                ) : (
                  <div className="font-bold text-media-primary">{status.name}</div>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-[10px] uppercase tracking-widest text-media-on-surface-variant mb-1">Description</div>
                <div className="text-sm text-media-on-surface-variant truncate select-none italic opacity-60">User defined protocol</div>
              </div>
              <div className="flex justify-end gap-3 items-center">
                {editingId === status.id ? (
                  <button onClick={() => handleSaveEdit(status.id)} className="cursor-pointer text-green-600">
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(status.id); setEditingName(status.name); }} className="cursor-pointer text-media-primary/40 hover:text-media-primary">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(status.id)} className="cursor-pointer text-media-error/40 hover:text-media-error">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <GripVertical className="w-4 h-4 text-media-on-surface-variant/40 group-hover:text-media-primary cursor-pointer transition-colors" />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="group flex items-center gap-4 p-4 bg-media-surface-container-high rounded-lg border-2 border-dashed border-media-secondary/40 transition-all animate-in fade-in duration-300">
            <div className="flex-grow flex items-center gap-4">
              <input
                autoFocus
                className="flex-1 bg-transparent border-none p-2 font-bold text-media-primary focus:ring-0"
                placeholder="Name your new status..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStatus()}
              />
              <div className="flex gap-2">
                <button onClick={handleAddStatus} className="cursor-pointer bg-media-secondary text-media-on-secondary px-4 py-1 rounded text-xs font-bold uppercase tracking-widest">Save</button>
                <button onClick={() => setIsAdding(false)} className="cursor-pointer text-media-on-surface-variant px-4 py-1 rounded text-xs font-bold uppercase tracking-widest">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
