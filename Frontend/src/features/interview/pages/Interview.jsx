import React, { useState, useEffect } from "react";
import "../style/interview.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useParams } from "react-router";




const Interview = () => {
  const [activeTab, setActiveTab] = useState("technical");
  const {report, generateById, loading, getResumePdf} = useInterview()
    const {interviewId} = useParams()
  

  if (loading || !report) {
    return (
      <div className="empty-state">
        Loading interview report...
      </div>
    );
  }


 

  const renderContent = () => {
    switch (activeTab) {
      case "technical":
        return (
          <>
            <h2>Technical Questions</h2>

            {report.technicalQuestions.length === 0 ? (
              <div className="empty-state">
                Technical Questions will appear here.
              </div>
            ) : (
              report.technicalQuestions.map((q, index) => (
                <div className="question-card" key={index}>
                  <h4>Question {index + 1}</h4>

                  <p>{q.question}</p>
                  <p>{q.answer}</p>
                
                  <span>Intention : {q.intention}</span>
                </div>
              ))
            )}
          </>
        );

      case "behaviour":
        return (
          <>
            <h2>Behavioural Questions</h2>

            {report.behaviourQuestions.length === 0 ? (
              <div className="empty-state">
                Behaviour Questions will appear here.
              </div>
            ) : (
              report.behaviourQuestions.map((q, index) => (
                <div className="question-card" key={index}>
                  <h4>Question {index + 1}</h4>

                  <p>{q.question}</p>

                  <span>{q.intention}</span>
                </div>
              ))
            )}
          </>
        );

      case "roadmap":
        return (
          <>
            <h2>Preparation Roadmap</h2>

            <div className="roadmap">
              {report.preparationPlan.map((item) => (
                <div className="roadmap-card" key={item.day}>
                  <div className="day">Day {item.day}</div>

                  <h3>{item.focus}</h3>

                  <ul>
                    {item.tasks.map((task, i) => (
                      <li key={i}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <main className="interview">

      <div className="interview-container">

        {/* LEFT */}

        <aside className="sidebar">

         <div>
           <button
            className={activeTab === "technical" ? "active" : ""}
            onClick={() => setActiveTab("technical")}
          >
            Technical Questions
          </button>

          <button
            className={activeTab === "behaviour" ? "active" : ""}
            onClick={() => setActiveTab("behaviour")}
          >
            
            Behavioural Questions
          </button>

          <button
            className={activeTab === "roadmap" ? "active" : ""}
            onClick={() => setActiveTab("roadmap")}
          >
            Road Map
          </button>
         </div>

          <button 
          className={'button activeTab === "download" ? "active" : ""'}
            onClick={() => {
              setActiveTab("download")
              getResumePdf(interviewId)
            }}>
              <svg height={"1rem"} style={{marginRight:"0.8rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6144 17.7956 11.492 15.7854C12.2731 13.9966 13.6789 12.5726 15.4325 11.7942L17.8482 10.7219C18.6162 10.381 18.6162 9.26368 17.8482 8.92277L15.5079 7.88394C13.7092 7.08552 12.2782 5.60881 11.5105 3.75894L10.6215 1.61673C10.2916.821765 9.19319.821767 8.8633 1.61673L7.97427 3.75892C7.20657 5.60881 5.77553 7.08552 3.97685 7.88394L1.63658 8.92277C.868537 9.26368.868536 10.381 1.63658 10.7219L4.0523 11.7942C5.80589 12.5726 7.21171 13.9966 7.99275 15.7854L8.8704 17.7956C9.20776 18.5682 10.277 18.5682 10.6144 17.7956ZM19.4014 22.6899 19.6482 22.1242C20.0882 21.1156 20.8807 20.3125 21.8695 19.8732L22.6299 19.5353C23.0412 19.3526 23.0412 18.7549 22.6299 18.5722L21.9121 18.2532C20.8978 17.8026 20.0911 16.9698 19.6586 15.9269L19.4052 15.3156C19.2285 14.8896 18.6395 14.8896 18.4628 15.3156L18.2094 15.9269C17.777 16.9698 16.9703 17.8026 15.956 18.2532L15.2381 18.5722C14.8269 18.7549 14.8269 19.3526 15.2381 19.5353L15.9985 19.8732C16.9874 20.3125 17.7798 21.1156 18.2198 22.1242L18.4667 22.6899C18.6473 23.104 19.2207 23.104 19.4014 22.6899Z"></path></svg>
             Download Resume
          </button>

        </aside>

        {/* CENTER */}

        <section className="content">
          {renderContent()}
        </section>

        {/* RIGHT */}

        <aside className="right-panel">

          <div className="score-card">

            <h3>Match Score</h3>

            <div className="score">
              {report.matchScore}%
            </div>

          </div>

          <div className="skills">

            <h3>Skill Gaps</h3>

            <div className="chips">
              {report.skillGaps.map((skill, index) => (
                <span className="chip" key={index}>
                  {skill.skills}
                </span>
              ))}
            </div>

          </div>

        </aside>

      </div>

    </main>
  );
};

export default Interview;