import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import Spinner from "../components/Spinner";

const LeaveRequests = () => {
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("created_at");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    let result = leaves.filter(
      (l) => l.employee_detail?.name.toLowerCase().includes(q) || q === "",
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
  }, [search, leaves, sortKey, sortDir]);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get("/leave-requests/")
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

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

  const handleAction = async (id, action) => {
    await api.post(`/leave-requests/${id}/${action}/`);
    fetchLeaves();
  };

  const statusColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  const columns = [
    { label: "Karyawan", key: "employee_detail.name" },
    { label: "Tipe", key: "type" },
    { label: "Mulai", key: "start_date" },
    { label: "Selesai", key: "end_date" },
    { label: "Alasan", key: null },
    { label: "Status", key: "status" },
    { label: "Aksi", key: null },
  ];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Pengajuan Izin / Sakit
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari nama karyawan..."
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Tidak ada pengajuan
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {l.employee_detail?.name}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{l.type}</td>
                    <td className="px-4 py-3 text-sm">{l.start_date}</td>
                    <td className="px-4 py-3 text-sm">{l.end_date}</td>
                    <td className="px-4 py-3 text-sm">{l.reason}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${statusColor(l.status)}`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {l.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(l.id, "approve")}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(l.id, "reject")}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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

export default LeaveRequests;
