import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import Spinner from "../components/Spinner";

const MyLeave = () => {
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "izin",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = () => {
    setLoading(true);
    api
      .get("/leave-requests/")
      .then((res) => setLeaves(res.data))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/leave-requests/", form);
    setShowForm(false);
    setForm({ type: "izin", start_date: "", end_date: "", reason: "" });
    fetchLeaves();
  };

  const statusColor = (status) => {
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Pengajuan Izin / Sakit
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Ajukan
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Form Pengajuan</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Tipe</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Alasan</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                required
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Kirim
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Tipe", "Mulai", "Selesai", "Alasan", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Belum ada pengajuan
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-gray-50">
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

export default MyLeave;
