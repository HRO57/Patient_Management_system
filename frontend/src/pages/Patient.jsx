import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";
import "../styles.css";
import Sidebar from "../components/Navbar";

function Patient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = useCallback((page, search) => {
    setLoading(true);
    const query = search ? `&phone=${search}` : "";
    axios
      .get(`http://127.0.0.1:8000/api/patients?page=${page}&limit=5${query}`)
      .then((res) => {
        const patientsData = Array.isArray(res.data.message)
          ? res.data.message
          : [];
        setPatients(patientsData);
        setTotalPages(res.data.last_page || 1);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const debouncedFetchPatients = debounce(() => {
      fetchPatients(currentPage, searchTerm);
    }, 500);

    debouncedFetchPatients();

    return () => {
      debouncedFetchPatients.cancel();
    };
  }, [currentPage, searchTerm, fetchPatients]);

  useEffect(() => {
    fetchPatients(currentPage, searchTerm);
  }, [currentPage, fetchPatients]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://127.0.0.1:8000/api/patients/${id}/delete`)
      .then(() => {
        setPatients(patients.filter((patient) => patient.id !== id));
        setSuccessMessage("Patient deleted successfully.");
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      })
      .catch((error) => {
        setError(error);
      });
  };

  // if(loading) {
  //   return <div>Loading...</div>;
  // }

  // if(error) {
  //   return <div>Error: {error.message}</div>;
  // }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 mt-5 overflow-auto patient-list-container">
        <div className="">
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header sticky-h">
                  <h4>
                    Patient List
                    <Link
                      className="btn btn-primary btn-sm float-end"
                      to="/patients/create"
                    >
                      Add Patient
                    </Link>
                  </h4>
                </div>
                <div className="card-body">
                  {successMessage && (
                    <div className="alert alert-success">{successMessage}</div>
                  )}
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((item, index) => (
                        <tr key={index}>
                          <td>{item.id}</td>
                          <td>{item.name}</td>
                          <td>{item.description}</td>
                          <td>{item.email}</td>
                          <td>{item.phone}</td>
                          <td>
                            <Link
                              to={`/patients/${item.id}/edit`}
                              className="btn btn-success mr-2 btn-sm"
                            >
                              Edit
                            </Link>
                            <button
                              className="btn btn-danger btn-sm mt-2"
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav>
      <ul className="pagination">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </button>
        </li>
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li
          className={`page-item ${
            currentPage === totalPages ? "disabled" : ""
          }`}
        >
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Patient;
