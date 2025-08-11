'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Chat</h1>
        <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
          Powered by AI
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {status === 'loading' ? (
          <div className="animate-pulse">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        ) : session ? (
          <div className="flex items-center space-x-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {session.user?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {session.user?.email}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Sign In with Google
          </button>
        )}
      </div>
    </header>
  );
}

