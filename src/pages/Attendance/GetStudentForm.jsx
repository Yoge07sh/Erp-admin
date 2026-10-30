import { Container, Form, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaChalkboardTeacher,
  FaClock,
  FaCalendarAlt,
  FaUserGraduate,
  FaEye,
  FaArrowRight,
  FaClipboardCheck,
} from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;

function GetStudentForm() {
  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState("");
  const [timeslots, setTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [formData, setFormData] = useState({
    session: "",
    course: "",
    courseName: "",
    branch: "",
    branchName: "",
    year: "",
    semester: "",
    section: "",
  });
  const token = localStorage.getItem("token");

  // Get faculty mappings
  useEffect(() => {
    axios
      .get(`${apiUrl}/getfacultymappings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.data.success) {
          setMappings(res.data.data);
        } else {
          alert("Failed to load faculty mappings.");
        }
      })
      .catch((err) => {
        console.error("Error fetching faculty mappings:", err);
        alert("Failed to load faculty mappings.");
      });
  }, []);

  // Get time slots
  useEffect(() => {
    axios
      .get(`${apiUrl}/timeslots`)
      .then((res) => {
        setTimeSlots(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching time slots:", err);
        alert("Failed to load time slots.");
      });
  }, []);

  // When faculty selects a mapping
  const handleMappingChange = (e) => {
    const mappingId = e.target.value;

    setSelectedMapping(mappingId);

    const mapping = mappings.find((item) => item._id === mappingId);

    if (mapping) {
      setFormData({
        session: mapping.session,
        course: mapping.course?._id || "",
        courseName: mapping.course?.courseShortName || "",
        branch: mapping.branch?._id || "",
        branchName: mapping.branch?.branchShortName || "",
        year: mapping.year,
        semester: mapping.semester,
        section: mapping.section,
      });
    } else {
      setFormData({
        session: "",
        course: "",
        courseName: "",
        branch: "",
        branchName: "",
        year: "",
        semester: "",
        section: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMapping) {
      alert("Please select a class.");
      return;
    }

    if (!selectedTimeSlot) {
      alert("Please select a time slot.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(`${apiUrl}/getstudentsdata`, {
        params: {
          mappingId: selectedMapping,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/studentsattendance", {
        state: {
          students: response.data.data,
          formData: formData,
          facultyMapId: selectedMapping,
          timeSlotId: selectedTimeSlot,
          selectedDate: selectedDate,
        },
      });
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Failed to fetch students");
    }
  };

  return (
    <Container
      fluid
      className="py-4 px-4"
      style={{
        backgroundColor: "#f5f7fb",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        className="mb-4 p-4 rounded-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
          color: "white",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: "52px",
              height: "52px",
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <FaClipboardCheck size={25} />
          </div>

          <div>
            <h3 className="mb-1 fw-bold">Attendance Management</h3>

            <p
              className="mb-0"
              style={{
                color: "#cbd5e1",
                fontSize: "14px",
              }}
            >
              Select your class, lecture time and date to manage attendance
            </p>
          </div>
          <div className="ms-auto">
            <Button
              onClick={() => {
                navigate("/register");
              }}
            >
              E-AttendanceRegister
            </Button>
          </div>
        </div>
      </div>
      {/* Form Card */}
      <div className="bg-white rounded-4 shadow-sm p-4">
        <Form onSubmit={handleSubmit}>
          {/* Class */}
          <Row>
            <Col md={12}>
              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <FaChalkboardTeacher
                    className="me-2"
                    style={{ color: "#2563eb" }}
                  />
                  Select Class / Lecture
                </Form.Label>

                <Form.Select
                  value={selectedMapping}
                  onChange={handleMappingChange}
                  className="py-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "none",
                  }}
                >
                  <option value="">Select Class</option>

                  {mappings.map((mapping) => (
                    <option key={mapping._id} value={mapping._id}>
                      {mapping.session} | {mapping.course?.courseShortName} |{" "}
                      {mapping.branch?.branchShortName} | Year {mapping.year} |
                      Semester {mapping.semester} | Section {mapping.section} |{" "}
                      {mapping.subjectId?.subjectFullName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Time Slot + Date */}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <FaClock className="me-2" style={{ color: "#0ea5e9" }} />
                  Select Time Slot
                </Form.Label>

                <Form.Select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="py-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "none",
                  }}
                >
                  <option value="">Select Time Slot</option>

                  {timeslots.map((t) => (
                    <option key={t._id} value={t._id}>
                      Lecture {t.lectureNo} - {t.timeSlot}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-semibold"
                  style={{ color: "#1e293b" }}
                >
                  <FaCalendarAlt
                    className="me-2"
                    style={{ color: "#8b5cf6" }}
                  />
                  Select Date
                </Form.Label>

                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="py-2"
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    boxShadow: "none",
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Buttons */}
          <div className="d-flex gap-3 mt-2 flex-wrap">
            <Button
              type="submit"
              disabled={!selectedMapping || !selectedTimeSlot}
              className="d-flex align-items-center justify-content-center gap-2 px-4 py-2 border-0"
              style={{
                backgroundColor: "#2563eb",
                borderRadius: "9px",
                fontWeight: "600",
                minWidth: "160px",
              }}
            >
              <FaUserGraduate />
              Get Students
              <FaArrowRight size={12} />
            </Button>

            <Button
              type="button"
              disabled={!selectedMapping || !selectedTimeSlot || !selectedDate}
              onClick={() =>
                navigate("/viewattendance", {
                  state: {
                    formData: formData,
                    facultyMapId: selectedMapping,
                    SingletimeSlot: selectedTimeSlot,
                    selectedDate: selectedDate,
                  },
                })
              }
              className="d-flex align-items-center justify-content-center gap-2 px-4 py-2 border-0"
              style={{
                backgroundColor: "#0f7631",
                borderRadius: "9px",
                fontWeight: "600",
                minWidth: "180px",
              }}
            >
              <FaEye />
              View Attendance
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
}

export default GetStudentForm;
