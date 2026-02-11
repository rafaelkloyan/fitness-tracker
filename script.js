// Данные приложения
let appData = {
    currentDay: new Date().toDateString(),
    dailyFood: { breakfast: [], lunch: [], dinner: [] },
    dailyMacros: { protein: 0, carbs: 0, fat: 0 },
    workoutData: { day1: {}, day2: {}, day3: {} },
    streak: 0,
    weeklyHistory: []
};

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateUI();
    setupEventListeners();
    
    // Установка сегодняшней даты
    document.getElementById('today-date').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Загрузка данных из localStorage
function loadData() {
    const saved = localStorage.getItem('fitnessTrackerData');
    if (saved) {
        appData = JSON.parse(saved);
        
        // Если это новый день, сохраняем в историю и сбрасываем дневные данные
        if (appData.currentDay !== new Date().toDateString()) {
            saveToHistory();
            resetDailyData();
        }
    }
}

// Сохранение данных
function saveData() {
    localStorage.setItem('fitnessTrackerData', JSON.stringify(appData));
}

// Сохранение дня в историю
function saveToHistory() {
    const historyEntry = {
        date: appData.currentDay,
        macros: { ...appData.dailyMacros },
        trained: Object.keys(appData.workoutData).some(day => 
            Object.keys(appData.workoutData[day]).length > 0
        )
    };
    
    appData.weeklyHistory.unshift(historyEntry);
    
    // Храним только последние 7 дней
    if (appData.weeklyHistory.length > 7) {
        appData.weeklyHistory.pop();
    }
    
    // Обновляем серию дней
    if (appData.dailyMacros.protein >= 80 && appData.dailyMacros.carbs <= 220) {
        appData.streak++;
    } else {
        appData.streak = 0;
    }
}

// Сброс дневных данных
function resetDailyData() {
    appData.currentDay = new Date().toDateString();
    appData.dailyFood = { breakfast: [], lunch: [], dinner: [] };
    appData.dailyMacros = { protein: 0, carbs: 0, fat: 0 };
}

// Обновление интерфейса
function updateUI() {
    updateMacrosDisplay();
    updateMealCards();
    updateProgressCircles();
    updateHistoryTable();
    updateStats();
}

// Обновление макросов
function updateMacrosDisplay() {
    const { protein, carbs, fat } = appData.dailyMacros;
    
    // Обновляем текст
    document.getElementById('protein-circle').innerHTML = 
        `<span>${protein}/100г</span>`;
    document.getElementById('carbs-circle').innerHTML = 
        `<span>${carbs}/200г</span>`;
    document.getElementById('fats-circle').innerHTML = 
        `<span>${fat}/85г</span>`;
    
    // Обновляем круги прогресса
    updateProgressCircle('protein-circle', protein, 100);
    updateProgressCircle('carbs-circle', carbs, 200);
    updateProgressCircle('fats-circle', fat, 85);
}

// Обновление круга прогресса
function updateProgressCircle(elementId, current, max) {
    const circle = document.getElementById(elementId);
    const percentage = (current / max) * 100;
    circle.style.background = `conic-gradient(var(--success) ${percentage}%, #eee ${percentage}%)`;
}

// Обновление карточек приёмов пищи
function updateMealCards() {
    for (const meal in appData.dailyFood) {
        const mealCard = document.querySelector(`[data-meal="${meal}"] .meal-items`);
        mealCard.innerHTML = '';
        
        appData.dailyFood[meal].forEach((item, index) => {
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            mealItem.innerHTML = `
                <span>${item.name}</span>
                <span>${item.protein}Б/${item.carbs}У/${item.fat}Ж</span>
                <button onclick="removeFoodItem('${meal}', ${index})" class="delete-btn">🗑️</button>
            `;
            mealCard.appendChild(mealItem);
        });
    }
}

// Добавление еды
function addFoodItem() {
    const name = document.getElementById('food-name').value;
    const protein = parseInt(document.getElementById('food-protein').value);
    const carbs = parseInt(document.getElementById('food-carbs').value);
    const fat = parseInt(document.getElementById('food-fat').value);
    const meal = document.getElementById('food-meal').value;
    
    if (!name) {
        alert('Введите название продукта!');
        return;
    }
    
    const foodItem = { name, protein, carbs, fat };
    
    appData.dailyFood[meal].push(foodItem);
    appData.dailyMacros.protein += protein;
    appData.dailyMacros.carbs += carbs;
    appData.dailyMacros.fat += fat;
    
    saveData();
    updateUI();
    closeMealModal();
    
    // Очистка формы
    document.getElementById('food-name').value = '';
    document.getElementById('food-protein').value = '0';
    document.getElementById('food-carbs').value = '0';
    document.getElementById('food-fat').value = '0';
}

// Быстрое добавление
function addQuickItem(name, protein, carbs, fat, meal) {
    const foodItem = { name, protein, carbs, fat };
    
    appData.dailyFood[meal].push(foodItem);
    appData.dailyMacros.protein += protein;
    appData.dailyMacros.carbs += carbs;
    appData.dailyMacros.fat += fat;
    
    saveData();
    updateUI();
}

// Удаление еды
function removeFoodItem(meal, index) {
    const item = appData.dailyFood[meal][index];
    
    appData.dailyMacros.protein -= item.protein;
    appData.dailyMacros.carbs -= item.carbs;
    appData.dailyMacros.fat -= item.fat;
    
    appData.dailyFood[meal].splice(index, 1);
    
    saveData();
    updateUI();
}

// Модальное окно
function openMealModal(meal) {
    document.getElementById('food-meal').value = meal;
    document.getElementById('meal-modal').style.display = 'flex';
}

function closeMealModal() {
    document.getElementById('meal-modal').style.display = 'none';
}

// Навигация по вкладкам
function setupEventListeners() {
    // Переключение вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Убираем активный класс у всех
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Переключение дней тренировок
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            
            document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.workout-day').forEach(d => d.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`day-${day}`).classList.add('active');
        });
    });
    
    // Сохранение заметок по тренировкам
    document.querySelectorAll('.workout-notes .save-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const day = this.closest('.workout-day').id.replace('day-', '');
            const notes = this.previousElementSibling.value;
            
            appData.workoutData[`day${day}`] = { notes, date: new Date().toISOString() };
            saveData();
            alert('Тренировка сохранена! 💪');
        });
    });
}

// Обновление таблицы истории
function updateHistoryTable() {
    const tbody = document.getElementById('history-body');
    tbody.innerHTML = '';
    
    appData.weeklyHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(entry.date).toLocaleDateString('ru-RU')}</td>
            <td>${entry.macros.protein}г</td>
            <td>${entry.macros.carbs}г</td>
            <td>${entry.macros.fat}г</td>
            <td>${entry.trained ? '✅' : '❌'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Обновление статистики
function updateStats() {
    document.getElementById('streak').textContent = appData.streak;
    
    // Сумма белка за последние 7 дней
    const weeklyProtein = appData.weeklyHistory
        .reduce((sum, day) => sum + day.macros.protein, 0);
    document.getElementById('weekly-protein').textContent = `${weeklyProtein}г`;
    
    // Количество тренировок за последние 30 дней (пример)
    const monthlyWorkouts = appData.weeklyHistory
        .filter(day => day.trained).length;
    document.getElementById('monthly-workouts').textContent = monthlyWorkouts;
}

// Сброс дня
function resetDay() {
    if (confirm('Точно сбросить все данные за сегодня?')) {
        resetDailyData();
        saveData();
        updateUI();
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('meal-modal');
    if (event.target === modal) {
        closeMealModal();
    }
};
