import React, { useState } from 'react';
import { User, UserRole } from '../../types/auth';
import { useAuthStore } from '../../store/authStore';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Key, 
  Shield,
  Clock,
  Mail,
  Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  sectorId?: string;
  active: boolean;
}

interface PasswordChangeData {
  userId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function UserManagement() {
  const { users, addUser, updateUser, deleteUser, changePassword } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'attendant',
    active: true,
  });
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    userId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        updateUser(editingUser, formData);
        setEditingUser(null);
      } else {
        addUser(formData);
        setIsAdding(false);
      }
      setFormData({
        name: '',
        email: '',
        role: 'attendant',
        active: true,
      });
    } catch (err) {
      setError('Falha ao salvar usuário');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await changePassword(
        changingPassword!,
        passwordData.currentPassword,
        passwordData.newPassword
      );
      setChangingPassword(null);
      setPasswordData({
        userId: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Falha ao alterar senha');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        deleteUser(userId);
      } catch (err) {
        setError('Falha ao excluir usuário');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-gray-700" />
          <h3 className="text-lg font-semibold">Gerenciamento de Usuários</h3>
        </div>
        {!isAdding && !editingUser && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {(isAdding || editingUser) && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Função
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="input mt-1"
              >
                <option value="attendant">Atendente</option>
                <option value="receptionist">Recepcionista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingUser(null);
                setFormData({
                  name: '',
                  email: '',
                  role: 'attendant',
                  active: true,
                });
              }}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {editingUser ? 'Atualizar' : 'Criar'} Usuário
            </button>
          </div>
        </form>
      )}

      {changingPassword && (
        <form onSubmit={handlePasswordChange} className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-lg font-medium mb-4">Alterar Senha</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha Atual
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nova Senha
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="input mt-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input mt-1"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setChangingPassword(null);
                setPasswordData({
                  userId: '',
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Alterar Senha
            </button>
          </div>
        </form>
      )}

      {!isAdding && !editingUser && !changingPassword && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Acesso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm text-gray-900 capitalize">
                        {user.role === 'admin' ? 'Administrador' : 
                         user.role === 'attendant' ? 'Atendente' : 'Recepcionista'}
                      </span>
                    </div>
                    {user.sectorId && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        Setor atribuído
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(user.lastLogin), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </div>
                    ) : (
                      'Nunca'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setFormData({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            sectorId: user.sectorId,
                            active: user.active,
                          });
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setChangingPassword(user.id);
                          setPasswordData({
                            userId: user.id,
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}