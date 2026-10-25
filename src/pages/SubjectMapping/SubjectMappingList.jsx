import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { FaEdit, FaTrash } from "react-icons/fa";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";

import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function SubjectMappingList() {
  const navigate = useNavigate();

  const [subjectsmap, setSubjectsmap] = useState([]);
  const [show, setShow] = useState(false);
  const [isDelete, setIsDelete] = useState(false);

  const [filterBy, setFilterBy] = useState("course");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 5;
  const token = localStorage.getItem("token");

  // =========================
  // GET SUBJECT MAPPINGS
  // =========================
  useEffect(() => {
    axios({
      url: apiUrl + "/subjectsMapped",
      method: "get",
      params: {
        filterBy,
        search: searchTerm,
        pageNo: currentPage,
        limit,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setSubjectsmap(result.data.data);

          setTotalPages(result.data.pagination.totalPages);
          setTotalRecords(result.data.pagination.totalRecords);

          setIsDelete(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching subject mappings:", error);
      });
  }, [filterBy, searchTerm, currentPage, isDelete]);

  // =========================
  // CLOSE DELETE MODAL
  // =========================
  const handleClose = () => {
    setShow(false);
    setIsDelete(true);
  };

  // =========================
  // EDIT
  // =========================
  function goToEdit(id) {
    navigate("/edit/subjectMapping/" + id);
  }

  // =========================
  // DELETE
  // =========================
  function goToDelete(id) {
    axios({
      url: apiUrl + "/delete/subjectMapping/" + id,
      method: "delete",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((result) => {
        if (result.data.success) {
          setShow(true);
        }
      })
      .catch((error) => {
        console.error("Error deleting subject mapping:", error);
      });
  }

  // =========================
  // FILTER PLACEHOLDER
  // =========================
  const getPlaceholder = () => {
    switch (filterBy) {
      case "course":
        return "Enter course name or short name";

      case "branch":
        return "Enter branch name or short name";

      case "subject":
        return "Enter subject name or nickname";

      case "session":
        return "Enter session (e.g. 2026-27)";

      case "year":
        return "Enter year";

      case "semester":
        return "Enter semester";

      default:
        return "Enter search value";
    }
  };

  return (
    <>
      {/* HEADING */}
      <h3 className="text-center mb-4 py-2 text-primary fw-bold text-danger">
        LIST OF SUBJECT MAPPING
      </h3>

      {/* FILTER SECTION */}
      <div className="row g-2 mb-3 align-items-center">
        <div className="col-md-3">
          <Form.Select
            value={filterBy}
            onChange={(e) => {
              setFilterBy(e.target.value);
              setSearchTerm("");
              setCurrentPage(1);
            }}
          >
            <option value="course">Filter By Course</option>
            <option value="branch">Filter By Branch</option>
            <option value="subject">Filter By Subject</option>
            <option value="session">Filter By Session</option>
            <option value="year">Filter By Year</option>
            <option value="semester">Filter By Semester</option>
          </Form.Select>
        </div>

        <div className="col-md-9">
          <InputGroup>
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>

            <Form.Control
              type="text"
              placeholder={getPlaceholder()}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </div>
      </div>

      {/* ADD BUTTON */}
      <button
        className="btn btn-success ms-3 mt-2 float-end"
        onClick={() => navigate("/add/subjectMapping")}
      >
        Map Subject +
      </button>

      {/* TOTAL RECORDS */}
      <div className="mt-4 mb-2 text-muted">
        Total Records: <strong>{totalRecords}</strong>
      </div>

      {/* TABLE */}
      <div className="table-responsive mt-3">
        <table className="table text-center table-hover">
          <thead>
            <tr>
              <th>Session</th>
              <th>Subject</th>
              <th>Course</th>
              <th>Branch</th>
              <th>Year</th>
              <th>Semester</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {subjectsmap.length > 0 ? (
              subjectsmap.map((subject) => (
                <tr key={subject._id}>
                  {/* SESSION */}
                  <td>{subject.session}</td>

                  {/* SUBJECT */}
                  <td>
                    {subject.subject?.subjectNickName ||
                      subject.subject?.subjectFullName ||
                      "-"}
                  </td>

                  {/* COURSE */}
                  <td>
                    {subject.course?.courseShortName ||
                      subject.course?.courseFullName ||
                      "-"}
                  </td>

                  {/* BRANCH */}
                  <td>
                    {subject.branch?.branchShortName ||
                      subject.branch?.branchFullName ||
                      "-"}
                  </td>

                  {/* YEAR */}
                  <td>{subject.year}</td>

                  {/* SEMESTER */}
                  <td>{subject.semester}</td>

                  {/* ACTION */}
                  <td>
                    <Button
                      variant="outline-primary"
                      title="Edit Subject Mapping"
                      onClick={() => goToEdit(subject._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Subject Mapping"
                      className="ms-2"
                      onClick={() => goToDelete(subject._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No subject mappings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* DELETE SUCCESS MODAL */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Subject Mapping has been deleted successfully 👍
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default SubjectMappingList;
