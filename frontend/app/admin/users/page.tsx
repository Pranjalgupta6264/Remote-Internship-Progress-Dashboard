'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Search, UserPlus } from 'lucide-react';
import api, { getApiErrorMessage } from '@/lib/api';
import { User, UserRole } from '@/types';
import { StatusMessage } from '@/components/ui/StatusMessage';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<'error' | 'success' | 'loading'>('loading');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<UserRole>(UserRole.INTERN);
  const [editingIsActive, setEditingIsActive] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: unknown) {
      setFeedbackTone('error');
      setFeedback(getApiErrorMessage(error, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => users.filter((user) => {
    const matchesSearch = user.full_name.toLowerCase().includes(search.toLowerCase()) ||
                          user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  }), [users, search, filterRole]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-500/20 text-red-300 border border-red-500/30',
      mentor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      intern: 'bg-green-500/20 text-green-300 border border-green-500/30',
    };
    return colors[role] || colors.intern;
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return '👑';
      case 'mentor': return '👨‍🏫';
      default: return '👨‍🎓';
    }
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditingRole(user.role);
    setEditingIsActive(user.is_active);
  };

  const saveEdit = async () => {
    if (!editingUserId) return;
    setIsSaving(true);
    setFeedbackTone('loading');
    setFeedback(null);
    try {
      await api.patch(`/users/${editingUserId}`, {
        role: editingRole,
        is_active: editingIsActive,
      });
      setFeedbackTone('success');
      setFeedback('User updated successfully');
      setEditingUserId(null);
      await fetchUsers();
    } catch (error: unknown) {
      setFeedbackTone('error');
      setFeedback(getApiErrorMessage(error, 'Failed to update user'));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user account?')) return;
    setFeedbackTone('loading');
    setFeedback(null);
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setFeedbackTone('success');
      setFeedback('User deleted successfully');
    } catch (error: unknown) {
      setFeedbackTone('error');
      setFeedback(getApiErrorMessage(error, 'Failed to delete user'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage all users in the system</p>
        </div>
        <Link
          href="/admin/users/add"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/20"
        >
          <UserPlus size={18} />
          Add New User
        </Link>
      </div>
      {loading && <StatusMessage tone="loading" message="Loading users..." />}
      {feedback && <StatusMessage tone={feedbackTone} message={feedback} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Users</p>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Active Users</p>
          <p className="text-2xl font-bold text-white">{users.filter((u) => u.is_active).length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Mentors</p>
          <p className="text-2xl font-bold text-white">{users.filter((u) => u.role === UserRole.MENTOR).length}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Interns</p>
          <p className="text-2xl font-bold text-white">{users.filter((u) => u.role === UserRole.INTERN).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1A1F3A] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2.5 bg-[#1A1F3A] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="mentor">Mentor</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-[#11162E]/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0D1130]">
                <th className="text-left p-4 text-gray-400 font-medium text-sm">User</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Email</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Role</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Joined</th>
                <th className="text-left p-4 text-gray-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-all duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium shadow-lg">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.full_name}</p>
                        <p className="text-gray-500 text-xs">ID: {user.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-gray-300">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${getRoleColor(user.role)}`}>
                      <span>{getRoleIcon(user.role)}</span>
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(user)} className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => void deleteUser(user.id)} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-[#11162E]/50 rounded-2xl border border-gray-800">
          <p className="text-gray-400">No users found</p>
        </div>
      )}
      {editingUserId && (
        <div className="rounded-2xl border border-gray-800 bg-[#11162E]/80 p-4 md:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <select value={editingRole} onChange={(e) => setEditingRole(e.target.value as UserRole)} className="rounded-lg bg-[#1A1F3A] border border-gray-700 px-3 py-2 text-white">
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.MENTOR}>Mentor</option>
              <option value={UserRole.INTERN}>Intern</option>
            </select>
            <label className="flex items-center gap-2 text-gray-200">
              <input type="checkbox" checked={editingIsActive} onChange={(e) => setEditingIsActive(e.target.checked)} />
              Active
            </label>
            <div className="flex gap-2">
              <button disabled={isSaving} onClick={() => void saveEdit()} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">Save</button>
              <button onClick={() => setEditingUserId(null)} className="rounded-lg bg-slate-700 px-4 py-2 text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}