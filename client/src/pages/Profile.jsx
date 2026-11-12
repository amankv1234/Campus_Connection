import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiEdit2, FiGithub, FiLinkedin, FiFileText } from 'react-icons/fi';
import { API_URL } from '../config/api';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    branch: user?.branch || '',
    year: user?.year || '',
    skills: user?.skills?.join(', ') || '',
    interests: user?.interests?.join(', ') || '',
    githubLink: user?.githubLink || '',
    linkedinLink: user?.linkedinLink || '',
    projects: user?.projects || []
  });

  const resumeInputRef = useRef(null);
  const [isResumeUploading, setIsResumeUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataToUpload = new FormData();
    formDataToUpload.append('resume', file);
    
    setIsResumeUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/users/resume`, formDataToUpload, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser({ ...user, resumeUrl: res.data.resumeUrl });
    } catch (error) {
      console.error('Failed to upload resume', error);
      alert('Failed to upload resume.');
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataToUpload = new FormData();
    formDataToUpload.append('image', file);
    
    setIsUploading(true);
    try {
      const res = await axios.post(`${API_URL}/api/users/profile-pic`, formDataToUpload, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setUser({ ...user, profilePic: res.data.profilePic });
    } catch (error) {
      console.error('Failed to upload image', error);
      alert('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...formData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setFormData({ ...formData, projects: updatedProjects });
  };

  const addProject = () => {
    setFormData({ 
      ...formData, 
      projects: [...formData.projects, { title: '', description: '', link: '' }] 
    });
  };

  const removeProject = (index) => {
    const updatedProjects = formData.projects.filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
      const interestsArray = formData.interests.split(',').map(s => s.trim()).filter(s => s);
      const res = await axios.put(`${API_URL}/api/users/profile`, {
        ...formData,
        skills: skillsArray,
        interests: interestsArray
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUser({ ...res.data, token: user.token });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex-shrink-0 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
            <img 
              src={user.profilePic || 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'} 
              alt="Profile" 
              className={`w-32 h-32 rounded-full object-cover border-4 border-primary-500 ${isUploading ? 'opacity-50' : ''}`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-full">
                <span className="text-xs font-semibold text-primary-600">Uploading...</span>
              </div>
            )}
            {isEditing && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary-600 p-2 rounded-full text-white hover:bg-primary-700">
                 <FiEdit2 size={16}/>
              </button>
            )}
          </div>
          
          <div className="flex-grow text-center md:text-left">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-lg text-gray-600 mt-1">{user.bio || 'Add a bio to tell people about yourself'}</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="hidden md:flex items-center space-x-2 border border-gray-300 px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  <FiEdit2 size={16} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">{user.branch || 'Course'}</span>
              <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">{user.year || 'Year'}</span>
              <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">{user.points || 0} Points</span>
            </div>

            <div className="mt-6 flex justify-center md:justify-start space-x-4">
              {user.githubLink && <a href={user.githubLink} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900"><FiGithub size={24}/></a>}
              {user.linkedinLink && <a href={user.linkedinLink} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600"><FiLinkedin size={24}/></a>}
              {user.resumeUrl && <a href={user.resumeUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-primary-600"><FiFileText size={24}/></a>}
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <input type="text" name="bio" value={formData.bio} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Branch / Major</label>
                  <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="e.g. Computer Science" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input type="text" name="year" value={formData.year} onChange={handleChange} placeholder="e.g. Sophomore, 2nd Year" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                  <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, Python" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Interests (comma separated)</label>
                  <input type="text" name="interests" value={formData.interests} onChange={handleChange} placeholder="AI, Web3, Chess" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">GitHub Profile URL</label>
                  <input type="text" name="githubLink" value={formData.githubLink} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
                  <input type="text" name="linkedinLink" value={formData.linkedinLink} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
               </div>
               <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Projects</label>
                    <button type="button" onClick={addProject} className="text-sm text-primary-600 hover:text-primary-700 font-medium">+ Add Project</button>
                  </div>
                  <div className="space-y-4">
                    {formData.projects.map((project, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg relative">
                        <button type="button" onClick={() => removeProject(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">&times;</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" placeholder="Project Title" value={project.title} onChange={(e) => handleProjectChange(index, 'title', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
                          <input type="text" placeholder="Project Link" value={project.link} onChange={(e) => handleProjectChange(index, 'link', e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2" />
                          <textarea placeholder="Description" value={project.description} onChange={(e) => handleProjectChange(index, 'description', e.target.value)} className="md:col-span-2 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm border p-2 h-20" />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <input type="file" ref={resumeInputRef} onChange={handleResumeChange} className="hidden" accept=".pdf" />
                    <button type="button" onClick={() => resumeInputRef.current?.click()} className="bg-gray-100 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200">
                      {isResumeUploading ? 'Uploading...' : user.resumeUrl ? 'Change Resume' : 'Upload Resume'}
                    </button>
                    {user.resumeUrl && <span className="text-xs text-green-600 truncate">Resume uploaded</span>}
                  </div>
               </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={() => setIsEditing(false)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">Cancel</button>
              <button type="submit" className="bg-primary-600 justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="mt-8 border-t border-gray-200 pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills?.length > 0 ? user.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-sm font-medium border border-blue-100">
                    {skill}
                  </span>
                )) : <span className="text-gray-500 italic text-sm">No skills added yet</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests?.length > 0 ? user.interests.map((interest, index) => (
                  <span key={index} className="bg-green-50 text-green-700 px-3 py-1 rounded-md text-sm font-medium border border-green-100">
                    {interest}
                  </span>
                )) : <span className="text-gray-500 italic text-sm">No interests added yet</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
              {user.projects?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.projects.map((project, index) => (
                    <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-bold text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline mt-2 inline-block">
                          View Project
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-500 italic text-sm">No projects added yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
