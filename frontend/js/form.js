// Load products from localStorage or start empty
let products = JSON.parse(localStorage.getItem("products")) || [];

// Keeps track of the product being edited
let editIndex = null;

// Get form and table body
const form = document.getElementById("productForm");
const tableBody = document.getElementById("productTableBody");

// Render products when page loads
renderTable();

// Handle form submission (Add or Edit)
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get reference value separately (we will validate it)
  const referenciaValue = document.getElementById("referencia").value.trim();

  // Basic validation: reference is required
  if (referenciaValue === "") {
    alert("Referência is required.");
    return;
  }

  // Check for duplicate reference (only when adding)
  const duplicate = products.some((product, index) => {
    return product.referencia === referenciaValue && index !== editIndex;
  });

  if (duplicate) {
    alert("A product with this referência already exists.");
    return;
  }

  // Build product object
  const product = {
    referencia: referenciaValue,
    cor: document.getElementById("cor").value,
    x: document.getElementById("x").value,
    y: document.getElementById("y").value,
    rack: document.getElementById("rack").value,
    acab: document.getElementById("acab").value,
    obs: document.getElementById("obs").value
  };

  // Decide between ADD or EDIT
  if (editIndex === null) {
    products.push(product); // ADD
  } else {
    products[editIndex] = product; // EDIT
    editIndex = null;
  }

  saveToLocalStorage();
  renderTable();
  form.reset();
});

// Render all products into the table
function renderTable() {
  tableBody.innerHTML = "";

  products.forEach((product, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.referencia}</td>
      <td>${product.cor}</td>
      <td>${product.x}</td>
      <td>${product.y}</td>
      <td>${product.rack}</td>
      <td>${product.acab}</td>
      <td>${product.obs}</td>
      <td>
        <button onclick="editProduct(${index})">Edit</button>
        <button onclick="deleteProduct(${index})">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Delete product with confirmation
function deleteProduct(index) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this product?"
  );

  // Only delete if user confirms
  if (!confirmDelete) return;

  products.splice(index, 1);
  saveToLocalStorage();
  renderTable();
}

// Fill form with product data for editing
function editProduct(index) {
  const product = products[index];

  document.getElementById("referencia").value = product.referencia;
  document.getElementById("cor").value = product.cor;
  document.getElementById("x").value = product.x;
  document.getElementById("y").value = product.y;
  document.getElementById("rack").value = product.rack;
  document.getElementById("acab").value = product.acab;
  document.getElementById("obs").value = product.obs;

  // Set index so submit knows this is an edit
  editIndex = index;
}

// Save products to localStorage
function saveToLocalStorage() {
  localStorage.setItem("products", JSON.stringify(products));
}
