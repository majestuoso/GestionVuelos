// ===============================
// CONFIGURACIÓN GENERAL
// ===============================

// URL base del backend
const API = "http://localhost:3000";

// Espera a que el HTML esté cargado antes de usar el DOM
document.addEventListener("DOMContentLoaded", () => {

  // =====================================================
  // FUNCIÓN AUXILIAR → Convertir fecha completa a "hh:mm"
  // =====================================================
  function formatearHora(fecha) {
    if (!fecha) return "-";
    const f = new Date(fecha);
    return f.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  }

  // =====================================================
  // CARGAR TABLA DE VUELOS
  // =====================================================
  async function cargarVuelos() {
    try {
      const res = await fetch(`${API}/vuelos`);
      const vuelos = await res.json();

      const tbody = document.getElementById("vuelos-body");
      tbody.innerHTML = "";

      vuelos.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${formatearHora(v.fecha_hora_salida)}</td>
          <td>${v.numero_vuelo}</td>
          <td>${v.origen}</td>
          <td>${v.destino}</td>
          <td>${v.plataforma}</td>
          <td>${v.capacidad}</td>
          <td>${v.estado}</td>
        `;
        tbody.appendChild(tr);
      });

      cargarSelectVuelos(vuelos);

    } catch (e) {
      console.error("Error cargando vuelos:", e);
    }
  }

  // =====================================================
  // CARGAR SELECT DE VUELOS EN EL FORMULARIO DE RESERVAS
  // =====================================================
  function cargarSelectVuelos(vuelos) {
    const select = document.getElementById("vuelo-select");
    select.innerHTML = `<option value="">--Selecciona un vuelo--</option>`;

    vuelos
      .filter(v => v.estado !== "finalizado")     // ❗ No mostrar vuelos finalizados
      .forEach(v => {
        const op = document.createElement("option");
        op.value = v.id_vuelo;
        op.textContent = `${v.numero_vuelo} (${v.origen} → ${v.destino})`;
        select.appendChild(op);
      });
  }

  // =====================================================
  // CARGAR ASIENTOS DISPONIBLES
  // =====================================================
  async function cargarAsientosDisponibles(idVuelo) {
    try {
      const res = await fetch(`${API}/vuelos/${idVuelo}/asientos-disponibles`);
      const disponibles = await res.json();

      // Mostrar cantidad
      document.getElementById("asientos-disponibles").textContent =
        disponibles.length;

      // Llenar el select
      const select = document.getElementById("asiento-select");
      select.innerHTML = `<option value="">--Selecciona asiento--</option>`;

      disponibles.forEach(a => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = a;
        select.appendChild(opt);
      });

    } catch (e) {
      console.error("Error cargando asientos:", e);
    }
  }

  // =====================================================
  // EVENTO → CUANDO EL USUARIO ELIGE UN VUELO
  // =====================================================
  document.getElementById("vuelo-select").addEventListener("change", async () => {
    const idVuelo = document.getElementById("vuelo-select").value;

    if (!idVuelo) return;

    // Obtener datos del vuelo seleccionado
    const res = await fetch(`${API}/vuelos/${idVuelo}`);
    const vuelo = await res.json();

    // Mostrar hora salida
    document.getElementById("hora-salida").textContent =
      formatearHora(vuelo.fecha_hora_salida);

    // Mostrar plataforma
    document.getElementById("plataforma-vuelo").textContent =
      vuelo.plataforma || "-";

    // Cargar asientos disponibles
    cargarAsientosDisponibles(idVuelo);
  });

  // =====================================================
  // CREAR NUEVA RESERVA
  // =====================================================
  document.getElementById("guardar-reserva")?.addEventListener("click", async () => {

    const data = {
      id_vuelo: document.getElementById("vuelo-select").value,
      nombre: document.getElementById("nombre-pasajero").value,
      apellido: document.getElementById("apellido-pasajero").value,
      dni: document.getElementById("dni-pasajero").value,
      asiento: document.getElementById("asiento-select").value
    };

    if (!data.id_vuelo || !data.nombre || !data.apellido || !data.dni || !data.asiento)
      return alert("Completá todos los campos para la reserva");

    try {
      const res = await fetch(`${API}/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error creando reserva");

      alert("Reserva creada correctamente");

      cargarVuelos();
      cargarEstadisticas();

    } catch (e) {
      console.error(e);
      alert("Error creando reserva");
    }
  });

  // =====================================================
  // BUSCAR RESERVA
  // =====================================================
  document.getElementById("btn-buscar-reserva-independiente")?.addEventListener("click", async () => {

    const id = document.getElementById("buscar-id-reserva-independiente").value;
    if (!id) return alert("Ingresá un ID de reserva");

    try {
      const res = await fetch(`${API}/reservas/${id}`);
      if (!res.ok) return alert("Reserva no encontrada");

      const reserva = await res.json();

      const box = document.getElementById("reserva-encontrada");
      box.style.display = "block";

      document.getElementById("reserva-id").textContent = reserva.id_reserva;
      document.getElementById("reserva-pasajero-nombre").textContent =
        `${reserva.nombre} ${reserva.apellido} (DNI: ${reserva.dni})`;

      document.getElementById("reserva-vuelo-numero").textContent = reserva.numero_vuelo;
      document.getElementById("reserva-asiento-numero").textContent = reserva.asiento;
      document.getElementById("reserva-fecha").textContent =
        reserva.fecha_reserva?.split("T")[0] || "-";
      document.getElementById("reserva-estado").textContent = reserva.estado || "-";

      // CARGAR ASIENTOS DISPONIBLES PARA EDITAR
      const asientosRes = await fetch(`${API}/vuelos/${reserva.id_vuelo}/asientos`);
      const ocupados = await asientosRes.json();

      const select = document.getElementById("mod-asiento");
      select.innerHTML = "";

      const capacidad = reserva.capacidad || 30;

      for (let i = 1; i <= capacidad; i++) {
        const a = `A${i}`;
        if (!ocupados.includes(a) || a === reserva.asiento) {
          const op = document.createElement("option");
          op.value = a;
          op.textContent = a;

          if (a === reserva.asiento) op.selected = true;

          select.appendChild(op);
        }
      }

    } catch (e) {
      console.error(e);
      alert("Error buscando reserva");
    }
  });

  // =====================================================
  // ACTUALIZAR RESERVA
  // =====================================================
  document.getElementById("actualizar-reserva")?.addEventListener("click", async () => {

    const id = document.getElementById("buscar-id-reserva-independiente").value;
    const nuevoAsiento = document.getElementById("mod-asiento").value;
    const nuevoEstado = document.getElementById("mod-estado").value;

    try {
      const res = await fetch(`${API}/reservas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asiento: nuevoAsiento, estado: nuevoEstado })
      });

      const data = await res.json();
      if (!res.ok) return alert("Error: " + data.message);

      alert("✔ Reserva actualizada");

      cargarEstadisticas();
      cargarVuelos();

    } catch (e) {
      console.error(e);
      alert("Error actualizando");
    }
  });

  // =====================================================
  // CANCELAR RESERVA
  // =====================================================
  document.getElementById("cancelar-reserva")?.addEventListener("click", async () => {

    const id = document.getElementById("buscar-id-reserva-independiente").value;

    try {
      const res = await fetch(`${API}/reservas/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) return alert("Error: " + data.message);

      alert("✔ Reserva cancelada");

      document.getElementById("reserva-encontrada").style.display = "none";

      cargarVuelos();
      cargarEstadisticas();

    } catch (e) {
      console.error(e);
      alert("Error cancelando reserva");
    }
  });

  // =====================================================
  // CRUD PASAJEROS
  // =====================================================
  document.getElementById("guardar-pasajero")?.addEventListener("click", async () => {
    const data = {
      nombre: document.getElementById("reg-nombre").value,
      apellido: document.getElementById("reg-apellido").value,
      dni: document.getElementById("reg-dni").value
    };

    await fetch(`${API}/pasajeros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Pasajero registrado");
  });

  document.getElementById("modificar-pasajero")?.addEventListener("click", async () => {
    const id = document.getElementById("mod-id-pasajero").value;
    const data = {
      nombre: document.getElementById("mod-nombre").value,
      apellido: document.getElementById("mod-apellido").value,
      dni: document.getElementById("mod-dni").value
    };

    await fetch(`${API}/pasajeros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Pasajero actualizado");
  });

  document.getElementById("eliminar-pasajero")?.addEventListener("click", async () => {
    const id = document.getElementById("elim-id-pasajero").value;

    await fetch(`${API}/pasajeros/${id}`, { method: "DELETE" });

    alert("Pasajero eliminado");
  });

  // =====================================================
  // ESTADÍSTICAS
  // =====================================================
  async function cargarEstadisticas() {
    try {
      const res = await fetch(`${API}/estadisticas`);
      const stats = await res.json();

      document.querySelector("#vuelos-mas-solicitados .card-container").innerHTML =
        stats.vuelos_mas_solicitados
          .map(v => `<p>${v.numero_vuelo} (${v.reservas} reservas)</p>`)
          .join("");

      document.querySelector("#vuelos-mas-cambiados .card-container").innerHTML =
        stats.vuelos_mas_cambiados
          .map(v => `<p>${v.numero_vuelo} (${v.cambios_recibidos} cambios)</p>`)
          .join("");

      document.querySelector("#cambios-reservas .card-container").textContent =
        stats.total_cambios || 0;

    } catch (e) {
      console.error("Error estadísticas:", e);
    }
  }

  // =====================================================
  // CARGA INICIAL
  // =====================================================
  cargarVuelos();
  cargarEstadisticas();

});
