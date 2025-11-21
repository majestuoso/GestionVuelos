# GestionVuelos


node index.js

 http://localhost:3000


python3 -m http.server 5500

http://localhost: 5500


✔ Obtener todas

GET http://localhost:3000/fechas

✔ Obtener una

GET http://localhost:3000/fechas/1

✔ Crear

POST http://localhost:3000/fechas


✔ Actualizar

PUT http://localhost:3000/fechas/3

✔ Eliminar

DELETE http://localhost:3000/fechas/3



Sistema de Reservas de Vuelos con Cambios de Fecha: Diseña una aplicación que
permita gestionar las reservas de vuelos. Cada vuelo tiene un número, origen, destino,
capacidad y lista de pasajeros. Los pasajeros pueden reservar o cambiar la fecha de su
vuelo si hay disponibilidad. Implementa la posibilidad de ver qué vuelos están más
solicitados y cuántos pasajeros han cambiado sus reservas.