import React, { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('user');
  
  const [conversations, setConversations] = useState([]); // List of users we chatter with
  const [activeChat, setActiveChat] = useState(null); // The user object we are chatting with
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socket = useRef();
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  // Initialize Socket Connection
  useEffect(() => {
    socket.current = io('http://localhost:5000');
    
    if (user) {
      socket.current.emit('register_user', user._id);
    }

    socket.current.on('receive_message', (message) => {
      const currentActive = activeChatRef.current;
      if (currentActive && (message.sender._id === currentActive._id || message.sender === currentActive._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });
    
    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  // Fetch initial conversations (mocked by fetching all users for now, or users we message)
  // To keep it simple, we will fetch all users to pick from
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const others = res.data.filter(u => u._id !== user._id);
        setConversations(others);
        
        if (initialUserId) {
          const target = others.find(u => u._id === initialUserId);
          if (target) setActiveChat(target);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, [user, initialUserId]);

  // Fetch Messages when activeChat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setMessages(res.data);
      } catch (error) {
        console.error('Failed to fetch messages', error);
      }
    };

    fetchMessages();
  }, [activeChat, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        receiverId: activeChat._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
      
      socket.current.emit('send_message', {
        receiverId: activeChat._id,
        message: res.data
      });
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex" style={{ height: 'calc(100vh - 64px)' }}>
      {/* Sidebar: Conversations */}
      <div className="w-1/3 bg-white rounded-l-lg shadow-sm border border-gray-200 border-r-0 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0">
          <h2 className="text-xl font-bold text-gray-800">Messages</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {conversations.map(conv => (
            <div 
              key={conv._id} 
              onClick={() => setActiveChat(conv)}
              className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition ${activeChat?._id === conv._id ? 'bg-primary-50 border-l-4 border-primary-500' : ''}`}
            >
               <img 
                  src={conv.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                  alt={conv.name}
                  className="w-12 h-12 rounded-full object-cover"
               />
               <div>
                 <h3 className="font-semibold text-gray-900">{conv.name}</h3>
                 <p className="text-xs text-gray-500 truncate w-32 md:w-48">{conv.branch} {conv.year}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-grow w-2/3 bg-gray-50 rounded-r-lg shadow-sm border border-gray-200 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex items-center space-x-3 shadow-sm z-10">
               <img 
                  src={activeChat.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
                  alt={activeChat.name}
                  className="w-10 h-10 rounded-full object-cover"
               />
               <div>
                  <h3 className="font-bold text-gray-900">{activeChat.name}</h3>
                  <p className="text-xs text-green-500 font-medium">Online</p>
               </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
               {messages.map((msg, idx) => {
                 const isMe = msg.sender._id === user._id || msg.sender === user._id; // Depending on populate
                 return (
                   <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${isMe ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                       <p className="text-sm">{msg.content}</p>
                       <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                         {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                       </p>
                     </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
               {messages.length === 0 && (
                 <div className="h-full flex items-center justify-center text-gray-500">
                    Send a message to start the conversation!
                 </div>
               )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
               <form onSubmit={handleSendMessage} className="flex space-x-2">
                 <input 
                   type="text" 
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   placeholder="Type your message..."
                   className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm"
                 />
                 <button 
                   type="submit"
                   disabled={!newMessage.trim()}
                   className="bg-primary-600 text-white rounded-full px-6 py-2 font-medium hover:bg-primary-700 transition disabled:opacity-50"
                 >
                   Send
                 </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center flex-col text-gray-500">
             <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                <svg className="w-12 h-12 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <p className="text-lg font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
