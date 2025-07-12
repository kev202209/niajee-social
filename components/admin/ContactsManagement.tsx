'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FiSearch, 
  FiFilter, 
  FiMail, 
  FiUser, 
  FiCalendar,
  FiEye,
  FiCheck,
  FiX,
  FiEdit3,
  FiTrash2,
  FiMessageSquare
} from 'react-icons/fi';
import { formatCount } from '@/app/utils/formatCount';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  processed: boolean;
  processedAt?: string;
  processedBy?: {
    id: string;
    name: string;
  };
  adminNotes?: string;
  createdAt: string;
}

interface ContactsManagementProps {
  userRole: string;
}

export default function ContactsManagement({ userRole }: ContactsManagementProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [filters, setFilters] = useState({
    processed: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    unprocessed: 0
  });

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, [currentPage, filters, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(filters.processed && { processed: filters.processed }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts?${queryParams}`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const data = await response.json();
      setContacts(data.data.contacts);
      setTotalPages(data.data.totalPages);
      setTotalContacts(data.data.totalContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/stats`,
        {
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contact stats');
      }

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const handleMarkAsProcessed = async (contactId: string, adminNotes?: string) => {
    try {
      setActionLoading(contactId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/${contactId}/process`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ adminNotes })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark contact as processed');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error marking contact as processed:', error);
      toast.error('Failed to mark contact as processed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAsUnprocessed = async (contactId: string) => {
    try {
      setActionLoading(contactId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/${contactId}/unprocess`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark contact as unprocessed');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error marking contact as unprocessed:', error);
      toast.error('Failed to mark contact as unprocessed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateNotes = async (contactId: string, adminNotes: string) => {
    try {
      setActionLoading(contactId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/${contactId}/notes`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          },
          body: JSON.stringify({ adminNotes })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update notes');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContacts();
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      toast.error('Insufficient permissions');
      return;
    }

    if (!confirm('Are you sure you want to delete this contact? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(contactId);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/${contactId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete contact');
      }

      const data = await response.json();
      toast.success(data.message);
      fetchContacts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Failed to delete contact');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Contacts Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatCount(totalContacts)} total contacts
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCount(stats.total)}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <FiMail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCount(stats.processed)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <FiCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unprocessed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCount(stats.unprocessed)}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
              <FiX className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <select
              value={filters.processed}
              onChange={(e) => setFilters({ ...filters, processed: e.target.value })}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Contacts</option>
              <option value="true">Processed</option>
              <option value="false">Unprocessed</option>
            </select>
          </div>
        )}
      </div>

      {/* Contacts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                            <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                        {contact.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contact.processed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {contact.processed ? 'Processed' : 'Unprocessed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedContact(contact);
                            setShowContactModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        
                        {!contact.processed ? (
                          <button
                            onClick={() => {
                              const notes = prompt('Enter admin notes (optional):');
                              handleMarkAsProcessed(contact.id, notes || undefined);
                            }}
                            disabled={actionLoading === contact.id}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsUnprocessed(contact.id)}
                            disabled={actionLoading === contact.id}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 disabled:opacity-50"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            const notes = prompt('Enter admin notes:', contact.adminNotes || '');
                            if (notes !== null) {
                              handleUpdateNotes(contact.id, notes);
                            }
                          }}
                          disabled={actionLoading === contact.id}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        
                        {['ADMIN', 'SUPER_ADMIN'].includes(userRole) && (
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            disabled={actionLoading === contact.id}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            <FiTrash2 className="w-4 h-4" />
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