let vuelos = [];

/* Renderizar vuelos en la tabla principal */
function renderVuelosEnTabla(vuelosLista) {
  const tbody = document.getElementById("tabla-vuelos-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  vuelosLista.forEach(v => {
    let claseEstado = "gate-open";
    const estado = (v.estado || v.remarks || "").toLowerCase();
    if (estado.includes("board")) claseEstado = "boarding";
    if (estado.includes("delay") || estado.includes("demora")) claseEstado = "delayed";
    if (estado.includes("final") || estado.includes("cancel")) claseEstado = "cancelado";

    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${new Date(v.fecha_hora_salida).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
      <td>${v.numero_vuelo}</td>
      <td>${v.destino}</td>
      <td>${v.via || "-"}</td>
      <td>${v.checkin || "-"}</td>
      <td>${v.puerta || "-"}</td>
      <td><span class="estado ${claseEstado}">${v.estado || v.remarks || "Programado"}</span></td>
    `;
    tbody.appendChild(fila);
  });
}

/* Cargar resumen KPI y tabla de vuelos */
async function cargarResumen() {
  try {
    const res = await fetch("http://localhost:3000/vuelos");
    vuelos = await res.json();
    renderVuelosEnTabla(vuelos);

    // KPIs
    const masViajes = vuelos.reduce((a, b) => ((a.reservas || 0) > (b.reservas || 0) ? a : b), vuelos[0] || {});
    document.getElementById("mas-viajes").textContent =
      masViajes?.numero_vuelo ? `${masViajes.numero_vuelo} (${masViajes.reservas || 0} reservas)` : "Sin datos";

    const masCambios = vuelos.reduce((a, b) => ((a.cambios || 0) > (b.cambios || 0) ? a : b), vuelos[0] || {});
    document.getElementById("mas-cambios").textContent =
      masCambios?.numero_vuelo ? `${masCambios.numero_vuelo} (${masCambios.cambios || 0} cambios)` : "Sin datos";

    const totalPersonas = vuelos.reduce((sum, v) => sum + (v.reservas || 0), 0);
    document.getElementById("total-personas").textContent = `${totalPersonas} personas`;

    // Select de vuelos para nueva reserva
    const selectVuelo = document.getElementById("vuelo");
    if (selectVuelo) {
      selectVuelo.innerHTML = "";
      vuelos.forEach(v => {
        const option = document.createElement("option");
        option.value = v.id_vuelo;
        option.textContent = `${v.numero_vuelo} - ${v.origen} → ${v.destino}`;
        selectVuelo.appendChild(option);
      });
      actualizarAsientos();
      selectVuelo.addEventListener("change", actualizarAsientos);
    }
  } catch (err) {
    console.error("Error cargando vuelos:", err);
  }
}

/* Actualizar lista de asientos */
function actualizarAsientos() {
  const selectVuelo = document.getElementById("vuelo");
  const selectAsiento = document.getElementById("asiento");
  if (!selectVuelo || !selectAsiento) return;

  const idVuelo = selectVuelo.value;
  const vuelo = vuelos.find(v => String(v.id_vuelo) === String(idVuelo));
  selectAsiento.innerHTML = "";

  if (vuelo) {
    const total = Math.max(0, vuelo.asientos_disponibles ?? 0);
    for (let i = 1; i <= total; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Asiento ${i}`;
      selectAsiento.appendChild(option);
    }
  }
}

/* Registrar nueva reserva */
const formReserva = document.getElementById("form-reserva");
if (formReserva) {
  formReserva.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id_vuelo = document.getElementById("vuelo").value;
    const nombre = document.getElementById("nombre").value;
    const apellido = document.getElementById("apellido").value;
    const dni = document.getElementById("dni").value;
    const asiento = document.getElementById("asiento").value;

    try {
      const res = await fetch("http://localhost:3000/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_vuelo, nombre, apellido, dni, asiento })
      });

      if (res.ok) {
        alert("Reserva creada ✅");
        formReserva.reset();
        cargarResumen();
      } else {
        alert("❌ Error al registrar la reserva");
      }
    } catch (err) {
      alert("❌ Error de conexión con el servidor");
    }
  });
}

/* Buscar reserva por ID de reserva */
const btnBuscar = document.getElementById("btn-buscar");
if (btnBuscar) {
  btnBuscar.addEventListener("click", async () => {
    const reservaInput = document.getElementById("buscar-reserva");
    const contenedor = document.getElementById("resultado-busqueda");
    if (!reservaInput || !contenedor) return;

    const id_reserva = reservaInput.value.trim();
    if (!id_reserva) return;

    try {
      const res = await fetch(`http://localhost:3000/reservas/${id_reserva}`);
      if (!res.ok) {
        contenedor.innerHTML = "<p style='color:red'>No se encontró la reserva</p>";
        return;
      }
      const r = await res.json();

      let html = `
        <h3>Detalle de Reserva</h3>
        <div class="reserva-card" data-reserva="${r.id_reserva}">
          <p><strong>ID Reserva:</strong> ${r.id_reserva}</p>
          <p><strong>Pasajero:</strong> ${r.nombre} ${r.apellido} (DNI: ${r.dni})</p>
          <p><strong>Vuelo:</strong> ${r.numero_vuelo} ${r.origen} → ${r.destino}</p>
          <p><strong>Fecha/Hora salida:</strong> ${new Date(r.fecha_hora_salida).toLocaleString()}</p>
          <p><strong>Asiento:</strong> ${r.asiento}</p>
          <p><strong>Estado:</strong> ${r.estado}</p>
          <div class="acciones">
            <button class="btn-editar" data-id="${r.id_reserva}">Editar</button>
            <button class="btn-eliminar" data-id="${r.id_reserva}">Cancelar</button>
          </div>
        </div>
      `;
      contenedor.innerHTML = html;

      // --- Editar reserva ---
      document.querySelector(".btn-editar").addEventListener("click", () => {
        document.getElementById("editar-id").value = r.id_reserva;
        document.getElementById("editar-nombre").value = r.nombre;
        document.getElementById("editar-apellido").value = r.apellido;
        document.getElementById("editar-dni").value = r.dni;
        document.getElementById("editar-asiento").value = r.asiento;

        // llenar select de vuelos
        const editarVueloSelect = document.getElementById("editar-vuelo");
        editarVueloSelect.innerHTML = "";
        vuelos.forEach(v => {
          const option = document.createElement("option");
          option.value = v.id_vuelo;
          option.textContent = `${v.numero_vuelo} - ${v.origen} → ${v.destino}`;
          editarVueloSelect.appendChild(option);
        });
        editarVueloSelect.value = r.id_vuelo;

        document.getElementById("panel-editar").style.display = "block";
      });

      // --- Cancelar reserva ---
           // --- Cancelar reserva ---
      document.querySelector(".btn-eliminar").addEventListener("click", async () => {
        if (!confirm("¿Seguro que quieres cancelar la reserva?")) return;
        const resDel = await fetch(`http://localhost:3000/reservas/${r.id_reserva}`, { method: "DELETE" });
        if (resDel.ok) {
          alert("Reserva cancelada ❌");
          contenedor.innerHTML = "";
          cargarResumen();
        } else {
          alert("❌ Error al cancelar reserva");
        }
      });

    } catch (err) {
      contenedor.innerHTML = "<p style='color:red'>Error buscando reserva</p>";
    }
  });
}

/* Guardar cambios en el formulario de edición */
const formEditar = document.getElementById("form-editar");
if (formEditar) {
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("editar-id").value;
    const nombre = document.getElementById("editar-nombre").value;
    const apellido = document.getElementById("editar-apellido").value;
    const dni = document.getElementById("editar-dni").value;
    const asiento = document.getElementById("editar-asiento").value;
    const id_vuelo = document.getElementById("editar-vuelo").value; // nuevo campo para cambiar vuelo

    try {
      const resPut = await fetch(`http://localhost:3000/reservas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, dni, asiento, id_vuelo })
      });

      if (resPut.ok) {
        alert("Reserva modificada ✅");
        document.getElementById("panel-editar").style.display = "none"; // ocultar formulario
        formEditar.reset(); // limpiar campos
        btnBuscar.click(); // refrescar listado
        cargarResumen();
      } else {
        alert("❌ Error al modificar reserva");
      }
    } catch (err) {
      alert("❌ Error de conexión al modificar");
    }
  });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", cargarResumen);
