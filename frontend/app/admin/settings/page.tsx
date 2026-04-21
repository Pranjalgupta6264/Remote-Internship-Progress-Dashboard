'use client';
import { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [weekNumber, setWeekNumber] = useState(8);
  const [totalWeeks, setTotalWeeks] = useState(12);
  const [deadline, setDeadline] = useState('friday');
  const [emailNotify, setEmailNotify] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');

  const saveSettings = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
    setSaving(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setPasswordMessage('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordMessage('Password must be at least 6 characters');
      return;
    }
    
    try {
      await api.post('/auth/change-password', {
        current_password: passwordData.current,
        new_password: passwordData.new
      });
      setPasswordMessage('Password changed successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err: unknown) {
      const detail = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : undefined;
      setPasswordMessage(detail || 'Failed to change password');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">System Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Current Week</label>
              <input
                type="number"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
                min="1"
                max={totalWeeks}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Total Weeks (Internship Duration)</label>
              <input
                type="number"
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(parseInt(e.target.value))}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
                min="4"
                max="24"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Report Deadline Day</label>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-[#1A1F3A]"
              />
              <label className="text-gray-300">Enable Email Notifications</label>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            {message && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-2 text-center">
                <p className="text-green-400 text-sm">{message}</p>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lock size={18} />
            Change Password
          </h3>

          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Current Password</label>
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="w-full px-4 py-2 bg-[#1A1F3A] border border-[#2A2F4A] rounded-lg text-white"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition"
            >
              <Lock size={16} />
              Change Password
            </button>

            {passwordMessage && (
              <div className={`p-2 rounded-lg text-center text-sm ${passwordMessage.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'}`}>
                {passwordMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}