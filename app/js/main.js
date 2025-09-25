console.log("hello world");

const newitem = document.getElementById("newitem");
const button = document.querySelector(".header__button");
const list = document.querySelector(".container__main-list");
const header = document.querySelector(".container__header");

// LocalStorage key
const STORAGE_KEY = "todo-items";
const THEME_KEY = "theme";

// Storage helpers
function loadListFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn("Failed to parse items from storage:", e);
        return [];
    }
}

function saveListToStorage(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// THEME: dark / light helpers
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
}

function getSavedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (_) { return null; }
}

function getPreferredTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

let themeBtn = null;
function updateThemeToggleLabel(theme) {
    if (themeBtn) {
        themeBtn.textContent = theme === 'dark' ? 'Light' : 'Dark';
        themeBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    updateThemeToggleLabel(next);
}

function initTheme() {
    const saved = getSavedTheme();
    const theme = saved || getPreferredTheme();
    applyTheme(theme);
    updateThemeToggleLabel(theme);
}

// Helper: create a full list item with checkbox, label, and delete button
function createListItem(text, id = null, checked = false) {
    const li = document.createElement("li");
    li.classList.add("container__main-list-item");

    // Create unique id for the checkbox/label pair
    if (!id) {
        id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    li.dataset.id = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.classList.add("container__main-list-item-checkbox");
    checkbox.checked = Boolean(checked);

    const label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = text;

    const delBtn = document.createElement("button");
    delBtn.classList.add("container__main-list-item-btn");
    delBtn.textContent = "delete";

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(delBtn);

    return li;
}

// Render an array of items from storage
function renderList(items) {
    list.innerHTML = "";
    items.forEach(({ id, text, checked }) => {
        const li = createListItem(text, id, checked);
        list.appendChild(li);
    });
}

button.addEventListener("click", () => {
    const value = newitem.value.trim();
    if (!value) return;
    const id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const item = createListItem(value, id, false);
    list.appendChild(item);

    const items = loadListFromStorage();
    items.push({ id, text: value, checked: false });
    saveListToStorage(items);

    newitem.value = "";
});

newitem.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const value = newitem.value.trim();
        if (!value) return;
        const id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const item = createListItem(value, id, false);
        list.appendChild(item);

        const items = loadListFromStorage();
        items.push({ id, text: value, checked: false });
        saveListToStorage(items);

        newitem.value = "";
    }
});

const clearbtn = document.querySelector(".container__main-titleBtn-btn");
clearbtn.addEventListener("dblclick", () => {
    list.innerHTML = "";
    localStorage.removeItem(STORAGE_KEY);
});
 
// Event delegation for delete buttons (works for current and future items)
list.addEventListener("click", (e) => {
    const target = e.target;
    if (target && target.classList.contains("container__main-list-item-btn")) {
        const li = target.closest(".container__main-list-item");
        if (li) {
            const id = li.dataset.id;
            li.remove();
            const items = loadListFromStorage();
            const next = items.filter((it) => it.id !== id);
            saveListToStorage(next);
        }
    }
});

// Event delegation for checkbox toggle -> persist checked state
list.addEventListener("change", (e) => {
    const target = e.target;
    if (target && target.classList.contains("container__main-list-item-checkbox")) {
        const li = target.closest(".container__main-list-item");
        if (!li) return;
        const id = li.dataset.id;
        const items = loadListFromStorage();
        const idx = items.findIndex((it) => it.id === id);
        if (idx !== -1) {
            items[idx].checked = target.checked;
            saveListToStorage(items);
        }
    }
});

// Initial render from storage
document.addEventListener("DOMContentLoaded", () => {
    // Setup theme toggle button
    themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }
    // Initialize theme (saved or system preference)
    initTheme();

    // Render saved to-do items
    const items = loadListFromStorage();
    renderList(items);
});
    