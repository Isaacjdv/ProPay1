document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#payments-table tbody');
    const filterForm = document.getElementById('filter-form');
    const searchInput = document.getElementById('search');
    const adminSection = document.getElementById('admin-section');
    const adminForm = document.getElementById('admin-form');
    const userSelect = document.getElementById('user-select');
    const userPaymentsSection = document.getElementById('user-payments');
    const faqItems = document.querySelectorAll('.faq-item');

    // Recuperar datos de localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const loggedUser = JSON.parse(localStorage.getItem('loggedUser')) || { username: '', password: '' };
    let payments = JSON.parse(localStorage.getItem('payments')) || [];

    // Renderizar tabla
    function renderTable(data) {
        tableBody.innerHTML = '';
        data.forEach(payment => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${payment.id}</td>
                <td>${payment.name}</td>
                <td>${payment.date}</td>
                <td>${payment.amount}</td>
                <td>${payment.vacations}</td>
                <td>${payment.overtimeHours}</td>
                <td>${payment.totalEgresos}</td>
                <td>${payment.netToReceive}</td>
                <td>${payment.status}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Renderizar opciones de usuario
    function renderUserSelect() {
        userSelect.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            userSelect.appendChild(option);
        });
    }

    // Renderizar pagos del usuario
    function renderUserPayments() {
        const user = users.find(user => user.username === loggedUser.username);
        if (user && user.roles.length > 0) {
            userPaymentsSection.innerHTML = '';
            user.roles.forEach(role => {
                const paymentItem = document.createElement('div');
                paymentItem.className = 'payment-item';
                paymentItem.innerHTML = `
                    <p>ID: ${role.id}</p>
                    <p>Fecha: ${role.date}</p>
                    <p>Monto: ${role.amount}</p>
                    <p>Vacaciones: ${role.vacations}</p>
                    <p>Horas Extra: ${role.overtimeHours}</p>
                    <p>Total Egresos: ${role.totalEgresos}</p>
                    <p>Líquido a Recibir: ${role.netToReceive}</p>
                `;
                userPaymentsSection.appendChild(paymentItem);
            });
        } else {
            userPaymentsSection.innerHTML = '<p id="no-payments-message">No tienes roles de pagos registrados.</p>';
        }
    }

    // Calcular egresos
    function calculateEgresos(amount, vacations, overtimeHours) {
        const iessContribution = amount * 0.0945;
        const incomeTax = (amount - iessContribution) * 0.05;
        const privateInsurance = 50;
        const commissary = 20;

        return iessContribution + incomeTax + privateInsurance + commissary;
    }

    // Calcular líquido a recibir
    function calculateNetToReceive(amount, totalEgresos) {
        return amount - totalEgresos;
    }

    // Filtrar pagos
    filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const searchTerm = searchInput.value.toLowerCase();
        const filteredPayments = payments.filter(payment =>
            payment.name.toLowerCase().includes(searchTerm) || payment.id.includes(searchTerm)
        );
        renderTable(filteredPayments);
    });

    // Agregar rol de pago
    adminForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (loggedUser.username === 'Isaac' && loggedUser.password === '1234') {
            const userId = document.getElementById('user-id').value.trim();
            const selectedUser = userSelect.value;
            const paymentDate = document.getElementById('payment-date').value;
            const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
            const vacations = parseFloat(document.getElementById('vacations').value);
            const overtimeHours = parseFloat(document.getElementById('overtime-hours').value);

            if (!userId || isNaN(paymentAmount) || isNaN(vacations) || isNaN(overtimeHours)) {
                alert('Por favor, complete todos los campos correctamente.');
                return;
            }

            const totalEgresos = calculateEgresos(paymentAmount, vacations, overtimeHours);
            const netToReceive = calculateNetToReceive(paymentAmount, totalEgresos);

            const user = users.find(user => user.username === selectedUser);
            if (user) {
                const newRole = {
                    id: userId,
                    date: paymentDate,
                    amount: paymentAmount,
                    vacations: vacations,
                    overtimeHours: overtimeHours,
                    totalEgresos: totalEgresos,
                    netToReceive: netToReceive,
                    status: 'Pendiente'
                };

                user.roles = user.roles || [];
                user.roles.push(newRole);
                payments.push(newRole);
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('payments', JSON.stringify(payments));
                alert('Rol de pago agregado exitosamente.');
                adminForm.reset();
                renderTable(payments);
            } else {
                alert('Usuario no encontrado.');
            }
        } else {
            alert('No tienes permiso para realizar esta acción.');
        }
    });

    // Cerrar sesión
    document.getElementById('logout').addEventListener('click', function () {
        localStorage.removeItem('loggedUser');
        window.location.href = '../index.html';
    });

    // Descargar PDF
    document.getElementById('downloadBtn').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Rol de Pagos', 10, 10);
        doc.autoTable({
            head: [['ID', 'Nombre', 'Fecha', 'Monto', 'Vacaciones', 'Horas Extra', 'Total Egresos', 'Líquido a Recibir', 'Estado']],
            body: payments.map(payment => [
                payment.id,
                payment.name,
                payment.date,
                payment.amount,
                payment.vacations,
                payment.overtimeHours,
                payment.totalEgresos,
                payment.netToReceive,
                payment.status
            ]),
            startY: 20
        });
        doc.save('rol_de_pagos.pdf');
    });

    // Toggle FAQ
    faqItems.forEach(item => {
        item.addEventListener('click', function () {
            const answer = item.querySelector('.faq-answer');
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        });
    });

    // Verificar permisos de usuario
    if (loggedUser.username === 'Isaac' && loggedUser.password === '1234') {
        adminSection.style.display = 'block';
    } else {
        adminSection.style.display = 'none';
    }

    // Renderizar datos iniciales
    renderTable(payments);
    renderUserSelect();
    renderUserPayments();
});
