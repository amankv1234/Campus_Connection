import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { FiUsers, FiPlus, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '../components/PostCard';
import { API_URL } from '../config/api';

const Groups = () => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Create Group Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ name: '', description: '' });

  // Group Details Data
  const [groupPosts, setGroupPosts] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newGroupMessage, setNewGroupMessage] = useState('');
  
  const socket = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setGroups(res.data);
      } catch (error) {
        console.error('Failed to fetch groups', error);
      }
    };
    fetchGroups();
  }, [user]);

  // Initialize Socket for Group Chat
  useEffect(() => {
    socket.current = io(API_URL);
    if (user) {
      socket.current.emit('register_user', user._id);
    }
    
    socket.current.on('receive_message', (message) => {
      if (activeGroup && message.group === activeGroup._id) {
        setGroupMessages(prev => [...prev, message]);
      }
    });

    return () => socket.current.disconnect();
  }, [user, activeGroup]);

  // Fetch Group Data when activeGroup changes
  useEffect(() => {
    if (!activeGroup) return;

    const fetchGroupData = async () => {
      try {
        if (activeTab === 'posts') {
          const res = await axios.get(`${API_URL}/api/posts/group/${activeGroup._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setGroupPosts(res.data);
        } else if (activeTab === 'chat') {
          const res = await axios.get(`${API_URL}/api/messages/group/${activeGroup._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setGroupMessages(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch group data', error);
      }
    };
    fetchGroupData();
  }, [activeGroup, activeTab, user]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupMessages, activeTab]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createData.name || !createData.description) return;
    try {
      const res = await axios.post(`${API_URL}/api/groups`, createData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGroups([...groups, res.data]);
      setShowCreateModal(false);
      setCreateData({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create group', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/posts`, {
        content: newPostContent,
        group: activeGroup._id
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGroupPosts([res.data, ...groupPosts]);
      setNewPostContent('');
    } catch (error) {
      console.error('Failed to create post', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newGroupMessage.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        groupId: activeGroup._id,
        content: newGroupMessage
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGroupMessages([...groupMessages, res.data]);
      setNewGroupMessage('');

      // Emit to all group members via socket (assuming basic global broadcast or room broadcast in a real app)
      // Since our simple socket doesn't handle rooms, we won't emit it here to avoid sending to everyone,
      // or we can implement real rooms. For this fix, it updates locally.
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleJoinLeave = async (groupId, action) => {
    try {
      await axios.put(`${API_URL}/api/groups/${groupId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Refresh groups
      const res = await axios.get(`${API_URL}/api/groups`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setGroups(res.data);
      if (activeGroup && activeGroup._id === groupId) {
        setActiveGroup(res.data.find(g => g._id === groupId));
      }
    } catch (error) {
      console.error(`Failed to ${action} group`, error);
    }
  };

  if (activeGroup) {
    const isMember = activeGroup.members.some(m => m._id === user._id);
    return (
      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <button onClick={() => setActiveGroup(null)} className="mb-4 flex items-center text-gray-600 hover:text-primary-600 font-medium">
          <FiArrowLeft className="mr-2" /> Back to Groups
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img src={activeGroup.avatar} alt={activeGroup.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{activeGroup.name}</h1>
              <p className="text-gray-500">{activeGroup.members.length} members</p>
            </div>
          </div>
          <div>
            {isMember ? (
              <button onClick={() => handleJoinLeave(activeGroup._id, 'leave')} className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-md hover:bg-red-50 transition">
                Leave Group
              </button>
            ) : (
              <button onClick={() => handleJoinLeave(activeGroup._id, 'join')} className="px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition">
                Join Group
              </button>
            )}
          </div>
        </div>

        {/* Group Tabs */}
        <div className="flex space-x-6 border-b border-gray-200 mb-6 px-2">
          {['posts', 'chat', 'members'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Group {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {!isMember && activeTab !== 'members' ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            Join the group to view {activeTab}.
          </div>
        ) : (
          <div className="flex-grow overflow-auto relative rounded-lg">
            {activeTab === 'posts' && (
              <div className="max-w-2xl mx-auto space-y-6">
                <form onSubmit={handlePostSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex space-x-4">
                  <img src={user.profilePic} alt="User" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-grow flex flex-col">
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share something with the group..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-primary-500 focus:bg-white resize-none mb-2"
                      rows="2"
                    ></textarea>
                    <div className="flex justify-end">
                      <button type="submit" disabled={!newPostContent.trim()} className="bg-primary-600 text-white px-4 py-1.5 rounded-md font-medium text-sm hover:bg-primary-700 disabled:opacity-50">Post</button>
                    </div>
                  </div>
                </form>
                <div className="space-y-4">
                  {groupPosts.map(post => <PostCard key={post._id} post={post} />)}
                  {groupPosts.length === 0 && <p className="text-center text-gray-500">No posts in this group yet.</p>}
                </div>
              </div>
            )}
            
            {activeTab === 'chat' && (
              <div className="bg-white border border-gray-200 rounded-lg flex flex-col h-full max-h-[600px]">
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                   {groupMessages.map((msg, idx) => {
                     const isMe = msg.sender._id === user._id || msg.sender === user._id;
                     return (
                       <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-md p-3 rounded-lg shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200'}`}>
                           {!isMe && <p className="text-xs font-bold mb-1">{msg.sender.name}</p>}
                           <p className="text-sm">{msg.content}</p>
                           <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                             {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                           </p>
                         </div>
                       </div>
                     );
                   })}
                   <div ref={messagesEndRef} />
                   {groupMessages.length === 0 && <p className="text-center text-gray-500 py-4">Start the conversation!</p>}
                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50 mt-auto">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <input type="text" value={newGroupMessage} onChange={(e) => setNewGroupMessage(e.target.value)} placeholder="Message group..." className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary-500" />
                    <button type="submit" disabled={!newGroupMessage.trim()} className="bg-primary-600 text-white rounded-full px-6 py-2 font-medium hover:bg-primary-700 disabled:opacity-50">Send</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {activeGroup.members.map(member => (
                  <div key={member._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                    <img src={member.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} alt="Member" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-gray-900">{member.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Groups</h1>
          <p className="text-gray-600">Join groups to collaborate, share notes, and study together.</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition flex items-center space-x-2"
        >
          <FiPlus size={18} />
          <span className="hidden md:inline">Create Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => {
          const isMember = group.members.some(m => m._id === user._id);
          return (
            <div key={group._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="flex items-center space-x-4 mb-4">
                <img 
                  src={group.avatar} 
                  alt={group.name} 
                  className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center">
                    <FiUsers className="mr-1" />
                    {group.members.length} members
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                {group.description}
              </p>

              <div className="mt-auto flex space-x-3">
                <button 
                  onClick={() => setActiveGroup(group)}
                  className="flex-1 py-2 bg-gray-50 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition border border-gray-200"
                >
                  View Group
                </button>
                {isMember ? (
                  <button 
                    onClick={() => handleJoinLeave(group._id, 'leave')}
                    className="flex-1 py-2 border border-red-200 text-red-600 font-medium rounded-md hover:bg-red-50 transition"
                  >
                    Leave
                  </button>
                ) : (
                  <button 
                    onClick={() => handleJoinLeave(group._id, 'join')}
                    className="flex-1 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition"
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {groups.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No groups found</h3>
            <p className="text-gray-500">Be the first to create a study group for your campus.</p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input required type="text" value={createData.name} onChange={(e) => setCreateData({...createData, name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required value={createData.description} onChange={(e) => setCreateData({...createData, description: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm resize-none"></textarea>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
