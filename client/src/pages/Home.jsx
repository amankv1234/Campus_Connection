import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import PostCard from '../components/PostCard';
import { API_URL } from '../config/api';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const fileInputRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    }
  };

  const fetchSidebarData = async () => {
    try {
      // Fetch Opportunities
      const oppRes = await axios.get(`${API_URL}/api/opportunities`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRecentOpportunities(oppRes.data.slice(0, 3)); // Top 3

      // Fetch Events
      const evtRes = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setRecentEvents(evtRes.data.slice(0, 3)); 

      // Fetch Suggested Users
      const usersRes = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const suggested = usersRes.data
        .filter(u => u._id !== user._id && !user.connections.includes(u._id))
        .slice(0, 3);
      setSuggestedUsers(suggested);
    } catch (error) {
      console.error('Failed to fetch sidebar data', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchSidebarData();
    const intervalId = setInterval(fetchPosts, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const res = await axios.post(`${API_URL}/api/posts`, formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Add new post to top of list
      setPosts([res.data, ...posts]);
      setContent('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to create post', error);
      alert(error.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostUpdate = (postId, updatedPostData) => {
    setPosts(posts.map(post => {
      if (post._id === postId) {
        if (updatedPostData._id) {
          return updatedPostData;
        }
        if (Array.isArray(updatedPostData)) {
           return { ...post, likes: updatedPostData };
        }
      }
      return post;
    }));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
      <Sidebar />
      <div className="flex-grow md:ml-8 max-w-2xl">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <form onSubmit={handlePostSubmit}>
            <div className="flex space-x-4">
              <img 
                src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="flex-grow">
                <textarea
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24"
                  placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                ></textarea>
                
                {imagePreview && (
                  <div className="relative mt-2 inline-block">
                    <img src={imagePreview} alt="Preview" className="h-32 rounded-lg object-cover" />
                    <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-red-600">X</button>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-3">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary-600 font-medium hover:text-primary-700 hover:bg-primary-50 px-3 py-1 rounded-md transition">
                    + Add Photo
                  </button>
                  <button 
                    type="submit" 
                    disabled={(!content.trim() && !image) || isSubmitting}
                    className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onPostUpdate={handlePostUpdate}
              onPostDelete={handlePostDelete}
            />
          ))}
          {posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No posts yet. Be the first to share something!
            </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="hidden lg:block w-80 ml-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-20 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recent Opportunities</h3>
          {recentOpportunities.length > 0 ? (
            <ul className="space-y-4">
              {recentOpportunities.map(opp => (
                <li key={opp._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-bold text-primary-700 truncate">{opp.title}</p>
                  <p className="text-xs text-gray-800 font-medium truncate">{opp.company}</p>
                  <p className="text-xs text-gray-500 mt-1">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No recent opportunities.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-[300px]">
          <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
          {recentEvents.length > 0 ? (
            <ul className="space-y-4">
              {recentEvents.map(evt => (
                <li key={evt._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-bold text-primary-700 truncate">{evt.title}</p>
                  <p className="text-xs text-gray-800 font-medium truncate">{evt.location}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(evt.date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500">No upcoming events.</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-[530px] mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Suggested Connections</h3>
          {suggestedUsers.length > 0 ? (
            <div className="space-y-4">
              {suggestedUsers.map(suggestedUser => (
                <div key={suggestedUser._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={suggestedUser.profilePic} className="w-8 h-8 rounded-full" alt=""/>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{suggestedUser.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{suggestedUser.branch}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { /* Navigate to Discovery or Profile */ }}
                    className="text-xs text-primary-600 font-bold hover:underline"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No suggestions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
