import {
  Container,
  Card,
  Table,
  Badge,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

// Get today's date in Indian Standard Time (YYYY-MM-DD)
const getISTDateString = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

// Format the marked attendance date without timezone conversion issues
const formatAttendanceDate = (date) => {
  if (!date) return "-";

  // If the backend returns YYYY-MM-DD, display that date directly.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  }

  // Handle ISO date strings returned by the backend.
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function AttendanceSummary() {
  const today = getISTDateString();

  const [date, setDate] = useState(today);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(`${apiUrl}/attendance/dashboard`, {
          params: { date },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (cancelled) return;
        setSubjects(
          (response.data.data || []).map((subject) => ({
            ...subject,
            date: response.data.date,
          })),
        );

      } catch (err) {
        if (cancelled) return;

        console.error("Attendance summary error:", err);

        setError(
          err.response?.data?.message || "Failed to load attendance summary.",
        );

        setSubjects([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <Container fluid className="py-3 px-3">
      {/* Page Heading */}
      <div className="text-center mb-3">
        <h3 className="text-primary fw-bold mb-1">ATTENDANCE SUMMARY</h3>

        <small className="text-muted">
          Marked lectures and their time slots
        </small>
      </div>

      {/* Date Filter and Summary */}
      <Card className="border-0 shadow-sm mb-3">
        <Card.Body className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-2">
          <Form.Group className="d-flex align-items-center gap-2 mb-0">
            <Form.Label className="mb-0">Date:</Form.Label>

            <Form.Control
              type="date"
              size="sm"
              value={date}
              max={today}
              onChange={(event) => setDate(event.target.value || today)}
              style={{ width: "160px" }}
            />
          </Form.Group>

          <Badge bg="success" className="p-2">
            Marked Lectures: {subjects.length}
          </Badge>
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Attendance Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading attendance...</span>
            </div>
          ) : (
            <Table responsive bordered hover className="mb-0 align-middle">
              <thead className="table-primary">
                <tr>
                  <th className="text-center">S.No.</th>
                  <th className="text-center">Date</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th className="text-center">Lecture</th>
                  <th>Time Slot</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {subjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No marked attendance found for this date.
                    </td>
                  </tr>
                ) : (
                  subjects.map((subject, index) => (
                    <tr key={subject._id}>
                      <td className="text-center">{index + 1}</td>

                      {/* Actual marked attendance date */}
                      <td className="text-center text-nowrap">
                        {formatAttendanceDate(date)}
                      </td>

                      <td className="fw-semibold">
                        {subject.subjectName || "-"}
                      </td>

                      <td>
                        {subject.courseName || "-"}
                        {subject.branchName ? ` / ${subject.branchName}` : ""}

                        <div className="small text-muted">
                          Year {subject.year ?? "-"} · Semester{" "}
                          {subject.semester ?? "-"} · Section{" "}
                          {subject.section || "-"}
                        </div>
                      </td>

                      <td className="text-center">
                        {subject.lectureNo ?? "-"}
                      </td>

                      <td>{subject.timeSlot || "-"}</td>

                      <td className="text-center">
                        <Badge bg="success">Marked</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AttendanceSummary;
