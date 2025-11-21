// Управление авторизацией
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Восстановление сессии из localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }

        // Обработчики форм
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Переключение вкладок
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tab) {
        // Обновляем кнопки вкладок
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Обновляем формы
        document.getElementById('login-form').classList.toggle('active', tab === 'login');
        document.getElementById('register-form').classList.toggle('active', tab === 'register');

        // Очищаем ошибки
        document.getElementById('login-error').classList.remove('show');
        document.getElementById('register-error').classList.remove('show');
    }

    async handleLogin() {
        const login = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            errorDiv.classList.remove('show');
            const user = await ApiService.login(login, password);
            
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            this.showDashboard();
        } catch (error) {
            errorDiv.textContent = 'Неверный логин или пароль';
            errorDiv.classList.add('show');
        }
    }

    async handleRegister() {
        const login = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const errorDiv = document.getElementById('register-error');

        try {
            errorDiv.classList.remove('show');
            const user = await ApiService.register(login, password);
            
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            this.showDashboard();
        } catch (error) {
            errorDiv.textContent = 'Ошибка регистрации. Возможно, пользователь с таким логином уже существует.';
            errorDiv.classList.add('show');
        }
    }

    showDashboard() {
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.login || 'Пользователь';
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('auth-screen').classList.add('active');
        document.getElementById('dashboard-screen').classList.remove('active');
        document.getElementById('dictionary-screen').classList.remove('active');
        document.getElementById('game-screen').classList.remove('active');
        
        // Очищаем формы
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Глобальный экземпляр
const authManager = new AuthManager();

