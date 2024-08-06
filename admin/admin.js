document.addEventListener('DOMContentLoaded', function () {
    const userList = document.getElementById('user-list');
    const users = JSON.parse(localStorage.getItem('users')) || [];

    function renderUsers() {
        userList.innerHTML = '';
        users.forEach((user, index) => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <span>${user.username}: ${user.password}</span>
                <button onclick="deleteUser(${index})">Borrar</button>
            `;
            userList.appendChild(userItem);
        });
    }

    document.getElementById('add-user-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const newUsername = document.getElementById('new-username').value;
        const newPassword = document.getElementById('new-password').value;

        const userExists = users.find(user => user.username === newUsername);

        if (userExists) {
            alert('El usuario ya existe');
        } else {
            users.push({ username: newUsername, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Usuario agregado exitosamente');
            renderUsers();
            document.getElementById('add-user-form').reset();
        }
    });

    window.deleteUser = function (index) {
        users.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        renderUsers();
    }

    document.getElementById('back-to-home').addEventListener('click', function () {
        window.location.href = '../index.html';
    });

    renderUsers();
});
