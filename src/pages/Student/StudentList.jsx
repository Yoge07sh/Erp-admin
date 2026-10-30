import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";

import { Modal, Button, Form, Container, Row, Col } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const SECTIONS = ["A", "B", "C", "D"];

// Sessions like "2023-24", "2024-25" ... up to SESSION_END_YEAR
const SESSION_START_YEAR = 2023;
const SESSION_END_YEAR = 2030; // change this to extend the list

const SESSIONS = Array.from(
  { length: SESSION_END_YEAR - SESSION_START_YEAR + 1 },
  (_, i) => {
    const start = SESSION_START_YEAR + i;
    const end = String(start + 1).slice(-2);
    return `${start}-${end}`;
  },
);

// Accepts [..], { data: [..] }, { courses: [..] }, { branches: [..] }, { data: { courses: [..] } }, etc.
const toArray = (body) => {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== "object") return [];

  const candidates = [
    body.data,
    body.courses,
    body.branches,
    body.result,
    body.results,
    body.data?.courses,
    body.data?.branches,
    body.data?.data,
  ];

  return candidates.find((c) => Array.isArray(c)) || [];
};

const emptyFilters = {
  courseId: "",
  branchId: "",
  year: "",
  semester: "",
  section: "",
  currentSession: "",
};

function StudentList() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  // Dropdown data
  const [courses, setCourses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [filterError, setFilterError] = useState("");

  // Filter form values (what the user is selecting)
  const [formFilters, setFormFilters] = useState(emptyFilters);

  // Applied filters (what is actually sent to the backend)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Loading state
  const [loading, setLoading] = useState(false);

  const limit = 20;

  const token = localStorage.getItem("token");

  // Fetch courses for the filter dropdown
  useEffect(() => {
    const getCourses = async () => {
      try {
        setFilterError("");

        const result = await axios.get(`${apiUrl}/courses/for/student`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = toArray(result.data);
        setCourses(list);

        if (list.length === 0) {
          setFilterError("No courses returned by the server.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setFilterError(
          `Courses failed (${error.response?.status || "network"}): ` +
            (error.response?.data?.message || error.message),
        );
        setCourses([]);
      }
    };

    getCourses();
  }, []);

  // Fetch branches whenever the selected course changes (branch needs courseId)
  useEffect(() => {
    if (!formFilters.courseId) {
      setBranches([]);
      return;
    }

    let isMounted = true;

    const getBranches = async () => {
      try {
        setBranchLoading(true);

        const result = await axios.get(`${apiUrl}/branches/for/student`, {
          params: { courseId: formFilters.courseId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (isMounted) setBranches(toArray(result.data));
      } catch (error) {
        console.error("Error fetching branches:", error);

        if (isMounted) {
          setBranches([]);
          setFilterError(
            `Branches failed (${error.response?.status || "network"}): ` +
              (error.response?.data?.message || error.message),
          );
        }
      } finally {
        if (isMounted) setBranchLoading(false);
      }
    };

    getBranches();

    return () => {
      isMounted = false;
    };
  }, [formFilters.courseId]);

  // Fetch students
  useEffect(() => {
    let isMounted = true;

    const getStudents = async () => {
      try {
        setLoading(true);

        // Only send filters that have a value
        const params = { page: currentPage, limit };
        Object.entries(appliedFilters).forEach(([key, value]) => {
          if (value !== "") params[key] = value;
        });

        const result = await axios.get(`${apiUrl}/students`, { params });

        if (isMounted && result.data.success) {
          setStudents(result.data.data);

          if (result.data.pagination) {
            setTotalPages(result.data.pagination.totalPages);
            setTotalRecords(result.data.pagination.totalRecords);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching students:",
          error.response?.data?.message || error.message,
        );

        if (isMounted) {
          setStudents([]);
          setTotalPages(1);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getStudents();

    return () => {
      isMounted = false;
    };
  }, [appliedFilters, currentPage, isDelete]);

  // Handle any filter field change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFormFilters((prev) => {
      // Changing course resets branch
      if (name === "courseId") {
        return { ...prev, courseId: value, branchId: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  // Apply filters (form submit)
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setAppliedFilters(formFilters);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFormFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setBranches([]);
    setCurrentPage(1);
  };

  // Close success modal and refresh students
  const handleClose = () => {
    setShow(false);
    setIsDelete((prev) => !prev);
  };

  // Navigate to Add Student
  const goToAddStudentPage = () => {
    navigate("/add/student");
  };

  // Navigate to Edit Student
  const goToEdit = (id) => {
    navigate("/edit/student/" + id);
  };

  // Navigate to Student Profile
  const goToView = (id) => {
    navigate("/student/profile/" + id);
  };

  // Delete Student
  const goToDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?",
    );

    if (!confirmed) return;

    try {
      const result = await axios.delete(`${apiUrl}/delete/student/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data.success) {
        setShow(true);
      }
    } catch (error) {
      console.error(
        "Error deleting student:",
        error.response?.data?.message || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete student. Please try again.",
      );
    }
  };

  return (
    <Container>
      {/* Heading */}
      <h3 className="text-center mb-4 py-2 fw-bold text-danger">
        LIST OF STUDENTS
      </h3>

      {/* Filter Form */}
      <Form onSubmit={handleApplyFilters} className="border rounded p-3 mb-3">
        {filterError && (
          <div className="alert alert-warning py-2 mb-3">{filterError}</div>
        )}
        <Row className="g-3">
          <Col md={4} lg={3}>
            <Form.Group controlId="filterSession">
              <Form.Label>Session</Form.Label>
              <Form.Select
                name="currentSession"
                value={formFilters.currentSession}
                onChange={handleFilterChange}
              >
                <option value="">All Sessions</option>
                {SESSIONS.map((session) => (
                  <option key={session} value={session}>
                    {session}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} lg={3}>
            <Form.Group controlId="filterCourse">
              <Form.Label>Course</Form.Label>
              <Form.Select
                name="courseId"
                value={formFilters.courseId}
                onChange={handleFilterChange}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={4} lg={3}>
            <Form.Group controlId="filterBranch">
              <Form.Label>Branch</Form.Label>
              <Form.Select
                name="branchId"
                value={formFilters.branchId}
                onChange={handleFilterChange}
                disabled={!formFilters.courseId || branchLoading}
              >
                <option value="">
                  {!formFilters.courseId
                    ? "Select course first"
                    : branchLoading
                      ? "Loading..."
                      : "All Branches"}
                </option>
                {branches.map((branch) => (
                  <option key={branch.value} value={branch.value}>
                    {branch.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={4} md={4} lg={2}>
            <Form.Group controlId="filterYear">
              <Form.Label>Year</Form.Label>
              <Form.Select
                name="year"
                value={formFilters.year}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={4} md={4} lg={2}>
            <Form.Group controlId="filterSemester">
              <Form.Label>Semester</Form.Label>
              <Form.Select
                name="semester"
                value={formFilters.semester}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={4} md={4} lg={2}>
            <Form.Group controlId="filterSection">
              <Form.Label>Section</Form.Label>
              <Form.Select
                name="section"
                value={formFilters.section}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="outline-secondary" onClick={handleResetFilters}>
            Reset
          </Button>
          <Button type="submit" variant="primary">
            <i className="bi bi-funnel me-1"></i>
            Apply Filters
          </Button>
        </div>
      </Form>

      {/* Add Student Button */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" onClick={goToAddStudentPage}>
          Add Student +
        </Button>
      </div>

      {/* Total Students */}
      <div className="text-muted mb-2">Total Students: {totalRecords}</div>

      {/* Student Table */}
      <div className="table-responsive">
        <table className="table text-center table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Roll No</th>
              <th>Year</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Loading students...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id}>
                  <td>
                    <img
                      src={student.image || "/profile.png"}
                      width="50"
                      height="50"
                      alt="Student"
                      className="d-block mx-auto rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                  </td>

                  <td>
                    {student.firstName} {student.lastName}
                  </td>

                  <td>{student.rollNumber}</td>

                  <td>{student.year}</td>

                  <td>
                    <Button
                      variant="outline-warning"
                      title="View Student"
                      onClick={() => goToView(student._id)}
                    >
                      <FaEye />
                    </Button>

                    <Button
                      variant="outline-primary"
                      title="Edit Student"
                      className="ms-2"
                      onClick={() => goToEdit(student._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Student"
                      className="ms-2"
                      onClick={() => goToDelete(student._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Delete Success Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>Student has been deleted successfully 👍</Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default StudentList;
