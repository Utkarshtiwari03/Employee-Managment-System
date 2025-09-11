/* Robust frontend for your Employee (id, name, number, email)
   - Uses /Employees exactly as in your controller (capital E)
   - Logs request & response (console) so we can see what's happening
   - Tolerant: reads text or JSON responses
   - Sends id in update payload too (just in case)
*/

const API_URL = "/Employees"; // matches your controller

const $ = sel => document.querySelector(sel);

document.addEventListener("DOMContentLoaded", () => {
  init();
  loadEmployees();
});

function init(){
  $("#employeeForm").addEventListener("submit", onSave);
  $("#clearBtn").addEventListener("click", clearForm);
  $("#refreshBtn").addEventListener("click", loadEmployees);
  $("#searchBtn").addEventListener("click", onSearch);
  $("#clearSearchBtn").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#searchResult").innerHTML = "";
  });
}

/* Universal request helper:
   - logs method/url
   - returns {res, body} where body is parsed JSON if possible, else text
*/
async function request(url, opts = {}) {
  const method = (opts.method || "GET").toUpperCase();
  console.log(`FETCH → ${method} ${url}`, opts);
  const res = await fetch(url, opts);
  const ct = res.headers.get("content-type") || "";
  let body;
  try {
    if (ct.includes("application/json")) body = await res.json();
    else body = await res.text();
  } catch (e) {
    // fallback
    try { body = await res.text(); } catch (ee) { body = null; }
  }
  console.log(`FETCH-RESP ← ${res.status} ${res.statusText}`, body);
  return { res, body };
}

/* Load all employees */
async function loadEmployees() {
  try {
    const { res, body } = await request(API_URL);
    if (!res.ok) {
      toast(`Load failed (${res.status})`);
      return;
    }
    const list = Array.isArray(body) ? body : [];
    renderTable(list);
    clearForm(); // reset selection when refreshing
  } catch (err) {
    console.error(err);
    toast("Load error - check console");
  }
}

function renderTable(list) {
  const tbody = $("#empTable tbody");
  tbody.innerHTML = "";
  list.forEach(emp => {
    const tr = document.createElement("tr");
    tr.dataset.id = emp.id;

    tr.innerHTML = `
      <td>${emp.id}</td>
      <td>${escapeHtml(emp.name)}</td>
      <td>${escapeHtml(emp.number)}</td>
      <td>${escapeHtml(emp.email)}</td>
      <td>
        <button class="small-btn" data-action="select">Select</button>
        <button class="small-btn danger" data-action="delete">Delete</button>
      </td>
    `;

    // clicking row selects
    tr.addEventListener("click", (e) => {
      // avoid row click when clicking buttons
      if (e.target && (e.target.tagName === "BUTTON")) return;
      selectRow(emp, tr);
    });

    // button actions
    tr.querySelector("[data-action='select']").addEventListener("click", (ev) => {
      ev.stopPropagation();
      selectRow(emp, tr);
    });
    tr.querySelector("[data-action='delete']").addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await onDelete(emp.id);
    });

    tbody.appendChild(tr);
  });
}

/* Save handler: create or update depending on hidden id */
async function onSave(e) {
  e.preventDefault();
  const id = $("#empId").value.trim();
  const payload = {
    name: $("#empName").value.trim(),
    number: $("#empNumber").value.trim(),
    email: $("#empEmail").value.trim()
  };

  if (!payload.name || !payload.number || !payload.email) {
    toast("Fill all fields");
    return;
  }

  try {
    let endpoint = API_URL;
    let method = "POST";
    if (id) {
      endpoint = `${API_URL}/${id}`;
      method = "PUT";
      payload.id = Number(id); // include id in body too
    }

    const { res, body } = await request(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain"
      },
      body: JSON.stringify(payload)
    });

    // show server reply text (body) if any — helps debugging
    if (!res.ok) {
      console.error("Server responded with error:", res.status, body);
      toast(`Operation failed: ${res.status} ${res.statusText}`);
      return;
    }

    // success
    // sometimes server returns a plain text message (Saved Succesfully). Show it.
    if (typeof body === "string" && body.trim()) toast(body);
    else toast(id ? "Updated" : "Saved");

    clearForm();
    loadEmployees();
  } catch (err) {
    console.error("Save error:", err);
    toast("Save failed - check console");
  }
}

/* Select a row (prefill form) */
function selectRow(emp, trEl) {
  // clear previous highlight
  const prev = document.querySelector("tr.selected");
  if (prev) prev.classList.remove("selected");
  if (trEl) trEl.classList.add("selected");

  $("#empId").value = emp.id;
  $("#empName").value = emp.name;
  $("#empNumber").value = emp.number;
  $("#empEmail").value = emp.email;
  $("#formTitle").textContent = `✏️ Update (#${emp.id})`;
  $("#saveBtn").textContent = "Update";
  toast(`Selected: ${emp.name}`);
}

/* Delete */
async function onDelete(id) {
  if (!confirm("Delete this employee?")) return;
  try {
    const { res, body } = await request(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Delete failed:", res.status, body);
      toast("Delete failed");
      return;
    }
    // show message if server returned a message
    if (typeof body === "string" && body.trim()) toast(body);
    else toast("Deleted");
    loadEmployees();
  } catch (err) {
    console.error("Delete error:", err);
    toast("Delete failed - check console");
  }
}

/* Search by ID or name (updates search result area) */
async function onSearch() {
  const q = $("#searchInput").value.trim();
  const out = $("#searchResult");
  out.innerHTML = "";
  if (!q) { toast("Enter ID or name"); return; }

  try {
    let resObj;
    if (/^\d+$/.test(q)) {
      resObj = await request(`${API_URL}/${q}`);
      if (!resObj.res.ok) {
        out.innerHTML = `<div class="card" style="padding:10px;color:#ffdcdc;background:rgba(255,0,0,0.04)">Not found</div>`;
        return;
      }
      renderSearch([resObj.body]);
    } else {
      const enc = encodeURIComponent(q);
      resObj = await request(`${API_URL}/name/${enc}`);
      if (!resObj.res.ok) {
        out.innerHTML = `<div class="card" style="padding:10px;color:#ffdcdc;background:rgba(255,0,0,0.04)">Not found</div>`;
        return;
      }
      renderSearch([resObj.body]);
    }
  } catch (err) {
    console.error("Search error:", err);
    toast("Search failed - check console");
  }
}

function renderSearch(list) {
  const out = $("#searchResult");
  out.innerHTML = "";
  list.forEach(emp => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.margin = "6px 0";
    card.style.padding = "10px";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700">${escapeHtml(emp.name)} <span style="color:var(--muted);font-weight:400">(#${emp.id})</span></div>
          <div style="color:var(--muted);margin-top:6px">${escapeHtml(emp.number)} • ${escapeHtml(emp.email)}</div>
        </div>
        <div>
          <button class="small-btn" id="select-${emp.id}">Select</button>
        </div>
      </div>
    `;
    out.appendChild(card);
    card.querySelector(`#select-${emp.id}`).addEventListener("click", () => {
      // find row if present and select
      const row = document.querySelector(`#empTable tbody tr[data-id='${emp.id}']`);
      selectRow(emp, row || card);
      out.scrollIntoView({behavior:"smooth", block:"center"});
    });
  });
}

/* Utility: clear form & selection */
function clearForm() {
  $("#empId").value = "";
  $("#empName").value = "";
  $("#empNumber").value = "";
  $("#empEmail").value = "";
  $("#formTitle").textContent = "➕ Add Employee";
  $("#saveBtn").textContent = "Save";
  const prev = document.querySelector("tr.selected");
  if (prev) prev.classList.remove("selected");
  $("#searchResult").innerHTML = "";
}

/* Tiny toast */
let _toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(()=> t.classList.remove("show"), 2600);
}

/* Helpful escape for insertion into DOM */
function escapeHtml(s){
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
