import React, { useRef, useState } from 'react'
import "../style/home.scss"
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { generateReport, getReports } from "../interviewThunks.js";
import { useNavigate } from 'react-router'
import ReportSidebar from '../components/ReportSideBar.jsx'
import ErrorBoundary from '../../auth/components/ErrorBoundary.jsx';

const MAX_CHARS = 5000
const MAX_FILE_MB = 5

const Home = () => {
    const [jobDescription, setJobDescription] = useState('')
    const [selfDescription, setSelfDescription] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [fileError, setFileError] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const fileInputRef = useRef(null)
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const { reports, loading, error } = useSelector(
        (state) => state.interview
    );

    useEffect(() => {

        dispatch(
            getReports()
        );

    }, [dispatch]);


    const handleFile = (file) => {
        if (!file) return
        const isValidType = ['application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ].includes(file.type)
        if (!isValidType) {
            setFileError('Please upload a PDF or DOCX file.')
            return
        }
        if (file.size > MAX_FILE_MB * 1024 * 1024) {
            setFileError(`File must be under ${MAX_FILE_MB}MB.`)
            return
        }
        setFileError('')
        setResumeFile(file)
    }

    const handleFileInputChange = (e) => {
        handleFile(e.target.files?.[0])
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const removeFile = (e) => {
        e.stopPropagation()
        setResumeFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const canGenerate = jobDescription.trim().length > 0 && (resumeFile || selfDescription.trim().length > 0)

    const handleGenerateReport = async () => {

        const resumeFile = fileInputRef.current?.files?.[0];

        const result =
            await dispatch(
                generateReport({
                    jobDescription,
                    selfDescription,
                    resumeFile
                })
            );

        if (
            generateReport.fulfilled.match(result)
        ) {

            navigate(
                `/interview/${result.payload._id}`
            );
        }
    };
    if (loading) {
        return (
            <main>
                <h1>Loading your Interview plan....</h1>
            </main>
        )
    }



    return (
        <>
            {
                reports.length > 0 && (
                    <>
                        <button
                            className="menu-btn"
                            onClick={() => setSidebarOpen(true)}
                        >
                            &#9776;
                        </button>

                        <ReportSidebar
                            open={sidebarOpen}
                            reports={reports}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </>
                )
            }
            <main className='home'>
                {error && (
                    <ErrorMessage message={error} />
                )}
                <header className='home-header'>
                    <h1>
                        Create Your Custom <span className='highlight'>Interview Plan</span>
                    </h1>
                    <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
                </header>

                <div className='panels'>
                    {/* LEFT PANEL */}
                    <section className='panel left'>
                        <div className='panel-heading'>
                            <div className='panel-title'>
                                <span className='icon-badge pink'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </span>
                                <h2>Target Job Description</h2>
                            </div>
                            <span className='badge outline'>REQUIRED</span>
                        </div>

                        <div className='textarea-wrap grow'>
                            <textarea
                                name='jobDescription'
                                id='jobDescription'
                                placeholder={`Paste the full job description here...\n\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."`}
                                value={jobDescription}
                                maxLength={MAX_CHARS}
                                onChange={(e) => setJobDescription(e.target.value)}
                            />
                            <span className='char-count'>{jobDescription.length} / {MAX_CHARS} chars</span>
                        </div>
                    </section>

                    {/* RIGHT PANEL */}
                    <section className='panel right'>
                        <div className='panel-heading'>
                            <div className='panel-title'>
                                <span className='icon-badge purple'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </span>
                                <h2>Your Profile</h2>
                            </div>
                        </div>

                        <div className='input-group'>
                            <div className='label-row'>
                                <label htmlFor='resume'>Upload Resume</label>
                                <span className='badge solid'>BEST RESULTS</span>
                            </div>

                            <div
                                className={`dropzone ${isDragging ? 'dragging' : ''} ${resumeFile ? 'has-file' : ''}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                role='button'
                                tabIndex={0}
                            >
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    name='resume'
                                    id='resume'
                                    accept='.pdf,.docx'
                                    onChange={handleFileInputChange}
                                    hidden
                                />

                                {resumeFile ? (
                                    <>
                                        <span className='upload-icon success'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6 9 17l-5-5" />
                                            </svg>
                                        </span>
                                        <p className='dz-title'>{resumeFile.name}</p>
                                        <p className='dz-sub'>
                                            {(resumeFile.size / 1024 / 1024).toFixed(2)} MB — <button type='button' className='link-btn' onClick={removeFile}>remove</button>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <span className='upload-icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                        </span>
                                        <p className='dz-title'>Click to upload or drag &amp; drop</p>
                                        <p className='dz-sub'>PDF or DOCX (Max {MAX_FILE_MB}MB)</p>
                                    </>
                                )}
                            </div>
                            {fileError && <p className='file-error'>{fileError}</p>}
                        </div>

                        <div className='divider'>
                            <span>OR</span>
                        </div>

                        <div className='input-group'>
                            <label htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                name='selfDescription'
                                id='selfDescription'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                                value={selfDescription}
                                onChange={(e) => setSelfDescription(e.target.value)}
                            />
                        </div>

                        <div className='info-box'>
                            <span className='info-icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </section>
                </div>



                <footer className='home-footer'>
                    <p className='footer-note'>AI-Powered Strategy Generation • Approx 30s</p>
                    <button onClick={handleGenerateReport}
                        className='generate-btn' disabled={!canGenerate}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" />
                        </svg>
                        Generate My Interview Strategy
                    </button>
                </footer>


            </main>


        </>
    )
}

export default Home