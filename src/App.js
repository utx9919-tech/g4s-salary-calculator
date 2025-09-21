import React, { useState } from 'react';
import { Search, Edit, Trash2, Plus, Calculator, X } from 'lucide-react';

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSalaryDetail, setShowSalaryDetail] = useState(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [employees, setEmployees] = useState([
    { id: 1, name: 'สมชาย', surname: 'ใจดี', code: 'G001' },
    { id: 2, name: 'สมหญิง', surname: 'รักงาน', code: 'G002' },
    { id: 3, name: 'วิชัย', surname: 'ขยัน', code: 'G003' }
  ]);

  const [attendance, setAttendance] = useState({});
  const [bonuses, setBonuses] = useState({});
  const [deductions, setDeductions] = useState({});

  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const getDates = () => {
    const dates = [];
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = 16; i <= daysInPrevMonth; i++) {
      dates.push({ day: i, month: prevMonth, year: prevYear });
    }
    
    for (let i = 1; i <= 15; i++) {
      dates.push({ day: i, month: currentMonth, year: currentYear });
    }
    
    return dates;
  };

  const dates = getDates();

  const getAttendanceKey = (employeeId, date) => {
    return employeeId + '-' + date.year + '-' + date.month + '-' + date.day;
  };

  const toggleAttendance = (employeeId, date) => {
    if (!isAdminMode) return;
    const key = getAttendanceKey(employeeId, date);
    setAttendance(prev => ({
      ...prev,
      [key]: prev[key] === 'N' ? 'F' : 'N'
    }));
  };

  const getAttendanceStatus = (employeeId, date) => {
    const key = getAttendanceKey(employeeId, date);
    return attendance[key] || 'F';
  };

  const calculateWorkDays = (employeeId) => {
    let workDays = 0;
    let consecutiveDays = 0;
    let sevenDayBonuses = 0;

    dates.forEach(date => {
      const status = getAttendanceStatus(employeeId, date);
      if (status === 'N') {
        workDays++;
        consecutiveDays++;
        if (consecutiveDays === 7) {
          sevenDayBonuses++;
          consecutiveDays = 0;
        }
      } else {
        consecutiveDays = 0;
      }
    });

    return { workDays, sevenDayBonuses };
  };

  const calculateSalary = (employeeId) => {
    const { workDays, sevenDayBonuses } = calculateWorkDays(employeeId);
    const basicSalary = (workDays + sevenDayBonuses) * 600;
    
    const employeeBonuses = bonuses[employeeId] || {};
    const totalBonuses = Object.values(employeeBonuses).reduce((sum, bonus) => {
      return sum + (parseFloat(bonus.amount) || 0);
    }, 0);

    const employeeDeductions = deductions[employeeId] || {};
    const totalDeductions = Object.values(employeeDeductions).reduce((sum, deduction) => {
      return sum + (parseFloat(deduction.amount) || 0);
    }, 0);

    return {
      workDays,
      sevenDayBonuses,
      basicSalary,
      totalBonuses,
      totalDeductions,
      netSalary: basicSalary + totalBonuses - totalDeductions
    };
  };

  const handleLogin = () => {
    if (password === 'admin') {
      setIsAdminMode(true);
      setShowLogin(false);
      setPassword('');
    } else {
      alert('รหัสผ่านไม่ถูกต้อง');
    }
  };

  const updateBonus = (employeeId, type, amount, checked) => {
    setBonuses(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: { checked, amount: checked ? amount : '' }
      }
    }));
  };

  const updateDeduction = (employeeId, type, amount, checked) => {
    setDeductions(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [type]: { checked, amount: checked ? amount : '' }
      }
    }));
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.includes(searchTerm) ||
    emp.surname.includes(searchTerm) ||
    emp.code.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-bold text-green-400">G4S ผลัด B - คำนวณรายได้</h1>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Admin
            </button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            >
              {Array.from({length: 10}, (_, i) => currentYear - 5 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ค้นหา ชื่อ/สกุล/รหัส"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 px-3 py-1 rounded text-sm flex-1"
            />
            <button className="bg-green-600 px-3 py-1 rounded hover:bg-green-700 transition-colors">
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {isAdminMode && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-green-400 font-bold">🔧 โหมด Admin</span>
            <button
              onClick={() => setIsAdminMode(false)}
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              ออกจาก Admin
            </button>
          </div>
          <button
            onClick={() => setShowAddEmployee(true)}
            className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> เพิ่มพนักงาน
          </button>
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-4">
        {filteredEmployees.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
            ไม่พบพนักงานที่ค้นหา
          </div>
        ) : (
          filteredEmployees.map(employee => {
            const salaryInfo = calculateSalary(employee.id);
            const employeeBonuses = bonuses[employee.id] || {};
            const employeeDeductions = deductions[employee.id] || {};

            return (
              <div key={employee.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-bold text-green-400 text-lg">
                      {employee.name} {employee.surname}
                    </div>
                    <div className="text-sm text-gray-400">รหัส: {employee.code}</div>
                  </div>
                  <div className="flex gap-2">
                    {isAdminMode && (
                      <React.Fragment>
                        <button
                          onClick={() => setShowEditEmployee(employee)}
                          className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                          title="แก้ไขข้อมูล"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(employee.id)}
                          className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 transition-colors"
                          title="ลบพนักงาน"
                        >
                          <Trash2 size={16} />
                        </button>
                      </React.Fragment>
                    )}
                    <button
                      onClick={() => setShowSalaryDetail(employee.id)}
                      className="bg-purple-600 px-2 py-1 rounded hover:bg-purple-700 transition-colors"
                      title="ดูรายละเอียดรายได้"
                    >
                      <Calculator size={16} />
                    </button>
                  </div>
                </div>

                {/* Attendance Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {dates.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => toggleAttendance(employee.id, date)}
                      className={`p-2 rounded text-xs font-bold transition-all ${
                        getAttendanceStatus(employee.id, date) === 'N'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      } ${!isAdminMode ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-105'}`}
                      disabled={!isAdminMode}
                    >
                      <div>{date.day}</div>
                      <div>{getAttendanceStatus(employee.id, date)}</div>
                    </button>
                  ))}
                </div>

                {/* Admin Controls */}
                {isAdminMode && (
                  <div className="border-t border-gray-700 pt-3">
                    {/* Bonus Checkboxes */}
                    <div className="mb-3">
                      <div className="text-green-400 font-bold mb-2 text-sm">💰 รายการโบนัส</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'holiday', label: 'วันหยุดนักขัตฤกษ์' },
                          { key: 'allowance', label: 'เบี้ยเลี้ยง' },
                          { key: 'diligence', label: 'เบี้ยขยัน' },
                          { key: 'transport', label: 'ค่าจราจร' }
                        ].map(bonus => (
                          <div key={bonus.key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={employeeBonuses[bonus.key] && employeeBonuses[bonus.key].checked || false}
                              onChange={(e) => {
                                const amount = (employeeBonuses[bonus.key] && employeeBonuses[bonus.key].amount) || '';
                                updateBonus(employee.id, bonus.key, amount, e.target.checked);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-green-300">{bonus.label}</span>
                            <input
                              type="number"
                              placeholder="บาท"
                              value={(employeeBonuses[bonus.key] && employeeBonuses[bonus.key].amount) || ''}
                              onChange={(e) => {
                                const checked = (employeeBonuses[bonus.key] && employeeBonuses[bonus.key].checked) || false;
                                updateBonus(employee.id, bonus.key, e.target.value, checked);
                              }}
                              className="bg-gray-700 px-2 py-1 rounded text-xs w-20 focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deduction Checkboxes */}
                    <div className="mb-3">
                      <div className="text-red-400 font-bold mb-2 text-sm">💸 รายการหัก</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 'social', label: 'ประกันสังคม' },
                          { key: 'life', label: 'ประกันชีวิต' },
                          { key: 'advance', label: 'เบิกล่วงหน้า' },
                          { key: 'equipment', label: 'เบิกอุปกรณ์' }
                        ].map(deduction => (
                          <div key={deduction.key} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={(employeeDeductions[deduction.key] && employeeDeductions[deduction.key].checked) || false}
                              onChange={(e) => {
                                const amount = (employeeDeductions[deduction.key] && employeeDeductions[deduction.key].amount) || '';
                                updateDeduction(employee.id, deduction.key, amount, e.target.checked);
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-xs text-red-300">{deduction.label}</span>
                            <input
                              type="number"
                              placeholder="บาท"
                              value={(employeeDeductions[deduction.key] && employeeDeductions[deduction.key].amount) || ''}
                              onChange={(e) => {
                                const checked = (employeeDeductions[deduction.key] && employeeDeductions[deduction.key].checked) || false;
                                updateDeduction(employee.id, deduction.key, e.target.value, checked);
                              }}
                              className="bg-gray-700 px-2 py-1 rounded text-xs w-20 focus:ring-2 focus:ring-red-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-right text-lg border-t border-gray-700 pt-3">
                  <span className="text-green-400 font-bold">
                    💰 รายได้สุทธิ: {salaryInfo.netSalary.toLocaleString()} บาท
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showLogin && (
        <LoginModal 
          password={password}
          setPassword={setPassword}
          onLogin={handleLogin}
          onClose={() => {setShowLogin(false); setPassword('');}}
        />
      )}

      {showAddEmployee && (
        <AddEmployeeModal 
          onClose={() => setShowAddEmployee(false)}
          onAdd={(emp) => {
            const id = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
            setEmployees([...employees, { ...emp, id }]);
            setShowAddEmployee(false);
          }}
        />
      )}

      {showEditEmployee && (
        <EditEmployeeModal 
          employee={showEditEmployee}
          onClose={() => setShowEditEmployee(null)}
          onUpdate={(updatedEmp) => {
            setEmployees(employees.map(emp => 
              emp.id === updatedEmp.id ? updatedEmp : emp
            ));
            setShowEditEmployee(null);
          }}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal 
          employee={employees.find(emp => emp.id === showDeleteConfirm)}
          onClose={() => setShowDeleteConfirm(null)}
          onConfirm={() => {
            setEmployees(employees.filter(emp => emp.id !== showDeleteConfirm));
            setShowDeleteConfirm(null);
          }}
        />
      )}

      {showSalaryDetail && (
        <SalaryDetailModal 
          employee={employees.find(emp => emp.id === showSalaryDetail)}
          salaryInfo={calculateSalary(showSalaryDetail)}
          bonuses={bonuses[showSalaryDetail] || {}}
          deductions={deductions[showSalaryDetail] || {}}
          onClose={() => setShowSalaryDetail(null)}
        />
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8 p-4">
        <p>G4S ผลัด B - ระบบคำนวณรายได้ | Made with ❤️</p>
      </div>
    </div>
  );
};

// Modal Components
const LoginModal = ({ password, setPassword, onLogin, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
      <h3 className="text-lg font-bold mb-4 text-center">🔐 เข้าสู่โหมด Admin</h3>
      <input
        type="password"
        placeholder="รหัสผ่าน"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-gray-700 px-3 py-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
        onKeyPress={(e) => e.key === 'Enter' && onLogin()}
        autoFocus
      />
      <div className="flex gap-2">
        <button
          onClick={onLogin}
          className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700 transition-colors"
        >
          เข้าสู่ระบบ
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
);

const AddEmployeeModal = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [code, setCode] = useState('');

  const handleAdd = () => {
    if (!name || !surname || !code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onAdd({ name, surname, code });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">➕ เพิ่มพนักงานใหม่</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="นามสกุล"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
          />
          <input
            type="text"
            placeholder="รหัสพนักงาน"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAdd}
            className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700 transition-colors"
          >
            เพิ่ม
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

const EditEmployeeModal = ({ employee, onClose, onUpdate }) => {
  const [name, setName] = useState(employee.name);
  const [surname, setSurname] = useState(employee.surname);
  const [code, setCode] = useState(employee.code);

  const handleUpdate = () => {
    if (!name || !surname || !code) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    onUpdate({ ...employee, name, surname, code });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">✏️ แก้ไขข้อมูลพนักงาน</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <input
            type="text"
            placeholder="นามสกุล"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="รหัสพนักงาน"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-gray-700 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleUpdate}
            className="bg-green-600 px-4 py-2 rounded flex-1 hover:bg-green-700 transition-colors"
          >
            บันทึก
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700 transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ employee, onClose, onConfirm }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
      <h3 className="text-lg font-bold mb-4 text-red-400">🗑️ ยืนยันการลบ</h3>
      <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
        <p className="text-gray-300">
          ต้องการลบพนักงาน <span className="font-bold text-white">"{employee?.name} {employee?.surname}"</span> หรือไม่?
        </p>
        <p className="text-red-300 text-sm mt-2">⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="bg-red-600 px-4 py-2 rounded flex-1 hover:bg-red-700 transition-colors"
        >
          ยืนยันลบ
        </button>
        <button
          onClick={onClose}
          className="bg-gray-600 px-4 py-2 rounded flex-1 hover:bg-gray-700 transition-colors"
        >
          ยกเลิก
        </button>
      </div>
    </div>
  </div>
);

const SalaryDetailModal = ({ employee, salaryInfo, bonuses, deductions, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-
