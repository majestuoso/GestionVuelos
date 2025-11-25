const API = "http://localhost:3000"; // Ajusta según tu backend

document.addEventListener("DOMContentLoaded", () => {

  // ============================
  // CARGAR VUELOS EN TABLA
  // ============================
  async function cargarVuelos() {
    try {
      const res = await fetch(`${API}/vuelos`);
      const vuelos = await res.json();

      const tbody = document.getElementById("vuelos-body");
      tbody.innerHTML = "";

      vuelos.forEach(v => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${v.hora || "-"}</td>
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

  // ============================
  // CARGAR SELECT DE VUELOS
  // ============================
  function cargarSelectVuelos(vuelos) {
    const select = document.getElementById("vuelo-select");
    select.innerHTML = `<option value="">--Selecciona un vuelo--</option>`;
    vuelos.forEach(v => {
      const op = document.createElement("option");
      op.value = v.id_vuelo;
      op.textContent = `${v.numero_vuelo} (${v.origen} → ${v.destino})`;
      select.appendChild(op);
    });
  }

  // ============================
  // CREAR RESERVA
  // ============================
  document.getElementById("guardar-reserva")?.addEventListener("click", async () => {
    const data = {
      id_vuelo: document.getElementById("vuelo-select").value,
      nombre: document.getElementById("nombre-pasajero").value,
      apellido: document.getElementById("apellido-pasajero").value,
      dni: document.getElementById("dni-pasajero").value,
      asiento: document.getElementById("asiento-select").value
    };

    if (!data.id_vuelo || !data.nombre || !data.apellido || !data.dni || !data.asiento) {
      return alert("Completá todos los campos para la reserva");
    }

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

  // ============================
  // BUSCAR RESERVA POR ID
  // ============================
  document.getElementById("btn-buscar-reserva-independiente")?.addEventListener("click", async () => {
    const id = document.getElementById("buscar-id-reserva-independiente").value;
    if (!id) return alert("Ingresá un ID de reserva");

    try {
      const res = await fetch(`${API}/reservas/${id}`);
      if (!res.ok) return alert("Reserva no encontrada");

      const reserva = await res.json();

      const div = document.getElementById("reserva-encontrada-independiente");
      div.style.display = "block";

      document.getElementById("reserva-id").textContent = reserva.id_reserva;
      document.getElementById("reserva-pasajero-nombre").textContent =
        `${reserva.nombre} ${reserva.apellido} (DNI: ${reserva.dni})`;

      document.getElementById("reserva-vuelo-numero").textContent = reserva.numero_vuelo;
      document.getElementById("reserva-asiento-numero").textContent = reserva.asiento;
      document.getElementById("reserva-fecha").textContent = reserva.fecha_reserva?.split("T")[0] || "-";
      document.getElementById("reserva-estado").textContent = reserva.estado || "-";

      // ============================
      // CARGAR ASIENTOS DISPONIBLES DEL VUELO
      // ============================
      const asientosSelect = document.getElementById("mod-asiento");
      asientosSelect.innerHTML = `<option value="">--Selecciona un asiento--</option>`;

      const asientosRes = await fetch(`${API}/vuelos/${reserva.id_vuelo}/asientos`);
      const asientosOcupados = await asientosRes.json();

      const capacidad = reserva.capacidad || 30;

      for (let i = 1; i <= capacidad; i++) {
        const asiento = `A${i}`;
        if (!asientosOcupados.includes(asiento) || asiento === reserva.asiento) {
          const option = document.createElement("option");
          option.value = asiento;
          option.textContent = asiento;
          if (asiento === reserva.asiento) option.selected = true;
          asientosSelect.appendChild(option);
        }
      }

    } catch (e) {
      console.error("Error buscando reserva:", e);
      alert("Error buscando reserva");
    }
  });

  // ============================
// ACTUALIZAR RESERVA
// ============================
document.getElementById("actualizar-reserva")?.addEventListener("click", async () => {

  const id = document.getElementById("buscar-id-reserva-independiente").value;
  const nuevoAsiento = document.getElementById("mod-asiento").value;
  const nuevoEstado = document.getElementById("mod-estado").value;

  if (!id) return alert("Ingresá un ID de reserva");

  try {
    const res = await fetch(`${API}/reservas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asiento: nuevoAsiento,
        estado: nuevoEstado
      })
    });

    const data = await res.json();
    if (!res.ok) return alert("Error: " + data.message);

    alert("✔ Reserva actualizada correctamente");
    cargarEstadisticas();
    cargarVuelos();

  } catch (err) {
    console.error(err);
    alert("Error actualizando reserva");
  }
});

// ============================
// CANCELAR RESERVA
// ============================
document.getElementById("cancelar-reserva")?.addEventListener("click", async () => {

  const id = document.getElementById("buscar-id-reserva-independiente").value;
  if (!id) return alert("Ingresá un ID de reserva");

  try {
    const res = await fetch(`${API}/reservas/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) return alert("Error: " + data.message);

    alert("✔ Reserva cancelada correctamente");

    document.getElementById("reserva-encontrada-independiente").style.display = "none";

    cargarVuelos();
    cargarEstadisticas();

  } catch (err) {
    console.error(err);
    alert("Error cancelando reserva");
  }
});

  // ============================
  // PASAJEROS
  // ============================
  document.getElementById("guardar-pasajero")?.addEventListener("click", async () => {
    const data = {
      nombre: document.getElementById("reg-nombre").value,
      apellido: document.getElementById("reg-apellido").value,
      dni: document.getElementById("reg-dni").value
    };
    try {
      await fetch(`${API}/pasajeros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("Pasajero registrado");
    } catch (e) { console.error(e); }
  });

  document.getElementById("modificar-pasajero")?.addEventListener("click", async () => {
    const id = document.getElementById("mod-id-pasajero").value;
    const data = {
      nombre: document.getElementById("mod-nombre").value,
      apellido: document.getElementById("mod-apellido").value,
      dni: document.getElementById("mod-dni").value
    };
    try {
      await fetch(`${API}/pasajeros/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      alert("Pasajero actualizado");
    } catch (e) { console.error(e); }
  });

  document.getElementById("eliminar-pasajero")?.addEventListener("click", async () => {
    const id = document.getElementById("elim-id-pasajero").value;
    try {
      await fetch(`${API}/pasajeros/${id}`, { method: "DELETE" });
      alert("Pasajero eliminado");
    } catch (e) { console.error(e); }
  });

  // ============================
  // CARGAR ESTADÍSTICAS
  // ============================
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

    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  }
function resetearFormularios() {

  // Selects
  document.querySelectorAll("select").forEach(s => s.selectedIndex = 0);

  // Inputs
  document.querySelectorAll("input[type='text'], input[type='number']").forEach(i => i.value = "");

  // Ocultar panel de reserva encontrada
  const box = document.getElementById("reserva-encontrada-independiente");
  if (box) box.style.display = "none";
}

  // ============================
  // CARGA INICIAL
  // ============================
  cargarVuelos();
  cargarEstadisticas();

});
