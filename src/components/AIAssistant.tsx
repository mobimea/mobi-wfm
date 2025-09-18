import React, { useState } from 'react';
import { Bot, Send, Lightbulb, TrendingUp, Users, Calendar } from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest } from '../types';
import { MONTHLY_SALARIES } from '../data/demoData';
import { PAYROLL_CONSTANTS } from '../utils/payroll';

interface AIAssistantProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  onEmployeeUpdate: (employees: Employee[]) => void;
  onAttendanceUpdate: (attendance: AttendanceRecord[]) => void;
  onLeaveUpdate: (leaves: LeaveRequest[]) => void;
}

interface AIQuery {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  type: 'summary' | 'analysis' | 'recommendation';
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  employees,
  attendance,
  leaves,
  onEmployeeUpdate,
  onAttendanceUpdate,
  onLeaveUpdate
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [conversations, setConversations] = useState<AIQuery[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const prebuiltQueries = [
    "Generate monthly summary for Senthil Kumar",
    "Who was late the most this month?",
    "List employees with >3 absences this month",
    "Set salary for EMP001 to RS20000",
    "Update Sarah Johnson's salary to RS22000 monthly",
    "Calculate overtime for Sales department this week",
    "Show attendance patterns analysis",
    "Which department has best attendance?",
    "Predict staff scheduling needs",
    "Recommend performance improvements",
    "Give John Smith a 10% raise",
    "Update all Promoter positions to RS18000 monthly"
  ];

  const generateAIResponse = (question: string): { answer: string; type: AIQuery['type']; action?: 'modify' } => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Calculate monthly metrics
    const monthlyAttendance = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });

    const latenessStats = employees.map(emp => {
      const empAttendance = monthlyAttendance.filter(record => record.employee_id === emp.employee_id);
      const lateCount = empAttendance.filter(record => record.status === 'late').length;
      const totalDays = empAttendance.length;
      return { employee: emp, lateCount, totalDays, latenessRate: totalDays > 0 ? (lateCount / totalDays) * 100 : 0 };
    }).sort((a, b) => b.lateCount - a.lateCount);

    const absenteeStats = employees.map(emp => {
      const empAttendance = monthlyAttendance.filter(record => record.employee_id === emp.employee_id);
      const absentCount = empAttendance.filter(record => record.status === 'absent').length;
      return { employee: emp, absentCount };
    }).filter(stat => stat.absentCount > 3);

    // Handle employee data modification commands
    if (question.toLowerCase().includes('set') && question.toLowerCase().includes('salary')) {
      const salaryMatch = question.match(/(\d+)/);
      let employeeMatch = null;
      
      // Try to find employee by ID
      const empIdMatch = question.match(/EMP\d+/i);
      if (empIdMatch) {
        employeeMatch = employees.find(emp => 
          emp.employee_id.toLowerCase() === empIdMatch[0].toLowerCase()
        );
      } else {
        // Try to find by name
        const nameMatches = employees.filter(emp => 
          question.toLowerCase().includes(emp.name.toLowerCase())
        );
        if (nameMatches.length === 1) {
          employeeMatch = nameMatches[0];
        }
      }
      
      if (salaryMatch && employeeMatch) {
        const newSalary = parseFloat(salaryMatch[0]);
        if (newSalary > 0 && newSalary <= 50000) {
          // Actually update the employee salary
          onEmployeeUpdate(employees.map(emp => 
            emp.id === employeeMatch.id 
              ? { ...emp, monthly_salary: newSalary }
              : emp
          ));
          
          const currentSalary = employeeMatch.monthly_salary || 17710;
          return {
            answer: `✅ **Salary Updated Successfully**\n\n**Employee:** ${employeeMatch.name} (${employeeMatch.employee_id})\n**Previous Monthly Salary:** RS${currentSalary.toLocaleString()}\n**New Monthly Salary:** RS${newSalary.toLocaleString()}\n**Position:** ${employeeMatch.position}\n**Department:** ${employeeMatch.department}\n\n**Impact Analysis:**\n• Monthly change: RS${(newSalary - currentSalary).toFixed(2)}\n• Annual impact: RS${((newSalary - currentSalary) * 12).toFixed(2)}\n\n**Note:** This change is effective immediately and will apply to all future payroll calculations.`,
            type: 'summary',
            action: 'modify'
          };
        }
      }
      
      return {
        answer: `❌ **Unable to Process Salary Change**\n\nI couldn't find a valid employee or salary in your request. Please use one of these formats:\n\n• "Set salary for EMP001 to RS25000"\n• "Update [Employee Name]'s salary to RS22000 monthly"\n\n**Available Employees:**\n${employees.slice(0, 5).map(emp => `• ${emp.name} (${emp.employee_id}) - Current: RS${(emp.monthly_salary || 17710).toLocaleString()}`).join('\n')}\n\n**Tips:**\n• Use exact employee names or IDs\n• Specify salaries between RS10,000-50,000`,
        type: 'summary'
      };
    }
    
    // Handle raise/percentage increase commands
    if (question.toLowerCase().includes('raise') || question.toLowerCase().includes('increase')) {
      const percentMatch = question.match(/(\d+)%/);
      let employeeMatch = null;
      
      // Try to find employee by name
      const nameMatches = employees.filter(emp => 
        question.toLowerCase().includes(emp.name.toLowerCase())
      );
      if (nameMatches.length === 1) {
        employeeMatch = nameMatches[0];
      }
      
      if (percentMatch && employeeMatch) {
        const percentage = parseFloat(percentMatch[0]);
        const currentSalary = employeeMatch.monthly_salary || 17710;
        const newSalary = currentSalary * (1 + percentage / 100);
        
        if (newSalary <= 50000) {
          // Actually update the employee salary
          onEmployeeUpdate(employees.map(emp => 
            emp.id === employeeMatch.id 
              ? { ...emp, monthly_salary: newSalary }
              : emp
          ));
          
          return {
            answer: `🎉 **${percentage}% Raise Applied Successfully**\n\n**Employee:** ${employeeMatch.name} (${employeeMatch.employee_id})\n**Previous Monthly Salary:** RS${currentSalary.toLocaleString()}\n**New Monthly Salary:** RS${newSalary.toLocaleString()}\n**Raise Amount:** RS${(newSalary - currentSalary).toFixed(2)}\n\n**Annual Impact:**\n• Additional annual income: RS${((newSalary - currentSalary) * 12).toFixed(2)}\n• Performance recognition: ${percentage}% merit increase\n\n**Congratulations to ${employeeMatch.name} on their well-deserved raise!**`,
            type: 'summary',
            action: 'modify'
          };
        }
      }
    }
    
    // Handle employee summary requests (more generic)
    if (question.toLowerCase().includes('summary') && question.toLowerCase().includes('for')) {
      const nameMatch = question.match(/summary for ([a-zA-Z\s]+)/i);
      if (nameMatch) {
        const searchName = nameMatch[1].trim();
        const employee = employees.find(emp => 
          emp.name.toLowerCase().includes(searchName.toLowerCase()) ||
          emp.employee_id.toLowerCase().includes(searchName.toLowerCase())
        );
        
        if (employee) {
          const empAttendance = monthlyAttendance.filter(record => record.employee_id === employee.employee_id);
          const presentDays = empAttendance.filter(record => record.status === 'present').length;
          const lateDays = empAttendance.filter(record => record.status === 'late').length;
          const totalHours = empAttendance.reduce((sum, record) => sum + (record.total_hours || 0), 0);
          const overtimeHours = empAttendance.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
          const empLeaves = leaves.filter(l => l.employee_id === employee.employee_id && l.status === 'approved');
          
          return {
            answer: `**Monthly Summary for ${employee.name}:**\n\n• **Position:** ${employee.position} (${employee.department})\n• **Employee ID:** ${employee.employee_id}\n• **Attendance:** ${presentDays + lateDays}/${empAttendance.length} days present\n• **Punctuality:** ${lateDays} late arrivals\n• **Total Hours:** ${totalHours.toFixed(1)} hours\n• **Overtime Hours:** ${overtimeHours.toFixed(1)} hours\n• **Leave Days Used:** ${empLeaves.reduce((sum, leave) => sum + leave.total_days, 0)} days\n• **Performance:** ${lateDays <= 2 ? 'Excellent' : 'Needs improvement'}\n• **Recommendation:** ${lateDays > 3 ? 'Schedule punctuality training' : 'Maintain current performance'}`,
            type: 'summary'
          };
        }
      }
    }

    if (question.toLowerCase().includes('late') && question.toLowerCase().includes('most')) {
      const topLate = latenessStats.slice(0, 3);
      return {
        answer: `**Employees with Most Late Arrivals This Month:**\n\n${topLate.map((stat, index) => 
          `${index + 1}. **${stat.employee.name}** (${stat.employee.employee_id})\n   • Late arrivals: ${stat.lateCount} times\n   • Lateness rate: ${stat.latenessRate.toFixed(1)}%\n   • Department: ${stat.employee.department}`
        ).join('\n\n')}\n\n**Recommendation:** Consider flexible working hours or punctuality coaching for these employees.`,
        type: 'analysis'
      };
    }

    if (question.toLowerCase().includes('absent') && question.toLowerCase().includes('>3')) {
      if (absenteeStats.length === 0) {
        return {
          answer: `**Excellent News!** 🎉\n\nNo employees have more than 3 absences this month. The team is showing strong attendance commitment.\n\n**Current absence patterns:**\n${employees.slice(0, 5).map(emp => {
            const absences = monthlyAttendance.filter(record => record.employee_id === emp.id && record.status === 'absent').length;
            return `• ${emp.name}: ${absences} absence${absences !== 1 ? 's' : ''}`;
          }).join('\n')}`,
          type: 'summary'
        };
      } else {
        return {
          answer: `**Employees with >3 Absences This Month:**\n\n${absenteeStats.map(stat => 
            `• **${stat.employee.name}** (${stat.employee.employee_id}): ${stat.absentCount} absences`
          ).join('\n')}\n\n**Recommended Actions:**\n• Schedule one-on-one meetings\n• Review personal circumstances\n• Consider attendance improvement plans`,
          type: 'analysis'
        };
      }
    }

    if (question.toLowerCase().includes('overtime') && question.toLowerCase().includes('sales')) {
      const salesEmployees = employees.filter(emp => emp.department === 'Sales');
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });
      
      const weekAttendance = attendance.filter(record => last7Days.includes(record.date));
      const salesOT = salesEmployees.map(emp => {
        const empWeekRecords = weekAttendance.filter(record => record.employee_id === emp.employee_id);
        const totalOT = empWeekRecords.reduce((sum, record) => sum + (record.overtime_hours || 0), 0);
        const otPay = totalOT * 127; // Using standard OT rate
        return { employee: emp, overtime: totalOT, otPay };
      }).filter(stat => stat.overtime > 0);

      return {
        answer: `**Sales Department Overtime (This Week):**\n\n${salesOT.length > 0 ? 
          salesOT.map(stat => 
            `• **${stat.employee.name}:** ${stat.overtime.toFixed(1)}h overtime\n   • OT Pay: RS${stat.otPay.toFixed(2)}`
          ).join('\n\n') :
          'No overtime recorded for Sales department this week.'
        }\n\n**Total Sales OT:** ${salesOT.reduce((sum, stat) => sum + stat.overtime, 0).toFixed(1)} hours\n**Total OT Cost:** RS${salesOT.reduce((sum, stat) => sum + stat.otPay, 0).toFixed(2)}`,
        type: 'analysis'
      };
    }

    // Handle department analysis
    if (question.toLowerCase().includes('department') && question.toLowerCase().includes('attendance')) {
      const departments = [...new Set(employees.map(emp => emp.department))];
      const deptAnalysis = departments.map(dept => {
        const deptEmployees = employees.filter(emp => emp.department === dept);
        const deptAttendance = monthlyAttendance.filter(record => {
          const employee = employees.find(emp => emp.employee_id === record.employee_id);
          return employee?.department === dept;
        });
        const presentRate = deptEmployees.length > 0 ? 
          (deptAttendance.filter(record => record.status === 'present' || record.status === 'late').length / 
           (deptEmployees.length * new Date().getDate())) * 100 : 0;
        
        return { department: dept, employees: deptEmployees.length, attendanceRate: presentRate };
      }).sort((a, b) => b.attendanceRate - a.attendanceRate);

      return {
        answer: `**Department Attendance Analysis:**\n\n${deptAnalysis.map((dept, index) => 
          `${index + 1}. **${dept.department}**\n   • Employees: ${dept.employees}\n   • Attendance Rate: ${dept.attendanceRate.toFixed(1)}%`
        ).join('\n\n')}\n\n**Best Performing:** ${deptAnalysis[0]?.department} (${deptAnalysis[0]?.attendanceRate.toFixed(1)}%)\n**Needs Attention:** ${deptAnalysis[deptAnalysis.length - 1]?.department} (${deptAnalysis[deptAnalysis.length - 1]?.attendanceRate.toFixed(1)}%)`,
        type: 'analysis'
      };
    }

    // Default response for unrecognized queries
    return {
      answer: `I understand you're asking about "${question}". I can help with:\n\n• Employee summaries and reports ("Generate summary for [Name]")\n• Attendance analysis ("Which department has best attendance?")\n• Overtime calculations ("Calculate overtime for [Department] department")\n• Salary updates and raises ("Set salary for [Employee] to RS[Amount]")\n• Department performance metrics\n• Late arrival analysis ("Who was late the most this month?")\n\n**Available Employees:** ${employees.slice(0, 3).map(emp => emp.name).join(', ')}${employees.length > 3 ? ` and ${employees.length - 3} more...` : ''}`,
      type: 'summary'
    };
  };

  const handleSubmit = async (query: string) => {
    if (!query.trim()) return;

    setIsThinking(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = generateAIResponse(query);
    const newConversation: AIQuery = {
      id: Date.now().toString(),
      question: query,
      answer: response.answer,
      timestamp: new Date(),
      type: response.type
    };

    setConversations(prev => [newConversation, ...prev]);
    setInputQuery('');
    setIsThinking(false);
  };

  const handlePrebuiltQuery = (query: string) => {
    setInputQuery(query);
    handleSubmit(query);
  };

  const getTypeIcon = (type: AIQuery['type']) => {
    switch (type) {
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: AIQuery['type']) => {
    switch (type) {
      case 'analysis': return 'bg-gray-50 border-gray-200';
      case 'recommendation': return 'bg-gray-100 border-gray-300';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <Bot className="w-8 h-8 relative z-10" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Workforce Assistant</h2>
            <p className="text-gray-300">Ask questions about your workforce data and get instant insights</p>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about employees, attendance, overtime, or performance..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(inputQuery)}
          />
          <button
            onClick={() => handleSubmit(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
              <Send className="w-4 h-4 relative z-10" />
            </div>
            Ask AI
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm rounded-full border border-gray-200"></div>
            <Lightbulb className="w-5 h-5 text-gray-700 relative z-10" />
          </div>
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {prebuiltQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => handlePrebuiltQuery(query)}
              disabled={isThinking}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <span className="text-sm text-gray-700">{query}</span>
            </button>
          ))}
        </div>
      </div>

      {isThinking && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            <span className="text-gray-600">AI is analyzing your request...</span>
          </div>
        </div>
      )}

      {conversations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm rounded-full border border-gray-200"></div>
              <Users className="w-5 h-5 text-gray-700 relative z-10" />
            </div>
            Recent Insights
          </h3>
          
          {conversations.map((conv) => (
            <div key={conv.id} className={`rounded-xl border-2 p-6 ${getTypeColor(conv.type)}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-full border border-white/30"></div>
                    <div className="relative z-10">{getTypeIcon(conv.type)}</div>
                  </div>
                  <span className="font-medium text-gray-800 capitalize">{conv.type}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {conv.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-600 mb-1">Question:</p>
                <p className="text-gray-800">{conv.question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Answer:</p>
                <div className="text-gray-800 whitespace-pre-line">{conv.answer}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {conversations.length === 0 && !isThinking && (
        <div className="text-center py-12 text-gray-500">
          <div className="relative mb-4 inline-block">
            <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm rounded-full border border-gray-200"></div>
            <Bot className="w-12 h-12 mx-auto opacity-50 relative z-10" />
          </div>
          <p>Start asking questions to get AI-powered workforce insights!</p>
          <p className="text-sm mt-1">Try clicking one of the quick insight buttons above.</p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;