import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageSquare, FiShare2, FiTrash2, FiEdit2 } from 'react-icons/fi';

const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const isLiked = post.likes.includes(user?._id);

  const handleLike = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onPostUpdate(post._id, res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if(window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        onPostDelete(post._id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post._id}`, { content: editContent }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      onPostUpdate(post._id, res.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post', error);
      alert('Failed to edit post.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const toggleComments = async () => {
    if (!showComments) {
      setIsLoadingComments(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${post._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setComments(res.data);
      } catch (error) {
        console.error('Failed to fetch comments', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post(`http://localhost:5000/api/comments/${post._id}`, { text: newComment }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setComments([...comments, res.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment', error);
      alert('Failed to post comment.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if(window.confirm('Delete comment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setComments(comments.filter(c => c._id !== commentId));
      } catch (error) {
        console.error('Failed to delete comment', error);
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src={post.user?.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
            alt={post.user?.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{post.user?.name}</h3>
            <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
          </div>
        </div>
        {user?._id === post.user?._id && (
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-blue-500 transition">
              <FiEdit2 className="w-5 h-5"/>
            </button>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition">
              <FiTrash2 className="w-5 h-5"/>
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        {isEditing ? (
          <div>
            <textarea
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none h-24 mb-2"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => { setIsEditing(false); setEditContent(post.content); }} 
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                disabled={isSubmittingEdit || !editContent.trim() || editContent === post.content}
                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmittingEdit ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
        
        {post.image && (
          <img src={post.image} alt="Post Attachment" className="mt-3 rounded-lg max-h-96 w-full object-cover" />
        )}
      </div>

      <div className="flex items-center border-t border-gray-100 pt-3 space-x-6 text-gray-500">
        <button 
          onClick={handleLike} 
          className={`flex items-center space-x-2 transition ${isLiked ? 'text-blue-600' : 'hover:text-blue-600'}`}
        >
          <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`}/>
          <span>{post.likes.length}</span>
        </button>
        <button 
          onClick={toggleComments}
          className={`flex items-center space-x-2 transition ${showComments ? 'text-blue-600' : 'hover:text-blue-600'}`}
        >
          <FiMessageSquare className="w-5 h-5"/>
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 hover:text-blue-600 transition">
          <FiShare2 className="w-5 h-5"/>
          <span>Share</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <form onSubmit={handleCommentSubmit} className="flex space-x-2 mb-4">
            <img 
              src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
              alt="User" 
              className="w-8 h-8 rounded-full object-cover"
            />
            <input 
              type="text" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-grow bg-gray-50 border border-gray-200 rounded-full px-4 py-1 text-sm focus:outline-none focus:border-primary-500"
            />
            <button 
              type="submit" 
              disabled={!newComment.trim()}
              className="text-primary-600 font-medium text-sm px-2 disabled:opacity-50"
            >
              Post
            </button>
          </form>

          {isLoadingComments ? (
            <div className="text-center text-sm text-gray-500 py-2">Loading comments...</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-2 group">
                  <img 
                    src={comment.user?.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                    alt={comment.user?.name} 
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-grow bg-gray-50 rounded-lg p-2 relative">
                    <p className="font-medium text-sm text-gray-900">{comment.user?.name}</p>
                    <p className="text-sm text-gray-800">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</p>
                    {user?._id === comment.user?._id && (
                      <button 
                        onClick={() => handleCommentDelete(comment._id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiTrash2 className="w-4 h-4"/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first!</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
