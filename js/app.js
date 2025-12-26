// نظام حجز السكن الجامعي - جامعة نجران
// الملف الرئيسي للتطبيق

class DormSystem {
    constructor() {
        this.currentUser = null;
        this.selectedRoom = null;
        this.timer = null;
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuth();
    }

    loadData() {
        // جلب رقم الهوية من localStorage إن وجد
        const storedId = localStorage.getItem('national_id');
        
        this.students = JSON.parse(localStorage.getItem('students')) || [
            {
                id: storedId || '441234567', // استخدام الرقم المخزن أو الرقم الافتراضي
                name: 'محمد أحمد العتيبي',
                gender: 'male',
                gpa: 4.8,
                college: 'كلية علوم الحاسب',
                city: 'الرياض',
                region: 'الرياض',
                priority: 95,
                status: 'منتظم'
            }
        ];

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

        this.rooms = this.generateRooms();
    }

    generateRooms() {
        let rooms = [];
        
        for (let building of this.buildings.male) {
            for (let floor = 1; floor <= building.floors; floor++) {
                for (let room = 1; room <= 10; room++) {
                    rooms.push({
                        id: `${building.id}-${floor}${room.toString().padStart(2, '0')}`,
                        building: building.id,
                        floor: floor,
                        number: room,
                        type: Math.random() > 0.5 ? 'فردية' : 'مزدوجة',
                        capacity: Math.random() > 0.5 ? 1 : 2,
                        price: Math.random() > 0.5 ? 5000 : 7500,
                        status: Math.random() > 0.7 ? 'محجوزة' : 'متاحة',
                        gender: 'male',
                        facilities: ['سرير', 'مكتب', 'خزانة', 'إنترنت']
                    });
                }
            }
        }

        for (let building of this.buildings.female) {
            for (let floor = 1; floor <= building.floors; floor++) {
                for (let room = 1; room <= 8; room++) {
                    rooms.push({
                        id: `${building.id}-${floor}${room.toString().padStart(2, '0')}`,
                        building: building.id,
                        floor: floor,
                        number: room,
                        type: Math.random() > 0.5 ? 'فردية' : 'مزدوجة',
                        capacity: Math.random() > 0.5 ? 1 : 2,
                        price: Math.random() > 0.5 ? 5000 : 7500,
                        status: Math.random() > 0.7 ? 'محجوزة' : 'متاحة',
                        gender: 'female',
                        facilities: ['سرير', 'مكتب', 'خزانة', 'إنترنت', 'مرآة']
                    });
                }
            }
        }

        return rooms;
    }

    calculatePriority(student) {
        let score = 0;
        
        score += (student.gpa / 5) * 40;
        
        const distanceScore = this.calculateDistanceScore(student.city);
        score += distanceScore * 40;
        
        score += 20;
        
        return Math.min(100, Math.round(score));
    }

    calculateDistanceScore(city) {
        const distances = {
            'نجران': 0.1,
            'شرورة': 0.8,
            'الرياض': 0.9,
            'جدة': 0.9,
            'الدمام': 1.0,
            'أبها': 0.7,
            'جازان': 0.8
        };
        
        return distances[city] || 0.5;
    }

    login(idNumber, gender) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // استخدام الرقم من localStorage إن وجد
                const storedId = localStorage.getItem('national_id') || idNumber;
                
                this.currentUser = {
                    id: storedId,
                    gender: gender,
                    loginTime: new Date(),
                    sessionId: 'SESS-' + Date.now()
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                localStorage.setItem('userType', gender);
                
                resolve(true);
            }, 1500);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('selectedRoom');
        localStorage.removeItem('national_id');
        window.location.href = '/';
    }

    selectRoom(room) {
        if (room.status !== 'متاحة') {
            alert('هذه الغرفة غير متاحة للحجز');
            return false;
        }

        this.selectedRoom = room;
        
        localStorage.setItem('selectedRoom', JSON.stringify({
            ...room,
            selectedAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60000)
        }));

        this.startTimer(300);

        return true;
    }

    startTimer(seconds) {
        if (this.timer) clearInterval(this.timer);
        
        let timeLeft = seconds;
        this.timer = setInterval(() => {
            timeLeft--;
            
            const timerElement = document.getElementById('reservation-timer');
            if (timerElement) {
                const minutes = Math.floor(timeLeft / 60);
                const secs = timeLeft % 60;
                timerElement.textContent = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(this.timer);
                localStorage.removeItem('selectedRoom');
                this.selectedRoom = null;
                alert('انتهت مهلة الحجز. يرجى البدء من جديد.');
            }
        }, 1000);
    }

    confirmReservation() {
        if (!this.selectedRoom) {
            alert('لم يتم اختيار غرفة');
            return false;
        }

        const reservation = {
            id: 'RES-' + Date.now(),
            studentId: this.currentUser?.id,
            room: this.selectedRoom,
            date: new Date(),
            status: 'مؤكد',
            paymentStatus: 'بانتظار الدفع',
            reference: 'REF-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        };

        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        reservations.push(reservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));

        this.selectedRoom.status = 'محجوزة';
        this.updateRoomStatus(this.selectedRoom.id, 'محجوزة');

        clearInterval(this.timer);
        localStorage.removeItem('selectedRoom');

        return reservation;
    }

    updateRoomStatus(roomId, status) {
        console.log(`تحديث حالة الغرفة ${roomId} إلى ${status}`);
    }

    checkAuth() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    }

    setupEventListeners() {
        // سيتم تنفيذ هذا في كل صفحة حسب الحاجة
    }

    generateTermsPDF(studentName, roomDetails) {
        const content = `
            <html>
            <head>
                <meta charset="UTF-8">
                <title>تعهد السكن الجامعي</title>
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .content { line-height: 1.8; }
                    .signature { margin-top: 50px; border-top: 1px solid #000; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>جامعة نجران</h1>
                    <h2>تعهد السكن الجامعي</h2>
                </div>
                
                <div class="content">
                    <p>أنا الموقع أدناه ${studentName} أتعهد بالآتي:</p>
                    
                    <ol>
                        <li>الالتزام بأنظمة ولوائح السكن الجامعي</li>
                        <li>الحفاظ على الممتلكات العامة والخاصة</li>
                        <li>احترام مواعيد الدخول والخروج</li>
                        <li>عدم إيذاء الآخرين أو إزعاجهم</li>
                        <li>دفع الرسوم في المواعيد المحددة</li>
                    </ol>
                    
                    <p><strong>تفاصيل الحجز:</strong></p>
                    <p>رقم الغرفة: ${roomDetails.id}</p>
                    <p>نوع الغرفة: ${roomDetails.type}</p>
                    <p>السعر: ${roomDetails.price} ريال</p>
                    
                    <div class="signature">
                        <p>التوقيع: ________________________</p>
                        <p>الاسم: ${studentName}</p>
                        <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return content;
    }
}

window.dormSystem = new DormSystem();
