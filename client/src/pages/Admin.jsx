import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiUsers, FiFileText, FiBriefcase, FiCalendar, FiTrash2 } from 'react-icons/fi';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setStats(statsRes.data);

      const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUsers(usersRes.data);

      const postsRes = await axios.get('http://localhost:5000/api/admin/posts', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPosts(postsRes.data);
    } catch (error) {
      console.error('Admin Fetch Error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setUsers(users.filter(u => u._id !== id));
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/posts/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPosts(posts.filter(p => p._id !== id));
      } catch (error) {
        alert('Failed to delete post');
      }
    }
  };

  if (loading) return <div className="p-8">Loading Admin Dashboard...</div>;

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><FiUsers size={24}/></div>
          <div><p className="text-gray-500 text-sm">Users</p><p className="text-2xl font-bold">{stats?.users}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><FiFileText size={24}/></div>
          <div><p className="text-gray-500 text-sm">Posts</p><p className="text-2xl font-bold">{stats?.posts}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><FiBriefcase size={24}/></div>
          <div><p className="text-gray-500 text-sm">Opportunities</p><p className="text-2xl font-bold">{stats?.opportunities}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><FiCalendar size={24}/></div>
          <div><p className="text-gray-500 text-sm">Events</p><p className="text-2xl font-bold">{stats?.events}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-4 font-bold text-sm ${activeTab === 'users' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-4 font-bold text-sm ${activeTab === 'posts' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500'}`}
          >
            Manage Posts
          </button>
        </div>

        {activeTab === 'users' ? (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Email</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img src={u.profilePic} alt="" className="w-8 h-8 rounded-full object-cover"/>
                    <span className="font-medium">{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.isAdmin ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {u.isAdmin ? 'Admin' : 'Student'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition"
                      disabled={u._id === user._id}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="px-6 py-3 font-semibold">Author</th>
                <th className="px-6 py-3 font-semibold">Content</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 flex items-center space-x-3">
                    <img src={p.user?.profilePic} alt="" className="w-8 h-8 rounded-full object-cover"/>
                    <span className="font-medium text-sm">{p.user?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{p.content}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeletePost(p._id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-md transition"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;
