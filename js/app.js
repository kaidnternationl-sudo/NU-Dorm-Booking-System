// نظام حجز السكن الجامعي - جامعة نجران
// النسخة النهائية مع الأمان المتكامل

class DormSystem {
    constructor() {
        this.currentUser = null;
        this.selectedRoom = null;
        this.timer = null;
        this.fixedRooms = null; // مصفوفة الغرف الثابتة
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuth();
        this.generateFixedData();
    }

    generateFixedData() {
        // توليد بيانات ثابتة للمباني
        if (!localStorage.getItem('fixedBuildings')) {
            this.buildings = {
                male: this.generateMaleBuildings(),
                female: this.generateFemaleBuildings()
            };
            localStorage.setItem('fixedBuildings', JSON.stringify(this.buildings));
        } else {
            this.buildings = JSON.parse(localStorage.getItem('fixedBuildings'));
        }

        // توليد غرف ثابتة (تتولد مرة واحدة فقط)
        if (!localStorage.getItem('fixedRooms')) {
            this.rooms = this.generateDynamicRooms();
            localStorage.setItem('fixedRooms', JSON.stringify(this.rooms));
            this.fixedRooms = this.rooms;
        } else {
            this.rooms = JSON.parse(localStorage.getItem('fixedRooms'));
            this.fixedRooms = this.rooms;
        }
        
        // طلاب ديناميكيين
        this.students = this.generateDynamicStudents();
        
        // حجوزات سابقة
        this.reservations = JSON.parse(localStorage.getItem('all_reservations')) || [];
    }

    // باقي الكود كما هو مع إضافة:
    
    // دالة لتحديث حالة الغرفة فقط
    updateRoomStatusOnly(roomId, status) {
        if (this.fixedRooms) {
            const roomIndex = this.fixedRooms.findIndex(room => room.id === roomId);
            if (roomIndex !== -1) {
                this.fixedRooms[roomIndex].status = status;
                // تحديث في localStorage
                const updatedRooms = [...this.fixedRooms];
                localStorage.setItem('fixedRooms', JSON.stringify(updatedRooms));
                this.rooms = updatedRooms;
            }
        }
    }
    
    // دالة لمنع الوصول إلى لوحة التحكم
    preventAdminAccess() {
        const userType = localStorage.getItem('userType');
        const currentPage = window.location.pathname;
        
        if (userType && currentPage.includes('admin-dashboard')) {
            alert('⚠️ الوصول ممنوع! هذه الصفحة مخصصة للإدارة فقط.');
            window.location.href = 'building_selection.html';
            return false;
        }
        return true;
    }
    
    // دالة لفصل مسارات المستخدمين
    setupUserFlow() {
        const userType = localStorage.getItem('userType');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (userType && !isAdmin) {
            // مسار الطالب العادي
            this.hideAdminLinks();
        }
    }
    
    hideAdminLinks() {
        // إخفاء روابط الإدارة من واجهة الطالب
        const adminLinks = document.querySelectorAll('[href*="admin"], [onclick*="admin"]');
        adminLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
}

// تهيئة النظام
window.dormSystem = new DormSystem();

// التحقق من الوصول عند تحميل كل صفحة
document.addEventListener('DOMContentLoaded', function() {
    if (window.dormSystem) {
        window.dormSystem.preventAdminAccess();
        window.dormSystem.setupUserFlow();
    }
});
