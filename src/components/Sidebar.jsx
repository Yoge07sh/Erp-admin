import { NavLink, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserGraduate } from "react-icons/fa";

// ================= SIDEBAR =================
function Sidebar({ isOpen, onClose }) {
  let navigate = useNavigate();
  const [userRole, setUserRole] = useState("");
  const [studentId, setStudentId] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL;

  // ================= GET USER FROM BACKEND =================
  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const res = await axios.get(apiUrl + "/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setUserRole(res.data.data.userRole);

          if (res.data.data.userRole === "student") {
            setStudentId(res.data.data.studentId || null);
          }
        }
      } catch (error) {
        console.log("Error fetching user data:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      }
    };

    getUserData();
  }, [apiUrl, navigate]);

  // ================= ROLE CHECK =================
  const isAdmin = userRole === "admin";
  const isFaculty = userRole === "faculty";
  const isStudent = userRole === "student";

  return (
    <>
      <div
        className={`sidebar d-flex flex-column justify-content-between ${
          isOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="d-md-none text-end p-2">
          <button
            className="btn btn-sm btn-outline-light"
            onClick={onClose}
            type="button"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        {/* ================= SIDEBAR MENU ================= */}

        <div className="flex-grow-1  mt-3 overflow-auto">
          <ListGroup
            variant="flush"
            className="pt-4 px-3 flex-grow-1 overflow-auto"
          >
            {/* ================= ADMIN ================= */}
            {isAdmin && (
              <>
                <ListGroup.Item
                  as={NavLink}
                  to="/courses"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-mortarboard-fill"></i>
                  <span>Courses</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/branches"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-building"></i>
                  <span>Branches</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/subjects"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-journal-bookmark"></i>
                  <span>Subjects</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/subjectsmap"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-diagram-2"></i>
                  <span>Subject Mapping</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/faculties"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-person-workspace"></i>
                  <span>Faculties</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/facultymapping"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-diagram-3"></i>
                  <span>Faculty Mapping</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/students"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <FaUserGraduate />
                  <span>Students</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/timeslots"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-clock"></i>
                  <span>TimeSlots</span>
                </ListGroup.Item>
              </>
            )}

            {/* ================= FACULTY ================= */}
            {isFaculty && (
              <>
                <ListGroup.Item
                  as={NavLink}
                  to="/attendancesummary"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-clipboard-check"></i>
                  <span>Attendance Dashboard</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/getstudents"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-clipboard-check"></i>
                  <span>Mark Attendance</span>
                </ListGroup.Item>

                <ListGroup.Item
                  as={NavLink}
                  to="/attendance-register"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-clipboard-check"></i>
                  <span>Lecute/Register</span>
                </ListGroup.Item>
                <ListGroup.Item
                  as={NavLink}
                  to="/total-attendance"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                >
                  <i className="bi bi-clipboard-check"></i>
                  <span>AttendanceRecord</span>
                </ListGroup.Item>
              </>
            )}

            {/* ================= STUDENT ================= */}
            {isStudent && (
              <>
                <ListGroup.Item
                  as={NavLink}
                  to="/student/attendance"
                  className="sidebar-menu-item d-flex align-items-center gap-2"
                  onClick={onClose}
                >
                  <i className="bi bi-person-circle"></i>
                  <span>My Attendance</span>
                </ListGroup.Item>
              </>
            )}
          </ListGroup>
        </div>
      </div>
      {isOpen && (
        <div className="sidebar-overlay d-md-none" onClick={onClose}></div>
      )}
    </>
  );
}

export default Sidebar;
