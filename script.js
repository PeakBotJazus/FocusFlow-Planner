document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskCategory = document.getElementById('taskCategory');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const STORAGE_KEY = 'focusFlowTasks';

    let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Функция сохранения задач в localStorage
    function saveTasks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    // Функция рендера (отображения) задач
    function renderTasks() {
        taskList.innerHTML = ''; // Очищаем список перед повторным рендером
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add('task-item', task.category);
            if (task.completed) {
                li.classList.add('completed');
            }

            // Текст задачи
            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;
            taskText.addEventListener('click', () => toggleComplete(index));

            // Кнопка удаления
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => deleteTask(index));

            li.appendChild(taskText);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    }

    // Функция добавления новой задачи
    function addTask() {
        const text = taskInput.value.trim();
        const category = taskCategory.value;

        if (text === '') return; // Не добавляем пустые задачи

        tasks.push({ text: text, completed: false, category: category });
        saveTasks();
        renderTasks();
        taskInput.value = ''; // Очищаем поле ввода
    }

    // Функция переключения статуса "выполнено"
    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    // Функция удаления задачи
    function deleteTask(index) {
        tasks.splice(index, 1); // Удаляем 1 элемент по указанному индексу
        saveTasks();
        renderTasks();
    }

    // Обработчик кнопки "Добавить"
    addButton.addEventListener('click', addTask);

    // Также можно добавить задачу по нажатию Enter в поле ввода
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // При первой загрузке страницы отображаем задачи из хранилища
    renderTasks();
});
