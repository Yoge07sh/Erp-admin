import {
  Container,
  Button,
  Table,
  Card,
  Row,
  Col,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// How many days back faculty can mark attendance (keep same as backend)
const MAX_BACKDATE_DAYS = 30;

// Returns YYYY-MM-DD in Indian time
const getISTDateString = (d = new Date()) =>
  d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

function StudentsAttendance() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    students = [],
    formData = {},
    facultyMapId = "",
    timeSlotId = "",
    selectedDate = "",
  } = location.state || {};

  const today = getISTDateString();
  const minDate = getISTDateString(
    new Date(Date.now() - MAX_BACKDATE_DAYS * 24 * 60 * 60 * 1000),
  );

  const [attendance, setAttendance] = useState({});
  const [attendanceDate, setAttendanceDate] = useState(selectedDate || today);
  const [submitting, setSubmitting] = useState(false);
  const [show, setShow] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const handleClose = () => {
    setShow(false);
  };
  const handleSubmit = async () => {
    if (submitting) return; // block double clicks

    if (!facultyMapId) {
      alert("Mapping information is missing.");
      return;
    }

    if (!timeSlotId) {
      alert("Time slot is missing.");
      return;
    }

    if (students.length === 0) {
      alert("No students found.");
      return;
    }

    if (!attendanceDate) {
      alert("Please select the attendance date.");
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      const attendanceData = students.map((student) => ({
        studentId: student._id,
        status: attendance[student._id] || "Present",
      }));

      const response = await axios.post(
        `${apiUrl}/attendance`,
        {
          facultyMapId: facultyMapId,
          timeSlotId: timeSlotId,
          date: attendanceDate, // YYYY-MM-DD
          students: attendanceData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        setShow(true);
      }
    } catch (err) {
      console.error("Attendance submission error:", err);
      setErrorMessage(
        err.response?.data?.message || "Failed to submit attendance",
      );
      setShowError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter(
    (student) => (attendance[student._id] || "Present") === "Present",
  ).length;

  const absentCount = students.filter(
    (student) => attendance[student._id] === "Absent",
  ).length;

  return (
    <Container fluid className="py-3 px-4">
      {/* Page Heading */}
      <div className="text-center mb-3">
        <h3 className="text-primary fw-bold mb-1">STUDENT ATTENDANCE</h3>

        <div className="text-muted small">
          Mark attendance for the selected class
        </div>
      </div>

      <Row className="g-3">
        {/* Attendance Summary */}
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Body className="py-2 px-3">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <h6 className="fw-bold text-primary mb-0">
                  Attendance Summary
                </h6>

                <div>
                  <small className="text-muted">Course</small>

                  <span className="fw-semibold ms-2">
                    {formData.courseName || "-"}
                  </span>
                </div>

                {formData.branchName && (
                  <div>
                    <small className="text-muted">Branch</small>

                    <span className="fw-semibold ms-2">
                      {formData.branchName}
                    </span>
                  </div>
                )}

                <div>
                  <small className="text-muted">Year</small>

                  <span className="fw-semibold ms-2">
                    {formData.year || "-"}
                  </span>
                </div>

                <div>
                  <small className="text-muted">Semester</small>

                  <span className="fw-semibold ms-2">
                    {formData.semester || "-"}
                  </span>
                </div>

                <div>
                  <small className="text-muted">Section</small>

                  <span className="fw-semibold ms-2">
                    {formData.section || "-"}
                  </span>
                </div>

                {/* Attendance Date */}
                <div className="d-flex align-items-center">
                  <small className="text-muted">Date</small>

                  <Form.Control
                    type="date"
                    size="sm"
                    className="ms-2"
                    style={{ width: "160px" }}
                    value={attendanceDate}
                    min={minDate}
                    max={today}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                  />
                </div>

                <div className="ms-auto d-flex gap-2">
                  <Badge bg="primary" pill>
                    Total: {students.length}
                  </Badge>

                  <Badge bg="success" pill>
                    Present: {presentCount}
                  </Badge>

                  <Badge bg="danger" pill>
                    Absent: {absentCount}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Student Table */}
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              {/* Table Heading */}
              <div className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom">
                <div>
                  <h5 className="fw-bold mb-1">Student List</h5>

                  <small className="text-muted">
                    Mark attendance for each student
                  </small>
                </div>

                <Badge bg="primary" className="px-3 py-2">
                  {students.length} Students
                </Badge>
              </div>

              {/* Student Table */}
              <div className="table-responsive">
                <Table bordered hover className="mb-0 align-middle">
                  <thead className="table-primary">
                    <tr>
                      <th className="text-center" style={{ width: "8%" }}>
                        S.No
                      </th>

                      <th className="text-center" style={{ width: "18%" }}>
                        Roll No.
                      </th>

                      <th style={{ width: "39%" }}>Student Name</th>

                      <th className="text-center" style={{ width: "35%" }}>
                        Attendance
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.length > 0 ? (
                      students.map((student, index) => {
                        const status = attendance[student._id] || "Present";

                        return (
                          <tr key={student._id}>
                            <td className="text-center fw-semibold">
                              {index + 1}
                            </td>

                            <td className="text-center fw-semibold">
                              {student.rollNumber}
                            </td>

                            <td>
                              <span className="fw-semibold">
                                {student.firstName} {student.lastName}
                              </span>
                            </td>

                            <td>
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  size="sm"
                                  className="px-3"
                                  variant={
                                    status === "Present"
                                      ? "success"
                                      : "outline-success"
                                  }
                                  onClick={() =>
                                    setAttendance({
                                      ...attendance,
                                      [student._id]: "Present",
                                    })
                                  }
                                >
                                  Present
                                </Button>

                                <Button
                                  size="sm"
                                  className="px-3"
                                  variant={
                                    status === "Absent"
                                      ? "danger"
                                      : "outline-danger"
                                  }
                                  onClick={() =>
                                    setAttendance({
                                      ...attendance,
                                      [student._id]: "Absent",
                                    })
                                  }
                                >
                                  Absent
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Submit Button */}
              <div className="text-end p-3 border-top">
                <Button
                  variant="primary"
                  disabled={students.length === 0 || submitting}
                  className="px-4"
                  onClick={handleSubmit}
                >
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </Button>
              </div>
            </Card.Body>
          </Card>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Success</Modal.Title>
            </Modal.Header>
            <Modal.Body>Attendance Submitted successfully👍</Modal.Body>
            <Modal.Footer>
              <Button
                variant="success"
                onClick={() => {
                  handleClose();
                  navigate("/getstudents");
                }}
              >
                OK
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showError} onHide={() => setShowError(false)}>
            <Modal.Header closeButton>
              <Modal.Title className="text-danger">
                Submission Failed
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <div className="text-danger fw-semibold">{errorMessage}</div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="danger" onClick={() => setShowError(false)}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentsAttendance;
