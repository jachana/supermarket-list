const itemInput = document.getElementById('item-input');
const addItemButton = document.getElementById('add-item');
const itemList = document.getElementById('item-list');

let items = JSON.parse(localStorage.getItem('supermarketItems')) || [];

function renderItems() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item}
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        itemList.appendChild(li);
    });
    saveItems();
}

function addItem() {
    const newItem = itemInput.value.trim();
    if (newItem) {
        items.push(newItem);
        itemInput.value = '';
        renderItems();
    }
}

function deleteItem(index) {
    items.splice(index, 1);
    renderItems();
}

function saveItems() {
    localStorage.setItem('supermarketItems', JSON.stringify(items));
}

addItemButton.addEventListener('click', addItem);

itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem();
    }
});

itemList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const index = e.target.getAttribute('data-index');
        deleteItem(index);
    }
});

renderItems();
