// --- Utilities ---
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    // Year in footer
    $('#year').textContent = new Date().getFullYear();

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if(el){ e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      })
    })

    // --- Star Rating Component ---
    const starGroup = $('#star-group');
    let currentRating = 5;
    function renderStars(rating = 0){
      starGroup.innerHTML = '';
      for(let i=1;i<=5;i++){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'star';
        btn.setAttribute('aria-label', `${i} star`);
        btn.innerHTML = i <= rating ? filledStar() : emptyStar();
        btn.addEventListener('click', () => { currentRating = i; renderStars(currentRating); });
        starGroup.appendChild(btn);
      }
    }
    function filledStar(){
      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="url(#g)">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()}" />
            <stop offset="100%" stop-color="${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()}" />
          </linearGradient>
        </defs>
        <path d="M12 .587l3.668 7.431L24 9.753l-6 5.853 1.416 8.26L12 19.771l-7.416 4.095L6 15.606 0 9.753l8.332-1.735z"/></svg>`;
    }
    function emptyStar(){
      return `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.4">
        <path d="M12 .587l3.668 7.431L24 9.753l-6 5.853 1.416 8.26L12 19.771l-7.416 4.095L6 15.606 0 9.753l8.332-1.735z"/></svg>`;
    }
    renderStars(currentRating);

    // --- Feedback List (localStorage) ---
    const fbForm = $('#feedback-form');
    const fbList = $('#feedback-list');
    const fbStatus = $('#fb-status');

    function loadFeedback(){
      const items = JSON.parse(localStorage.getItem('aurora-feedback')||'[]');
      fbList.innerHTML = '';
      items.forEach(addFeedbackItem);
    }

    function addFeedbackItem({name, rating, comment, date}){
      const div = document.createElement('div');
      div.className = 'feedback-item';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <strong>${escapeHtml(name)}</strong>
          <small style="color:var(--muted)">${new Date(date).toLocaleString()}</small>
        </div>
        <div style="margin:6px 0;">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</div>
        <div>${escapeHtml(comment)}</div>
      `;
      fbList.prepend(div);
    }

    function escapeHtml(str){
      return str.replace(/[&<>"']/g, s => ({'&':'&','<':'<','>':'>','"':'"','\'':'''}[s]));
    }

    fbForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#fb-name').value.trim();
      const comment = $('#fb-comment').value.trim();
      if(!name || !comment){
        fbStatus.textContent = 'Please fill in your name and comment.';
        fbStatus.style.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
        return;
      }
      const entry = { name, rating: currentRating, comment, date: new Date().toISOString() };
      const items = JSON.parse(localStorage.getItem('aurora-feedback')||'[]');
      items.push(entry);
      localStorage.setItem('aurora-feedback', JSON.stringify(items));
      addFeedbackItem(entry);
      fbForm.reset();
      currentRating = 5; renderStars(currentRating);
      fbStatus.textContent = 'Thanks for your feedback!';
      fbStatus.style.color = getComputedStyle(document.documentElement).getPropertyValue('--success');
    });

    loadFeedback();

    // --- Contact form (mailto fallback) ---
    const cForm = $('#contact-form');
    const cStatus = $('#contact-status');
    cForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(cForm);
      const name = data.get('name');
      const email = data.get('email');
      const message = data.get('message');

      if(!name || !email || !message){
        cStatus.textContent = 'Please complete all fields.';
        cStatus.style.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
        return;
      }

      // Simple email format check
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        cStatus.textContent = 'Please enter a valid email address.';
        cStatus.style.color = getComputedStyle(document.documentElement).getPropertyValue('--warning');
        return;
      }

      const subject = encodeURIComponent('New message from Aurora Luxe website');
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:hello@auroraluxe.com?subject=${subject}&body=${body}`;
      cStatus.textContent = 'Opening your email app…';
      cStatus.style.color = getComputedStyle(document.documentElement).getPropertyValue('--muted');
      cForm.reset();
    });