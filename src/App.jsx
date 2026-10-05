import React, { useState, useEffect, useMemo } from 'react';

const API_URL = "http://localhost:3000/students";

// Vivid avatar gradient helper
const getAvatarGradient = (id) => {
  const gradients = [
    'from-blue-600 to-indigo-600 text-white',
    'from-purple-600 to-pink-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-500 to-red-600 text-white',
    'from-violet-600 to-purple-700 text-white',
    'from-cyan-600 to-blue-600 text-white'
  ];
  return gradients[(id || 0) % gradients.length];
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-asc');
  const [viewMode, setViewMode] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete student #${id}?`)) return;
    try {
      const res = await fetch(`${API_URL}?id=eq.${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showNotification(`Student #${id} deleted.`);
      await fetchStudents();
    } catch (err) {
      alert(err.message);
    }
  };

  const departments = useMemo(() => {
    const set = new Set();
    students.forEach(s => s.department && set.add(s.department));
    return Array.from(set).sort();
  }, [students]);

  const cities = useMemo(() => {
    const set = new Set();
    students.forEach(s => s.city && set.add(s.city));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students
      .filter(s => {
        const matchesDept = selectedDept === 'ALL' || s.department === selectedDept;
        const matchesCity = selectedCity === 'ALL' || s.city === selectedCity;
        const q = search.trim().toLowerCase();
        const matchesSearch = !q || (
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q)) ||
          (s.department && s.department.toLowerCase().includes(q)) ||
          (s.city && s.city.toLowerCase().includes(q)) ||
          (s.phone && String(s.phone).includes(q)) ||
          String(s.id).includes(q)
        );
        return matchesDept && matchesCity && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'id-asc') return (a.id || 0) - (b.id || 0);
        if (sortBy === 'id-desc') return (b.id || 0) - (a.id || 0);
        if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
        if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
        if (sortBy === 'age-asc') return (a.age || 0) - (b.age || 0);
        if (sortBy === 'age-desc') return (b.age || 0) - (a.age || 0);
        return 0;
      });
  }, [students, search, selectedDept, selectedCity, sortBy]);

  const getDeptBadgeClass = (dept) => {
    const lower = (dept || '').toLowerCase();
    if (lower.includes('comp')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (lower.includes('elec')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (lower.includes('mech')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (lower.includes('info')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    return 'bg-slate-200 text-slate-800 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Hero Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50 shadow-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">Student Management Portal</h1>
              </div>
              <p className="text-xs text-indigo-200/70 flex items-center gap-2 mt-0.5 font-mono">
                <span className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                {API_URL}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStudents}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold text-indigo-200 bg-slate-800/80 border border-indigo-800/60 rounded-xl hover:bg-slate-700/80 hover:text-white transition-all shadow-sm"
            >
              🔄 Refresh
            </button>
            <button
              onClick={() => {
                setModalStudent(null);
                setModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/30"
            >
              ➕ Add Student
            </button>
          </div>
        </div>
      </header>

      {/* Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 text-xs font-medium animate-bounce">
          {notice}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-sm shadow-sm">
            <div>
              <p className="font-bold">Failed to connect to PostgREST</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={fetchStudents}
              className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* Vibrant Gradient Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-lg shadow-blue-500/15">
            <p className="text-xs text-blue-100 font-semibold uppercase tracking-wider">Total Enrolled</p>
            <p className="text-3xl font-extrabold mt-1">{students.length}</p>
            <p className="text-xs text-blue-200 mt-1">Active students</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white p-5 rounded-2xl shadow-lg shadow-purple-500/15">
            <p className="text-xs text-purple-100 font-semibold uppercase tracking-wider">Departments</p>
            <p className="text-3xl font-extrabold mt-1">{departments.length}</p>
            <p className="text-xs text-purple-200 mt-1">Study faculties</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-lg shadow-amber-500/15">
            <p className="text-xs text-amber-100 font-semibold uppercase tracking-wider">Filtered Count</p>
            <p className="text-3xl font-extrabold mt-1">{filteredStudents.length}</p>
            <p className="text-xs text-amber-100 mt-1">Currently shown</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg shadow-emerald-500/15">
            <p className="text-xs text-emerald-100 font-semibold uppercase tracking-wider">Cities</p>
            <p className="text-3xl font-extrabold mt-1">{cities.length}</p>
            <p className="text-xs text-emerald-200 mt-1">Locations represented</p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by student name, department, email, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700"
            >
              <option value="ALL">All Cities</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700"
            >
              <option value="id-asc">Sort: ID (Asc)</option>
              <option value="id-desc">Sort: ID (Desc)</option>
              <option value="name-asc">Sort: Name (A-Z)</option>
              <option value="name-desc">Sort: Name (Z-A)</option>
              <option value="age-asc">Sort: Age (Youngest)</option>
              <option value="age-desc">Sort: Age (Oldest)</option>
            </select>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm font-bold text-indigo-600' : 'text-slate-600'}`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white shadow-sm font-bold text-indigo-600' : 'text-slate-600'}`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Data List */}
        {loading && students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center text-sm font-medium text-slate-500 shadow-sm">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center text-sm font-medium text-slate-500 shadow-sm">
            No students found matching your criteria.
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/40 overflow-hidden">
            {/* Table Top Header Bar */}
            <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-sm font-bold text-slate-800 tracking-tight">Student Directory</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live Database Records</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5 w-20">ID</th>
                    <th className="py-3.5 px-5">Student</th>
                    <th className="py-3.5 px-5">Department</th>
                    <th className="py-3.5 px-5">Age</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Phone</th>
                    <th className="py-3.5 px-5">City</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-indigo-50/50 transition-colors group">
                      {/* ID Pill */}
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">
                          #{student.id}
                        </span>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(student.id)} font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-sm`}>
                            {student.name ? student.name.charAt(0) : '?'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block">
                              {student.name || 'Unnamed Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department Badge */}
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-2xs ${getDeptBadgeClass(student.department)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {student.department || 'General'}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900">{student.age ?? '—'}</span>
                        <span className="text-xs text-slate-400 font-normal ml-1">yrs</span>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-5 text-xs text-slate-600">
                        <span className="hover:text-indigo-600 transition-colors">
                          {student.email || '—'}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-5 font-mono text-xs text-slate-600 font-medium">
                        {student.phone || '—'}
                      </td>

                      {/* City */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 bg-slate-100/80 border border-slate-200 px-2.5 py-1 rounded-lg text-xs text-slate-700 font-semibold">
                          📍 {student.city || '—'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setModalStudent(student);
                              setModalOpen(true);
                            }}
                            title="Edit student"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 rounded-lg transition-all shadow-2xs active:scale-95"
                          >
                            <span>✏️</span>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            title="Delete student"
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200/80 rounded-lg transition-all shadow-2xs active:scale-95"
                          >
                            <span>🗑️</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="py-3 px-6 bg-slate-50/90 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap justify-between items-center gap-2">
              <span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> enrolled students</span>
              <span className="text-slate-400 font-mono">PostgREST &bull; :3000/students</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className={`h-2 w-full bg-gradient-to-r ${getAvatarGradient(student.id)}`}></div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(student.id)} font-bold text-sm flex items-center justify-center uppercase shadow-sm`}>
                        {student.name ? student.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{student.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">ID: #{student.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setModalStudent(student);
                          setModalOpen(true);
                        }}
                        className="text-indigo-600 hover:bg-indigo-50 text-xs px-2 py-1 rounded font-bold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="text-rose-600 hover:bg-rose-50 text-xs px-2 py-1 rounded font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getDeptBadgeClass(student.department)}`}>
                      {student.department || 'General'}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">
                      {student.age} yrs
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                    <p>📧 {student.email || 'No email'}</p>
                    <p>📞 {student.phone || 'No phone'}</p>
                    <p>📍 {student.city || 'No city'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">
                {modalStudent ? `Edit Student #${modalStudent.id}` : 'Add New Student'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  setModalStudent(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const payload = {
                  name: formData.get('name')?.toString().trim(),
                  age: parseInt(formData.get('age'), 10) || null,
                  department: formData.get('department')?.toString().trim() || null,
                  email: formData.get('email')?.toString().trim() || null,
                  phone: formData.get('phone')?.toString().trim() || null,
                  city: formData.get('city')?.toString().trim() || null,
                };

                const url = modalStudent ? `${API_URL}?id=eq.${modalStudent.id}` : API_URL;
                const method = modalStudent ? 'PATCH' : 'POST';

                try {
                  const res = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
                    body: JSON.stringify(payload),
                  });
                  if (res.ok) {
                    setModalOpen(false);
                    setModalStudent(null);
                    showNotification(modalStudent ? 'Student updated successfully!' : 'Student added successfully!');
                    await fetchStudents();
                  } else {
                    alert('Failed to save student');
                  }
                } catch (err) {
                  alert(err.message);
                }
              }}
              className="p-6 space-y-4 text-sm"
            >
              <div>
                <label className="block font-bold text-xs text-slate-700 uppercase mb-1">Name *</label>
                <input
                  required
                  name="name"
                  defaultValue={modalStudent?.name || ''}
                  placeholder="Enter Name"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-slate-700 uppercase mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    defaultValue={modalStudent?.age ?? ''}
                    placeholder="Enter Age"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-slate-700 uppercase mb-1">Department</label>
                  <input
                    name="department"
                    defaultValue={modalStudent?.department || ''}
                    placeholder="Enter Department"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-xs text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={modalStudent?.email || ''}
                  placeholder="Enter Email"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-xs text-slate-700 uppercase mb-1">Phone</label>
                  <input
                    name="phone"
                    defaultValue={modalStudent?.phone || ''}
                    placeholder="Enter Phone"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-slate-700 uppercase mb-1">City</label>
                  <input
                    name="city"
                    defaultValue={modalStudent?.city || ''}
                    placeholder="Enter City"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setModalStudent(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/30 hover:from-blue-500 hover:to-indigo-500"
                >
                  {modalStudent ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
