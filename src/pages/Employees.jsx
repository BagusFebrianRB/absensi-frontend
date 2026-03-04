import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import Spinner from "../components/Spinner";
import { EllipsisVertical } from "lucide-react";
import ReactDOM from 'react-dom';

const Employees = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [form, setForm] = useState({
    name: "",
    employee_id: "",
    department: "",
    position: "",
    phone: "",
    join_date: "",
    username: "",
    password: "",
  });

  const [resetId, setResetId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleOpenMenu = (e, empId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - 144 + window.scrollX, // 144 = w-36
    });
    setOpenMenuId(openMenuId === empId ? null : empId);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q) ||
        e.employee_id.toLowerCase().includes(q),
    );
    result = [...result].sort((a, b) => {
      const valA = (a[sortKey] || "").toString().toLowerCase();
      const valB = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    setFiltered(result);
  }, [search, employees, sortKey, sortDir]);

  const fetchEmployees = () => {
    setLoading(true);
    api
      .get("/employees/")
      .then((res) => {
        setEmployees(res.data);
        setFiltered(res.data);
      })
      .finally(() => setLoading(false));
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const handleEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      name: emp.name,
      employee_id: emp.employee_id,
      department: emp.department,
      position: emp.position,
      phone: emp.phone,
      join_date: emp.join_date,
      username: emp.user?.username || "",
      password: "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/employees/${editId}/`, {
          name: form.name,
          employee_id: form.employee_id,
          department: form.department,
          position: form.position,
          phone: form.phone,
          join_date: form.join_date,
        });
        alert("Data karyawan berhasil diupdate!");
      } else {
        await api.post("/employees/register/", form);
        alert("Karyawan berhasil ditambahkan!");
      }
      setShowForm(false);
      setEditId(null);
      setForm({
        name: "",
        employee_id: "",
        department: "",
        position: "",
        phone: "",
        join_date: "",
        username: "",
        password: "",
      });
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.error || "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus karyawan ini?")) {
      await api.delete(`/employees/${id}/`);
      fetchEmployees();
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({
      name: "",
      employee_id: "",
      department: "",
      position: "",
      phone: "",
      join_date: "",
      username: "",
      password: "",
    });
  };

  const handleExportEmployees = async () => {
    try {
      const response = await api.get("/export/employees/", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_karyawan.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal export");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/employees/${resetId}/reset_password/`, {
        new_password: resetPassword,
      });
      alert(`Password ${resetTarget} berhasil direset!`);
      setShowResetModal(false);
      setResetPassword("");
    } catch (err) {
      alert("Gagal reset password");
    }
  };

  const columns = [
    { label: "ID", key: "employee_id" },
    { label: "Nama", key: "name" },
    { label: "Username", key: null },
    { label: "Departemen", key: "department" },
    { label: "Jabatan", key: "position" },
    { label: "No HP", key: null },
    { label: "Tgl Bergabung", key: "join_date" },
    { label: "Aksi", key: null },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Karyawan</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportEmployees}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Export Excel
          </button>
          <button
            onClick={() => {
              setEditId(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editId ? "Edit Karyawan" : "Tambah Karyawan Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            {[
              { label: "Nama Lengkap", key: "name" },
              { label: "ID Karyawan", key: "employee_id" },
              { label: "Departemen", key: "department" },
              { label: "Jabatan", key: "position" },
              { label: "No HP", key: "phone" },
              { label: "Tanggal Bergabung", key: "join_date", type: "date" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type={field.type || "text"}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  required
                />
              </div>
            ))}
            {!editId && (
              <>
                <div>
                  <label className="block text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">
                    Password Sementara
                  </label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {editId ? "Update" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama, departemen, jabatan, ID karyawan..."
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-left text-sm font-semibold text-gray-600 ${col.key ? "cursor-pointer hover:bg-gray-100 select-none" : ""}`}
                    onClick={() => col.key && handleSort(col.key)}
                  >
                    {col.label}
                    {col.key && <SortIcon col={col.key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Tidak ada data karyawan
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{emp.employee_id}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {emp.name}
                    </td>
                    <td className="px-4 py-3 text-sm">{emp.user?.username}</td>
                    <td className="px-4 py-3 text-sm">{emp.department}</td>
                    <td className="px-4 py-3 text-sm">{emp.position}</td>
                    <td className="px-4 py-3 text-sm">{emp.phone}</td>
                    <td className="px-4 py-3 text-sm">{emp.join_date}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="relative">
                        <button
                          onClick={(e) => handleOpenMenu(e, emp.id)}
                          className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                        >
                          <EllipsisVertical size={18}/>
                        </button>

                        {openMenuId === emp.id &&
                          ReactDOM.createPortal(
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                top: menuPosition.top,
                                left: menuPosition.left,
                              }}
                              className="fixed w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                            >
                              <button
                                onClick={() => {
                                  handleEdit(emp);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm  hover:bg-slate-200 rounded-t-lg"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setResetId(emp.id);
                                  setResetTarget(emp.name);
                                  setShowResetModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-200"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(emp.id);
                                  setOpenMenuId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-200"
                              >
                                Hapus
                              </button>
                            </div>,
                            document.body, // ← render langsung di body, bebas dari overflow tabel
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Reset Password - {resetTarget}
            </h2>
            <form onSubmit={handleReset}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Employees;
