import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiX } from 'react-icons/fi';

const Events = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };
    fetchEvents();
  }, [user]);

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to register', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setEvents(res.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events', formData, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setShowModal(false);
      setFormData({ title: '', description: '', date: '', location: '' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event', error);
      alert('Failed to create event');
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Campus Events</h1>
          <p className="text-gray-600">Discover and register for upcoming hackathons, workshops, and seminars.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition flex items-center"
        >
          <FiPlus className="mr-2" /> Create Event
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input 
                  type="text" required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                  <input 
                    type="datetime-local" required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" required
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-md font-bold hover:bg-primary-700">
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => {
          const evtDate = new Date(event.date);
          const isRegistered = event.attendees.includes(user._id);

          return (
            <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex overflow-hidden">
              <div className="bg-primary-50 px-6 py-8 flex flex-col items-center justify-center min-w-[120px] text-primary-700">
                 <span className="text-3xl font-black">{evtDate.getDate()}</span>
                 <span className="text-sm font-semibold uppercase">{evtDate.toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-center">
                 <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                 <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                 
                 <div className="flex flex-col space-y-2 mb-4 text-sm text-gray-500 font-medium">
                   <div className="flex items-center"><FiMapPin className="mr-2"/> {event.location}</div>
                   <div className="flex items-center"><FiCalendar className="mr-2"/> {evtDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                   <div className="flex items-center"><FiUsers className="mr-2"/> {event.attendees.length} Attendees</div>
                 </div>

                 <div className="mt-auto">
                   {isRegistered ? (
                     <button disabled className="w-full bg-green-50 text-green-700 py-2 rounded-md font-medium border border-green-200">
                        Registered ✓
                     </button>
                   ) : (
                     <button onClick={() => handleRegister(event._id)} className="w-full bg-primary-600 text-white py-2 rounded-md font-medium hover:bg-primary-700 transition">
                        Register Now
                     </button>
                   )}
                 </div>
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming events</h3>
            <p className="text-gray-500">Check back later or host your own event.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
