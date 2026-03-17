import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import Sidebar, { SidebarProvider } from '../components/Sidebar';
import ResponsiveHeader from '../components/ResponsiveHeader';
import { supabase } from '../supabaseClient';
import { createMaterialUpload } from '../utils/materials';

const Upload = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('PYQ');
    const [subject, setSubject] = useState('');
    const [year, setYear] = useState('');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
    const [uploadMessage, setUploadMessage] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !subject) {
            setUploadStatus('error');
            setUploadMessage('Please fill in the required fields and attach a file before submitting.');
            return;
        }

        setUploadStatus('uploading');
        setUploadMessage('');

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setUploadStatus('error');
                setUploadMessage('You must be logged in to upload files.');
                return;
            }

            await createMaterialUpload({
                title,
                description,
                subject,
                category,
                year,
                file,
                user,
            });

            setUploadStatus('success');
            setUploadMessage('Your file was uploaded successfully and is now waiting for admin approval.');
            // Reset form after success
            setTimeout(() => {
                setTitle('');
                setDescription('');
                setCategory('PYQ');
                setSubject('');
                setYear('');
                setFile(null);
                setUploadStatus('idle');
                setUploadMessage('');
            }, 3000);

        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setUploadMessage(error.message || 'The file upload failed. Please try again.');
        }
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen bg-gray-50 flex">
                <Sidebar />

                <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
                    <ResponsiveHeader 
                        title="Upload Material"
                        showSearch={false}
                        showNotifications={true}
                        showProfile={true}
                    />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 bg-gray-50/50">
                    <div className="max-w-4xl mx-auto">
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 lg:p-8 text-white">
                                <h2 className="text-lg lg:text-2xl font-bold mb-2">Share Your Knowledge</h2>
                                <p className="text-violet-100 text-sm lg:text-base">Upload PYQs, notes, or placement materials to help your peers and earn Edu Coins.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 lg:p-8 space-y-6 lg:space-y-8">
                                
                                {/* Status Messages */}
                                {uploadStatus === 'success' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-start"
                                    >
                                        <CheckCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold">Upload Successful!</h4>
                                            <p className="text-sm mt-1">{uploadMessage || 'Your material has been submitted for review. Coins are awarded after admin approval.'}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {uploadStatus === 'error' && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start"
                                    >
                                        <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
                                        <div>
                                            <h4 className="font-bold">Upload Failed</h4>
                                            <p className="text-sm mt-1">{uploadMessage || 'Please ensure all required fields are filled and a file is selected.'}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* File Upload Area */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-4">Upload File <span className="text-red-500">*</span></label>
                                    
                                    {!file ? (
                                        <div 
                                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400 hover:bg-gray-50'}`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => document.getElementById('file-upload').click()}
                                        >
                                            <input 
                                                id="file-upload" 
                                                type="file" 
                                                className="hidden" 
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                                            />
                                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                                <UploadIcon className="h-8 w-8 text-violet-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-1">Click to upload or drag and drop</h3>
                                            <p className="text-sm text-gray-500">PDF, DOC, PPT, or ZIP (max. 50MB)</p>
                                        </div>
                                    ) : (
                                        <div className="border border-gray-200 rounded-2xl p-6 flex items-center justify-between bg-gray-50">
                                            <div className="flex items-center space-x-4 overflow-hidden">
                                                <div className="bg-violet-100 p-3 rounded-xl text-violet-600 shrink-0">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-800 truncate">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 shrink-0"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Form Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g., Operating Systems Complete Notes Unit 1-5" 
                                            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 text-sm lg:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category / Type <span className="text-red-500">*</span></label>
                                        <select 
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 appearance-none text-sm lg:text-base"
                                        >
                                            <optgroup label="Academic">
                                                <option value="PYQ">Previous Year Question (PYQ)</option>
                                                <option value="Notes">Class Notes</option>
                                                <option value="Assignment">Assignment Solution</option>
                                            </optgroup>
                                            <optgroup label="Placement">
                                                <option value="Placement_Coding">Coding Material</option>
                                                <option value="Placement_Interview">Interview Prep</option>
                                                <option value="Placement_Core">Core CS Options</option>
                                                <option value="Placement_Aptitude">Aptitude</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject / Topic <span className="text-red-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder="e.g., Computer Science, Aptitude..." 
                                            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 text-sm lg:text-base"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Year of Study</label>
                                        <select 
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 appearance-none text-sm lg:text-base"
                                        >
                                            <option value="">Select Year</option>
                                            <optgroup label="Engineering">
                                                <option value="1st Year">1st Year</option>
                                                <option value="2nd Year">2nd Year</option>
                                                <option value="3rd Year">3rd Year</option>
                                                <option value="4th Year">4th Year</option>
                                            </optgroup>
                                            <optgroup label="Other">
                                                <option value="Not Applicable">Not Applicable</option>
                                                <option value="Other">Other</option>
                                            </optgroup>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description / Notes (Optional)</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="4" 
                                            placeholder="Add any extra details, instructions, or context about this material..." 
                                            className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 resize-none text-sm lg:text-base"
                                        ></textarea>
                                    </div>
                                </div>

                                {/* Submit Area */}
                                <div className="pt-4 lg:pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <p className="text-xs lg:text-sm text-gray-500">By uploading, you agree to our <a href="#" className="text-violet-600 hover:underline">Community Guidelines</a>.</p>
                                    <button 
                                        type="submit" 
                                        disabled={uploadStatus === 'uploading'}
                                        className={`w-full sm:w-auto px-6 lg:px-8 py-2 lg:py-3 rounded-xl font-bold flex items-center justify-center shadow-sm transition-all ${uploadStatus === 'uploading' ? 'bg-violet-400 text-white cursor-not-allowed' : 'bg-violet-600 text-white hover:bg-violet-700 hover:-translate-y-0.5'}`}
                                    >
                                        {uploadStatus === 'uploading' ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <UploadIcon className="h-5 w-5 mr-2" /> Upload Material
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        </motion.div>

                    </div>
                </main>
            </div>
        </div>
    </SidebarProvider>
    );
};

export default Upload;
