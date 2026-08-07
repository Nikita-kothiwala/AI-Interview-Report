import React from "react";
import { useNavigate } from "react-router";
import "./style/reportsidebar.scss"

const ReportSidebar = ({ open, reports, onClose }) => {
  const navigate = useNavigate();

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`report-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Interview Reports</h2>

          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sidebar-body">
          {reports.length === 0 ? (
            <div className="empty-state">
              <p>No reports generated yet.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report._id}
                className="report-card"
                onClick={() => {
                  navigate(`/interview/${report._id}`);
                  onClose();
                }}
              >
                <h3>{report.title || "Untitled Position"}</h3>

                <p className="date">
                  {new Date(report.createdAt).toLocaleDateString()}
                </p>

                <div className="score">
                  Match Score
                  <span>{report.matchScore}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default ReportSidebar;