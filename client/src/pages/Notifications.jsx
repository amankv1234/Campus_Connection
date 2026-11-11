import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiCheck, FiInbox } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Logic for marking all as read (if endpoint exists, otherwise loop)
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => 
        axios.put(`http://localhost:5000/api/notifications/${n._id}/read`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  if (loading) return <div className="flex-grow flex justify-center items-center">Loading notifications...</div>;

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FiBell className="mr-3 text-primary-600" />
          Notifications
        </h1>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center"
          >
            <FiCheck className="mr-1" /> Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-4 flex items-start space-x-4 transition hover:bg-gray-50 ${!n.read ? 'bg-primary-50' : ''}`}
                onClick={() => !n.read && markAsRead(n._id)}
              >
                <img 
                  src={n.sender?.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                  alt="Sender" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div className="flex-grow min-w-0">
                  <p className={`text-sm ${!n.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                    {n.content}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FiInbox size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 mt-1">We'll notify you when someone interacts with you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
