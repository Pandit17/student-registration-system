// Student Registration System
// Pure JS (no frameworks). Meets requirements:
// - Add/Edit/Delete records
// - Persist via localStorage
// - Validate inputs (name letters only; id & contact digits only; email format; contact min 10)
// - Prevent empty row
// - Dynamic vertical scrollbar via JS
// - Responsive UI (CSS handles breakpoints)
(function(){
  'use strict';

  /** ---------- DOM HOOKS ---------- */
  const form = document.getElementById('studentForm');
  const nameInput = document.getElementById('studentName');
  const idInput = document.getElementById('studentId');
  const emailInput = document.getElementById('email');
  const contactInput = document.getElementById('contact');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('search');
  const countBadge = document.getElementById('countBadge');
  const ariaStatus = document.getElementById('ariaStatus');
  const tableWrapper = document.getElementById('tableWrapper');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const yearSpan = document.getElementById('year');
  const formTitle = document.getElementById('formTitle');

  const nameError = document.getElementById('nameError');
  const idError = document.getElementById('idError');
  const emailError = document.getElementById('emailError');
  const contactError = document.getElementById('contactError');

  yearSpan.textContent = new Date().getFullYear();

  // App state
  let students = [];
  let editIndex = null; // index in students array while editing

  /** ---------- UTILITIES ---------- */
  const STORAGE_KEY = 'srs_students_v1';

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
  }

  function speak(msg) {
    ariaStatus.textContent = msg;
  }

  function clearErrors() {
    nameError.textContent = '';
    idError.textContent = '';
    emailError.textContent = '';
    contactError.textContent = '';
  }

  function onlyDigits(str) {
    return str.replace(/\D+/g, '');
  }

  function onlyLettersSpaces(str) {
    return str.replace(/[^a-zA-Z\s]+/g, '');
  }

  /** ---------- VALIDATION ---------- */
  function validate() {
    clearErrors();
    let ok = true;

    const name = nameInput.value.trim();
    const sid = idInput.value.trim();
    const email = emailInput.value.trim();
    const contact = contactInput.value.trim();

    // Name: letters + spaces, length constraints
    if (!name) {
      nameError.textContent = 'Name is required.';
      ok = false;
    } else if (!/^[A-Za-z ]{2,60}$/.test(name)) {
      nameError.textContent = 'Use only letters and spaces (2–60 chars).';
      ok = false;
    }

    // Student ID: digits only, non-empty, uniqueness
    if (!sid) {
      idError.textContent = 'Student ID is required.';
      ok = false;
    } else if (!/^\d+$/.test(sid)) {
      idError.textContent = 'Student ID must contain digits only.';
      ok = false;
    } else {
      const duplicateIndex = students.findIndex((s, i) => s.studentId === sid && i !== editIndex);
      if (duplicateIndex !== -1) {
        idError.textContent = 'Student ID must be unique.';
        ok = false;
      }
    }

    // Email format
    if (!email) {
      emailError.textContent = 'Email is required.';
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      emailError.textContent = 'Enter a valid email address.';
      ok = false;
    }

    // Contact: digits only, min length 10
    if (!contact) {
      contactError.textContent = 'Contact number is required.';
      ok = false;
    } else if (!/^\d{10,}$/.test(contact)) {
      contactError.textContent = 'Contact must be at least 10 digits.';
      ok = false;
    }

    return ok;
  }

  /** ---------- RENDER ---------- */
  function render(filter = '') {
    // Build rows
    const frag = document.createDocumentFragment();
    let visibleCount = 0;

    const q = filter.trim().toLowerCase();
    students.forEach((s, idx) => {
      const inFilter = !q ||
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q);
      if (!inFilter) return;

      visibleCount++;
      const tr = document.createElement('tr');

      const tdIndex = document.createElement('td');
      tdIndex.textContent = String(visibleCount);
      tr.appendChild(tdIndex);

      const tdName = document.createElement('td');
      tdName.textContent = s.name;
      tr.appendChild(tdName);

      const tdId = document.createElement('td');
      tdId.textContent = s.studentId;
      tr.appendChild(tdId);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = s.email;
      tr.appendChild(tdEmail);

      const tdContact = document.createElement('td');
      tdContact.textContent = s.contact;
      tr.appendChild(tdContact);

      const tdActions = document.createElement('td');
      tdActions.className = 'actions-cell';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.title = 'Edit';
      editBtn.innerHTML = svgEdit();
      editBtn.addEventListener('click', () => beginEdit(idx));
      tdActions.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.title = 'Delete';
      delBtn.innerHTML = svgDelete();
      delBtn.addEventListener('click', () => remove(idx));
      tdActions.appendChild(delBtn);

      tr.appendChild(tdActions);
      frag.appendChild(tr);
    });

    tableBody.innerHTML = '';
    tableBody.appendChild(frag);

    countBadge.textContent = String(visibleCount);

    // Dynamic vertical scrollbar: if more than N visible rows, turn on scroll
    const SCROLL_THRESHOLD = 7;
    if (visibleCount > SCROLL_THRESHOLD) {
      tableWrapper.classList.add('scrollable');
    } else {
      tableWrapper.classList.remove('scrollable');
    }
  }

  function svgEdit(){
    return '<svg class="icon edit" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75l11-11-3.75-3.75-11 11zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';
  }
  function svgDelete(){
    return '<svg class="icon delete" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12v14a2 2 0 01-2 2H8a2 2 0 01-2-2V7zm3-4h6l1 1h5v2H3V4h5l1-1z"/></svg>';
  }

  /** ---------- ACTIONS ---------- */
  function beginEdit(index){
    editIndex = index;
    const s = students[index];
    nameInput.value = s.name;
    idInput.value = s.studentId;
    emailInput.value = s.email;
    contactInput.value = s.contact;

    submitBtn.textContent = 'Update Student';
    formTitle.textContent = 'Update Student';
    nameInput.focus();
    speak(`Editing ${s.name}`);
  }

  function remove(index){
    const s = students[index];
    const ok = confirm(`Delete record for "${s.name}" (ID: ${s.studentId})?`);
    if (!ok) return;
    students.splice(index, 1);
    save();
    render(searchInput.value);
    speak(`Deleted ${s.name}`);
    // If we were editing this row, reset form
    if (editIndex === index) {
      resetForm();
    }
  }

  function resetForm(){
    editIndex = null;
    form.reset();
    submitBtn.textContent = 'Add Student';
    formTitle.textContent = 'Register a Student';
    clearErrors();
  }

  /** ---------- EVENT WIRING ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Sanitize inputs while typing/paste
    nameInput.value = onlyLettersSpaces(nameInput.value);
    idInput.value = onlyDigits(idInput.value);
    contactInput.value = onlyDigits(contactInput.value);

    if (!validate()) {
      speak('Please correct the errors in the form.');
      return;
    }

    const data = {
      name: nameInput.value.trim(),
      studentId: idInput.value.trim(),
      email: emailInput.value.trim(),
      contact: contactInput.value.trim()
    };

    if (editIndex === null) {
      // Add
      students.push(data);
      speak(`Added ${data.name}`);
    } else {
      // Update
      students[editIndex] = data;
      speak(`Updated ${data.name}`);
    }

    save();
    render(searchInput.value);
    resetForm();
  });

  resetBtn.addEventListener('click', () => {
    resetForm();
    speak('Form reset');
  });

  // Input sanitization on the fly
  nameInput.addEventListener('input', () => {
    const clean = onlyLettersSpaces(nameInput.value);
    if (nameInput.value !== clean) nameInput.value = clean;
  });
  idInput.addEventListener('input', () => {
    const clean = onlyDigits(idInput.value);
    if (idInput.value !== clean) idInput.value = clean;
  });
  contactInput.addEventListener('input', () => {
    const clean = onlyDigits(contactInput.value);
    if (contactInput.value !== clean) contactInput.value = clean;
  });

  // Search
  searchInput.addEventListener('input', () => {
    render(searchInput.value);
  });

  // Clear all
  clearAllBtn.addEventListener('click', () => {
    if (!students.length) return;
    const ok = confirm('This will remove ALL records. Continue?');
    if (!ok) return;
    students = [];
    save();
    render(searchInput.value);
    resetForm();
    speak('All records cleared');
  });

  // Load on start
  students = load();
  render('');

  // Ensure scroll toggles when resizing (in case row height changes)
  window.addEventListener('resize', () => render(searchInput.value));

})();