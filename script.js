
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
    const colorPickerWrapper = document.querySelector('.color-picker-wrapper');
    const homeBtn = document.getElementById('homeBtn');
    const trashBtn = document.getElementById('trashBtn');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const searchArea = document.querySelector('.search-area');
    const mainInputArea = document.getElementById('mainInputArea');

    const TASKS_STORAGE_KEY = 'focusFlowTasks';
    const CATEGORIES_STORAGE_KEY = 'focusFlowCategories';
    const LONG_PRESS_DURATION = 800;

    // Инициализация данных
    let tasks = JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)) || [];
    let categories = JSON.parse(localStorage.getItem(CATEGORIES_STORAGE_KEY)) || [
        { id: 'personal', name: 'Личное', color: '#ff5733' },
        { id: 'work', name: 'Работа', color: '#007bff' },
        { id: 'health', name: 'Здоровье', color: '#28a745' }
    ];

    let pressTimer;
    let currentView = 'home';
    let clearTrashBtn = null; // Кнопка очистки корзины

    // Создаем кнопку очистки корзины
    function createClearTrashButton() {
        if (!clearTrashBtn) {
            clearTrashBtn = document.createElement('button');
            clearTrashBtn.id = 'clearTrashBtn';
            clearTrashBtn.textContent = 'Очистить корзину';
            clearTrashBtn.classList.add('clear-trash-btn');
            clearTrashBtn.style.display = 'none';
            
            // Добавляем кнопку перед списком задач
            taskList.parentNode.insertBefore(clearTrashBtn, taskList);
            
            // Обработчик клика на кнопку очистки корзины
            clearTrashBtn.addEventListener('click', clearTrash);
        }
        return clearTrashBtn;
    }

    // Функция очистки корзины
    function clearTrash() {
        const deletedTasks = tasks.filter(task => task.isDeleted);
        
        if (deletedTasks.length === 0) {
            alert('Корзина уже пуста!');
            return;
        }
        
        if (confirm("Вы уверены, что хотите полностью удалить все задачи из корзины. Это действие нельзя отменить.")){
            // Оставляем только задачи, которые НЕ в корзине
            tasks = tasks.filter(task => !task.isDeleted);
            saveTasks();
            renderTasks();
            alert("Корзина очищена. Удалено задач.");
        }
    }

    // Сохранение данных
    function saveTasks() {
        localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    }

    function saveCategories() {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
        renderCategorySelect();
        renderCategoryManagementList();
    }

    // Обновление цвета в color picker
    function updateColorWrapper() {
        if (colorPickerWrapper && newCategoryColorInput) {
            colorPickerWrapper.style.backgroundColor = newCategoryColorInput.value;
        }
    }

    // Навигация
    function setActiveMenuButton(activeBtn) {
        document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }


function navigateHome() {
        currentView = 'home';
        setActiveMenuButton(homeBtn);
        mainInputArea.style.display = 'flex';
        searchArea.style.display = 'none';
        if (clearTrashBtn) clearTrashBtn.style.display = 'none';
        renderTasks();
    }

    function navigateTrash() {
        currentView = 'trash';
        setActiveMenuButton(trashBtn);
        mainInputArea.style.display = 'none';
        searchArea.style.display = 'none';
        
        // Показываем кнопку очистки корзины
        const clearBtn = createClearTrashButton();
        clearBtn.style.display = 'block';
        
        renderTasks();
    }

    function navigateSearch() {
        currentView = 'search';
        setActiveMenuButton(searchBtn);
        mainInputArea.style.display = 'none';
        searchArea.style.display = 'block';
        searchInput.focus();
        if (clearTrashBtn) clearTrashBtn.style.display = 'none';
        renderTasks();
    }

    // Категории
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

            const nameDisplay = document.createElement('span');
            nameDisplay.classList.add('category-name-display');
            
            const colorMarker = document.createElement('span');
            colorMarker.classList.add('category-color-marker');
            colorMarker.style.backgroundColor = category.color;

            const nameText = document.createElement('span');
            nameText.textContent = category.name;

            nameDisplay.appendChild(colorMarker);
            nameDisplay.appendChild(nameText);

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-category-btn');
            removeBtn.textContent = 'Удалить';
            removeBtn.setAttribute('data-index', index);
            removeBtn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeCategory(index);
            });

            li.appendChild(nameDisplay);
            li.appendChild(removeBtn);
            categoryListUl.appendChild(li);
        });
    }

    function addCategory() {
        const name = newCategoryNameInput.value.trim();
        const color = newCategoryColorInput.value;
        if (name === '') return;

        const id = name.toLowerCase().replace(/\s/g, '-');
        categories.push({ id, name, color });
        saveCategories();
        newCategoryNameInput.value = '';
    }

    function removeCategory(index) {
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

    // Задачи
    function renderTasks() {
        taskList.innerHTML = '';

        let tasksToRender = [];
        if (currentView === 'home') {
            tasksToRender = tasks.filter(task => !task.isDeleted);
        } else if (currentView === 'trash') {
            tasksToRender = tasks.filter(task => task.isDeleted);
        } else if (currentView === 'search') {
            const query = searchInput.value.toLowerCase();
            tasksToRender = tasks.filter(task => task.text.toLowerCase().includes(query));
        }


tasksToRender.forEach((task) => {
            const originalIndex = tasks.indexOf(task);

            const li = document.createElement('li');
            li.classList.add('task-item');
            if (task.completed) li.classList.add('completed');

            const category = categories.find(cat => cat.id === task.category);
            if (category) li.style.borderLeftColor = category.color;

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            
            if (currentView === 'home' || currentView === 'search') {
                taskText.addEventListener('click', () => toggleComplete(originalIndex));
                taskText.addEventListener('dblclick', () => editTask(originalIndex, taskText));
            }

            // Обработчики долгого нажатия
            li.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (currentView === 'home' || currentView === 'search') deleteTask(originalIndex);
                if (currentView === 'trash') restoreTask(originalIndex);
            });
            
            li.addEventListener('touchstart', (e) => {
                e.preventDefault();
                pressTimer = setTimeout(() => {
                    if (currentView === 'home' || currentView === 'search') deleteTask(originalIndex);
                    if (currentView === 'trash') restoreTask(originalIndex);
                    if (navigator.vibrate) navigator.vibrate(50);
                }, LONG_PRESS_DURATION);
            });
            
            li.addEventListener('touchend', () => clearTimeout(pressTimer));
            li.addEventListener('touchcancel', () => clearTimeout(pressTimer));

            li.appendChild(taskText);
            taskList.appendChild(li);
        });

        // Сообщение если нет задач
        if (tasksToRender.length === 0 && currentView !== 'search') {
            const message = document.createElement('li');
            message.classList.add('task-item');
            message.style.justifyContent = 'center';
            message.style.cursor = 'default';
            if (currentView === 'home') message.textContent = 'У вас пока нет активных задач.';
            if (currentView === 'trash') message.textContent = 'Корзина пуста.';
            taskList.appendChild(message);
        }
    }

    function editTask(index, taskTextElement) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = tasks[index].text;
        input.classList.add('edit-input');
        
        taskTextElement.parentNode.replaceChild(input, taskTextElement);
        input.focus();

        const saveEdit = () => {
            tasks[index].text = input.value.trim();
            if (tasks[index].text === '') {
                deleteTask(index);
            } else {
                saveTasks();
                renderTasks();
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }

    function addTask() {
        const text = taskInput.value.trim();
        const categoryId = taskCategorySelect.value;
        if (text === '') return;

        tasks.push({ text, completed: false, category: categoryId, isDeleted: false });
        saveTasks();
        
        if (currentView !== 'home') navigateHome();
        else renderTasks();
        
        taskInput.value = '';
    }

    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function deleteTask(index) {
        if (confirm("Переместить задачу в корзину?")) {
            tasks[index].isDeleted = true;
            saveTasks();
            renderTasks();
        }
    }


function restoreTask(index) {
        if (confirm("Восстановить задачу из корзины?")) {
            tasks[index].isDeleted = false;
            saveTasks();
            renderTasks();
        }
    }

    // Обработчики событий
    manageCategoriesBtn.addEventListener('click', () => {
        categoryModal.style.display = 'block';
        document.body.classList.add('modal-open');
        renderCategoryManagementList();
    });

    closeModal.addEventListener('click', () => {
        categoryModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        renderTasks();
    });

    window.addEventListener('click', (event) => {
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            renderTasks();
        }
    });

    addCategoryBtn.addEventListener('click', addCategory);
    addButton.addEventListener('click', addTask);
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    searchInput.addEventListener('input', renderTasks);
    homeBtn.addEventListener('click', navigateHome);
    trashBtn.addEventListener('click', navigateTrash);
    searchBtn.addEventListener('click', navigateSearch);

    // Инициализация
    newCategoryColorInput.addEventListener('input', updateColorWrapper);
    updateColorWrapper();
    renderCategorySelect();
    navigateHome();
});