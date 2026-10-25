import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import { Button, Form, InputGroup, Container, Modal } from "react-bootstrap";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { FaEdit, FaTrash } from "react-icons/fa";
import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function FacultyMappingList() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [show, setShow] = useState(false);
  const [facultyMapping, setFacultyMapping] = useState([]);

  // FILTER STATES
  const [filterBy, setFilterBy] = useState("session");
  const [searchTerm, setSearchTerm] = useState("");

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const limit = 5;

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // OTHER STATES
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // =========================
  // GET FACULTY MAPPING DATA
  // =========================
  const getFacultyMapping = async () => {
    try {
      setLoading(true);

      const res = await axios.get(apiUrl + "/get/facultymapping", {
        params: {
          page,
          limit,
          filterBy,
          search: searchTerm,
        },
      });

      if (res.data.success) {
        setFacultyMapping(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalRecords(res.data.pagination.totalRecords);
      }
    } catch (err) {
      console.error("Error fetching faculty mapping:", err);

      alert(
        err.response?.data?.message ||
          "Something went wrong while fetching faculty mappings.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH WHEN FILTER OR PAGE CHANGES
  // =========================
  useEffect(() => {
    getFacultyMapping();
  }, [page, filterBy, searchTerm]);

  // =========================
  // ADD FACULTY MAPPING
  // =========================
  const handleAdd = () => {
    navigate("/add/facultymapping");
  };

  // =========================
  // EDIT FACULTY MAPPING
  // =========================
  const handleEdit = (id) => {
    navigate("/edit/facultymapping/" + id);
  };

  // =========================
  // DELETE FACULTY MAPPING
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this faculty mapping?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const res = await axios.delete(apiUrl + "/delete/facultyMapping/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setShow(true);

        // Refresh the current results after deletion.
        await getFacultyMapping();
      }
    } catch (err) {
      console.error("Error deleting faculty mapping:", err);

      alert(
        err.response?.data?.message ||
          "Something went wrong while deleting the faculty mapping.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // FILTER PLACEHOLDER
  // =========================
  const getPlaceholder = () => {
    switch (filterBy) {
      case "session":
        return "Search by session (e.g. 2026-27)";

      case "facultyName":
        return "Search by faculty first or last name";

      case "course":
        return "Search by course name or short name";

      case "branch":
        return "Search by branch name or short name";

      case "subject":
        return "Search by subject name or nickname";

      case "year":
        return "Search by year";

      case "semester":
        return "Search by semester";

      case "section":
        return "Search by section";

      default:
        return "Enter search value";
    }
  };

  // =========================
  // CLOSE SUCCESS MODAL
  // =========================
  const handleClose = () => {
    setShow(false);
  };

  return (
    <Container fluid>
      {/* HEADING */}
      <h3 className="text-center mb-4 py-2 text-primary fw-bold text-danger">
        FACULTY TEACHING DETAIL
      </h3>

      {/* FILTER SECTION */}
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-md-4">
          <Form.Select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setSearchTerm("");
              setPage(1);
            }}
          >
            <option value="session">Filter By Session</option>
            <option value="facultyName">Filter By Faculty Name</option>
            <option value="course">Filter By Course</option>
            <option value="branch">Filter By Branch</option>
            <option value="subject">Filter By Subject</option>
            <option value="year">Filter By Year</option>
            <option value="semester">Filter By Semester</option>
            <option value="section">Filter By Section</option>
          </Form.Select>
        </div>

        <div className="col-md-5">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>

            <Form.Control
              type="text"
              value={searchTerm}
              placeholder={getPlaceholder()}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />

            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </div>

        <div className="col-md-3 text-md-end">
          <Button variant="success" onClick={handleAdd}>
            Add Faculty Mapping +
          </Button>
        </div>
      </div>

      {/* TOTAL RECORDS */}
      <div className="text-muted mb-2">
        Total Records: <strong>{totalRecords}</strong>
      </div>

      {/* TABLE */}
      <div className="table-responsive">
        <table className="table text-center table-hover mt-3 align-middle">
          <thead>
            <tr>
              <th>Session</th>
              <th>Faculty Name</th>
              <th>Course</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Section</th>
              <th>Subject</th>
              <th>Load Per Week</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10">Loading...</td>
              </tr>
            ) : facultyMapping.length > 0 ? (
              facultyMapping.map((mapping) => (
                <tr key={mapping._id}>
                  <td>{mapping.session || "-"}</td>

                  <td>
                    {mapping.facultyId?.firstName || ""}{" "}
                    {mapping.facultyId?.lastName || ""}
                  </td>

                  <td>
                    {mapping.course?.courseShortName ||
                      mapping.course?.courseFullName ||
                      "-"}
                  </td>

                  <td>
                    {mapping.branch?.branchShortName ||
                      mapping.branch?.branchFullName ||
                      "-"}
                  </td>

                  <td>{mapping.year ?? "-"}</td>

                  <td>{mapping.semester ?? "-"}</td>

                  <td>{mapping.section || "-"}</td>

                  <td>
                    {mapping.subjectId?.subjectNickName ||
                      mapping.subjectId?.subjectFullName ||
                      "-"}
                  </td>

                  <td>{mapping.loadPerWeek ?? "-"}</td>

                  <td>
                    <Button
                      variant="outline-primary"
                      title="Edit Faculty Mapping"
                      onClick={() => handleEdit(mapping._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Faculty Mapping"
                      className="ms-2"
                      disabled={deletingId === mapping._id}
                      onClick={() => handleDelete(mapping._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10">No records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* DELETE SUCCESS MODAL */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Faculty Teaching Detail has been deleted successfully 👍
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default FacultyMappingList;
