'use client'

import { useState, useRef } from 'react';
import { FaPaperclip, FaTimes, FaCheck, FaChevronDown, FaUser, FaPhone, FaEnvelope, FaCircleNotch } from 'react-icons/fa';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from "./../../../script/firebaseConfig";
import emailjs from '@emailjs/browser';

const PositionDropdown = ({ positions, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-4 py-3 border border-[#F7C229]/30 rounded-lg cursor-pointer flex justify-between items-center bg-white hover:bg-[#F7C229]/10 transition-colors duration-200 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-500'}>
          {selected || 'Select a position'}
        </span>
        <FaChevronDown className={`text-[#F7C229] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-[#F7C229]/30 rounded-lg shadow-lg max-h-60 overflow-auto">
          {positions.map((position) => (
            <li
              key={position}
              className="px-4 py-2 cursor-pointer hover:bg-[#F7C229]/10"
              onClick={() => {
                onSelect(position);
                setIsOpen(false);
              }}
            >
              {position}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FileUpload = ({ resumeName, onFileChange, onClear }) => {
  const fileInputRef = useRef(null);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Resume/CV *</label>
      <div className="flex items-center gap-2">
        <div
          onClick={() => fileInputRef.current.click()}
          className="flex-1 inline-flex items-center justify-between px-4 py-3 bg-white border border-[#F7C229]/30 rounded-lg cursor-pointer hover:bg-[#F7C229]/10"
        >
          <span className="text-gray-800 truncate max-w-[180px]">
            {resumeName || 'Select a file'}
          </span>
          <div className="flex items-center">
            {resumeName && (
              <span className="text-xs text-gray-500 mr-2">
                {resumeName.length > 20 ? '...' + resumeName.slice(-17) : resumeName}
              </span>
            )}
            <FaPaperclip className="text-[#F7C229]" />
          </div>
        </div>
        {resumeName && (
          <button
            type="button"
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-[#F7C229]"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        required
      />
      <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX, TXT (Max 50MB)</p>
    </div>
  );
};

const ApplicationModal = ({ jobTitle = 'Position', onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const progressBarRef = useRef(null);

  const positions = [
    'Sales Associate',
    'Sales Agent',
    'Admin Assistant',
    'System Developer',
    'On-The-Job-Training',
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size exceeds 50MB limit');
        return;
      }
      setResumeFile(file);
      setResumeName(file.name);
    }
  };

  const uploadFileToFirebase = async (file) => {
    const storageRef = ref(storage, `resumes/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const sendEmailWithAttachment = async (data) => {
    try {
      // Use environment variables
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
      
      const emailData = {
        to_name: 'Hiring Manager', // You can customize this
        from_name: data.name,
        from_email: data.email,
        position: formData.position, // Changed from data.position to formData.position
        phone: data.phone || 'Not provided',
        resume_url: data.resumeUrl,
        resume_name: data.resumeName,
        job_title: jobTitle,
        message: `New application received for ${formData.position} position.` // Updated here to
      };

      await emailjs.send(serviceId, templateId, emailData, publicKey);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Email sending error:', error);
      // You might want to handle this error differently
      // Maybe just log it and continue since the main submission was successful
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.position || !resumeFile) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Initialize progress bar
      const progressBar = document.createElement('div');
      progressBar.style.height = '4px';
      progressBar.style.background = '#F7C229';
      progressBar.style.width = '0%';
      progressBar.style.position = 'absolute';
      progressBar.style.bottom = '0';
      progressBar.style.left = '0';
      progressBar.style.transition = 'width 0.3s ease';
      progressBarRef.current = progressBar;
      e.currentTarget.parentNode.insertBefore(progressBar, e.currentTarget.nextSibling);

      // Upload file
      const resumeUrl = await uploadFileToFirebase(resumeFile);

      // Prepare data for Firestore and EmailJS
      const applicationData = {
        ...formData,
        jobTitle,
        resumeUrl,
        resumeName: resumeFile.name,
        status: 'new',
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      await addDoc(collection(db, "applications"), applicationData);

      // Send email with the download URL
      await sendEmailWithAttachment(applicationData);

      setSubmitSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Submission error:', error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      if (progressBarRef.current) {
        progressBarRef.current.remove();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#F7C229]/30 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#F7C229] p-2 rounded-full hover:bg-[#F7C229]/10"
          onClick={onClose}
        >
          <FaTimes className="text-xl" />
        </button>

        <div className="p-6 md:p-8">
          {submitSuccess ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#F7C229]/20 mb-4">
                <FaCheck className="h-8 w-8 text-[#F7C229]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
              <p className="text-gray-500">
                Thank you for applying to <span className="text-[#F7C229]">{jobTitle}</span>
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Apply for <span className="text-[#F7C229]">{jobTitle}</span>
                </h2>
                <p className="text-gray-500">Fill out the form below to submit your application</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative">
                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-[#F7C229]" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-[#F7C229]/30 rounded-lg focus:ring-2 focus:ring-[#F7C229] focus:border-[#F7C229] transition-all duration-200 shadow-sm"
                      placeholder="Danica Cruz"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-[#F7C229]" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-[#F7C229]/30 rounded-lg focus:ring-2 focus:ring-[#F7C229] focus:border-[#F7C229] transition-all duration-200 shadow-sm"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Email *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-[#F7C229]" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-[#F7C229]/30 rounded-lg focus:ring-2 focus:ring-[#F7C229] focus:border-[#F7C229] transition-all duration-200 shadow-sm"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Position *</label>
                  <PositionDropdown
                    positions={positions}
                    selected={formData.position}
                    onSelect={(position) => setFormData(prev => ({ ...prev, position }))}
                  />
                </div>

                <FileUpload
                  resumeName={resumeName}
                  onFileChange={handleFileChange}
                  onClear={() => {
                    setResumeFile(null)
                    setResumeName('')
                  }}
                />

                {/* Upload progress indicator */}
                {isSubmitting && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#F7C229] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-[#F7C229]/70 cursor-not-allowed'
                      : 'bg-[#F7C229] hover:bg-[#F7C229]/90 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <FaCircleNotch className="animate-spin" />
                      {uploadProgress < 100 ? 'Uploading...' : 'Finalizing...'}
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;