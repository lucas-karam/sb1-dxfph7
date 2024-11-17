import React from 'react';
import { Tag } from '../../types/queue';

interface TagModalProps {
  availableTags: Tag[];
  selectedTags: string[];
  onClose: () => void;
  onSave: (selectedTags: string[]) => void;
}

const DEFAULT_TAGS = [
  'Prioridade',
  'Panoramica',
  'Foto',
  'Tomografia',
  'Periapical',
  'Escaneamento Digital'
];

export function TagModal({ selectedTags, onClose, onSave }: TagModalProps) {
  const [localSelectedTags, setLocalSelectedTags] = React.useState<string[]>(selectedTags);

  const handleToggleTag = (tag: string) => {
    setLocalSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = () => {
    onSave(localSelectedTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Gerenciar Tags</h3>
          <span className="text-sm text-gray-500">
            {localSelectedTags.length} selecionada(s)
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {DEFAULT_TAGS.map(tag => (
            <label
              key={tag}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={localSelectedTags.includes(tag)}
                onChange={() => handleToggleTag(tag)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="flex-1">{tag}</span>
              {localSelectedTags.includes(tag) && (
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                  Selecionado
                </span>
              )}
            </label>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            Cancelar
          </button>
          <button onClick={handleSave} className="btn btn-primary flex-1">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}