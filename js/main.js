// نظام حجز السكن الجامعي - جامعة نجران
// الملف الرئيسي للتطبيق

class DormSystem {
    constructor() {
        this.currentUser = null;
        this.selectedRoom = null;
        this.init();
    }

    init() {
        this.loadData();
        this.checkAuth();
    }

    loadData() {
        // تحميل البيانات من localStorage
        this.currentUser = JSON.parse(localStorage.getItem('userData')) || null;
        this.selectedRoom = JSON.parse(localStorage.getItem('selectedRoom')) || null;
        
        // بيانات الطلاب
        this.students = JSON.parse(localStorage.getItem('students')) || [
            {
                id: '1087654321',
                name: 'محمد أحمد العتيبي',
                gender: 'male',
                gpa: 4.8,
                college: 'كلية علوم الحاسب',
                city: 'الرياض',
                priority: 95
            }
        ];

        // بيانات المباني
        this.buildings = {
            male: [
                { id: 'M-01', name: 'مبنى الطلاب 1', floors: 5, available: 45 },
                { id: 'M-02', name: 'مبنى الطلاب 2', floors: 4, available: 32 },
                { id: 'M-03', name: 'مبنى الطلاب 3', floors: 6, available: 28 }
            ],
            female: [
                { id: 'F-A', name: 'مبنى الطالبات أ', floors: 4, available: 40 },
                { id: 'F-B', name: 'مبنى الطالبات ب', floors: 5, available: 36 },
                { id: 'F-C', name: 'مبنى الطالبات ج', floors: 3, available: 24 }
            ]
        };
    }

    login(idNumber, userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.currentUser = {
                    id: idNumber,
                    ...userData
                };
                
                localStorage.setItem('userData', JSON.stringify(this.currentUser));
                localStorage.setItem('loggedIn', 'true');
                
                resolve(true);
            }, 1000);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('userData');
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('selectedRoom');
        window.location.href = 'index.html';
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('loggedIn');
        if (!isLoggedIn && window.location.pathname.includes('dashboard')) {
            window.location.href = 'login.html';
        }
    }

    selectRoom(room) {
        this.selectedRoom = room;
        localStorage.setItem('selectedRoom', JSON.stringify(room));
        return true;
    }

    confirmReservation() {
        if (!this.selectedRoom) {
            return false;
        }

        const reservation = {
            id: 'RES-' + Date.now(),
            studentId: this.currentUser?.id,
            room: this.selectedRoom,
            date: new Date(),
            status: 'مؤكد'
        };

        // حفظ الحجز
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        return reservation;
    }
}

// تهيئة النظام
window.dormSystem = new DormSystem();
