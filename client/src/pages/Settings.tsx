import { useState } from 'react';
import { Save, Bell, Moon, RefreshCw, User, Shield, Database } from 'react-feather';
import Error from '../components/Error';

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoSave: boolean;
}

const Settings = () => {
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    darkMode: false,
    autoSave: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement settings update logic
    console.log('Saving settings:', settings);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Error message="Settings page is under construction" />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Customize your QuizMe experience and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 overflow-hidden sticky top-24">
            <div className="px-4 py-3 bg-gray-50 dark:bg-surface-700 border-b border-gray-100 dark:border-surface-600">
              <h2 className="font-medium text-gray-800 dark:text-gray-100">Settings Menu</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-surface-700">
              <button className="w-full px-4 py-3 flex items-center gap-3 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/40 border-l-2 border-primary-600 dark:border-primary-500 font-medium">
                <User size={18} />
                <span>Account</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                <Bell size={18} />
                <span>Notifications</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                <Shield size={18} />
                <span>Privacy</span>
              </button>
              <button className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-colors">
                <Database size={18} />
                <span>Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-gray-100 dark:border-surface-700 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 dark:bg-surface-700 border-b border-gray-100 dark:border-surface-600">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Account Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your preferences and account settings</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-surface-600">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/50 rounded-lg text-primary-600 dark:text-primary-400">
                      <Bell size={20} />
                    </div>
                    <div>
                      <h3 className="text-gray-800 dark:text-gray-100 font-medium">Notifications</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Receive updates about your courses and quizzes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-surface-600">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Moon size={20} />
                    </div>
                    <div>
                      <h3 className="text-gray-800 dark:text-gray-100 font-medium">Dark Mode</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Use dark theme for better night viewing and reduced eye strain</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings(prev => ({ ...prev, darkMode: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-700"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-surface-600">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h3 className="text-gray-800 dark:text-gray-100 font-medium">Auto-save Progress</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Automatically save quiz progress as you complete questions</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoSave}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-900/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-700"></div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-surface-600">
                <button
                  type="submit"
                  className="bg-primary-600 dark:bg-primary-700 text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors flex items-center gap-2 font-medium shadow-sm"
                >
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;