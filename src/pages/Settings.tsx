import React, { useState } from 'react';
import { useQueueStore } from '../store/queueStore';
import { Plus, Trash2, Edit2, Check, X, Eye, EyeOff } from 'lucide-react';
import { UserManagement } from '../components/settings/UserManagement';
import { RoleManagement } from '../components/settings/RoleManagement';

interface EditingSector {
  id: string;
  name: string;
  prefix: string;
  color: string;
  isVisible: boolean;
  tags: string[];
}

export function Settings() {
  const { sectors, addSector, removeSector, updateSector } = useQueueStore();
  const [editingSector, setEditingSector] = useState<EditingSector | null>(null);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'sectors' | 'users' | 'roles'>('sectors');
  
  const handleAddSector = () => {
    addSector({
      name: 'Novo Setor',
      prefix: 'NS',
      color: '#6366f1',
      isVisible: true,
      tags: [],
    });
  };

  const handleEditSave = () => {
    if (editingSector) {
      updateSector(editingSector.id, {
        name: editingSector.name,
        prefix: editingSector.prefix,
        color: editingSector.color,
        isVisible: editingSector.isVisible,
        tags: editingSector.tags,
      });
      setEditingSector(null);
    }
  };

  const handleEditCancel = () => {
    setEditingSector(null);
    setNewTag('');
  };

  const toggleVisibility = (sectorId: string, currentVisibility: boolean) => {
    updateSector(sectorId, { isVisible: !currentVisibility });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim() && editingSector) {
      setEditingSector({
        ...editingSector,
        tags: [...editingSector.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editingSector) {
      setEditingSector({
        ...editingSector,
        tags: editingSector.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sectors')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sectors'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Setores
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Funções
          </button>
        </nav>
      </div>

      {activeTab === 'sectors' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Setores</h3>
            <button
              onClick={handleAddSector}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Setor</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                {editingSector?.id === sector.id ? (
                  <>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={editingSector.color}
                          onChange={(e) => setEditingSector({
                            ...editingSector,
                            color: e.target.value
                          })}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editingSector.name}
                            onChange={(e) => setEditingSector({
                              ...editingSector,
                              name: e.target.value
                            })}
                            className="input"
                            placeholder="Nome do setor"
                          />
                          <input
                            type="text"
                            value={editingSector.prefix}
                            onChange={(e) => setEditingSector({
                              ...editingSector,
                              prefix: e.target.value.toUpperCase()
                            })}
                            className="input"
                            placeholder="Prefixo"
                            maxLength={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {editingSector.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                            >
                              {tag}
                              <button
                                onClick={() => handleRemoveTag(tag)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Adicionar tag..."
                            className="input !py-1 !px-2 text-sm min-w-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setEditingSector({
                          ...editingSector,
                          isVisible: !editingSector.isVisible
                        })}
                        className={`p-2 rounded-lg transition-colors ${
                          editingSector.isVisible 
                            ? 'text-blue-600 hover:bg-blue-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={editingSector.isVisible ? 'Visível' : 'Oculto'}
                      >
                        {editingSector.isVisible ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={handleEditSave}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: sector.color }}
                      />
                      <div>
                        <span className="font-medium">{sector.name}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          Prefixo: {sector.prefix}
                        </span>
                        {sector.tags && sector.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                              {sector.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(sector.id, sector.isVisible)}
                        className={`p-2 rounded-lg transition-colors ${
                          sector.isVisible 
                            ? 'text-blue-600 hover:bg-blue-50' 
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={sector.isVisible ? 'Visível' : 'Oculto'}
                      >
                        {sector.isVisible ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingSector({
                          ...sector,
                          tags: sector.tags || []
                        })}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeSector(sector.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {sectors.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Nenhum setor cadastrado. Adicione um setor para começar.
              </p>
            )}
          </div>
        </div>
      ) : activeTab === 'users' ? (
        <UserManagement />
      ) : (
        <RoleManagement />
      )}
    </div>
  );
}