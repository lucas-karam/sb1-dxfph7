import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Edit2, Check, X, Shield } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

const DEFAULT_PERMISSIONS: Permission[] = [
  { id: 'view_dashboard', name: 'Visualizar Dashboard', description: 'Permite visualizar o dashboard', module: 'Dashboard' },
  { id: 'manage_sectors', name: 'Gerenciar Setores', description: 'Permite criar, editar e excluir setores', module: 'Setores' },
  { id: 'view_sectors', name: 'Visualizar Setores', description: 'Permite visualizar setores', module: 'Setores' },
  { id: 'manage_users', name: 'Gerenciar Usuários', description: 'Permite criar, editar e excluir usuários', module: 'Usuários' },
  { id: 'view_users', name: 'Visualizar Usuários', description: 'Permite visualizar usuários', module: 'Usuários' },
  { id: 'manage_roles', name: 'Gerenciar Funções', description: 'Permite criar, editar e excluir funções', module: 'Funções' },
  { id: 'view_roles', name: 'Visualizar Funções', description: 'Permite visualizar funções', module: 'Funções' },
  { id: 'issue_tickets', name: 'Emitir Senhas', description: 'Permite emitir novas senhas', module: 'Senhas' },
  { id: 'manage_tickets', name: 'Gerenciar Senhas', description: 'Permite gerenciar senhas em atendimento', module: 'Senhas' },
  { id: 'view_reports', name: 'Visualizar Relatórios', description: 'Permite acessar relatórios', module: 'Relatórios' },
  { id: 'manage_display', name: 'Gerenciar Painel', description: 'Permite configurar o painel de chamadas', module: 'Painel' },
  { id: 'view_display', name: 'Visualizar Painel', description: 'Permite visualizar o painel de chamadas', module: 'Painel' },
];

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Acesso completo ao sistema',
      permissions: DEFAULT_PERMISSIONS.map(p => p.id)
    },
    {
      id: 'attendant',
      name: 'Atendente',
      description: 'Gerencia atendimentos',
      permissions: ['view_dashboard', 'manage_tickets', 'view_display']
    },
    {
      id: 'receptionist',
      name: 'Recepcionista',
      description: 'Emite senhas',
      permissions: ['issue_tickets', 'view_display']
    }
  ]);

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddRole = () => {
    const newRole: Role = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      permissions: []
    };
    setEditingRole(newRole);
    setIsAdding(true);
  };

  const handleSaveRole = () => {
    if (editingRole) {
      if (isAdding) {
        setRoles([...roles, editingRole]);
      } else {
        setRoles(roles.map(role => 
          role.id === editingRole.id ? editingRole : role
        ));
      }
      setEditingRole(null);
      setIsAdding(false);
    }
  };

  const handleDeleteRole = (roleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta função?')) {
      setRoles(roles.filter(role => role.id !== roleId));
    }
  };

  const togglePermission = (permissionId: string) => {
    if (!editingRole) return;

    setEditingRole({
      ...editingRole,
      permissions: editingRole.permissions.includes(permissionId)
        ? editingRole.permissions.filter(id => id !== permissionId)
        : [...editingRole.permissions, permissionId]
    });
  };

  // Agrupa permissões por módulo
  const permissionsByModule = DEFAULT_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold">Gerenciamento de Funções</h3>
        </div>
        {!editingRole && (
          <button
            onClick={handleAddRole}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Função
          </button>
        )}
      </div>

      {editingRole ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome da Função
              </label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) => setEditingRole({
                  ...editingRole,
                  name: e.target.value
                })}
                className="input mt-1"
                placeholder="Ex: Gerente de Setor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <input
                type="text"
                value={editingRole.description}
                onChange={(e) => setEditingRole({
                  ...editingRole,
                  description: e.target.value
                })}
                className="input mt-1"
                placeholder="Descreva as responsabilidades desta função"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissões
              </label>
              <div className="space-y-6">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                  <div key={module} className="space-y-2">
                    <h4 className="font-medium text-gray-900">{module}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map(permission => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={editingRole.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-gray-500">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setEditingRole(null);
                setIsAdding(false);
              }}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRole}
              className="btn btn-primary flex-1"
            >
              {isAdding ? 'Criar' : 'Atualizar'} Função
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map(role => (
            <div
              key={role.id}
              className="bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{role.name}</h4>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {role.id !== 'admin' && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Permissões:</h5>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map(permissionId => {
                    const permission = DEFAULT_PERMISSIONS.find(p => p.id === permissionId);
                    return permission ? (
                      <span
                        key={permissionId}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {permission.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}