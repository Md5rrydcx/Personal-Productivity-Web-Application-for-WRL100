document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskCategory = document.getElementById('task-category');
    const taskPriority = document.getElementById('task-priority');
    const taskDate = document.getElementById('task-date');
    const taskList = document.getElementById('task-list');
    const prevMonth = document.getElementById('prev-month');
    const nextMonth = document.getElementById('next-month');
    const monthYear = document.getElementById('month-year');
    const calendar = document.getElementById('calendar');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const editTaskInput = document.getElementById('edit-task-input');
    const editTaskCategory = document.getElementById('edit-task-category');
    const editTaskPriority = document.getElementById('edit-task-priority');
    const editTaskDate = document.getElementById('edit-task-date');
    const saveEdit = document.getElementById('save-edit');
    const quoteDisplay = document.getElementById('quote-display');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        generateCalendar(currentMonth, currentYear);
    }

    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const div = document.createElement('div');
            div.innerHTML = `${task.text} (${task.category}, ${task.priority}, Due: ${task.date})`;
            div.className = task.priority.toLowerCase();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => editTask(task.id);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteTask(task.id);
            div.appendChild(editButton);
            div.appendChild(deleteButton);
            taskList.appendChild(div);
        });
    }

    function addTask(text, category, priority, date) {
        const id = Date.now();
        tasks.push({ id, text, category, priority, date });
        saveTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editTaskInput.value = task.text;
            editTaskCategory.value = task.category;
            editTaskPriority.value = task.priority;
            editTaskDate.value = task.date;
            editModal.style.display = 'block';
            saveEdit.onclick = () => {
                task.text = editTaskInput.value;
                task.category = editTaskCategory.value;
                task.priority = editTaskPriority.value;
                task.date = editTaskDate.value;
                saveTasks();
                editModal.style.display = 'none';
            };
        }
    }

    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const category = taskCategory.value;
        const priority = taskPriority.value;
        const date = taskDate.value;
        if (text && category && priority && date) {
            addTask(text, category, priority, date);
            taskInput.value = '';
            taskCategory.value = '';
            taskPriority.value = '';
            taskDate.value = '';
        }
    };

    closeModal.onclick = () => editModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == editModal) editModal.style.display = 'none'; };

    function generateCalendar(month, year) {
        calendar.innerHTML = '';
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        monthYear.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

        for (let i = 0; i < startDay; i++) {
            const div = document.createElement('div');
            calendar.appendChild(div);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const div = document.createElement('div');
            const taskDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            div.textContent = i;
            if (tasks.some(task => task.date === taskDateStr)) div.className = 'task-day';
            if (i === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) div.style.backgroundColor = '#e0f7fa';
            calendar.appendChild(div);
        }
    }

    prevMonth.onclick = () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        generateCalendar(currentMonth, currentYear);
    };

    nextMonth.onclick = () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        generateCalendar(currentMonth, currentYear);
    };

    async function fetchQuote() {
        const cache = localStorage.getItem('quoteCache');
        const cached = cache ? JSON.parse(cache) : null;
        const now = Date.now();
        if (cached && (now - cached.timestamp) < 24 * 60 * 60 * 1000) {
            quoteDisplay.textContent = `"${cached.content}" - ${cached.author}`;
            return;
        }
        try {
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const quote = { content: data.content, author: data.author, timestamp: now };
            localStorage.setItem('quoteCache', JSON.stringify(quote));
            quoteDisplay.textContent = `"${data.content}" - ${data.author}`;
        } catch (error) {
            console.error('Failed to load quote:', error);
            if (cached) {
                quoteDisplay.textContent = `"${cached.content}" - ${cached.author} (cached)`;
            } else {
                quoteDisplay.textContent = "Failed to load quote.";
            }
        }
    }

    renderTasks();
    generateCalendar(currentMonth, currentYear);
    fetchQuote();
});
