document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskCategory = document.getElementById('taskCategory');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const STORAGE_KEY = 'focusFlowTasks';
    const LONG_PRESS_DURATION = 800; // 800 миллисекунд для долгого нажатия

    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    let pressTimer;

    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item', task.category);
            if (task.completed) {
                li.classList.add('completed');
            }

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            taskText.addEventListener('click', () => toggleComplete(index));

            // --- ОБРАБОТЧИКИ ДОЛГОГО НАЖАТИЯ ---

            // Для десктопа (правая кнопка мыши)
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault(); // Предотвращаем стандартное меню браузера
                deleteTask(index);
            });

            // Для мобильных устройств (сенсорный экран)
            li.addEventListener('touchstart', (e) => {
                // Запускаем таймер при касании
                pressTimer = setTimeout(() => {
                    // Если таймер сработал (пользователь держал палец долго)
                    deleteTask(index);
                    // Опционально: можно добавить виброотклик, если это PWA с доступом к API
                    if (navigator.vibrate) {
                        navigator.vibrate(50); 
                    }
                }, LONG_PRESS_DURATION);
            });

            li.addEventListener('touchend', () => {
                // Если палец отпущен до истечения таймера, отменяем удаление
                clearTimeout(pressTimer);
            });

            li.addEventListener('touchcancel', () => {
                // Если касание прервано (например, скроллом), отменяем удаление
                clearTimeout(pressTimer);
            });
            
            // --- КОНЕЦ ОБРАБОТЧИКОВ ---

            li.appendChild(taskText);
            // Кнопку удаления больше не добавляем
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        const category = taskCategory.value;

        if (text === '') return;

        tasks.push({ text: text, completed: false, category: category });
        saveTasks();
        renderTasks();
        taskInput.value = '';
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function deleteTask(index) {
        // Добавляем подтверждение, чтобы избежать случайных удалений
        if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    }

    addButton.addEventListener('click', addTask);

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    renderTasks();
});
