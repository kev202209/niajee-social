'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FiSearch, 
  FiFilter,  
  FiUserX,
  FiCheckCircle,
  FiAlertTriangle,
  FiEye
} from 'react-icons/fi';
import { formatCount } from '@/utils/formatUtils';
import Image from 'next/image';
import { getImageSrc } from '@/utils/imageUtils';
import { GENERIC_ERROR_MESSAGE } from '@/utils/toastMessages';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  verified: boolean;
  suspended: boolean;
  banned: boolean;
  followerCount: number;
  videoCount: number;
  createdAt: string;
  lastActive: string;
  displayName:string;
  accountstatus: string;
  lastLoginAt:string;
}

interface UserManagementProps {
  userRole: string;
}

export default function UserManagement({ userRole }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filters, setFilters] = useState({
    role: '',
    verified: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  // const [selectedUser, setSelectedUser] = useState<User | null>(null);
  // const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);



  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.role && { role: filters.role }),
        ...(filters.verified && { verified: filters.verified }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // normalize API role strings to match the User.role union
      const normalizeRole = (r: unknown): User['role'] => {
        if (!r) return 'user';
        const role = String(r).toLowerCase();
        if (role === 'super_admin' || role === 'superadmin' || role === 'super admin' || role === 'super-admin') return 'superadmin';
        if (role === 'admin') return 'admin';
        if (role === 'moderator' || role === 'mod') return 'moderator';
        return 'user';
      };

      const users = data.data.users.map((user: User) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.displayName ?? user.name ?? user.username ?? '', // map displayName (or fallback)
        avatar: user.avatar || undefined,
        role: normalizeRole(user.role), // normalized to match local User type
        verified: Boolean(user.verified),
        suspended: user.accountstatus === 'suspended',
        banned: user.accountstatus === 'banned',
        followerCount: user.followerCount ?? 0,
        videoCount: user.videoCount ?? 0, // fallback to 0 if not present
        createdAt: user.createdAt,
        lastActive: user.lastLoginAt || '', // fallback to empty string if not present
      }));
      setUsers(users);
      setTotalPages(data.data.pagination.totalPages ?? 1);
      setTotalUsers(data.data.pagination.total ?? users.length);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    if (!['admin', 'super_admin'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/verify`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to verify user');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error verifying user:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    if (!['admin', 'super_admin'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/suspend`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ reason })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (userRole !== 'super_admin') {
      toast.error('Insufficient permissions');
      return;
    }

    try {
      setActionLoading(userId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/ban`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to ban user');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error(GENERIC_ERROR_MESSAGE);
    } finally {
      setActionLoading(null);
    }
  };

  // const handleUpdateRole = async (userId: string, newRole: string) => {
  //   if (userRole !== 'super_admin') {
  //     toast.error('Insufficient permissions');
  //     return;
  //   }

  //   try {
  //     setActionLoading(userId);
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`,
  //       {
  //         method: 'PUT',
  //         credentials: 'include',
  //         headers: { 
  //           'Content-Type': 'application/json',
  //           'Accept': 'application/json' 
  //         },
  //         body: JSON.stringify({ role: newRole })
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error('Failed to update user role');
  //     }

  //     const data = await response.json();
  //     toast.success(data.message);
  //     fetchUsers();
  //   } catch (error) {
  //     console.error('Error updating user role:', error);
  //     toast.error(GENERIC_ERROR_MESSAGE);
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (user: User) => {
    if (user.banned) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    if (user.suspended) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getStatusText = (user: User) => {
    if (user.banned) return 'Banned';
    if (user.suspended) return 'Suspended';
    return 'Active';
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters, , fetchUsers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatCount(totalUsers)} total users
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <select
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <Image
                            className="h-12 w-12 rounded-full object-cover"
                            src={getImageSrc(user.avatar, '480w') || '/placeholder.png'}
                            alt={user.name}
                            width={48}
                            height={48}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            {user.verified && (
                              <FiCheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user)}`}>
                        {getStatusText(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div>{formatCount(user.followerCount)} followers</div>
                        <div>{formatCount(user.videoCount)} videos</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            // setSelectedUser(user);
                            // setShowUserModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        
                        {!user.verified && ['admin', 'super_admin'].includes(userRole) && (
                          <button
                            onClick={() => handleVerifyUser(user.id)}
                            disabled={actionLoading === user.id}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {!user.suspended && ['admin', 'super_admin'].includes(userRole) && (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter suspension reason:');
                              if (reason) handleSuspendUser(user.id, reason);
                            }}
                            disabled={actionLoading === user.id}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                          >
                            <FiAlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                        
                        {!user.banned && userRole === 'super_admin' && (
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to ban this user?')) {
                                handleBanUser(user.id);
                              }
                            }}
                            disabled={actionLoading === user.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            <FiUserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}