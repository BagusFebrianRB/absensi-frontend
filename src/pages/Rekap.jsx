import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import Spinner from "../components/Spinner";

const Rekap = () => {
  const [loading, setLoading] = useState(false);
  const [rekap, setRekap] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    fetchRekap();
  }, [month, year, fetchRekap]);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = rekap.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        q === "",
    );
    result = [...result].sort((a, b) => {
      const valA = (a[sortKey] || "").toString().toLowerCase();
      const valB = (b[sortKey] || "").toString().toLowerCase();
      return sortDir === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    setFiltered(result);
  }, [search, rekap, sortKey, sortDir]);

  const fetchRekap = useCallback(() => {
    setLoading(true);
    api
      .get("/rekap/", { params: { month, year } })
      .then((res) => setRekap(res.data))
      .finally(() => setLoading(false));
  }, [month, year]);

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
      const response = await api.get("/export/rekap/", {
        params: { month, year },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `rekap_karyawan_${year}_${month}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal export");
    }
  };

  const columns = [
    { label: "ID", key: "employee_id" },
    { label: "Nama", key: "name" },
    { label: "Departemen", key: "department" },
    { label: "Jabatan", key: "position" },
    { label: "Hadir", key: "hadir" },
    { label: "Alpha", key: "alpha" },
    { label: "Izin", key: "izin" },
    { label: "Sakit", key: "sakit" },
    { label: "Total", key: "total" },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Rekap Absensi Per Karyawan
      </h1>

      <div className="bg-white rounded-lg p-4 shadow mb-6 flex items-center gap-4 flex-wrap">
        <span className="text-gray-700 font-medium">Periode:</span>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
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
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-24"
        />
        <button
          onClick={fetchRekap}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Tampilkan
        </button>
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
          placeholder="Cari nama, departemen..."
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
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{r.employee_id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-sm">{r.department}</td>
                    <td className="px-4 py-3 text-sm">{r.position}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        {r.hadir}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                        {r.alpha}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {r.izin}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-medium">
                        {r.sakit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {r.total}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Rekap;
