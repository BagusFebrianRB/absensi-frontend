import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("employee_detail.name");
  const [sortDir, setSortDir] = useState("asc");
  const [exportMonth, setExportMonth] = useState(new Date().getMonth() + 1);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get("/attendance/").then((res) => setAttendance(res.data));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = attendance.filter(
      (a) =>
        a.date === date &&
        (a.employee_detail?.name.toLowerCase().includes(q) || q === ""),
    );
    result = [...result].sort((a, b) => {
      let valA, valB;
      if (sortKey === "employee_detail.name") {
        valA = (a.employee_detail?.name || "").toLowerCase();
        valB = (b.employee_detail?.name || "").toLowerCase();
      } else {
        valA = (a[sortKey] || "").toString().toLowerCase();
        valB = (b[sortKey] || "").toString().toLowerCase();
      }
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    setFiltered(result);
  }, [date, search, attendance, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/export/attendance/", {
        params: { month: exportMonth, year: exportYear },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `rekap_absensi_${exportYear}_${exportMonth}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal export");
    }
  };

  const statusColor = (status) => {
    if (status === "hadir") return "bg-green-100 text-green-700";
    if (status === "alpha") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const columns = [
    { label: "Karyawan", key: "employee_detail.name" },
    { label: "Tanggal", key: "date" },
    { label: "Check In", key: "check_in" },
    { label: "Check Out", key: "check_out" },
    { label: "Status", key: "status" },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Absensi</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div className="bg-white rounded-lg p-4 shadow mb-6 flex items-center gap-4">
        <span className="text-gray-700 font-medium">Export Excel:</span>
        <select
          value={exportMonth}
          onChange={(e) => setExportMonth(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          {[
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
          ].map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={exportYear}
          onChange={(e) => setExportYear(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-24"
        />
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Download Excel
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama karyawan..."
          className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.label}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label}
                  <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Tidak ada data absensi
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {a.employee_detail?.name}
                  </td>
                  <td className="px-4 py-3 text-sm">{a.date}</td>
                  <td className="px-4 py-3 text-sm">
                    {a.check_in ? a.check_in.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.check_out ? a.check_out.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColor(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default Attendance;
