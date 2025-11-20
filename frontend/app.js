const API = "http://localhost:3000";

async function cargarVuelos() {
    const res = await fetch(`${API}/vuelos`);
    const vuelos = await res.json();
    const tbody = document.getElementById("flightsTable");
    tbody.innerHTML = "";
    vuelos.forEach(v => {
        const fila = `<tr>
            <td>${v.numero_vuelo}</td>
            <td>${v.origen}</td>
            <td>${v.destino}</td>
            <td>${v.capacidad}</td>
            <td>${v.reservas}</td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

async function cargarReservas() {
    const res = await fetch(`${API}/reservas`);
    const reservas = await res.json();
    const tbody = document.getElementById("reservationsTable");
    tbody.innerHTML = "";
    reservas.forEach(r => {
        const fila = `<tr>
            <td>${r.id_reserva}</td>
            <td>${r.fecha_reserva.split('T')[0]}</td>
            <td>${r.asiento}</td>
            <td>${r.estado}</td>
            <td>${r.vuelo_id}</td>
            <td><button onclick="prefillDate(${r.id_reserva}, '${r.fecha_reserva.split('T')[0]}')">Cambiar</button></td>
        </tr>`;
        tbody.innerHTML += fila;
    });
}

function prefillDate(id, fecha) {
    document.getElementById("reservationId").value = id;
    document.getElementById("newDate").value = fecha;
}

async function cambiarFecha() {
    const id = document.getElementById("reservationId").value;
    const nuevaFecha = document.getElementById("newDate").value;
    const res = await fetch(`${API}/reservas/${id}`);
    const data = await res.json();
    data.fecha = nuevaFecha;
    await fetch(`${API}/reservas/${id}`, {
        method: "PUT",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    });
    document.getElementById("feedback").innerText = "✔ Fecha cambiada con éxito";
}

document.getElementById("loadFlightsBtn").addEventListener("click", cargarVuelos);
document.getElementById("loadReservationsBtn").addEventListener("click", cargarReservas);
document.getElementById("changeDateBtn").addEventListener("click", cambiarFecha);
