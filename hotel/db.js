// ===== БАЗА ДАННЫХ (localStorage как общее хранилище) =====

const DB = {
  // --- Пользователи ---
  getUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
  },
  findUser(email, password) {
    return this.getUsers().find(u => u.email === email && u.password === password);
  },
  registerUser(data) {
    const users = this.getUsers();
    if (users.find(u => u.email === data.email)) return null;
    const user = { id: Date.now(), role: 'client', ...data };
    users.push(user);
    this.saveUsers(users);
    return user;
  },

  // --- Номера ---
  getRooms() {
    return JSON.parse(localStorage.getItem('rooms') || '[]');
  },
  saveRooms(rooms) {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  },
  addRoom(data) {
    const rooms = this.getRooms();
    const room = { id: Date.now(), status: 'свободен', ...data };
    rooms.push(room);
    this.saveRooms(rooms);
    return room;
  },
  updateRoom(id, data) {
    const rooms = this.getRooms().map(r => r.id === id ? { ...r, ...data } : r);
    this.saveRooms(rooms);
  },
  deleteRoom(id) {
    this.saveRooms(this.getRooms().filter(r => r.id !== id));
  },

  // --- Бронирования ---
  getBookings() {
    return JSON.parse(localStorage.getItem('bookings') || '[]');
  },
  saveBookings(b) {
    localStorage.setItem('bookings', JSON.stringify(b));
  },
  addBooking(data) {
    const bookings = this.getBookings();
    const booking = { id: Date.now(), status: 'ожидает', createdAt: new Date().toISOString(), ...data };
    bookings.push(booking);
    this.saveBookings(bookings);
    return booking;
  },
  updateBooking(id, data) {
    const bookings = this.getBookings().map(b => b.id === id ? { ...b, ...data } : b);
    this.saveBookings(bookings);
  },
  cancelBooking(id) {
    const booking = this.getBookings().find(b => b.id === id);
    this.updateBooking(id, { status: 'отменено' });
    // Освобождаем номер только если не осталось активных броней на него
    if (booking) {
      const hasActive = this.getBookings().some(b =>
        b.id !== id &&
        b.roomId === booking.roomId &&
        (b.status === 'ожидает' || b.status === 'подтверждено')
      );
      if (!hasActive) this.updateRoom(booking.roomId, { status: 'свободен' });
    }
  },

  // --- Уведомления ---
  getNotifications(userId) {
    const all = JSON.parse(localStorage.getItem('notifications') || '[]');
    return userId ? all.filter(n => n.userId === userId) : all;
  },
  addNotification(userId, text) {
    const all = JSON.parse(localStorage.getItem('notifications') || '[]');
    all.push({ id: Date.now(), userId, text, date: new Date().toISOString(), read: false });
    localStorage.setItem('notifications', JSON.stringify(all));
  },
  markRead(userId) {
    const all = JSON.parse(localStorage.getItem('notifications') || '[]');
    localStorage.setItem('notifications', JSON.stringify(
      all.map(n => n.userId === userId ? { ...n, read: true } : n)
    ));
  },

  // --- Сессия (sessionStorage — независима для каждой вкладки) ---
  getSession() {
    return JSON.parse(sessionStorage.getItem('session') || 'null');
  },
  setSession(user) {
    sessionStorage.setItem('session', JSON.stringify(user));
  },
  clearSession() {
    sessionStorage.removeItem('session');
  },

  // --- Инициализация демо-данных ---
  init() {
    if (this.getUsers().length === 0) {
      this.saveUsers([
        { id: 1, role: 'admin', fio: 'Администратор', email: 'admin@hotel.ru', password: 'admin123', phone: '' },
        { id: 2, role: 'client', fio: 'Иван Иванов', email: 'client@hotel.ru', password: 'client123', phone: '+7 900 000-00-00' }
      ]);
    }
    if (this.getRooms().length === 0) {
      this.saveRooms([
        { id: 101, number: '101', type: 'Стандарт', price: 2500, status: 'свободен', description: 'Уютный номер с видом на двор' },
        { id: 102, number: '102', type: 'Люкс', price: 5000, status: 'свободен', description: 'Просторный номер с балконом' },
        { id: 103, number: '201', type: 'Стандарт', price: 2800, status: 'свободен', description: 'Номер на втором этаже' },
        { id: 104, number: '202', type: 'Полулюкс', price: 3500, status: 'свободен', description: 'Номер с джакузи' },
      ]);
    }
  }
};

DB.init();
