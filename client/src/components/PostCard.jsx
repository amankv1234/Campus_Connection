import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageSquare, FiShare2, FiTrash2, FiEdit2, FiCheck, FiCopy, FiX } from 'react-icons/fi';
import {
  WhatsappShareButton,
  WhatsappIcon,
  XShareButton,
  XIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
  TelegramShareButton,
  TelegramIcon,
  RedditShareButton,
  RedditIcon
} from 'react-share';
import { API_URL } from '../config/api';

const PostCard = ({ post, onPostUpdate, onPostDelete }) => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const isLiked = post.likes.includes(user?._id);

  // Formulate share URL & title
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?post=${post._id}` : `https://campusconnect.vercel.app/?post=${post._id}`;
  const shareTitle = `${post.user?.name ? post.user.name + ' on CampusConnect' : 'CampusConnect Post'}: "${post.content ? post.content.slice(0, 100) : ''}"`;

  const handleShareClick = async () => {
    // If Web Share API is available on mobile/supported desktop browsers, try it first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CampusConnect',
          text: shareTitle,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name !== 'AbortError') {
          setShowShareModal(prev => !prev);
        }
      }
    } else {
      setShowShareModal(prev => !prev);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    try {
      const res = await axios.put(`${API_URL}/api/posts/${post._id}/like`, {}, {
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
        await axios.delete(`${API_URL}/api/posts/${post._id}`, {
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
      const res = await axios.put(`${API_URL}/api/posts/${post._id}`, { content: editContent }, {
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
        const res = await axios.get(`${API_URL}/api/comments/${post._id}`, {
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
      const res = await axios.post(`${API_URL}/api/comments/${post._id}`, { text: newComment }, {
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
        await axios.delete(`${API_URL}/api/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setComments(comments.filter(c => c._id !== commentId));
      } catch (error) {
        console.error('Failed to delete comment', error);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img 
            src={post.user?.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
            alt={post.user?.name} 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold text-gray-900">{post.user?.name}</h4>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {/* Actions for post owner */}
        {user?._id === post.user?._id && (
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-gray-400 hover:text-blue-600 transition"
            >
              <FiEdit2 className="w-4 h-4"/>
            </button>
            <button 
              onClick={handleDelete} 
              className="text-gray-400 hover:text-red-600 transition"
            >
              <FiTrash2 className="w-4 h-4"/>
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {isEditing ? (
          <div>
            <textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-primary-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button 
                onClick={() => setIsEditing(false)} 
                className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit} 
                disabled={isSubmittingEdit}
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

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-gray-500">
        <div className="flex items-center space-x-6">
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
          <button 
            onClick={handleShareClick}
            className={`flex items-center space-x-2 transition ${showShareModal ? 'text-primary-600' : 'hover:text-blue-600'}`}
            title="Share this post"
          >
            <FiShare2 className="w-5 h-5"/>
            <span>Share</span>
          </button>
        </div>

        {/* Quick Copy Link icon */}
        <button
          onClick={handleCopyLink}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
          title="Copy post link"
        >
          {copied ? <span className="text-green-600 font-medium flex items-center gap-1"><FiCheck /> Copied</span> : <span className="flex items-center gap-1"><FiCopy /> Copy</span>}
        </button>
      </div>

      {/* Share Modal / Dropdown powered by react-share */}
      {showShareModal && (
        <div className="mt-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">Share via:</span>
            <button 
              onClick={() => setShowShareModal(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* WhatsApp */}
            <WhatsappShareButton url={shareUrl} title={shareTitle} separator=" - ">
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <WhatsappIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">WhatsApp</span>
              </div>
            </WhatsappShareButton>

            {/* Twitter / X */}
            <XShareButton url={shareUrl} title={shareTitle}>
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <XIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">X</span>
              </div>
            </XShareButton>

            {/* LinkedIn */}
            <LinkedinShareButton url={shareUrl} title={shareTitle}>
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <LinkedinIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">LinkedIn</span>
              </div>
            </LinkedinShareButton>

            {/* Telegram */}
            <TelegramShareButton url={shareUrl} title={shareTitle}>
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <TelegramIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">Telegram</span>
              </div>
            </TelegramShareButton>

            {/* Facebook */}
            <FacebookShareButton url={shareUrl} quote={shareTitle}>
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <FacebookIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">Facebook</span>
              </div>
            </FacebookShareButton>

            {/* Reddit */}
            <RedditShareButton url={shareUrl} title={shareTitle}>
              <div className="flex flex-col items-center hover:opacity-85 transition">
                <RedditIcon size={36} round />
                <span className="text-[10px] text-gray-600 mt-1">Reddit</span>
              </div>
            </RedditShareButton>

            {/* Copy Link button */}
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center justify-center hover:opacity-85 transition"
            >
              <div className="w-9 h-9 rounded-full bg-gray-700 text-white flex items-center justify-center">
                {copied ? <FiCheck className="w-5 h-5 text-green-400" /> : <FiCopy className="w-4 h-4" />}
              </div>
              <span className="text-[10px] text-gray-600 mt-1">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Comments Section */}
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