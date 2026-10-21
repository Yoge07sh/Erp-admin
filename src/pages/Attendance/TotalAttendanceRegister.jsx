import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const getToday = () => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
};

const getFirstDayOfMonth = () => `${getToday().slice(0, 7)}-01`;

const formatDate = (value) => {
  if (!value) return "-";

  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
};

const getFullName = (student) =>
  [student.firstName, student.lastName].filter(Boolean).join(" ").trim() ||
  student.name ||
  "-";

const getRollNumber = (student) =>
  student.rollNumber ?? student.enrollmentNumber ?? "-";

const TotalAttendanceRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read the values selected in TotalAttendanceForm
  const navigationState = location.state || {};
  const formData = navigationState.formData || {};

  const initialFromDate =
    navigationState.fromDate || formData.fromDate || getFirstDayOfMonth();

  const initialToDate = navigationState.toDate || formData.toDate || getToday();

  // Editable date inputs
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);

  // Dates actually applied to the report
  const [appliedFromDate, setAppliedFromDate] = useState(initialFromDate);
  const [appliedToDate, setAppliedToDate] = useState(initialToDate);

  const [students, setStudents] = useState([]);
  const [dates, setDates] = useState([]);
  const [classDetails, setClassDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAttendanceRegister = useCallback(async () => {
    if (!appliedFromDate || !appliedToDate || appliedFromDate > appliedToDate) {
      setError("Please select a valid date range.");
      return;
    }

    const state = location.state || {};
    const form = state.formData || {};

    const session = state.session ?? form.session ?? state.currentSession;

    const course =
      state.course?._id ?? state.courseId ?? form.course ?? state.course;

    const branch =
      state.branch?._id ?? state.branchId ?? form.branch ?? state.branch;

    const year = state.year ?? form.year;
    const semester = state.semester ?? form.semester;
    const section = state.section ?? form.section;

    if (
      !session ||
      !course ||
      year === undefined ||
      year === null ||
      semester === undefined ||
      semester === null ||
      !section
    ) {
      setStudents([]);
      setDates([]);
      setError(
        "Class details are missing. Open this page from the class selection page.",
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setStudents([]);
      setDates([]);
      setError("Login session not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Send the exact range selected by the user
      const params = {
        session,
        course,
        year,
        semester,
        section,
        fromDate: appliedFromDate,
        toDate: appliedToDate,
      };

      if (branch && branch !== "__none__") {
        params.branch = branch;
      }

      console.log("Attendance API request:", params);

      const response = await axios.get(
        `${API_URL}/api/attendance/totalattendance-register`,
        {
          params,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = response.data;

      console.log("Attendance API response:", {
        fromDate: data.fromDate,
        toDate: data.toDate,
        dates: data.dates,
        totalDays: data.totalDays,
        totalStudents: data.students?.length,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to load attendance register.");
      }

      setStudents(Array.isArray(data.students) ? data.students : []);
      setDates(Array.isArray(data.dates) ? data.dates : []);
      setMessage(data.message || "");

      setClassDetails({
        session,
        course:
          state.courseName ??
          form.courseName ??
          state.course?.courseName ??
          state.course?.name ??
          "",
        branch:
          state.branchName ??
          form.branchName ??
          state.branch?.branchName ??
          state.branch?.name ??
          "",
        year,
        semester,
        section,
      });
    } catch (err) {
      console.error("Attendance register error:", err);

      setStudents([]);
      setDates([]);
      setMessage("");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendance register.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedFromDate, appliedToDate, location.state]);

  // Fetch on page load and whenever the applied range changes
  useEffect(() => {
    fetchAttendanceRegister();
  }, [fetchAttendanceRegister]);

  const handleApply = (event) => {
    event.preventDefault();

    if (!fromDate || !toDate || fromDate > toDate) {
      setError("From date cannot be later than To date.");
      return;
    }

    setError("");
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
  };

  const generatePDF = () => {
    if (!students.length) {
      setError("No attendance data available to generate PDF.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(16);
    doc.text("Total Attendance Register", 14, 14);

    doc.setFontSize(9);

    const classLine = [
      `Session: ${classDetails?.session ?? "-"}`,
      `Course: ${classDetails?.course || "-"}`,
      `Branch: ${classDetails?.branch || "-"}`,
      `Year: ${classDetails?.year ?? "-"}`,
      `Semester: ${classDetails?.semester ?? "-"}`,
      `Section: ${classDetails?.section ?? "-"}`,
    ].join(" | ");

    doc.text(classLine, 14, 21);

    doc.text(
      `Date Range: ${formatDate(appliedFromDate)} to ${formatDate(
        appliedToDate,
      )} | Total Days: ${dates.length}`,
      14,
      27,
    );

    const head = [
      [
        "#",
        "Roll No.",
        "Student Name",
        ...dates.map(formatDate),
        "Present",
        "Total Days",
        "Attendance %",
      ],
    ];

    const body = students.map((student, index) => {
      const points = Number(student.pointsEarned || 0);
      const total = Number(student.totalDays ?? dates.length);

      const percentage =
        student.percentage !== undefined
          ? Number(student.percentage)
          : total > 0
            ? (points / total) * 100
            : 0;

      return [
        index + 1,
        String(getRollNumber(student)),
        getFullName(student),
        ...dates.map((date) => {
          const status = student.dailyStatuses?.[date];

          if (status === "P" || status === "Present") return "P";
          if (status === "A" || status === "Absent") return "A";

          return "-";
        }),
        points,
        total,
        `${percentage.toFixed(2)}%`,
      ];
    });

    autoTable(doc, {
      head,
      body,
      startY: 32,
      theme: "grid",
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: "linebreak",
        valign: "middle",
      },
      headStyles: {
        fillColor: [45, 75, 120],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: 27 },
        2: { cellWidth: 40 },
      },
      horizontalPageBreak: true,
      horizontalPageBreakRepeat: [0, 1, 2],
      margin: { top: 10, right: 10, bottom: 12, left: 10 },
      didDrawPage: () => {
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

        doc.setFontSize(8);
        doc.text(
          `Page ${pageNumber}`,
          doc.internal.pageSize.getWidth() - 14,
          doc.internal.pageSize.getHeight() - 5,
          { align: "right" },
        );
      },
    });

    doc.save(`Attendance_Register_${appliedFromDate}_to_${appliedToDate}.pdf`);
  };

  return (
    <Container fluid className="py-2 px-2 px-md-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
        <div>
          <h5 className="fw-bold mb-0">Total Attendance Register</h5>
          <div className="small text-muted">
            Daily attendance · One result per date
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={fetchAttendanceRegister}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={generatePDF}
            disabled={loading || students.length === 0}
          >
            Generate PDF
          </Button>
        </div>
      </div>

      {classDetails && (
        <div className="small text-muted mb-2 d-flex flex-wrap gap-1">
          <span>
            Session: <strong>{classDetails.session}</strong>
          </span>
          <span> | </span>

          {classDetails.course && (
            <>
              <span>
                Course: <strong>{classDetails.course}</strong>
              </span>
              <span> | </span>
            </>
          )}

          {classDetails.branch && (
            <>
              <span>
                Branch: <strong>{classDetails.branch}</strong>
              </span>
              <span> | </span>
            </>
          )}

          <span>
            Year: <strong>{classDetails.year}</strong>
          </span>
          <span> | </span>

          <span>
            Semester: <strong>{classDetails.semester}</strong>
          </span>
          <span> | </span>

          <span>
            Section: <strong>{classDetails.section}</strong>
          </span>
        </div>
      )}

      <Form onSubmit={handleApply} className="mb-2">
        <Row className="g-2 align-items-end">
          <Col xs={6} sm="auto">
            <Form.Label className="small mb-1">From</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={fromDate}
              max={toDate || getToday()}
              onChange={(event) => setFromDate(event.target.value)}
              required
            />
          </Col>

          <Col xs={6} sm="auto">
            <Form.Label className="small mb-1">To</Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={toDate}
              min={fromDate}
              max={getToday()}
              onChange={(event) => setToDate(event.target.value)}
              required
            />
          </Col>

          <Col xs={12} sm="auto">
            <Button
              size="sm"
              type="submit"
              variant="primary"
              className="w-100"
              disabled={loading}
            >
              Apply
            </Button>
          </Col>

          <Col xs={12} sm="auto" className="ms-sm-auto">
            <div className="small text-muted text-sm-end">
              Students: <strong>{students.length}</strong>
              {" · "}
              Days: <strong>{dates.length}</strong>
            </div>
          </Col>
        </Row>
      </Form>

      {error && (
        <Alert
          variant="danger"
          className="py-2 mb-2"
          dismissible
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {message && !error && (
        <Alert variant="info" className="py-2 mb-2">
          {message}
        </Alert>
      )}

      <Card className="border shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex align-items-center gap-2 p-3 text-muted">
              <Spinner animation="border" size="sm" />
              <span className="small">Loading attendance records...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="p-3 text-muted small">
              No students found for the selected class and date range.
            </div>
          ) : (
            <div
              className="table-responsive"
              style={{ maxHeight: "calc(100vh - 190px)" }}
            >
              <Table
                bordered
                hover
                striped
                size="sm"
                className="mb-0 align-middle text-nowrap"
              >
                <thead className="table-light">
                  <tr>
                    {[
                      "S.No",
                      "Roll No.",
                      "Student Name",
                      "Total Days",
                      "Present Days",
                      "Attendance %",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="text-center"
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => {
                    const points = Number(student.pointsEarned || 0);
                    const total = Number(student.totalDays ?? dates.length);

                    const percentage =
                      student.percentage !== undefined
                        ? Number(student.percentage)
                        : total > 0
                          ? (points / total) * 100
                          : 0;

                    return (
                      <tr key={student._id ?? getRollNumber(student) ?? index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="fw-semibold">
                          {getRollNumber(student)}
                        </td>
                        <td>{getFullName(student)}</td>
                        <td className="text-center">{total}</td>
                        <td className="text-center fw-semibold">{points}</td>
                        <td className="text-center fw-semibold">
                          {percentage.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="small text-muted mt-2">
        <Badge bg="success">P</Badge> Present in every saved lecture that day
        {" · "}
        <Badge bg="danger">A</Badge> Absent in at least one saved lecture
      </div>

      <div className="small text-muted mt-1">
        Applied range: {formatDate(appliedFromDate)} to{" "}
        {formatDate(appliedToDate)}
      </div>
    </Container>
  );
};

export default TotalAttendanceRegister;
