import { useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const ChangePassword = () => {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (form.new_password !== form.confirm_password) {
      setError('Password baru tidak cocok');
      return;
    }

    try {
      await api.post('/employees/change_password/', {
        old_password: form.old_password,
        new_password: form.new_password,
      });
      setMessage('Password berhasil diubah!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengubah password');
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ganti Password</h1>
      <div className="bg-white rounded-lg p-6 shadow max-w-md">
        {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Password Lama', key: 'old_password' },
            { label: 'Password Baru', key: 'new_password' },
            { label: 'Konfirmasi Password Baru', key: 'confirm_password' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-gray-700 mb-1">{field.label}</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                value={form[field.key]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required
              />
            </div>
          ))}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Ubah Password
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ChangePassword;