'use client'

import { FaMapMarkerAlt, FaBriefcase, FaClock, FaArrowRight } from 'react-icons/fa'
import { useApplication } from '../contexts/ApplicationContext'

const JobCard = ({ job }) => {
  const { setSelectedJob, setShowApplicationModal } = useApplication()

  const handleApply = (e) => {
    e.stopPropagation()
    setSelectedJob(job)
    setShowApplicationModal(true)
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
      {/* Job Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={job.image || '/default-job.jpg'}
          alt={`${job.company} - ${job.title}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Job Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
          <p className="text-gray-600">{job.company}</p>
        </div>

        {/* Job Meta */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center text-gray-600">
            <FaBriefcase className="mr-2 text-yellow-500" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2 text-yellow-500" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2 text-yellow-500" />
              <span>{job.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-6 line-clamp-3">{job.description}</p>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleApply}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Apply Now
          </button>
          <button className="text-gray-600 hover:text-yellow-500 flex items-center">
            Details <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default JobCard