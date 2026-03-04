import { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";

const MyAttendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const fetchAttendance = useCallback(() => {
    setLoading(true);
    api
      .get("/attendance/")
      .then((res) => {
        const myData = res.data.filter(
          (a) => a.employee_detail?.name === user?.name,
        );
        setAttendance(myData);
        const today = new Date().toISOString().split("T")[0];
        setTodayAttendance(myData.find((a) => a.date === today) || null);
      })
      .finally(() => setLoading(false));
  }, [user?.name]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await api.post("/attendance/check_in/");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await api.post("/attendance/check_out/");
      fetchAttendance();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Absensi Saya</h1>
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Absensi Hari Ini</h2>
        <div className="flex gap-4">
          <button
            onClick={handleCheckIn}
            disabled={loading || todayAttendance?.check_in}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {todayAttendance?.check_in
              ? `Check In: ${todayAttendance.check_in}`
              : "Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={
              loading ||
              !todayAttendance?.check_in ||
              todayAttendance?.check_out
            }
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {todayAttendance?.check_out
              ? `Check Out: ${todayAttendance.check_out}`
              : "Check Out"}
          </button>
        </div>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Tanggal", "Check In", "Check Out", "Status"].map((h) => (
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
              {attendance.map((a) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{a.date}</td>
                  <td className="px-4 py-3 text-sm">
                    {a.check_in ? a.check_in.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {a.check_out ? a.check_out.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${a.status === "hadir" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default MyAttendance;
