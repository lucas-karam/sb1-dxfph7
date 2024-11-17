import React, { useState } from 'react';
import { Tag } from '../types/queue';
import { Plus, X } from 'lucide-react';

interface TagEditorProps {
  tags: Tag[];
  onAdd: (tag: Tag) => void;
  onRemove: (tagId: string) => void;
  onUpdate: (tag: Tag) => void;
}

export function TagEditor({ tags, onAdd, onRemove, onUpdate }: TagEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#6366f1' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.name.trim()) {
      onAdd({
        id: crypto.randomUUID(),
        name: newTag.name.trim(),
        color: newTag.color
      });
      setNewTag({ name: '', color: '#6366f1' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Tags</h4>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Adicionar Tag
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="color"
            value={newTag.color}
            onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
          <input
            type="text"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            placeholder="Nome da tag"
            className="input flex-1"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setNewTag({ name: '', color: '#6366f1' });
            }}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm"
            style={{
              backgroundColor: tag.color + '20',
              color: tag.color
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            {tag.name}
            <button
              onClick={() => onRemove(tag.id)}
              className="hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}