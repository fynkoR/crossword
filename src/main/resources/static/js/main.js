// Главный файл инициализации приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, авторизован ли пользователь
    const currentUser = authManager.getCurrentUser();
    
    if (currentUser) {
        // Показываем главный экран
        document.getElementById('auth-screen').classList.remove('active');
        document.getElementById('dashboard-screen').classList.add('active');
        document.getElementById('user-name').textContent = currentUser.login || 'Пользователь';
    } else {
        // Показываем экран авторизации
        document.getElementById('auth-screen').classList.add('active');
    }
    
    // Закрытие модальных окон по клику вне их
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    console.log('Приложение инициализировано');
});

