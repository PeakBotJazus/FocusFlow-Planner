document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskCategorySelect = document.getElementById('taskCategory');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const categoryModal = document.getElementById('categoryModal');
    const closeModal = document.querySelector('.close');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const newCategoryNameInput = document.getElementById('newCategoryName');
    const newCategoryColorInput = document.getElementById('newCategoryColor');
    const categoryListUl = document.getElementById('categoryList');

    const TASKS_STORAGE_KEY = 'focusFlowTasks';
    const CATEGORIES_STORAGE_KEY = 'focusFlowCategories';
    const LONG_PRESS_DURATION = 800;

    let tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
    // Начальные категории по умолчанию
    let categories = JSON.parse(localStorage.getItem(CATEGORIES_STORAGE_KEY)) || [
        { id: 'personal', name: 'Личное', color: '#ff5733' },
        { id: 'work', name: 'Работа', color: '#007bff' },
        { id: 'health', name: 'Здоровье', color: '#28a745' }
    ];

    let pressTimer;

    function saveTasks() {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    function saveCategories() {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        renderCategorySelect(); // Обновляем выпадающий список после сохранения
        renderCategoryManagementList(); // Обновляем список в модалке
    }

    // --- Функции для категорий ---

    function renderCategorySelect() {
        taskCategorySelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            taskCategorySelect.appendChild(option);
        });
    }

    function renderCategoryManagementList() {
        categoryListUl.innerHTML = '';
        categories.forEach((category, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span style="color: ${category.color};">■</span>
                ${category.name}
                <button class="remove-category-btn" data-index="${index}">Удалить</button>
            `;
            categoryListUl.appendChild(li);
        });

        // Добавляем обработчики удаления для кнопок в списке управления
        document.querySelectorAll('.remove-category-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeCategory(index);
            });
        });
    }

    function addCategory() {
        const name = newCategoryNameInput.value.trim();
        const color = newCategoryColorInput.value;
        if (name === '') return;

        // Создаем уникальный ID
        const id = name.toLowerCase().replace(/\s/g, '-'); 

        categories.push({ id, name, color });
        saveCategories();
        newCategoryNameInput.value = '';
    }

    function removeCategory(index) {
        // Простая защита от удаления категорий по умолчанию или если в них есть задачи
        const categoryId = categories[index].id;
        const tasksInCategory = tasks.some(task => task.category === categoryId);

        if (tasksInCategory) {
            alert('Невозможно удалить категорию, в которой есть задачи. Сначала удалите задачи.');
            return;
        }

        if (categories.length <= 1) {
             alert('Должна быть хотя бы одна категория.');
             return;
        }

        categories.splice(index, 1);
        saveCategories();
    }

    // --- Функции для задач (немного изменены) ---

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            if (task.completed) {
                li.classList.add('completed');
            }

            // Находим цвет категории для задачи
            const category = categories.find(cat => cat.id === task.category);
            if (category) {
                li.style.borderLeftColor = category.color;
            }

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            taskText.addEventListener('click', () => toggleComplete(index));

            // Обработчики долгого нажатия
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                deleteTask(index);
            });
            li.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    deleteTask(index);
                    if (navigator.vibrate) navigator.vibrate(50); 
                }, LONG_PRESS_DURATION);
            });
            li.addEventListener('touchend', () => clearTimeout(pressTimer));
            li.addEventListener('touchcancel', () => clearTimeout(pressTimer));

            li.appendChild(taskText);
            taskList.appendChild(li);
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        const categoryId = taskCategorySelect.value;

        if (text === '') return;

        tasks.push({ text: text, completed: false, category: categoryId });
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
        if (confirm("Вы уверены, что хотите удалить эту задачу?")) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        }
    }

    // --- Обработчики событий модального окна ---

    manageCategoriesBtn.addEventListener('click', () => {
        categoryModal.style.display = 'block';
        renderCategoryManagementList(); // Показываем актуальный список при открытии
    });

    closeModal.addEventListener('click', () => {
        categoryModal.style.display = 'none';
        renderTasks(); // Перерисовываем задачи на случай, если категории изменились
    });

    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
            renderTasks();
        }
    });

    addCategoryBtn.addEventListener('click', addCategory);

    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Инициализация при загрузке
    renderCategorySelect();
    renderTasks();
});
