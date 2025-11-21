import React, { useState, useEffect } from 'react';
// [배포 시 주석 해제]
import { createClient } from '@supabase/supabase-js'; 
import { Play, Pause, Square, Clock, Award, Calendar as CalendarIcon, BookOpen, ChevronLeft, ChevronRight, Tag, FileText, Plus, X, Check, ListTodo, CheckCircle, Circle, ChevronDown, Layout, CalendarDays, CalendarRange, RotateCcw, BarChart3, Star, Flag, TrendingUp, TrendingDown, PieChart, Filter, Edit2, Layers, Hash, History, Timer as TimerIcon, Hourglass, CheckSquare, LogOut, User } from 'lucide-react';

// --- [설정] Supabase 클라이언트 (배포 시 주석 해제) ---
const supabaseUrl = 'https://pheptnenitqlwraytprp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZXB0bmVuaXRxbHdyYXl0cHJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MTgxNjcsImV4cCI6MjA3OTI5NDE2N30.-th1Rs9w8MNaieTMj26s_2lk9z4pHgSsGx1gCbworOs';
const supabase = createClient(supabaseUrl, supabaseKey);

const CustomStyles = () => (
  <style>{`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #cbd5e1; }
    @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-in { animation: fade-in 0.2s ease-out; }
  `}</style>
);

const getRandomColor = () => {
  const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const stringToColor = (str) => {
  if (!str) return '#cbd5e1';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('timer'); 

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const [timerMode, setTimerMode] = useState('stopwatch');
  const [time, setTime] = useState(0);
  const [pomodoroDuration, setPomodoroDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);

  const [dDay, setDDay] = useState({ title: '시험', date: '' });
  const [isDDayModalOpen, setIsDDayModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 3, comment: '' });
  const [pendingRecord, setPendingRecord] = useState(null);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  const [isManualRecordModalOpen, setIsManualRecordModalOpen] = useState(false);
  const [manualRecord, setManualRecord] = useState({
      category: '', bookName: '', startTime: '', endTime: '', date: new Date().toISOString().split('T')[0]
  });

  const [savedCategories, setSavedCategories] = useState(['자율', '수학', '영어', '국어', '과학']);
  const [savedBooks, setSavedBooks] = useState(['단어장', '기출문제집', '교과서', '인강']);
  
  const [todos, setTodos] = useState([]);
  const [events, setEvents] = useState([]); 
  const [records, setRecords] = useState([]);
  const [eventCategories, setEventCategories] = useState([
    { id: 'cert', name: '자격증', color: '#f59e0b' }, { id: 'job', name: '채용', color: '#10b981' }, { id: 'school', name: '학교', color: '#6366f1' }
  ]);
  const [selectedEventCatId, setSelectedEventCatId] = useState('school');
  const [newEventCatName, setNewEventCatName] = useState('');
  const [isAddingEventCat, setIsAddingEventCat] = useState(false);

  const [summaryPeriod, setSummaryPeriod] = useState('daily');
  const [summaryCategory, setSummaryCategory] = useState('All');

  const [addItemMode, setAddItemMode] = useState('todo');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [category, setCategory] = useState('');
  const [bookName, setBookName] = useState('');
  const [chapter, setChapter] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [subtasksInput, setSubtasksInput] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [tempInput, setTempInput] = useState('');
  const [error, setError] = useState('');
  
  const [calendarView, setCalendarView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUserData(); 
      else { setTodos([]); setRecords([]); setEvents([]); }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true); setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message); else alert('회원가입 성공!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setAuthLoading(false);
  };
  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

  const loadUserData = async () => {
      const { data: settings } = await supabase.from('study_settings').select('*');
      if (settings && settings.length > 0) {
          settings.forEach(s => {
              if (s.key === 'savedCategories') setSavedCategories(s.value);
              if (s.key === 'savedBooks') setSavedBooks(s.value);
              if (s.key === 'eventCategories') setEventCategories(s.value);
              if (s.key === 'dDay') setDDay(s.value);
          });
      } else {
        // Fallback for Preview
        const localTodos = localStorage.getItem('studyTodos');
        if(localTodos) setTodos(JSON.parse(localTodos));
      }
      
      const { data: todosData } = await supabase.from('study_todos').select('*');
      if (todosData) setTodos(todosData.map(t => ({...t, bookName: t.book_name, dateKey: t.date_key, timeSpent: t.time_spent, pageRange: t.page_range})));
      
      const { data: recordsData } = await supabase.from('study_records').select('*');
      if (recordsData) setRecords(recordsData.map(r => ({...r, bookName: r.book_name, dateKey: r.date_key, isoDate: r.iso_date, timeRange: r.time_range, isManual: r.is_manual})));
      
      const { data: eventsData } = await supabase.from('study_events').select('*');
      if (eventsData) setEvents(eventsData.map(e => ({...e, startDate: e.start_date, endDate: e.end_date, categoryId: e.category_id})));

      const todayStr = new Date().toISOString().split('T')[0];
      setEventStartDate(todayStr); setEventEndDate(todayStr);
  };

  // 409 오류 수정: upsert 시 user_id와 key를 모두 포함하여 PK 충돌 방지
  const saveSetting = async (key, value) => {
      if (!session?.user?.id) return;
      await supabase.from('study_settings').upsert({ user_id: session.user.id, key, value });
  };

  useEffect(() => { if(session) saveSetting('savedCategories', savedCategories); }, [savedCategories, session]);
  useEffect(() => { if(session) saveSetting('savedBooks', savedBooks); }, [savedBooks, session]);
  useEffect(() => { if(session) saveSetting('eventCategories', eventCategories); }, [eventCategories, session]);
  useEffect(() => { if(session) saveSetting('dDay', dDay); }, [dDay, session]);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => {
            if (timerMode === 'stopwatch') return prevTime + 1;
            if (prevTime <= 0) { setIsRunning(false); return 0; }
            return prevTime - 1;
        });
      }, 1000);
    } else { clearInterval(interval); }
    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  useEffect(() => {
      if (timerMode === 'pomodoro') { setTime(pomodoroDuration); setIsRunning(false); }
      else { setTime(0); setIsRunning(false); }
  }, [timerMode, pomodoroDuration]);

  const formatTime = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };
  const formatTimeShort = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const getDateKey = (d) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const calculateDDay = () => {
    if (!dDay.date) return null;
    const t = new Date(dDay.date); const n = new Date();
    t.setHours(0,0,0,0); n.setHours(0,0,0,0);
    return Math.ceil((t - n) / (1000 * 60 * 60 * 24));
  };

  const handleAddItem = (type) => {
    if (!tempInput.trim()) return;
    if (type === 'category') {
      if (!savedCategories.includes(tempInput)) setSavedCategories([...savedCategories, tempInput]);
      setCategory(tempInput); setIsAddingCategory(false);
    } else if (type === 'book') {
      if (!savedBooks.includes(tempInput)) setSavedBooks([...savedBooks, tempInput]);
      setBookName(tempInput); setIsAddingBook(false);
    }
    setTempInput('');
  };

  const addSubtaskToInput = () => {
      if (!newSubtaskText.trim()) return;
      setSubtasksInput([...subtasksInput, { id: Date.now(), text: newSubtaskText, completed: false }]);
      setNewSubtaskText('');
  };
  const removeSubtaskFromInput = (id) => setSubtasksInput(subtasksInput.filter(s => s.id !== id));

  const saveTodo = async () => {
    if (!category && !bookName) { setError('과목이나 책 이름을 선택해주세요.'); return; }
    let pr = '';
    if (startPage && endPage) pr = `p.${startPage} ~ p.${endPage}`;
    else if (startPage) pr = `p.${startPage} ~`;
    else if (endPage) pr = `~ p.${endPage}`;

    const todoData = {
        category, book_name: bookName, chapter, page_range: pr, subtasks: subtasksInput, // Subtasks included
        date_key: getDateKey(selectedDate), user_id: session.user.id
    };

    if (editingTodoId) {
        const { error } = await supabase.from('study_todos').update(todoData).eq('id', editingTodoId);
        if (!error) {
            setTodos(todos.map(t => t.id === editingTodoId ? { ...t, ...todoData, bookName, pageRange: pr } : t));
            setEditingTodoId(null);
        }
    } else {
        const { data, error } = await supabase.from('study_todos').insert([todoData]).select();
        const mockNewId = Date.now();
        // Preview/Mock Handling
        if ((!error && data && data.length > 0) || !session.user.id.includes('test')) {
             const newData = data ? data[0] : { id: mockNewId, ...todoData };
             setTodos([...todos, { ...newData, bookName, pageRange: pr, timeSpent: 0, completed: false }]);
        } else {
             setTodos([...todos, { id: mockNewId, ...todoData, bookName, pageRange: pr, timeSpent: 0, completed: false }]);
        }
    }
    setCategory(''); setBookName(''); setChapter(''); setStartPage(''); setEndPage(''); setSubtasksInput([]); setError('');
  };

  const deleteTodo = async (id) => {
    const { error } = await supabase.from('study_todos').delete().eq('id', id);
    if (!error || true) {
        setTodos(todos.filter(t => t.id !== id));
        if (selectedTaskId === id) { setIsRunning(false); setTime(0); setSelectedTaskId(null); }
        if (editingTodoId === id) cancelEditing();
    }
  };

  const toggleTodoComplete = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newCompleted = !todo.completed;
    const { error } = await supabase.from('study_todos').update({ completed: newCompleted }).eq('id', id);
    if (!error || true) setTodos(todos.map(t => t.id === id ? { ...t, completed: newCompleted } : t));
  };

  const toggleSubtask = async (todoId, subtaskId) => {
      const todo = todos.find(t => t.id === todoId);
      if (!todo) return;
      
      const newSubtasks = todo.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s);
      const allCompleted = newSubtasks.length > 0 && newSubtasks.every(s => s.completed);
      
      const { error } = await supabase.from('study_todos').update({ subtasks: newSubtasks, completed: allCompleted }).eq('id', todoId);
      if (!error || true) {
          setTodos(todos.map(t => t.id === todoId ? { ...t, subtasks: newSubtasks, completed: allCompleted } : t));
      }
  };

  const addEventCategory = () => {
      if(!newEventCatName.trim()) return;
      const newCat = { id: Date.now().toString(), name: newEventCatName, color: getRandomColor() };
      setEventCategories([...eventCategories, newCat]);
      setNewEventCatName(''); setIsAddingEventCat(false); setSelectedEventCatId(newCat.id);
  };

  const addEvent = async () => {
    if (!eventTitle.trim() || !eventStartDate || !eventEndDate) { setError('모든 필드를 입력해주세요.'); return; }
    const cat = eventCategories.find(c => c.id === selectedEventCatId);
    const newEvent = { 
        title: eventTitle, start_date: eventStartDate, end_date: eventEndDate, 
        category_id: selectedEventCatId, color: cat ? cat.color : '#6366f1', user_id: session.user.id
    };
    const { data, error } = await supabase.from('study_events').insert([newEvent]).select();
    if ((!error && data) || true) {
        const savedEvent = data ? data[0] : { id: Date.now(), ...newEvent };
        setEvents([...events, { ...savedEvent, startDate: eventStartDate, endDate: eventEndDate, categoryId: selectedEventCatId }]);
        setEventTitle(''); setError('');
    }
  };

  const deleteEvent = async (id) => {
      const { error } = await supabase.from('study_events').delete().eq('id', id);
      if(!error || true) setEvents(events.filter(e => e.id !== id));
  };

  const toggleTimer = () => {
    if (!selectedTaskId && !isRunning) { setError('먼저 공부할 계획(To-Do)을 선택해주세요!'); return; }
    setError(''); setIsRunning(!isRunning);
  };

  const handleStopClick = () => {
      let studiedTime = 0;
      if (timerMode === 'stopwatch') studiedTime = time;
      else studiedTime = pomodoroDuration - time;
      if (studiedTime <= 0) return;

      setIsRunning(false);
      const now = new Date();
      const task = todos.find(t => t.id === selectedTaskId);
      const displaySubject = task 
        ? `${task.category} ${task.bookName ? '| ' + task.bookName : ''} ${task.chapter ? 'Ch.' + task.chapter : ''}`
        : '삭제된 작업';
      
      const tempRecord = {
        todo_id: selectedTaskId, category: task ? task.category : 'Unknown', book_name: task ? task.bookName : '',
        duration: studiedTime, timestamp: now.toLocaleString('ko-KR'), date_key: getDateKey(now), iso_date: now.toISOString(),
        time_range: `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} ~ ${new Date(now.getTime() + studiedTime*1000).getHours().toString().padStart(2,'0')}:${new Date(now.getTime() + studiedTime*1000).getMinutes().toString().padStart(2,'0')}`,
        user_id: session.user.id
      };
      setPendingRecord({ ...tempRecord, subject: displaySubject, dateDisplay: now.toLocaleDateString('ko-KR') }); 
      setReviewData({ rating: 3, comment: '' }); 
      setIsReviewModalOpen(true);
  };

  const saveRecordWithReview = async () => {
      if (!pendingRecord) return;
      // DB Insert (Clean data)
      const dbPayload = {
          user_id: pendingRecord.user_id,
          todo_id: pendingRecord.todo_id,
          category: pendingRecord.category,
          book_name: pendingRecord.book_name,
          duration: pendingRecord.duration,
          timestamp: pendingRecord.timestamp,
          date_key: pendingRecord.date_key,
          iso_date: pendingRecord.iso_date,
          time_range: pendingRecord.time_range,
          is_manual: false,
          review: { rating: reviewData.rating, comment: reviewData.comment }
      };
      
      const { data, error } = await supabase.from('study_records').insert([dbPayload]).select();
      
      if (!error || true) {
          const savedRecord = (data && data[0]) ? data[0] : { id: Date.now(), ...dbPayload };
          setRecords([...records, { ...savedRecord, bookName: savedRecord.book_name, dateKey: savedRecord.date_key, isoDate: savedRecord.iso_date, timeRange: savedRecord.time_range }]);
          
          if (pendingRecord.todo_id) {
              const todo = todos.find(t => t.id === pendingRecord.todo_id);
              if (todo) {
                  const newTime = (todo.timeSpent || 0) + pendingRecord.duration;
                  await supabase.from('study_todos').update({ time_spent: newTime }).eq('id', pendingRecord.todo_id);
                  setTodos(todos.map(t => t.id === pendingRecord.todo_id ? { ...t, timeSpent: newTime } : t));
              }
          }
      }
      
      setIsReviewModalOpen(false); setPendingRecord(null);
      if (timerMode === 'stopwatch') setTime(0); else setTime(pomodoroDuration);
      setSelectedTaskId(null);
  };

  const addManualRecord = async () => {
      if (!manualRecord.category || !manualRecord.startTime || !manualRecord.endTime) return;
      const start = new Date(`${manualRecord.date}T${manualRecord.startTime}`);
      const end = new Date(`${manualRecord.date}T${manualRecord.endTime}`);
      let diffSeconds = (end - start) / 1000;
      if (diffSeconds <= 0) { alert('시간 설정을 확인해주세요.'); return; }

      const now = new Date();
      const newRecord = {
          category: manualRecord.category, book_name: manualRecord.bookName || '수동 기록',
          duration: diffSeconds, timestamp: start.toLocaleString('ko-KR'), date_key: getDateKey(new Date(manualRecord.date)), 
          iso_date: start.toISOString(), is_manual: true, time_range: `${manualRecord.startTime} ~ ${manualRecord.endTime}`,
          user_id: session.user.id
      };

      const { data, error } = await supabase.from('study_records').insert([newRecord]).select();
      const savedRecord = (data && data[0]) ? data[0] : { id: Date.now(), ...newRecord };
      setRecords([...records, { ...savedRecord, bookName: savedRecord.book_name, dateKey: savedRecord.date_key, isoDate: savedRecord.iso_date, timeRange: savedRecord.time_range, dateDisplay: new Date(manualRecord.date).toLocaleDateString('ko-KR') }]);
      setIsManualRecordModalOpen(false);
      setManualRecord({ category: '', bookName: '', startTime: '', endTime: '', date: new Date().toISOString().split('T')[0] });
  };

  const startEditingTodo = (todo) => {
      setAddItemMode('todo'); setEditingTodoId(todo.id);
      setCategory(todo.category); setBookName(todo.bookName); setChapter(todo.chapter || '');
      setSubtasksInput(todo.subtasks || []);
      const range = todo.pageRange || '';
      const parts = range.match(/p\.(\d+)/g);
      if (parts && parts.length >= 1) setStartPage(parts[0].replace('p.',''));
      if (parts && parts.length >= 2) setEndPage(parts[1].replace('p.',''));
  };
  const cancelEditing = () => { setEditingTodoId(null); setCategory(''); setBookName(''); setChapter(''); setSubtasksInput([]); setStartPage(''); setEndPage(''); };

  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (calendarView === 'year') newDate.setFullYear(newDate.getFullYear() + direction);
    else if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };
  const goToToday = () => { const t = new Date(); setCurrentDate(t); setSelectedDate(t); };
  const isEventOnDate = (e, d) => {
      const check = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const s = new Date(e.startDate); const en = new Date(e.endDate);
      s.setHours(0,0,0,0); en.setHours(0,0,0,0);
      return check >= s && check <= en;
  };

  if (!session) {
      return (
          <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-6 font-sans">
              <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                  <div className="text-center mb-8"><div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600"><Clock size={32} strokeWidth={2.5} /></div><h1 className="text-2xl font-bold text-slate-800">Study Focus</h1><p className="text-slate-500 mt-1">{isSignUp ? '새 계정 만들기' : '로그인하고 공부 시작하기'}</p></div>
                  <form onSubmit={handleAuth} className="space-y-4">
                      <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all" placeholder="name@example.com" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" /></div>
                      {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
                      <button type="submit" disabled={authLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50">{authLoading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}</button>
                  </form>
                  <div className="mt-6 text-center"><button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-indigo-600 font-bold hover:underline">{isSignUp ? '이미 계정이 있으신가요? 로그인' : '계정이 없으신가요? 회원가입'}</button></div>
              </div>
              <CustomStyles />
          </div>
      );
  }

  const renderDDayModal = () => {
      if (!isDDayModalOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Flag className="text-indigo-500" size={20} /> D-Day 설정</h3>
                  <div className="space-y-4">
                      <div><label className="block text-xs font-bold text-slate-400 mb-1">제목</label><input type="text" value={dDay.title} onChange={(e) => setDDay({...dDay, title: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none" placeholder="예: 수능" /></div>
                      <div><label className="block text-xs font-bold text-slate-400 mb-1">날짜</label><input type="date" value={dDay.date} onChange={(e) => setDDay({...dDay, date: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none" /></div>
                      <div className="flex gap-2 pt-2"><button onClick={() => setIsDDayModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200">취소</button><button onClick={() => setIsDDayModalOpen(false)} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">저장</button></div>
                  </div>
              </div>
          </div>
      );
  };

  const renderManualRecordModal = () => {
      if (!isManualRecordModalOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[100] backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Edit2 className="text-indigo-500" size={20} /> 수동 기록 추가</h3>
                  <div className="space-y-3">
                      <div><label className="block text-xs font-bold text-slate-400 mb-1">날짜</label><input type="date" value={manualRecord.date} onChange={(e) => setManualRecord({...manualRecord, date: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none" /></div>
                      <div><label className="block text-xs font-bold text-slate-400 mb-1">과목</label><select value={manualRecord.category} onChange={(e) => setManualRecord({...manualRecord, category: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"><option value="" disabled>선택</option>{savedCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                      <div><label className="block text-xs font-bold text-slate-400 mb-1">내용(책 이름)</label><input type="text" value={manualRecord.bookName} onChange={(e) => setManualRecord({...manualRecord, bookName: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none" placeholder="예: 독서" /></div>
                      <div className="flex gap-2">
                          <div className="flex-1"><label className="block text-xs font-bold text-slate-400 mb-1">시작 시간</label><input type="time" value={manualRecord.startTime} onChange={(e) => setManualRecord({...manualRecord, startTime: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none" /></div>
                          <div className="flex-1"><label className="block text-xs font-bold text-slate-400 mb-1">종료 시간</label><input type="time" value={manualRecord.endTime} onChange={(e) => setManualRecord({...manualRecord, endTime: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none" /></div>
                      </div>
                      <div className="flex gap-2 pt-2"><button onClick={() => setIsManualRecordModalOpen(false)} className="flex-1 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold hover:bg-slate-200">취소</button><button onClick={addManualRecord} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">추가</button></div>
                  </div>
              </div>
          </div>
      );
  };

  const renderReviewModal = () => {
      if (!isReviewModalOpen) return null;
      return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">공부 완료! 수고하셨어요 🎉</h3>
                  <div className="mb-6 text-center"><p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Focus Time</p><div className="text-4xl font-mono font-bold text-indigo-600">{formatTime(pendingRecord?.duration || 0)}</div></div>
                  <div className="mb-6"><label className="block text-xs font-bold text-slate-400 mb-2">집중도 평가</label><div className="flex justify-center gap-2">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setReviewData({ ...reviewData, rating: star })} className={`p-2 transition-all ${reviewData.rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}><Star size={32} fill="currentColor" /></button>))}</div></div>
                  <div className="mb-6"><label className="block text-xs font-bold text-slate-400 mb-2">한 줄 메모</label><textarea value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} placeholder="어려웠던 점이나 다음 목표를 적어주세요." className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none resize-none h-24 text-sm" /></div>
                  <button onClick={saveRecordWithReview} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"><CheckCircle size={20} /> 기록 저장하기</button>
              </div>
          </div>
      );
  };

  const renderTimerContent = () => {
    const todayKey = getDateKey(new Date());
    const todayTodos = todos.filter(t => t.dateKey === todayKey);
    const incompleteTodos = todayTodos.filter(t => !t.completed);
    const completedTodos = todayTodos.filter(t => t.completed);
    const selectedTask = todos.find(t => t.id === selectedTaskId);
    
    const todayTotalSeconds = records.filter(r => r.dateKey === todayKey).reduce((acc, curr) => acc + curr.duration, 0);
    let currentSessionElapsed = 0;
    if (isRunning) {
        if (timerMode === 'stopwatch') currentSessionElapsed = time;
        else currentSessionElapsed = pomodoroDuration - time;
    }
    const displayTotalSeconds = todayTotalSeconds + currentSessionElapsed;
    const completionRate = todayTodos.length > 0 ? Math.round((completedTodos.length / todayTodos.length) * 100) : 0;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-12 text-center relative overflow-hidden flex-1 flex flex-col justify-center items-center min-h-[500px]">
                    <div className={`absolute inset-0 transition-opacity duration-1000 ${isRunning ? 'opacity-5' : 'opacity-0'}`}><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent animate-pulse"></div></div>
                    <div className="relative z-30 mb-8 bg-slate-100 p-1 rounded-xl inline-flex">
                        <button onClick={() => setTimerMode('stopwatch')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${timerMode === 'stopwatch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><TimerIcon size={16} /> Stopwatch</button>
                        <button onClick={() => setTimerMode('pomodoro')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${timerMode === 'pomodoro' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Hourglass size={16} /> Pomodoro</button>
                    </div>
                    <div className="w-full max-w-md mb-8 relative z-20">
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">What to focus on?</h3>
                        {incompleteTodos.length === 0 && todayTodos.length > 0 ? (
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600 text-sm font-bold">모든 계획을 달성했습니다! 🎉</div>
                        ) : todayTodos.length === 0 ? (
                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm">Planner 탭에서 오늘의 계획을 먼저 추가해주세요.</div>
                        ) : (
                            <div className="relative">
                                <button onClick={() => !isRunning && setIsTaskDropdownOpen(!isTaskDropdownOpen)} disabled={isRunning} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-white ${isRunning ? 'cursor-not-allowed opacity-90 border-indigo-100' : 'cursor-pointer hover:border-indigo-300 border-slate-200 shadow-sm'}`}>
                                    {selectedTask ? (
                                        <div className="flex items-center gap-3 text-left">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2"><span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: stringToColor(selectedTask.category) + '30', color: stringToColor(selectedTask.category) }}>{selectedTask.category}</span></div>
                                                <span className="font-bold text-slate-800 text-lg mt-1">{selectedTask.bookName}</span>
                                                <span className="text-xs text-slate-400 flex gap-1">{selectedTask.chapter && <span>Chapter {selectedTask.chapter}</span>} {selectedTask.pageRange}</span>
                                            </div>
                                        </div>
                                    ) : (<span className="text-slate-400 font-medium">공부할 계획을 선택해주세요</span>)}
                                    <div className="flex items-center gap-3">{selectedTask && (<span className="text-indigo-600 font-mono font-bold bg-indigo-50 px-2 py-1 rounded-md">{formatTimeShort(selectedTask.timeSpent || 0)}</span>)}<ChevronDown size={20} className={`text-slate-400 transition-transform ${isTaskDropdownOpen ? 'rotate-180' : ''}`} /></div>
                                </button>
                                {isTaskDropdownOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 max-h-64 overflow-y-auto">
                                        {incompleteTodos.map(todo => (
                                            <button key={todo.id} onClick={() => { setSelectedTaskId(todo.id); setIsTaskDropdownOpen(false); }} className={`w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${selectedTaskId === todo.id ? 'bg-indigo-50' : ''}`}>
                                                <div><div className="flex items-center gap-2"><span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold" style={{color: stringToColor(todo.category)}}>{todo.category}</span><span className="font-bold text-slate-700">{todo.bookName}</span></div><div className="text-xs text-slate-400 mt-0.5 flex gap-1">{todo.chapter && <span>Chapter {todo.chapter}</span>} {todo.pageRange}</div></div>
                                                <Circle size={16} className="text-slate-300" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {error && <p className="text-red-500 text-sm mt-3 animate-bounce font-medium">{error}</p>}
                    </div>
                    <div className="relative z-10 mb-8"><div className={`text-[6rem] lg:text-[8rem] leading-none font-mono font-bold tracking-tighter transition-colors tabular-nums ${isRunning ? 'text-indigo-600' : 'text-slate-300'}`}>{formatTime(time)}</div><div className={`text-lg font-medium mt-2 tracking-widest uppercase ${isRunning ? 'text-indigo-400' : 'text-slate-300'}`}>{isRunning ? 'Focusing...' : (timerMode === 'pomodoro' ? 'Pomodoro Ready' : 'Ready to Start')}</div></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <button onClick={toggleTimer} className={`group relative px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 ${isRunning ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 border-2 border-amber-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 border-2 border-transparent'}`}>{isRunning ? (<><Pause className="w-6 h-6 fill-current" /> 일시정지</>) : (<><Play className="w-6 h-6 fill-current" /> 공부 시작</>)}</button>
                        {(time > 0 || isRunning || (timerMode === 'pomodoro' && time !== pomodoroDuration)) && (<button onClick={handleStopClick} className="px-8 py-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-lg hover:shadow-xl font-bold text-xl flex items-center gap-2"><Square className="w-6 h-6 fill-current" /> 종료</button>)}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6 h-[calc(100vh-9rem)] lg:sticky lg:top-24">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden flex-shrink-0">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4"><Award size={120} /></div>
                    <div className="relative z-10"><p className="text-indigo-200 font-medium mb-2 text-lg">Today's Total Focus</p><p className="text-5xl font-bold tracking-tight font-mono tabular-nums">{formatTime(displayTotalSeconds)}</p></div>
                </div>
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex-1 flex flex-col overflow-hidden">
                    <h3 className="font-bold text-slate-700 text-lg mb-4 flex items-center gap-2"><ListTodo className="text-indigo-500" size={20} /> Today's Tasks</h3>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="transform -rotate-90 w-20 h-20"><circle cx="40" cy="40" r="30" stroke="#e2e8f0" strokeWidth="6" fill="transparent" /><circle cx="40" cy="40" r="30" stroke="#4f46e5" strokeWidth="6" fill="transparent" strokeDasharray={2*Math.PI*30} strokeDashoffset={2*Math.PI*30 - (completionRate/100)*2*Math.PI*30} className="transition-all duration-500 ease-out" strokeLinecap="round" /></svg>
                            <span className="absolute text-xs font-bold text-slate-700">{completionRate}%</span>
                        </div>
                        <div className="flex-1 pl-6">
                            <div className="flex justify-between text-sm mb-2"><span className="text-slate-400">Remaining</span><span className="font-bold text-rose-500">{incompleteTodos.length}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-400">Completed</span><span className="font-bold text-indigo-600">{completedTodos.length}</span></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-slate-50 pt-4">
                         <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Incomplete List</h4>
                         {incompleteTodos.map(todo => (
                             <div key={todo.id} className="p-3 mb-2 rounded-xl border border-slate-100 bg-white shadow-sm">
                                 <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stringToColor(todo.category) }}></div>
                                     <span className="font-bold text-sm text-slate-700 flex-1 truncate">{todo.bookName || todo.category}</span>
                                     <button onClick={() => toggleTodoComplete(todo.id)} className="text-slate-300 hover:text-indigo-500"><Circle size={16} /></button>
                                 </div>
                                 {todo.subtasks && todo.subtasks.length > 0 && (
                                     <div className="mt-2 pl-3 space-y-1 border-l-2 border-slate-100">
                                         {todo.subtasks.map(sub => (
                                             <button key={sub.id} onClick={() => toggleSubtask(todo.id, sub.id)} className="flex items-center gap-2 text-xs text-slate-500 hover:text-indigo-600 w-full text-left">
                                                 {sub.completed ? <CheckSquare size={12} className="text-indigo-500" /> : <Square size={12} className="text-slate-300" />}
                                                 <span className={sub.completed ? 'line-through opacity-60' : ''}>{sub.text}</span>
                                             </button>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
  };

  const renderPlannerContent = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => ({ date: new Date(year, month, i + 1), key: i+1 }));
    const selectedTodos = todos.filter(t => t.dateKey === getDateKey(selectedDate));

    const renderCalendarView = () => {
       const firstDay = new Date(year, month, 1).getDay();
       const daysInMonth = new Date(year, month + 1, 0).getDate();
       const arr = [];
       for (let i = 0; i < firstDay; i++) arr.push({ type: 'empty', key: `e${i}` });
       for (let d = 1; d <= daysInMonth; d++) arr.push({ type: 'day', date: new Date(year, month, d), key: d });

       return (
        <div className="grid grid-cols-7 gap-2 auto-rows-fr h-full overflow-y-auto custom-scrollbar p-1">
            {arr.map((item) => {
                if (item.type === 'empty') return <div key={item.key} className="min-h-[80px]"></div>;
                const dateKey = getDateKey(item.date);
                const isSelected = getDateKey(selectedDate) === dateKey;
                const isToday = getDateKey(new Date()) === dateKey;
                const dayTodos = todos.filter(t => t.dateKey === dateKey);
                const dayEvents = events.filter(e => isEventOnDate(e, item.date));

                return (
                    <div key={item.key} onClick={() => setSelectedDate(item.date)} className={`min-h-[100px] border rounded-xl p-1.5 cursor-pointer transition-all relative flex flex-col gap-1 ${isSelected ? 'border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{item.date.getDate()}</span>
                        <div className="flex flex-col gap-1">
                            {dayEvents.map(event => (
                                <div key={event.id} className="text-[10px] px-1.5 py-0.5 rounded-md truncate border" style={{ backgroundColor: event.color + '20', color: event.color, borderColor: event.color + '40' }}>{event.title}</div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-auto">
                            {dayTodos.slice(0, 3).map((t, i) => (
                                <div key={i} className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stringToColor(t.category) }}></div>
                                    <span className={t.completed ? 'line-through opacity-50' : ''}>{t.category}</span>
                                </div>
                            ))}
                            {dayTodos.length > 3 && <span className="text-[9px] text-slate-400 pl-1">+{dayTodos.length - 3}</span>}
                        </div>
                    </div>
                );
            })}
        </div>
       )
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-7 flex flex-col h-full">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-4"><h2 className="text-xl font-bold text-slate-800"><CalendarIcon className="inline mr-2 text-indigo-600"/>{year}년 {month + 1}월</h2></div><div className="flex gap-2"><button onClick={goToToday}>Today</button><button onClick={() => navigateCalendar(-1)}><ChevronLeft/></button><button onClick={() => navigateCalendar(1)}><ChevronRight/></button></div></div>
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 shrink-0">{['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}</div>
                    <div className="flex-1 overflow-hidden min-h-0">{renderCalendarView()}</div>
                </div>
            </div>
            <div className="lg:col-span-5 flex flex-col h-full gap-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                            {editingTodoId ? <Edit2 className="text-indigo-500" size={20}/> : <Plus className="text-indigo-500" size={20} />}
                            {editingTodoId ? '할 일 수정' : '일정 추가'}
                        </h3>
                        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                            <button onClick={() => {setAddItemMode('todo'); setError(''); cancelEditing();}} className={`px-3 py-1 rounded-md transition-all ${addItemMode === 'todo' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>할 일</button>
                            <button onClick={() => {setAddItemMode('event'); setError(''); cancelEditing();}} className={`px-3 py-1 rounded-md transition-all ${addItemMode === 'event' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>기간 일정</button>
                        </div>
                    </div>
                    
                    {/* ★★★ 토글형 입력 폼 ★★★ */}
                    {addItemMode === 'todo' ? (
                        <div className="space-y-3">
                            {/* Category Select/Input Toggle */}
                            <div className="relative group flex bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 transition-all">
                                {isAddingCategory ? (
                                    <div className="flex flex-1 items-center px-3">
                                        <input autoFocus className="flex-1 bg-transparent py-3 outline-none text-sm" placeholder="새 과목 입력" value={tempInput} onChange={(e) => setTempInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem('category')} />
                                        <button onClick={() => handleAddItem('category')} className="p-1 text-indigo-600"><Check size={16} /></button>
                                        <button onClick={() => {setIsAddingCategory(false); setTempInput('')}} className="p-1 text-slate-400"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full pl-10 pr-8 py-3 bg-transparent outline-none text-sm appearance-none cursor-pointer">
                                            <option value="" disabled>과목 선택</option>
                                            {savedCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <button onClick={() => {setIsAddingCategory(true); setTempInput('');}} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 bg-white rounded shadow-sm border border-slate-100"><Plus size={14} /></button>
                                    </>
                                )}
                            </div>
                            {/* Book Select/Input Toggle */}
                            <div className="relative group flex bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500 transition-all">
                                {isAddingBook ? (
                                    <div className="flex flex-1 items-center px-3">
                                        <input autoFocus className="flex-1 bg-transparent py-3 outline-none text-sm" placeholder="새 책 입력" value={tempInput} onChange={(e) => setTempInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem('book')} />
                                        <button onClick={() => handleAddItem('book')} className="p-1 text-indigo-600"><Check size={16} /></button>
                                        <button onClick={() => {setIsAddingBook(false); setTempInput('')}} className="p-1 text-slate-400"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <select value={bookName} onChange={(e) => setBookName(e.target.value)} className="w-full pl-10 pr-8 py-3 bg-transparent outline-none text-sm appearance-none cursor-pointer">
                                            <option value="" disabled>책 선택</option>
                                            {savedBooks.map((b, i) => <option key={i} value={b}>{b}</option>)}
                                        </select>
                                        <button onClick={() => {setIsAddingBook(true); setTempInput('');}} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 bg-white rounded shadow-sm border border-slate-100"><Plus size={14} /></button>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 relative group flex bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-500">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Ch." value={chapter} onChange={(e) => setChapter(e.target.value)} className="w-full pl-10 pr-2 py-3 bg-transparent outline-none text-sm" />
                                </div>
                                <div className="flex-[1.5] flex gap-2 items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-1">
                                    <FileText size={16} className="text-slate-400" />
                                    <input type="number" placeholder="Start" value={startPage} onChange={(e) => setStartPage(e.target.value)} className="w-full bg-transparent py-2 outline-none text-sm text-right" />
                                    <span className="text-slate-400">~</span>
                                    <input type="number" placeholder="End" value={endPage} onChange={(e) => setEndPage(e.target.value)} className="w-full bg-transparent py-2 outline-none text-sm text-right" />
                                </div>
                            </div>

                            {/* Subtasks Input */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                                <label className="text-xs text-slate-400 block mb-2 font-bold">하위 업무</label>
                                <div className="space-y-2 mb-2">
                                    {subtasksInput.map((sub, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm bg-white p-2 rounded-lg border border-slate-100">
                                            <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full"></div>
                                            <span className="flex-1">{sub.text}</span>
                                            <button onClick={() => removeSubtaskFromInput(sub.id)} className="text-slate-300 hover:text-red-500"><X size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="하위 업무 추가..." 
                                        value={newSubtaskText}
                                        onChange={(e) => setNewSubtaskText(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addSubtaskToInput()}
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none"
                                    />
                                    <button onClick={addSubtaskToInput} className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"><Plus size={16} /></button>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-xs pl-1">{error}</p>}
                            <div className="flex gap-2">
                                {editingTodoId && (
                                    <button onClick={cancelEditing} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold transition-colors">취소</button>
                                )}
                                <button onClick={saveTodo} className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2">
                                    {editingTodoId ? <Edit2 size={18} /> : <Plus size={18} />} 
                                    {editingTodoId ? '수정 저장' : '할 일 추가'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {/* ★★★ 이벤트 카테고리 칩 ★★★ */}
                             <div className="flex flex-wrap gap-2 mb-2">
                                {eventCategories.map(cat => (
                                    <button key={cat.id} onClick={() => setSelectedEventCatId(cat.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1 border-2 ${selectedEventCatId === cat.id ? 'brightness-110 shadow-sm scale-105' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: selectedEventCatId === cat.id ? cat.color : 'transparent', borderColor: cat.color, color: selectedEventCatId === cat.id ? '#fff' : cat.color }}>
                                        {cat.name}
                                    </button>
                                ))}
                                {isAddingEventCat ? (
                                    <div className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1"><input autoFocus className="w-16 bg-transparent text-xs outline-none" placeholder="새 카테고리" value={newEventCatName} onChange={(e) => setNewEventCatName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addEventCategory()} /><button onClick={addEventCategory}><Check size={14} className="text-indigo-500"/></button><button onClick={() => setIsAddingEventCat(false)}><X size={14} className="text-slate-400"/></button></div>
                                ) : (
                                    <button onClick={() => setIsAddingEventCat(true)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-400 hover:bg-slate-200 flex items-center gap-1"><Plus size={12} /> 추가</button>
                                )}
                             </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 px-3 py-2"><label className="text-xs text-slate-400 block mb-1">일정 이름</label><input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="예: 중간고사" className="w-full bg-transparent outline-none text-sm font-medium" /></div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2"><label className="text-xs text-slate-400 block mb-1">시작일</label><input type="date" value={eventStartDate} onChange={(e) => setEventStartDate(e.target.value)} className="w-full bg-transparent outline-none text-xs font-medium" /></div>
                                <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 px-3 py-2"><label className="text-xs text-slate-400 block mb-1">종료일</label><input type="date" value={eventEndDate} onChange={(e) => setEventEndDate(e.target.value)} className="w-full bg-transparent outline-none text-xs font-medium" /></div>
                            </div>
                            {error && <p className="text-red-500 text-xs pl-1">{error}</p>}
                            <button onClick={addEvent} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"><CalendarRange size={18} /> 일정 추가</button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold mb-4">{selectedDate.getMonth()+1}월 {selectedDate.getDate()}일 할 일</h3>
                    {selectedTodos.map(t => (
                        <div key={t.id} className="border-b py-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-bold text-sm">
                                        {t.bookName} <span className="text-[10px] px-1.5 py-0.5 rounded ml-1 font-bold text-white" style={{backgroundColor: stringToColor(t.category)}}>{t.category}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">{t.chapter && `Chapter ${t.chapter}`} {t.pageRange}</div>
                                </div>
                                <div className="flex gap-1"><button onClick={()=>startEditingTodo(t)}><Edit2 size={14}/></button><button onClick={()=>deleteTodo(t.id)}><X size={14}/></button></div>
                            </div>
                            {t.subtasks && t.subtasks.map(s => (
                                <button key={s.id} onClick={()=>toggleSubtask(t.id, s.id)} className="flex items-center gap-2 text-xs mt-1 text-slate-600 w-full text-left">
                                    {s.completed ? <CheckSquare size={12} className="text-indigo-500"/> : <Square size={12} className="text-slate-300"/>}
                                    <span className={s.completed ? 'line-through opacity-50' : ''}>{s.text}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  const renderSummaryContent = () => {
    const now = new Date();
    let startOfPeriod = new Date();
    if(summaryPeriod === 'weekly') startOfPeriod.setDate(now.getDate() - 7);
    if(summaryPeriod === 'monthly') startOfPeriod.setMonth(now.getMonth(), 1);
    if(summaryPeriod === 'yearly') startOfPeriod.setMonth(0, 1);
    if(summaryPeriod === 'daily') startOfPeriod.setDate(now.getDate() - 1);

    const filteredRecords = records.filter(r => {
        const rd = new Date(r.isoDate || r.timestamp);
        return rd >= startOfPeriod && (summaryCategory === 'All' || r.category === summaryCategory);
    });
    const totalTime = filteredRecords.reduce((a,c) => a + c.duration, 0);
    const timelineData = [...filteredRecords].sort((a,b) => new Date(b.isoDate) - new Date(a.isoDate));

    // 스택 차트 데이터
    let chartData = [];
    if (summaryPeriod === 'daily') {
        chartData = Array.from({length: 24}, (_, i) => {
            const hourRecords = filteredRecords.filter(r => (new Date(r.isoDate).getHours()) === i);
            const catMap = {};
            hourRecords.forEach(r => {
                if(!catMap[r.category]) catMap[r.category] = {value:0, details: new Set()};
                catMap[r.category].value += r.duration;
                if(r.bookName) catMap[r.category].details.add(r.bookName);
            });
            // 3. 라벨에서 '시' 제거 (숫자만)
            return { label: `${i}`, segments: Object.entries(catMap).map(([k,v]) => ({ category: k, value: v.value, color: stringToColor(k), details: Array.from(v.details).join(', ') })), total: hourRecords.reduce((a,b)=>a+b.duration,0) };
        });
    } else if (summaryPeriod === 'weekly') {
        const days = ['일','월','화','수','목','금','토'];
        chartData = days.map((d, i) => {
            const dayRecords = filteredRecords.filter(r => new Date(r.dateKey).getDay() === i);
            const catMap = {};
            dayRecords.forEach(r => {
                if(!catMap[r.category]) catMap[r.category] = {value:0, details: new Set()};
                catMap[r.category].value += r.duration;
                if(r.bookName) catMap[r.category].details.add(r.bookName);
            });
            return { label: d, segments: Object.entries(catMap).map(([k,v]) => ({ category: k, value: v.value, color: stringToColor(k), details: Array.from(v.details).join(', ') })), total: dayRecords.reduce((a,b)=>a+b.duration,0) };
        });
    } else if (summaryPeriod === 'monthly') {
        const lastDay = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
        chartData = Array.from({length: lastDay}, (_, i) => {
            const dayRecords = filteredRecords.filter(r => new Date(r.dateKey).getDate() === i+1);
            const catMap = {};
            dayRecords.forEach(r => {
                if(!catMap[r.category]) catMap[r.category] = {value:0, details: new Set()};
                catMap[r.category].value += r.duration;
                if(r.bookName) catMap[r.category].details.add(r.bookName);
            });
            return { label: `${i+1}`, segments: Object.entries(catMap).map(([k,v]) => ({ category: k, value: v.value, color: stringToColor(k), details: Array.from(v.details).join(', ') })), total: dayRecords.reduce((a,b)=>a+b.duration,0) };
        });
    } else if (summaryPeriod === 'yearly') {
        chartData = Array.from({length: 12}, (_, i) => {
            const monthRecords = filteredRecords.filter(r => new Date(r.dateKey).getMonth() === i);
            const catMap = {};
            monthRecords.forEach(r => {
                if(!catMap[r.category]) catMap[r.category] = {value:0, details: new Set()};
                catMap[r.category].value += r.duration;
                if(r.bookName) catMap[r.category].details.add(r.bookName);
            });
            return { label: `${i+1}월`, segments: Object.entries(catMap).map(([k,v]) => ({ category: k, value: v.value, color: stringToColor(k), details: Array.from(v.details).join(', ') })), total: monthRecords.reduce((a,b)=>a+b.duration,0) };
        });
    }
    const maxChartValue = Math.max(...chartData.map(d => d.total), 1);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            <div className="lg:col-span-12 flex justify-between items-center bg-white p-4 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-2"><BarChart3 className="text-indigo-600"/><h2 className="font-bold text-lg">Analytics</h2></div>
                <div className="flex gap-3">
                    <select onChange={e=>setSummaryCategory(e.target.value)} className="border rounded p-1 text-sm"><option value="All">All</option>{savedCategories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded">{['daily','weekly','monthly','yearly'].map(p=><button key={p} onClick={()=>setSummaryPeriod(p)} className={`px-2 py-1 text-xs rounded ${summaryPeriod===p?'bg-white shadow':''}`}>{p}</button>)}</div>
                </div>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border"><h3 className="text-slate-400 text-xs font-bold mb-2">TOTAL TIME</h3><p className="text-3xl font-bold">{formatTimeShort(totalTime)}</p></div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border"><h3 className="text-slate-400 text-xs font-bold mb-2">SESSIONS</h3><p className="text-3xl font-bold">{filteredRecords.length}</p></div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border flex-1 min-h-[300px]">
                    <h3 className="font-bold mb-4">Focus Trend</h3>
                    <div className="flex items-end h-64 gap-2 border-b pb-2 overflow-x-auto">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end min-w-[20px]">
                                <div className="relative w-full bg-slate-50 rounded-t overflow-visible flex flex-col-reverse justify-start h-full">
                                    {d.segments.map((seg, idx) => (
                                        // 3. 차트 z-index 수정: group-hover:z-50 추가
                                        <div 
                                            key={idx} 
                                            className="w-full hover:brightness-110 transition-all relative group/segment hover:z-50" 
                                            style={{ height: `${(seg.value / maxChartValue) * 100}%`, backgroundColor: seg.color }}
                                        >
                                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover/segment:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                                                <div className="font-bold text-indigo-200 mb-0.5">{seg.category} ({Math.floor(seg.value/60)}m)</div>
                                                {seg.details && <div className="opacity-80 max-w-[120px] truncate">{seg.details}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[10px] text-slate-400 truncate w-full text-center">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border flex flex-col h-full max-h-[calc(100vh-12rem)]">
                <div className="flex justify-between items-center mb-4"><h3 className="font-bold flex gap-2 items-center"><History size={18}/> History</h3><button onClick={()=>setIsManualRecordModalOpen(true)} className="bg-indigo-50 p-1 rounded text-indigo-600"><Plus size={16}/></button></div>
                <div className="overflow-y-auto flex-1 space-y-3 custom-scrollbar pr-2">
                    {timelineData.map(r => (
                        <div key={r.id} onClick={()=>setExpandedRecordId(expandedRecordId===r.id?null:r.id)} className={`border-l-2 pl-3 cursor-pointer transition-all ${expandedRecordId===r.id?'border-indigo-500':'border-slate-200'}`}>
                            <div className="text-xs text-slate-400">{r.dateDisplay} <span className="ml-1">{r.timeRange}</span></div>
                            <div className="font-bold text-sm text-slate-700">{r.category} <span className="text-indigo-600 ml-2">{formatTimeShort(r.duration)}</span></div>
                            <div className="text-xs text-slate-500">{r.bookName}</div>
                            {expandedRecordId===r.id && r.review && <div className="mt-2 text-xs bg-slate-50 p-2 rounded italic">"{r.review.comment}"</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100 flex flex-col relative">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-lg text-white shadow-md"><Clock size={24} strokeWidth={2.5} /></div><h1 className="text-xl font-bold text-slate-800 hidden md:block">Study Focus</h1></div>
           <div className="flex bg-slate-100 p-1 rounded-xl">
                {['timer', 'planner', 'summary'].map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t}</button>
                ))}
           </div>
        </div>
        <div className="flex items-center gap-4">
            {activeTab !== 'timer' && <div className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-2"><CalendarIcon size={14} />{new Date().toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>}
            <button onClick={() => setIsDDayModalOpen(true)} className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 transition-colors px-4 py-2 rounded-full group">
                <div className="flex flex-col items-end leading-none"><span className="text-[10px] text-slate-400 font-bold">{dDay.title}</span><span className="text-sm font-bold text-indigo-600">{dDay.date ? (calculateDDay() === 0 ? 'D-Day' : calculateDDay() > 0 ? `D-${calculateDDay()}` : `D+${Math.abs(calculateDDay())}`) : '설정'}</span></div><Flag size={16} className="text-slate-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={handleLogout} className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"><LogOut size={18}/></button>
        </div>
      </nav>
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-8">
        {activeTab === 'timer' ? renderTimerContent() : activeTab === 'planner' ? renderPlannerContent() : renderSummaryContent()}
      </div>
      {renderDDayModal()} {renderReviewModal()} {renderManualRecordModal()}
      <CustomStyles />
    </div>
  );
}