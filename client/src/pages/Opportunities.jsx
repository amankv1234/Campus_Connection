import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { FiBriefcase, FiExternalLink, FiClock } from 'react-icons/fi';
import { API_URL } from '../config/api';

const Opportunities = () => {
  const { user } = useContext(AuthContext);
  const [opportunities, setOpportunities] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    type: 'Internship',
    applyLink: '',
    deadline: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchOpps = async () => {
      try {
        const query = filterType !== 'All' ? `?type=${filterType}` : '';
        const res = await axios.get(`${API_URL}/api/opportunities${query}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOpportunities(res.data);
      } catch (error) {
        console.error('Failed to fetch opportunities', error);
      }
    };
    fetchOpps();
  }, [user, filterType]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (image) data.append('image', image);

      await axios.post(`${API_URL}/api/opportunities`, data, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setShowModal(false);
      setFormData({ title: '', company: '', description: '', type: 'Internship', applyLink: '', deadline: '' });
      setImage(null);
      fetchOpps(); // Refetch
    } catch (error) {
      console.error('Failed to create opportunity', error);
      alert('Error creating opportunity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookmark = async (id) => {
    try {
      const res = await axios.put(`${API_URL}/api/opportunities/${id}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setOpportunities(opportunities.map(opp => 
        opp._id === id ? { ...opp, bookmarks: res.data } : opp
      ));
    } catch (error) {
      console.error('Failed to bookmark', error);
    }
  };

  return (
    <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Opportunities Board</h1>
          <p className="text-gray-600">Find internships, jobs, and hackathons tailored for students.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition"
        >
          + Post Opportunity
        </button>
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {['All', 'Internship', 'Job', 'Hackathon'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none ${filterType === type ? 'bg-primary-50 border-primary-500 text-primary-700 hover:bg-primary-100' : ''}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map(opp => (
          <div key={opp._id} className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col hover:shadow-md transition overflow-hidden">
            {opp.image && (
              <img src={opp.image} alt="Opportunity" className="w-full h-40 object-cover border-b border-gray-100" />
            )}
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                  <FiBriefcase size={24} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {opp.type}
                  </span>
                  <button 
                    onClick={() => handleBookmark(opp._id)}
                    className="text-gray-400 hover:text-yellow-500 transition"
                  >
                    <svg className={`w-5 h-5 ${opp.bookmarks?.includes(user._id) ? 'fill-yellow-500 text-yellow-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  </button>
                </div>
              </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{opp.title}</h3>
            <p className="text-primary-600 font-medium mb-3">{opp.company}</p>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
              {opp.description}
            </p>

              <div className="mt-auto">
                <div className="flex items-center text-xs text-gray-500 mb-4 font-medium">
                  <FiClock className="mr-1" />
                  Deadline: {new Date(opp.deadline).toLocaleDateString()}
                </div>
                <a 
                  href={opp.applyLink.startsWith('http') ? opp.applyLink : `https://${opp.applyLink}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center space-x-2 py-2 border border-primary-600 text-primary-600 font-medium rounded-md hover:bg-primary-50 transition"
                >
                  <span>Apply Now</span>
                  <FiExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}

        {opportunities.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-1">No opportunities found</h3>
            <p className="text-gray-500">Check back later for new internships and jobs.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Post Opportunity</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-800 font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company / Organization</label>
                <input required type="text" name="company" value={formData.company} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select required name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm">
                  <option value="Internship">Internship</option>
                  <option value="Job">Job</option>
                  <option value="Hackathon">Hackathon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm resize-none"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Apply Link</label>
                <input required type="url" name="applyLink" value={formData.applyLink} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input required type="date" name="deadline" value={formData.deadline} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                <input type="file" onChange={(e) => setImage(e.target.files[0])} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 border border-gray-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50">{isSubmitting ? 'Posting...' : 'Post Opportunity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
