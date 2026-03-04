import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";
import { Users, ClockCheck, ClockAlert, ClipboardClock, Stethoscope, Mail } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_employees: 0,
    hadir_today: 0,
    alpha_today: 0,
    pending_leave: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      api.get("/attendance/"),
      api.get("/employees/"),
      api.get("/leave-requests/"),
    ])
      .then(([attRes, empRes, leaveRes]) => {
        const todayData = attRes.data.filter((a) => a.date === today);
        setStats({
          total_employees: empRes.data.length,
          hadir_today: todayData.filter((a) => a.status === "hadir").length,
          alpha_today: todayData.filter((a) => a.status === "alpha").length,
          pending_leave: leaveRes.data.filter((l) => l.status === "pending")
            .length,
        });
        setRecentAttendance(todayData.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: "Total Karyawan",
      value: stats.total_employees,
      color: "bg-white",
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      label: "Hadir Hari Ini",
      value: stats.hadir_today,
      color: "bg-white",
      icon: ClockCheck,
      iconColor: "text-green-600",
    },
    {
      label: "Alpha Hari Ini",
      value: stats.alpha_today,
      color: "bg-white",
      icon: ClockAlert,
      iconColor: "text-red-600",
    },
    {
      label: "Pengajuan Pending",
      value: stats.pending_leave,
      color: "bg-white",
      icon: ClipboardClock,
      iconColor: "text-yellow-600",
    },
  ];

  if (loading)
    return (
      <Layout>
        <Spinner />
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Admin</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.color} text-gray-800 rounded-lg p-6 shadow`}
          >
            <card.icon size={20} className={`${card.iconColor} mb-2`} />
            <p className="text-sm opacity-80">{card.label}</p>
            <p className="text-4xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Absensi Hari Ini
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {recentAttendance.length === 0 ? (
          <p className="text-gray-400">Belum ada absensi hari ini</p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Karyawan", "Check In", "Check Out", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2 text-sm font-medium">
                    {a.employee_detail?.name}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {a.check_in ? a.check_in.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {a.check_out ? a.check_out.slice(0, 5) : "-"}
                  </td>
                  <td className="px-4 py-2 text-sm">
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
        )}
      </div>
    </Layout>
  );
};

const KaryawanDashboard = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [rekap, setRekap] = useState({ hadir: 0, alpha: 0, izin: 0, sakit: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/attendance/"),
      api.get("/rekap/", { params: { month, year } }),
    ])
      .then(([attRes, rekapRes]) => {
        const todayData = attRes.data.find((a) => a.date === today);
        setTodayAttendance(todayData || null);
        const myRekap = rekapRes.data.find((r) => r.name === user?.name);
        if (myRekap) setRekap(myRekap);
      })
      .finally(() => setLoading(false));
  }, [month, year, today, user?.name]);

  const handleCheckIn = async () => {
    setLoadingAction(true);
    try {
      await api.post("/attendance/check_in/");
      const res = await api.get("/attendance/");
      setTodayAttendance(res.data.find((a) => a.date === today) || null);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckOut = async () => {
    setLoadingAction(true);
    try {
      await api.post("/attendance/check_out/");
      const res = await api.get("/attendance/");
      setTodayAttendance(res.data.find((a) => a.date === today) || null);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading)
    return (
      <Layout>
        <Spinner />
      </Layout>
    );

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Halo, {user?.name}!
      </h1>
      <p className="text-gray-500 mb-6">
        {new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Absensi Hari Ini
        </h2>
        {todayAttendance ? (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Check In</p>
              <p className="text-2xl font-bold text-green-600">
                {todayAttendance.check_in
                  ? todayAttendance.check_in.slice(0, 5)
                  : "-"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Check Out</p>
              <p className="text-2xl font-bold text-red-500">
                {todayAttendance.check_out
                  ? todayAttendance.check_out.slice(0, 5)
                  : "-"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Status</p>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Hadir
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mb-4">Kamu belum absen hari ini</p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleCheckIn}
            disabled={loadingAction || todayAttendance?.check_in}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {todayAttendance?.check_in ? "✓ Sudah Check In" : "Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={
              loadingAction ||
              !todayAttendance?.check_in ||
              todayAttendance?.check_out
            }
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {todayAttendance?.check_out ? "✓ Sudah Check Out" : "Check Out"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Rekap Bulan Ini
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Hadir",
              value: rekap.hadir,
              icon: ClockCheck,
              iconColor: "text-green-600",
            },
            {
              label: "Alpha",
              value: rekap.alpha,
              icon: ClockAlert,
              iconColor: "text-red-600",
            },
            {
              label: "Izin",
              value: rekap.izin,
              icon: Mail,
              iconColor: "text-yellow-600",
            },
            {
              label: "Sakit",
              value: rekap.sakit,
              icon: Stethoscope,
              iconColor: "text-blue-600",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white text-slate-800 rounded-lg p-4 text-center shadow"
            >
              <card.icon size={20} className={`${card.iconColor} mb-2`} />
              <p className="text-sm opacity-80">{card.label}</p>
              <p className="text-3xl font-bold mt-1">
                {card.value} <span className="text-sm font-normal">hari</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  return user?.is_staff ? <AdminDashboard /> : <KaryawanDashboard />;
};

export default Dashboard;
