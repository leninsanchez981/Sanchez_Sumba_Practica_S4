const IVA = 0.15;

const catalogo = [
  { id: 1, nombre: "Mouse inalámbrico", precio: 12.5, categoria: "Periféricos" },
  { id: 2, nombre: "Teclado mecánico", precio: 25, categoria: "Periféricos" },
  { id: 3, nombre: "Audífonos con micrófono", precio: 35, categoria: "Periféricos" },
  { id: 4, nombre: "Cámara web HD", precio: 42, categoria: "Periféricos" },
  { id: 5, nombre: "Cable USB-C 1 m", precio: 2, categoria: "Accesorios" },
  { id: 6, nombre: "Memoria USB 64 GB", precio: 9.9, categoria: "Accesorios" },
  { id: 7, nombre: "Hub USB-C 4 puertos", precio: 28, categoria: "Accesorios" },
  { id: 8, nombre: "Monitor 24 pulgadas", precio: 189, categoria: "Pantallas" }
];

const estado = {
  carrito: [],
  busqueda: "",
  categoria: "todas",
  envio: "retiro",
  pedidos: 0
};

const contCatalogo = document.querySelector("#catalogo");
const sinResultados = document.querySelector("#sinResultados");
const inputBuscar = document.querySelector("#buscar");
const selectCategoria = document.querySelector("#categoria");
const listaCarrito = document.querySelector("#listaCarrito");
const carritoVacio = document.querySelector("#carritoVacio");
const selectEnvio = document.querySelector("#envio");
const resumen = document.querySelector("#resumen");
const btnConfirmar = document.querySelector("#btnConfirmar");
const btnVaciar = document.querySelector("#btnVaciar");
const mensaje = document.querySelector("#mensaje");
const badge = document.querySelector("#badge");

const formatoDinero = valor => `$${valor.toFixed(2)}`;

function porcentajeDescuento(unidades) {
  if (unidades >= 10) return 0.10;
  if (unidades >= 5) return 0.05;
  return 0;
}

function costoEnvio(tipo) {
  switch (tipo) {
    case "cuenca": return 2.5;
    case "nacional": return 6;
    default: return 0;
  }
}

const buscarProducto = id => catalogo.find(p => p.id === id);

function totalUnidades() {
  let unidades = 0;
  for (const item of estado.carrito) {
    unidades += item.cantidad;
  }
  return unidades;
}

function calcularTotales() {
  let subtotal = 0;

  for (const item of estado.carrito) {
    subtotal += buscarProducto(item.id).precio * item.cantidad;
  }

  const descuento = subtotal * porcentajeDescuento(totalUnidades());
  const envio = estado.carrito.length > 0 ? costoEnvio(estado.envio) : 0;
  const base = subtotal - descuento + envio;
  const iva = base * IVA;

  return { subtotal, descuento, envio, iva, total: base + iva };
}

function agregar(id) {
  const item = estado.carrito.find(i => i.id === id);

  if (item) {
    item.cantidad++;
  } else {
    estado.carrito.push({ id, cantidad: 1 });
  }
}

function cambiarCantidad(id, cambio) {
  const item = estado.carrito.find(i => i.id === id);
  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    quitar(id);
  }
}

function quitar(id) {
  estado.carrito = estado.carrito.filter(i => i.id !== id);
}

function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("producto");
  tarjeta.dataset.id = producto.id;

  const enCarrito = estado.carrito.some(i => i.id === producto.id);
  tarjeta.classList.toggle("en-carrito", enCarrito);

  const categoria = document.createElement("span");
  categoria.classList.add("categoria");
  categoria.textContent = producto.categoria;

  const nombre = document.createElement("span");
  nombre.classList.add("nombre");
  nombre.textContent = producto.nombre;

  const precio = document.createElement("span");
  precio.classList.add("precio");
  precio.textContent = formatoDinero(producto.precio);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = enCarrito ? "✓ Agregar otro" : "Agregar";

  tarjeta.append(categoria, nombre, precio, boton);
  return tarjeta;
}

function renderCatalogo() {
  const texto = estado.busqueda.toLowerCase();

  const visibles = catalogo.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    const coincideCategoria =
      estado.categoria === "todas" || p.categoria === estado.categoria;

    return coincideTexto && coincideCategoria;
  });

  contCatalogo.replaceChildren();

  for (const producto of visibles) {
    contCatalogo.append(crearTarjetaProducto(producto));
  }

  sinResultados.hidden = visibles.length > 0;
}

function crearItemCarrito(item) {
  const producto = buscarProducto(item.id);
  const li = document.createElement("li");
  li.classList.add("item");
  li.dataset.id = item.id;

  const detalle = document.createElement("div");
  detalle.classList.add("detalle");

  const nombre = document.createElement("strong");
  nombre.textContent = producto.nombre;

  const linea = document.createElement("small");
  linea.textContent =
    `${formatoDinero(producto.precio)} × ${item.cantidad} = ` +
    formatoDinero(producto.precio * item.cantidad);

  detalle.append(nombre, linea);

  const cantidad = document.createElement("div");
  cantidad.classList.add("cantidad");

  const menos = document.createElement("button");
  menos.type = "button";
  menos.dataset.accion = "menos";
  menos.textContent = "−";

  const numero = document.createElement("span");
  numero.textContent = item.cantidad;

  const mas = document.createElement("button");
  mas.type = "button";
  mas.dataset.accion = "mas";
  mas.textContent = "+";

  cantidad.append(menos, numero, mas);

  const quitarBtn = document.createElement("button");
  quitarBtn.type = "button";
  quitarBtn.classList.add("quitar");
  quitarBtn.dataset.accion = "quitar";
  quitarBtn.title = "Quitar del carrito";
  quitarBtn.textContent = "✕";

  li.append(detalle, cantidad, quitarBtn);
  return li;
}

function renderCarrito() {
  listaCarrito.replaceChildren();

  for (const item of estado.carrito) {
    listaCarrito.append(crearItemCarrito(item));
  }

  const vacio = estado.carrito.length === 0;
  carritoVacio.hidden = !vacio;
  btnConfirmar.disabled = vacio;
  btnVaciar.disabled = vacio;
}

function lineaResumen(etiqueta, valor, clase) {
  const div = document.createElement("div");
  div.classList.add("linea");

  if (clase) div.classList.add(clase);

  const a = document.createElement("span");
  a.textContent = etiqueta;

  const b = document.createElement("span");
  b.textContent = valor;

  div.append(a, b);
  return div;
}

function renderResumen() {
  const t = calcularTotales();
  const unidades = totalUnidades();

  resumen.replaceChildren(
    lineaResumen(`Subtotal (${unidades} u.)`, formatoDinero(t.subtotal)),
    lineaResumen(
      "Descuento",
      t.descuento > 0 ? `- ${formatoDinero(t.descuento)}` : "No aplica",
      "descuento"
    ),
    lineaResumen("Envío", formatoDinero(t.envio)),
    lineaResumen("IVA (15 %)", formatoDinero(t.iva)),
    lineaResumen("Total", formatoDinero(t.total), "total")
  );
}

function renderBadge() {
  const anterior = badge.textContent;
  badge.textContent = totalUnidades();

  if (badge.textContent !== anterior) {
    badge.classList.remove("pulso");
    void badge.offsetWidth;
    badge.classList.add("pulso");
  }
}

function render() {
  renderCatalogo();
  renderCarrito();
  renderResumen();
  renderBadge();
}

// Eventos de búsqueda y categoría
inputBuscar.addEventListener("input", () => {
  estado.busqueda = inputBuscar.value.trim();
  renderCatalogo();
});

selectCategoria.addEventListener("change", () => {
  estado.categoria = selectCategoria.value;
  renderCatalogo();
});

// Delegación de eventos del catálogo
contCatalogo.addEventListener("click", evento => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const tarjeta = boton.closest(".producto");
  const id = Number(tarjeta.dataset.id);

  agregar(id);
  mensaje.hidden = true;
  render();
});

// Delegación de eventos del carrito
listaCarrito.addEventListener("click", evento => {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const id = Number(boton.closest(".item").dataset.id);
  const accion = boton.dataset.accion;

  if (accion === "mas") cambiarCantidad(id, 1);
  if (accion === "menos") cambiarCantidad(id, -1);
  if (accion === "quitar") quitar(id);

  render();
});

selectEnvio.addEventListener("change", () => {
  estado.envio = selectEnvio.value;
  renderResumen();
});

btnVaciar.addEventListener("click", () => {
  estado.carrito = [];
  mensaje.hidden = true;
  render();
});

btnConfirmar.addEventListener("click", () => {
  const total = calcularTotales().total;
  estado.pedidos++;

  const numero = String(estado.pedidos).padStart(3, "0");

  mensaje.textContent =
    `✅ Pedido #${numero} confirmado por ${formatoDinero(total)}. ` +
    "¡Gracias por tu compra!";

  mensaje.hidden = false;
  estado.carrito = [];
  render();
});

// Primer dibujo al cargar la página
render();
