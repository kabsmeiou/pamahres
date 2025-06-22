import { useState } from 'react';
import { Save, Bell, Moon, RefreshCw, User, Shield, Database } from 'react-feather';
import Error from '../components/Error';
import { UserDetail } from '../types/user';
import { useQuery } from '@tanstack/react-query';
import { useUserApi } from '../services/users';

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

  const { getUserDetails } = useUserApi();

  const { data: UserInfo, isLoading } = useQuery<UserDetail>({
    queryKey: ['profile'],
    queryFn: () => getUserDetails() as Promise<UserDetail>,
  });

  console.log('User:', UserInfo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement settings update logic
    console.log('Saving settings:', settings);
  };


  // if (true) {
  //   return (
  //     <div>
  //       Work in progress...
  //     </div>
  //   )
  // }

  return (
    <div className="max-w-4xl mx-auto">
      <Error message="Settings page is under construction" />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Customize your Pamahres experience and preferences</p>
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
                {/* user name, degree, mbti type, age,  */}
                { isLoading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-surface-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 dark:bg-surface-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-surface-700 rounded w-2/3"></div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className='flex space-x-4 w-full'>
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="first_name"
                          value={UserInfo?.first_name || ''}
                          onChange={(e) => setSettings(prev => ({ ...prev, first_name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        value={UserInfo?.last_name || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, last_name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-surface-600 dark:bg-surface-700 dark:text-surface-100 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 shadow-sm"
                        placeholder="Enter your last name"
                        required
                      /> 
                      </div>
                    </div>
                  </div>
                )}
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