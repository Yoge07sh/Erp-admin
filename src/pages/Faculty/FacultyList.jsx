import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";

import { Form, InputGroup, Button, Modal, Spinner } from "react-bootstrap";

import { FaEdit, FaTrash, FaEye } from "react-icons/fa";

import Pagination from "../../components/Pagination";

const apiUrl = import.meta.env.VITE_API_URL;

function FacultyList() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showSpinner, setShowSpinner] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [file, setFile] = useState(null);
  const [faculties, setFaculties] = useState([]);

  // FILTER STATES
  const [filterBy, setFilterBy] = useState("firstName");
  const [searchTerm, setSearchTerm] = useState("");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const limit = 5;

  // =========================
  // GET FACULTIES
  // =========================
  useEffect(() => {
    axios({
      url: apiUrl + "/faculties",
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
          setFaculties(result.data.data);
          setTotalPages(result.data.pagination.totalPages);
          setTotalRecords(result.data.pagination.totalRecords);
        }
      })
      .catch((error) => {
        console.error("Error fetching faculties:", error);
      });
  }, [filterBy, searchTerm, currentPage]);

  // =========================
  // CSV UPLOAD MODAL
  // =========================
  function doUploadCsv() {
    setShowModal(true);
  }

  // =========================
  // UPLOAD CSV
  // =========================
  async function doAddFaculties() {
    if (!file) {
      alert("Please select a CSV file first.");
      return;
    }

    setButtonDisabled(true);
    setShowSpinner(true);

    const formData = new FormData();

    formData.append("facultyData", file);
    formData.append("fileName", file.name);

    try {
      const result = await axios({
        url: apiUrl + "/add/faculties",
        method: "post",
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data.success) {
        setShow(true);
        setShowModal(false);
        setFile(null);

        // Refresh faculty records after uploading.
        setCurrentPage(1);

        // If already on page 1, changing the page state
        // won't trigger a refresh, so fetch the data directly.
        const refreshed = await axios.get(apiUrl + "/faculties", {
          params: {
            filterBy,
            search: searchTerm,
            pageNo: 1,
            limit,
          },
        });

        if (refreshed.data.success) {
          setFaculties(refreshed.data.data);
          setTotalPages(refreshed.data.pagination.totalPages);
          setTotalRecords(refreshed.data.pagination.totalRecords);
        }
      } else {
        alert(result.data.message || "Unable to upload faculty data.");
      }
    } catch (error) {
      console.error("CSV upload failed:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while uploading the CSV.",
      );
    } finally {
      setShowSpinner(false);
      setButtonDisabled(false);
    }
  }

  // =========================
  // CLOSE MODALS
  // =========================
  const handleClose = () => {
    setShow(false);
    setShowModal(false);
  };

  // =========================
  // ADD FACULTY
  // =========================
  function goToAddFacultyPage() {
    navigate("/add/faculty");
  }

  // =========================
  // EDIT FACULTY
  // =========================
  function goToEdit(id) {
    navigate("/edit/faculty/" + id);
  }

  // =========================
  // VIEW FACULTY
  // =========================
  function goToView(id) {
    navigate("/faculty/profile/" + id);
  }

  // =========================
  // DELETE FACULTY
  // =========================
  async function goToDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this faculty?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const result = await axios.delete(apiUrl + "/delete/faculty/" + id, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (result.data.success) {
        alert("Faculty deleted successfully.");

        // Refresh the current page after deletion.
        const refreshed = await axios.get(apiUrl + "/faculties", {
          params: {
            filterBy,
            search: searchTerm,
            pageNo: currentPage,
            limit,
          },
        });

        if (refreshed.data.success) {
          let updatedFaculties = refreshed.data.data;
          let updatedPagination = refreshed.data.pagination;

          // If the last record on the current page was deleted,
          // move back one page when possible.
          if (updatedFaculties.length === 0 && currentPage > 1) {
            const previousPage = currentPage - 1;

            const previousResult = await axios.get(apiUrl + "/faculties", {
              params: {
                filterBy,
                search: searchTerm,
                pageNo: previousPage,
                limit,
              },
            });

            if (previousResult.data.success) {
              updatedFaculties = previousResult.data.data;
              updatedPagination = previousResult.data.pagination;
              setCurrentPage(previousPage);
            }
          }

          setFaculties(updatedFaculties);
          setTotalPages(updatedPagination.totalPages);
          setTotalRecords(updatedPagination.totalRecords);
        }
      }
    } catch (error) {
      console.error("Error deleting faculty:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while deleting faculty.",
      );
    }
  }

  // =========================
  // FILTER PLACEHOLDER
  // =========================
  function getPlaceholder() {
    switch (filterBy) {
      case "firstName":
        return "Enter faculty first name";

      case "lastName":
        return "Enter faculty last name";

      case "designation":
        return "Enter designation";

      case "highestQualification":
        return "Enter highest qualification";

      default:
        return "Enter search value";
    }
  }

  return (
    <>
      {/* HEADING */}
      <h3 className="text-center mb-4 py-2 text-primary fw-bold text-danger">
        LIST OF FACULTIES
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
            <option value="firstName">Filter By First Name</option>
            <option value="lastName">Filter By Last Name</option>
            <option value="designation">Filter By Designation</option>
            <option value="highestQualification">
              Filter By Highest Qualification
            </option>
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

      {/* ACTION BUTTONS */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        <Button variant="success" size="sm" onClick={goToAddFacultyPage}>
          Add Faculty +
        </Button>

        <span className="text-muted">Or upload via CSV</span>

        <Button
          variant="success"
          size="sm"
          disabled={buttonDisabled}
          onClick={doUploadCsv}
        >
          Upload CSV
        </Button>
      </div>

      {/* TOTAL RECORDS */}
      <div className="text-muted mb-2">
        Total Records: <strong>{totalRecords}</strong>
      </div>

      {/* FACULTY TABLE */}
      <div className="table-responsive">
        <table className="table text-center table-hover align-middle">
          <thead>
            <tr>
              <th>Faculty Image</th>
              <th>Faculty Name</th>
              <th>Designation</th>
              <th>Highest Qualification</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {faculties.length > 0 ? (
              faculties.map((faculty) => (
                <tr key={faculty._id}>
                  <td>
                    <img
                      src={faculty.facultyImage || "/profile.png"}
                      width="50"
                      height="50"
                      alt="Faculty"
                      className="d-block mx-auto rounded-circle"
                      style={{ objectFit: "cover" }}
                    />
                  </td>

                  <td>
                    {faculty.firstName} {faculty.lastName}
                  </td>

                  <td>{faculty.designation || "-"}</td>

                  <td>{faculty.highestQualification || "-"}</td>

                  <td>
                    <Button
                      variant="outline-warning"
                      title="View Faculty"
                      onClick={() => goToView(faculty._id)}
                    >
                      <FaEye />
                    </Button>

                    <Button
                      variant="outline-primary"
                      title="Edit Faculty"
                      className="ms-2"
                      onClick={() => goToEdit(faculty._id)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Delete Faculty"
                      className="ms-2"
                      onClick={() => goToDelete(faculty._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-4">
                  No faculties found.
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

      {/* LOADING SPINNER */}
      {showSpinner && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(255, 255, 255, 0.7)",
            zIndex: 2000,
          }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* CSV UPLOAD SUCCESS MODAL */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>

        <Modal.Body>Faculty data uploaded successfully.</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* CSV UPLOAD MODAL */}
      <Modal
        show={showModal}
        onHide={() => {
          if (!buttonDisabled) {
            setShowModal(false);
            setFile(null);
          }
        }}
      >
        <Modal.Header closeButton={!buttonDisabled}>
          <Modal.Title>Add Faculties</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            type="file"
            name="facultyData"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                setFile(e.target.files[0]);
              }
            }}
            disabled={buttonDisabled}
          />

          <Button
            variant="success"
            className="mt-2"
            disabled={buttonDisabled || !file}
            onClick={doAddFaculties}
          >
            {buttonDisabled ? "Uploading..." : "Upload CSV"}
          </Button>

          <div className="mt-3">
            <p>
              Click below to download a <strong>sample CSV file</strong> for
              reference:
            </p>

            <a href="/demo.csv" download>
              <Button variant="success" as="span">
                ⬇ Download Demo CSV
              </Button>
            </a>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="danger"
            disabled={buttonDisabled}
            onClick={() => {
              setShowModal(false);
              setFile(null);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default FacultyList;
