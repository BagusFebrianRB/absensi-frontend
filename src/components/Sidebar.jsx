import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart2,
  FileText,
  KeyRound,
  CalendarCheck,
  LogOut,
} from "lucide-react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuAdmin = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/employees", label: "Karyawan", icon: Users },
    { path: "/attendance", label: "Absensi", icon: ClipboardList },
    { path: "/rekap", label: "Rekap Absensi", icon: BarChart2 },
    { path: "/leave-requests", label: "Pengajuan Izin/Sakit", icon: FileText },
    { path: "/change-password", label: "Ganti Password", icon: KeyRound },
  ];

  const menuKaryawan = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/my-attendance", label: "Absensi Saya", icon: CalendarCheck },
    { path: "/my-leave", label: "Pengajuan Izin/Sakit", icon: FileText },
    { path: "/change-password", label: "Ganti Password", icon: KeyRound },
  ];

  const menu = user?.is_staff ? menuAdmin : menuKaryawan;

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-blue-800 min-h-screen text-white flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-6 border-b border-blue-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Sistem Absensi</h2>
              <p className="text-blue-300 text-sm mt-1">
                {user?.name || user?.username}
              </p>
              <p className="text-blue-400 text-xs mt-1">
                {user?.is_staff ? "Admin" : "Karyawan"}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-blue-300 hover:text-white text-xl"
            >
              ✕
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 rounded mb-1 transition ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-blue-700"
              }`}
            >
              <item.icon size={18} className="inline mr-2" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-blue-200 hover:bg-red-600 rounded transition"
          >
            <LogOut size={18} className="inline mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
