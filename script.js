 const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
  const NUMS    = '0123456789';
  const SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const slider     = document.getElementById('length-slider');
  const lenVal     = document.getElementById('length-val');
  const pwDisplay  = document.getElementById('pw-display');
  const genBtn     = document.getElementById('gen-btn');
  const copyBtn    = document.getElementById('copy-btn');
  const errMsg     = document.getElementById('err-msg');
  const toast      = document.getElementById('toast');

  const opts = [
    { id: 'opt-upper',   lblId: 'lbl-upper',   chars: UPPER   },
    { id: 'opt-lower',   lblId: 'lbl-lower',   chars: LOWER   },
    { id: 'opt-numbers', lblId: 'lbl-numbers', chars: NUMS    },
    { id: 'opt-special', lblId: 'lbl-special', chars: SPECIAL },
  ].map(o => ({
    el:  document.getElementById(o.id),
    lbl: document.getElementById(o.lblId),
    chars: o.chars,
  }));

  // Sync slider label
  slider.addEventListener('input', () => {
    lenVal.textContent = slider.value;
  });

  // Toggle active style on checkbox cards
  opts.forEach(({ el, lbl }) => {
    el.addEventListener('change', () => {
      lbl.classList.toggle('active', el.checked);
      errMsg.style.display = 'none';
    });
  });

  // Strength calculator
  function calcStrength(pw) {
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 20) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { level: 1, label: 'Weak',        color: '#E24B4A' };
    if (score <= 4) return { level: 2, label: 'Fair',        color: '#EF9F27' };
    if (score <= 5) return { level: 3, label: 'Strong',      color: '#639922' };
    return              { level: 4, label: 'Very Strong',  color: '#1D9E75' };
  }

  function updateStrengthBar(pw) {
    const segs = ['s1','s2','s3','s4'];
    if (!pw) {
      segs.forEach(id => document.getElementById(id).style.background = '');
      document.getElementById('strength-label').textContent = '';
      return;
    }
    const { level, label, color } = calcStrength(pw);
    segs.forEach((id, i) => {
      document.getElementById(id).style.background = i < level ? color : '#e8eaf0';
    });
    const lbl = document.getElementById('strength-label');
    lbl.textContent = label;
    lbl.style.color = color;
  }

  // Secure random character picker using Web Crypto API
  function secureRandom(max) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] % max;
  }

  // Shuffle array (Fisher-Yates using crypto)
  function secureShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = secureRandom(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Main generation function
  function generatePassword() {
    const selected = opts.filter(o => o.el.checked);

    // Validation
    if (selected.length === 0) {
      errMsg.style.display = 'block';
      return;
    }
    errMsg.style.display = 'none';

    const length = parseInt(slider.value);
    const pool   = selected.map(o => o.chars).join('');

    // Guarantee at least one character from each selected type
    let pwChars = selected.map(o => o.chars[secureRandom(o.chars.length)]);

    // Fill remaining slots from the full pool
    while (pwChars.length < length) {
      pwChars.push(pool[secureRandom(pool.length)]);
    }

    // Shuffle to avoid predictable positions
    const password = secureShuffle(pwChars).join('');

    pwDisplay.textContent = password;
    updateStrengthBar(password);
  }

  // Copy to clipboard
  copyBtn.addEventListener('click', () => {
    const pw = pwDisplay.textContent;
    if (!pw || pw.trim() === '' || pwDisplay.querySelector('.placeholder')) return;

    navigator.clipboard.writeText(pw).then(() => {
      toast.className = 'toast show';
      toast.textContent = '✅ Copied to clipboard!';
      setTimeout(() => { toast.className = 'toast'; }, 2200);
    }).catch(() => {
      toast.className = 'toast error';
      toast.textContent = '❌ Copy failed. Please copy manually.';
      setTimeout(() => { toast.className = 'toast'; }, 2200);
    });
  });

  genBtn.addEventListener('click', generatePassword);