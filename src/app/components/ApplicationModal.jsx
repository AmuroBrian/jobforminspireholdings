'use client'

import { useState, useRef, useEffect } from 'react'
import { FaPaperclip, FaTimes, FaCheck, FaChevronDown, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa'

const PositionDropdown = ({ positions, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="w-full px-4 py-3 border border-[#F7C229]/30 rounded-lg cursor-pointer flex justify-between items-center bg-white hover:bg-[#F7C229]/10 transition-colors duration-200 shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={selected ? 'text-gray-800' : 'text-gray-500'}>
          {selected || 'Select a position'}
        </span>
        <FaChevronDown
          className={`text-[#F7C229] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      {isOpen && (
        <ul
          className="absolute z-10 mt-1 w-full bg-white border border-[#F7C229]/30 rounded-lg shadow-lg max-h-60 overflow-auto transition-all duration-200"
          role="listbox"
        >
          {positions.map((position) => (
            <li
              key={position}
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-[#F7C229]/10"
              role="option"
              tabIndex={0}
              onClick={() => {
                onSelect(position)
                setIsOpen(false)
              }}
            >
              {position}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const FileUpload = ({ resumeName, onFileChange, onClear }) => {
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current.click()
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Resume/CV
      </label>
      <div className="flex items-center gap-2">
        <div
          onClick={handleClick}
          className="flex-1 inline-flex items-center justify-between px-4 py-3 bg-white border border-[#F7C229]/30 rounded-lg cursor-pointer hover:bg-[#F7C229]/10 transition-colors duration-200 shadow-sm"
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
            className="p-2 text-gray-400 hover:text-[#F7C229] transition-colors duration-200"
          >
            <FaTimes />
          </button>
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        id="applicantResume"
        name="resume"
        onChange={onFileChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />
      <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX (Max. 5MB)</p>
    </div>
  )
}

const ApplicationModal = ({ jobTitle, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    resume: null
  })
  const [resumeName, setResumeName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const positions = [
    'Sales Associate',
    'Sales Agent',
    'Admin Assistant',
    'System Developer',
    'On-The-Job-Training',
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid file type (PDF, DOC, DOCX, TXT).')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.')
        return
      }
      setResumeName(file.name)
      setFormData((prev) => ({ ...prev, resume: file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.position) {
      alert('Please fill in all required fields (Name, Email, and Position).')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ ...formData, jobTitle })
      setSubmitSuccess(true)
      setTimeout(() => {
        setFormData({ name: '', phone: '', email: '', position: '', resume: null })
        setResumeName('')
        setSubmitSuccess(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-[#F7C229]/30">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-[#F7C229] p-2 rounded-full hover:bg-[#F7C229]/10 transition-colors duration-200 z-10"
          onClick={onClose}
          aria-label="Close modal"
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
                Thank you for applying to the <span className="font-medium text-[#F7C229]">{jobTitle}</span> position.
              </p>
              <div className="mt-6 h-1 w-full bg-[#F7C229] rounded-full"></div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Join Our Team <span className="text-[#F7C229]">{jobTitle}</span>
                </h2>
                <p className="text-gray-500">
                  Interested in joining our team? Start by applying for the open position below and attaching your resume. We look forward to reviewing your application!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    onSelect={(position) =>
                      setFormData((prev) => ({ ...prev, position }))
                    }
                  />
                </div>

                <FileUpload
                  resumeName={resumeName}
                  onFileChange={handleFileChange}
                  onClear={() => {
                    setResumeName('')
                    setFormData((prev) => ({ ...prev, resume: null }))
                  }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-[#F7C229]/70 cursor-not-allowed'
                      : 'bg-[#F7C229] hover:bg-[#F7C229]/90 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApplicationModal