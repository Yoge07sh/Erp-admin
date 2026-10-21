import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClipboardCheck,
  FaSearch,
} from "react-icons/fa";

const apiUrl = import.meta.env.VITE_API_URL;

const getTodayIST = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

const getUniqueValues = (items, getValue, getLabel = getValue) => {
  const unique = new Map();

  items.forEach((item) => {
    const value = getValue(item);

    if (value !== undefined && value !== null && String(value) !== "") {
      const key = String(value);

      if (!unique.has(key)) {
        unique.set(key, {
          value: key,
          label: String(getLabel(item)),
        });
      }
    }
  });

  return Array.from(unique.values()).sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
};

const TotalAttendanceForm = () => {
  const navigate = useNavigate();

  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [session, setSession] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch the logged-in faculty's mappings.
  // The mappings are used to discover available classes,
  // not to ask the faculty to select a subject.
  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await axios.get(`${apiUrl}/getfacultymappings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        const mappingList = Array.isArray(data)
          ? data
          : Array.isArray(data?.mappings)
            ? data.mappings
            : Array.isArray(data?.data)
              ? data.data
              : [];

        setMappings(mappingList);
      } catch (err) {
        console.error("Error fetching faculty mappings:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your class details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMappings();
  }, []);

  // Session options
  const sessionOptions = useMemo(
    () =>
      getUniqueValues(
        mappings,
        (m) => m.session,
        (m) => m.session,
      ),
    [mappings],
  );

  // Course options for the selected session
  const courseOptions = useMemo(() => {
    const filtered = mappings.filter(
      (m) => String(m.session ?? "") === session,
    );

    return getUniqueValues(
      filtered,
      (m) => m.course?._id,
      (m) => m.course?.courseShortName || m.course?.courseName || m.course?._id,
    );
  }, [mappings, session]);

  // Branch options for the selected session and course
  const branchOptions = useMemo(() => {
    const filtered = mappings.filter(
      (m) =>
        String(m.session ?? "") === session &&
        String(m.course?._id ?? "") === course,
    );

    return getUniqueValues(
      filtered,
      (m) => m.branch?._id || "__none__",
      (m) => m.branch?.branchShortName || m.branch?.branchName || "No Branch",
    );
  }, [mappings, session, course]);

  // Year options
  const yearOptions = useMemo(() => {
    const filtered = mappings.filter(
      (m) =>
        String(m.session ?? "") === session &&
        String(m.course?._id ?? "") === course &&
        String(m.branch?._id || "__none__") === branch,
    );

    return getUniqueValues(
      filtered,
      (m) => m.year,
      (m) => `Year ${m.year}`,
    );
  }, [mappings, session, course, branch]);

  // Semester options
  const semesterOptions = useMemo(() => {
    const filtered = mappings.filter(
      (m) =>
        String(m.session ?? "") === session &&
        String(m.course?._id ?? "") === course &&
        String(m.branch?._id || "__none__") === branch &&
        String(m.year ?? "") === year,
    );

    return getUniqueValues(
      filtered,
      (m) => m.semester,
      (m) => `Semester ${m.semester}`,
    );
  }, [mappings, session, course, branch, year]);

  // Section options
  const sectionOptions = useMemo(() => {
    const filtered = mappings.filter(
      (m) =>
        String(m.session ?? "") === session &&
        String(m.course?._id ?? "") === course &&
        String(m.branch?._id || "__none__") === branch &&
        String(m.year ?? "") === year &&
        String(m.semester ?? "") === semester,
    );

    return getUniqueValues(
      filtered,
      (m) => m.section,
      (m) => `Section ${m.section}`,
    );
  }, [mappings, session, course, branch, year, semester]);

  const handleSessionChange = (value) => {
    setSession(value);
    setCourse("");
    setBranch("");
    setYear("");
    setSemester("");
    setSection("");
  };

  const handleCourseChange = (value) => {
    setCourse(value);
    setBranch("");
    setYear("");
    setSemester("");
    setSection("");
  };

  const handleBranchChange = (value) => {
    setBranch(value);
    setYear("");
    setSemester("");
    setSection("");
  };

  const handleYearChange = (value) => {
    setYear(value);
    setSemester("");
    setSection("");
  };

  const handleSemesterChange = (value) => {
    setSemester(value);
    setSection("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!session || !course || !branch || !year || !semester || !section) {
      setError("Please select all class details.");
      return;
    }

    if (!fromDate || !toDate) {
      setError("Please select both the start date and end date.");
      return;
    }

    if (fromDate > toDate) {
      setError("The start date cannot be after the end date.");
      return;
    }

    setSubmitting(true);

    const selectedClassMapping = mappings.find(
      (m) =>
        String(m.session ?? "") === session &&
        String(m.course?._id ?? "") === course &&
        String(m.branch?._id || "__none__") === branch &&
        String(m.year ?? "") === year &&
        String(m.semester ?? "") === semester &&
        String(m.section ?? "") === section,
    );

    const formData = {
      session,
      course,
      courseName:
        selectedClassMapping?.course?.courseShortName ||
        selectedClassMapping?.course?.courseName ||
        "",
      branch: branch === "__none__" ? "" : branch,
      branchName:
        selectedClassMapping?.branch?.branchShortName ||
        selectedClassMapping?.branch?.branchName ||
        "",
      year,
      semester,
      section,
    };

    // Open the total attendance report.
    // No subject or individual mapping ID is sent.
    navigate("/total-attendance-report", {
      state: {
        formData,
        session,
        course,
        branch: branch === "__none__" ? "" : branch,
        year,
        semester,
        section,
        fromDate,
        toDate,
      },
    });

    setSubmitting(false);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
        <p className="mt-3">Loading your class details...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          className="me-3"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FaArrowLeft />
        </Button>

        <div>
          <h3 className="mb-1">Total Attendance Register</h3>
          <p className="text-muted mb-0">
            Select a class and date range to view daily attendance.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!mappings.length && !error && (
        <Alert variant="warning">
          No faculty mappings were found. Please check your assigned class
          mappings.
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white py-3">
          <h5 className="mb-0">
            <FaClipboardCheck className="me-2" />
            Class and Date Selection
          </h5>
        </Card.Header>

        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Session</Form.Label>
                  <Form.Select
                    value={session}
                    onChange={(e) => handleSessionChange(e.target.value)}
                    required
                  >
                    <option value="">Select Session</option>
                    {sessionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Course</Form.Label>
                  <Form.Select
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    disabled={!session}
                    required
                  >
                    <option value="">Select Course</option>
                    {courseOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Branch</Form.Label>
                  <Form.Select
                    value={branch}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    disabled={!course}
                    required
                  >
                    <option value="">Select Branch</option>
                    {branchOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={year}
                    onChange={(e) => handleYearChange(e.target.value)}
                    disabled={!branch}
                    required
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Semester</Form.Label>
                  <Form.Select
                    value={semester}
                    onChange={(e) => handleSemesterChange(e.target.value)}
                    disabled={!year}
                    required
                  >
                    <option value="">Select Semester</option>
                    {semesterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Section</Form.Label>
                  <Form.Select
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    disabled={!semester}
                    required
                  >
                    <option value="">Select Section</option>
                    {sectionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    max={toDate || getTodayIST()}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    max={getTodayIST()}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr className="my-4" />

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                type="submit"
                disabled={submitting || !mappings.length}
              >
                <FaSearch className="me-2" />
                View Total Attendance
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TotalAttendanceForm;
