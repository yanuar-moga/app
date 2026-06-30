/**
 * SIPANDA - Core Engine Client Application Framework
 * Architectural Year: 2026 UI/UX
 */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbx7Vbq4RhCL8qpOksha_s4CloWSfJwyHPcAHF0bkic5YzCy3tKGpSXTfvwUy83ecjpD/exec";
const SPREADSHEET_ID = "1bjy5x2MgD92uEDs8z-DyDRg6puKk8od8RSf5y4L70lo";

const app = {
  state: {
    user: null,
    role: null,
    config: {},
    wizardStep: 1,
    uploadedUrls: { PASFOTO: "", KK: "", AKTA: "" }
  },

  init: async () => {
    app.diagnostik.renderQuestions();
    app.wizard.loadDraft();
    
    // Check Existing Session Timeout 30 Minutes Rule
    const savedSession = localStorage.getItem('sipanda_session');
    const sessionTime = localStorage.getItem('sipanda_session_time');
    
    setTimeout(() => {
      document.getElementById('screen-splash').classList.remove('active');
      if (savedSession && sessionTime && (Date.now() - sessionTime < 30 * 60 * 1000)) {
        app.state.user = savedSession;
        app.state.role = localStorage.getItem('sipanda_role');
        app.router.navHome();
      } else {
        app.auth.logout();
        app.router.navigate('screen-login');
      }
    }, 2500);
  },

  router: {
    navigate: (screenId) => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      const target = document.getElementById(screenId);
      if(target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
      }
      
      // Control Bottom Layout Nav visibility
      const nav = document.getElementById('app-nav');
      if (screenId === 'screen-splash' || screenId === 'screen-login') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        // Handle accessibility role permissions display
        if(app.state.role === 'SISWA') {
          document.querySelectorAll('.student-only').forEach(e => e.style.display = 'flex');
        } else {
          document.querySelectorAll('.student-only').forEach(e => e.style.display = 'none');
        }
      }
    },
    navHome: () => {
      if(app.state.role === 'SISWA') {
        app.router.navigate('screen-dash-siswa');
        app.student.loadDashboard();
      } else {
        app.router.navigate('screen-dash-guru');
        app.teacher.loadDashboard();
      }
    }
  },

  auth: {
    login: async () => {
      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-pin').value;
      if(!u || !p) return alert("Mohon lengkapi seluruh field login.");

      app.ui.showLoading(true);
      const res = await app.network.send('login', { username: u, pin: p });
      app.ui.showLoading(false);

      if(res.status === 'success') {
        app.state.user = res.username;
        app.state.role = res.role;
        localStorage.setItem('sipanda_session', res.username);
        localStorage.setItem('sipanda_role', res.role);
        localStorage.setItem('sipanda_session_time', Date.now());
        app.router.navHome();
      } else {
        alert(res.message);
      }
    },
    logout: () => {
      localStorage.removeItem('sipanda_session');
      localStorage.removeItem('sipanda_role');
      localStorage.removeItem('sipanda_session_time');
      app.state.user = null;
      app.state.role = null;
      app.router.navigate('screen-login');
    }
  },

  network: {
    send: async (action, payload = {}) => {
      // Automatic global configuration refresh session timing validation rule updates
      if(localStorage.getItem('sipanda_session_time')) {
        localStorage.setItem('sipanda_session_time', Date.now());
      }
      try {
        const response = await fetch(GAS_API_URL, {
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({ ssId: SPREADSHEET_ID, action, payload })
        });
        return await response.json();
      } catch (err) {
        console.error(err);
        return { status: 'error', message: 'Koneksi jaringan gagal.' };
      }
    }
  },

  wizard: {
    next: async () => {
      const currentStepEl = document.querySelector(`.wizard-step[data-step="${app.state.wizardStep}"]`);
      const inputs = currentStepEl.querySelectorAll('[required]');
      for(let input of inputs) {
        if(!input.value) return alert('Mohon isi field wajib pada halaman ini sebelum melanjutkan.');
      }

      app.wizard.saveDraft();

      if(app.state.wizardStep < 5) {
        currentStepEl.classList.remove('active');
        app.state.wizardStep++;
        document.querySelector(`.wizard-step[data-step="${app.state.wizardStep}"]`).classList.add('active');
        document.getElementById('btn-wizard-prev').style.display = 'inline-flex';
        if(app.state.wizardStep === 5) {
          document.getElementById('btn-wizard-next').textContent = 'Kirim Data Final';
        }
        app.wizard.updateProgress();
      } else {
        await app.wizard.submitFinal();
      }
    },
    prev: () => {
      if(app.state.wizardStep > 1) {
        document.querySelector(`.wizard-step[data-step="${app.state.wizardStep}"]`).classList.remove('active');
        app.state.wizardStep--;
        document.querySelector(`.wizard-step[data-step="${app.state.wizardStep}"]`).classList.add('active');
        document.getElementById('btn-wizard-next').textContent = 'Lanjut';
        if(app.state.wizardStep === 1) document.getElementById('btn-wizard-prev').style.display = 'none';
        app.wizard.updateProgress();
      }
    },
    updateProgress: () => {
      const pct = (app.state.wizardStep / 5) * 100;
      document.getElementById('bio-progress').style.width = `${pct}%`;
    },
    saveDraft: () => {
      const formData = new FormData(document.getElementById('form-biodata-wizard'));
      const obj = {};
      formData.forEach((val, key) => obj[key] = val);
      localStorage.setItem('sipanda_bio_draft', JSON.stringify(obj));
    },
    loadDraft: () => {
      const draft = localStorage.getItem('sipanda_bio_draft');
      if(draft) {
        const obj = JSON.parse(draft);
        for(let key in obj) {
          const el = document.querySelector(`[name="${key}"]`);
          if(el) el.value = obj[key];
        }
      }
    },
    submitFinal: async () => {
      app.ui.showLoading(true);
      
      // Sequential critical file upload systems
      await app.wizard.uploadSpecificFile('file-pasfoto', 'PASFOTO');
      await app.wizard.uploadSpecificFile('file-kk', 'KK');
      await app.wizard.uploadSpecificFile('file-akta', 'AKTA');

      const formData = new FormData(document.getElementById('form-biodata-wizard'));
      const finalPayload = {};
      formData.forEach((val, key) => finalPayload[key] = val);
      
      // Inject external secure cloud storage endpoints
      finalPayload['Link Pas Foto'] = app.state.uploadedUrls.PASFOTO;
      finalPayload['Link KK'] = app.state.uploadedUrls.KK;
      finalPayload['Link Akta'] = app.state.uploadedUrls.AKTA;

      const res = await app.network.send('submitBiodata', { data: finalPayload });
      app.ui.showLoading(false);

      if(res.status === 'success') {
        alert(res.message);
        localStorage.removeItem('sipanda_bio_draft');
        app.router.navigate('screen-login');
      } else {
        alert(res.message);
      }
    },
    uploadSpecificFile: async (elementId, type) => {
      const fileEl = document.getElementById(elementId);
      if(fileEl && fileEl.files.length > 0) {
        const file = fileEl.files[0];
        if(file.size > 5 * 1024 * 1024) return alert(`File ${type} melebihi batas 5MB.`);
        
        const base64DataRaw = await app.utils.toBase64(file);
        const cleanBase64 = base64DataRaw.split(',')[1];
        
        const res = await app.network.send('uploadFile', {
          type: type,
          fileName: file.name,
          mimeType: file.type,
          base64Data: cleanBase64
        });
        
        if(res.status === 'success') app.state.uploadedUrls[type] = res.url;
      }
    }
  },

  diagnostik: {
    questions: [
      { id: 1, text: "Saya lebih mudah mengingat penjelasan jika melihat diagram/gambar.", type: "V" },
      { id: 2, text: "Saya sering membaca keras-keras atau menggerakkan bibir saat belajar.", type: "A" },
      { id: 3, text: "Saya menyukai eksperimen atau aktivitas fisik langsung di kelas.", type: "K" },
      { id: 4, text: "Saya merasa lelah setelah berada di keramaian dalam jangka waktu lama.", type: "I" },
      { id: 5, text: "Saya senang berdiskusi kelompok dan mudah bergaul dengan orang baru.", type: "E" },
      { id: 6, text: "Melihat coretan berwarna membantu saya fokus menghafal materi.", type: "V" },
      { id: 7, text: "Saya terganggu belajar jika ada suara bising di sekitar saya.", type: "A" },
      { id: 8, text: "Saya tidak betah duduk diam di kursi dalam waktu lebih dari 30 menit.", type: "K" },
      { id: 9, text: "Saya lebih memilih mengekspresikan pikiran lewat tulisan daripada lisan.", type: "I" },
      { id: 10, text: "Saya nyaman berbicara di depan umum atau memimpin kelompok.", type: "E" },
      { id: 11, text: "Buku ilustrasi komik visual lebih menarik bagi saya daripada buku teks polos.", type: "V" },
      { id: 12, text: "Mendengarkan musik instrumen meningkatkan konsentrasi belajar saya.", type: "A" },
      { id: 13, text: "Saya sering mengetuk jari atau menggerakkan kaki saat berpikir.", type: "K" },
      { id: 14, text: "Saya butuh waktu sendiri (me-time) untuk memulihkan energi internal.", type: "I" },
      { id: 15, text: "Saya mendapatkan inspirasi ide baru ketika bertukar pikiran dengan orang lain.", type: "E" },
      { id: 16, text: "Saya cepat menyadari perubahan dekorasi visual layout tata ruang kelas.", type: "V" },
      { id: 17, text: "Saya lebih mudah memahami instruksi lisan dibandingkan manual tertulis.", type: "A" },
      { id: 18, text: "Menulis rangkuman berulang kali membuat tangan saya ingat pola materi.", type: "K" },
      { id: 19, text: "Saya memiliki sedikit teman dekat namun hubungan kami sangat mendalam.", type: "I" },
      { id: 20, text: "Saya cenderung spontan bertindak dan adaptif di situasi baru.", type: "E" }
    ],
    renderQuestions: () => {
      const container = document.getElementById('diagnostik-questions-container');
      container.innerHTML = app.diagnostik.questions.map((q) => `
        <div class="input-group" style="margin-bottom:20px; border-bottom:1px solid var(--glass-border); padding-bottom:12px;">
          <p style="font-size:14px; margin-bottom:8px; font-weight:500;">${q.id}. ${q.text}</p>
          <div style="display:flex; gap:16px;">
            <label><input type="radio" name="dq-${q.id}" value="3" required> Ya</label>
            <label><input type="radio" name="dq-${q.id}" value="1"> Ragu</label>
            <label><input type="radio" name="dq-${q.id}" value="0"> Tidak</label>
          </div>
        </div>
      `).join('');
    }
  },

  student: {
    loadDashboard: async () => {
      const res = await app.network.send('getStudentDashboard', { username: app.state.user });
      if(res.status === 'success') {
        const d = res.data;
        document.getElementById('ds-nama').textContent = d.biodata['Nama Lengkap'] || app.state.user;
        document.getElementById('ds-kelas-wali').textContent = `Kelas ${d.biodata['Kelas'] || '-'} | Wali Kelas: ${d.biodata['Nama Wali Kelas'] || '-'}`;
        document.getElementById('ds-poin').textContent = d.totalPoin;
        document.getElementById('ds-prestasi-count').textContent = d.prestasi.length;
        document.getElementById('ds-current-mood').textContent = d.currentMood;
        if(d.biodata['Link Pas Foto']) document.getElementById('ds-avatar').src = d.biodata['Link Pas Foto'];
      }
    },
    setMood: async (moodChar) => {
      const res = await app.network.send('submitMood', { username: app.state.user, mood: moodChar });
      if(res.status === 'success') {
        document.getElementById('ds-current-mood').textContent = moodChar;
      }
    },
    evaluateDiagnostik: async () => {
      let scores = { V: 0, A: 0, K: 0, I: 0, E: 0 };
      for(let q of app.diagnostik.questions) {
        const rad = document.querySelector(`input[name="dq-${q.id}"]:checked`);
        if(!rad) return alert('Mohon tuntaskan semua 20 butir asesmen diagnostik.');
        scores[q.type] += parseInt(rad.value);
      }

      // Compute style dynamic results
      let gaya = "Kombinasi";
      if(scores.V > scores.A && scores.V > scores.K) gaya = "Visual";
      else if(scores.A > scores.V && scores.A > scores.K) gaya = "Auditori";
      else if(scores.K > scores.V && scores.K > scores.A) gaya = "Kinestetik";

      let kepribadian = "Ambivert";
      if(scores.I > scores.E + 2) kepribadian = "Introvert";
      else if(scores.E > scores.I + 2) kepribadian = "Extrovert";

      let kesimpulan = `Ananda cenderung memiliki gaya belajar ${gaya.toLowerCase()}. `;
      if(gaya === "Visual") kesimpulan += "Ananda menyukai pembelajaran dengan media gambar dan visualisasi terstruktur. ";
      if(gaya === "Auditori") kesimpulan += "Ananda optimal belajar dengan mendengarkan pemaparan serta forum diskusi verbal. ";
      if(gaya === "Kinestetik") kesimpulan += "Ananda menyukai pembelajaran praktik interaktif lapangan. ";
      kesimpulan += `Berdasarkan pemetaan psikologi karakter, ananda termasuk pribadi ${kepribadian.toLowerCase()}.`;

      app.ui.showLoading(true);
      const res = await app.network.send('submitDiagnostik', {
        username: app.state.user,
        gayaBelajar: gaya,
        kepribadian: kepribadian,
        kesimpulan: kesimpulan
      });
      app.ui.showLoading(false);
      
      alert(`Analisis Selesai!\n\n${res.kesimpulan}`);
      app.router.navHome();
    }
  },

  teacher: {
    activeModalType: "",
    loadDashboard: async () => {
      const res = await app.network.send('getTeacherDashboard', { username: app.state.user });
      if(res.status === 'success') {
        const m = res.metrics;
        document.getElementById('dg-total').textContent = m.totalSiswa;
        document.getElementById('dg-ratio').textContent = `${m.laki} L / ${m.perempuan} P`;
        document.getElementById('dg-critical').textContent = m.bermasalah;
        document.getElementById('dg-nobio').textContent = m.belumBiodata;
        app.state.cachedStudents = res.listSiswa;
      }
    },
    openModal: (type) => {
      app.teacher.activeModalType = type;
      const mTitle = document.getElementById('modal-title');
      const mBody = document.getElementById('modal-body-content');
      
      let optionsHtml = (app.state.cachedStudents || []).map(s => `<option value="${s.nisn}">${s.nama} (${s.kelas})</option>`).join('');
      let selectSiswaHtml = `<div class="input-group"><label>Pilih Siswa</label><select id="modal-target-siswa" class="form-control">${optionsHtml}</select></div>`;

      if(type === 'prestasi') {
        mTitle.textContent = "Tambah Prestasi Siswa";
        mBody.innerHTML = selectSiswaHtml + `
          <div class="input-group"><label>Nama Prestasi</label><input type="text" id="m-p-nama" class="form-control"></div>
          <div class="input-group"><label>Tingkat (Sekolah/Kabupaten/Provinsi/Nasional)</label><input type="text" id="m-p-tingkat" class="form-control"></div>
          <div class="input-group"><label>Keterangan Tambahan</label><input type="text" id="m-p-ket" class="form-control"></div>
        `;
      } else if(type === 'pelanggaran') {
        mTitle.textContent = "Catat Pelanggaran Kedisiplinan";
        mBody.innerHTML = selectSiswaHtml + `
          <div class="input-group"><label>Nama Pelanggaran</label><input type="text" id="m-l-nama" class="form-control"></div>
          <div class="input-group"><label>Bobot Poin</label><input type="number" id="m-l-poin" class="form-control" placeholder="Contoh: 15"></div>
          <div class="input-group"><label>Keterangan Kejadian</label><input type="text" id="m-l-ket" class="form-control"></div>
        `;
      } else if(type === 'catatan') {
        mTitle.textContent = "Beri Catatan Wali Kelas";
        mBody.innerHTML = selectSiswaHtml + `
          <div class="input-group"><label>Catatan Perkembangan Karakter</label><textarea id="m-c-text" class="form-control" rows="4"></textarea></div>
        `;
      }
      document.getElementById('teacher-modal').style.display = 'block';
    },
    submitModalAction: async () => {
      const targetNisn = document.getElementById('modal-target-siswa').value;
      if(!targetNisn) return alert('Target siswa tidak valid.');

      app.ui.showLoading(true);
      let payload = { username: app.state.user, nisn: targetNisn };
      let actionType = "";

      if(app.teacher.activeModalType === 'prestasi') {
        actionType = 'addPrestasi';
        payload.nama = document.getElementById('m-p-nama').value;
        payload.tingkat = document.getElementById('m-p-tingkat').value;
        payload.keterangan = document.getElementById('m-p-ket').value;
      } else if(app.teacher.activeModalType === 'pelanggaran') {
        actionType = 'addPelanggaran';
        payload.pelanggaran = document.getElementById('m-l-nama').value;
        payload.poin = document.getElementById('m-l-poin').value;
        payload.keterangan = document.getElementById('m-l-ket').value;
      } else if(app.teacher.activeModalType === 'catatan') {
        actionType = 'addCatatan';
        payload.catatan = document.getElementById('m-c-text').value;
      }

      const res = await app.network.send(actionType, payload);
      app.ui.showLoading(false);
      
      if(res.status === 'success') {
        alert('Data transaksi bimbingan berhasil disimpan.');
        document.getElementById('teacher-modal').style.display = 'none';
        app.teacher.loadDashboard();
      }
    }
  },

  chat: {
    load: async () => {
      const res = await app.network.send('getChat', { username: app.state.user, role: app.state.role });
      if(res.status === 'success') {
        const container = document.getElementById('chat-box');
        container.innerHTML = res.data.map(c => {
          const isMe = c.username.toString() === app.state.user.toString();
          const displaySender = c.anonim === 'YA' ? 'Anonim' : c.username;
          return `
            <div class="chat-bubble ${isMe ? 'me' : 'other'}">
              <div style="font-weight:700; font-size:11px; margin-bottom:2px;">${displaySender}</div>
              <div>${c.pesan}</div>
              <div class="chat-meta">
                ${new Date(c.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                ${app.state.role !== 'SISWA' ? `<span style="color:red; cursor:pointer; margin-left:8px;" onclick="app.chat.deleteRow(${c.id})">🗑</span>` : ''}
              </div>
            </div>
          `;
        }).join('');
        container.scrollTop = container.scrollHeight;
      }
    },
    send: async () => {
      const txt = document.getElementById('chat-message-input').value;
      const isAnon = document.getElementById('chat-anonim').checked;
      if(!txt) return;

      document.getElementById('chat-message-input').value = "";
      await app.network.send('sendChat', { username: app.state.user, pesan: txt, anonim: isAnon });
      app.chat.load();
    },
    deleteRow: async (id) => {
      if(confirm('Hapus pesan ini secara permanen dari server database?')) {
        await app.network.send('deleteChat', { username: app.state.user, rowId: id });
        app.chat.load();
      }
    }
  },

  ui: {
    showLoading: (status) => {
      if(status) {
        let loader = document.createElement('div');
        loader.id = "global-app-loader";
        loader.style = "position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999; background:rgba(0,0,0,0.4); display:flex; justify-content:center; align-items:center; color:white; font-weight:600; backdrop-filter:blur(5px);";
        loader.innerHTML = '<div class="glass-card" style="text-align:center; color:var(--text-main);">Sinkronisasi Enkripsi Data...</div>';
        document.body.appendChild(loader);
      } else {
        const loader = document.getElementById('global-app-loader');
        if(loader) loader.remove();
      }
    }
  },

  utils: {
    toBase64: file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    })
  }
};

// Polling runtime network updates interval for real-time internal communication chat integration
setInterval(() => {
  if(document.getElementById('screen-chat').classList.contains('active')) {
    app.chat.load();
  }
}, 7000);

window.addEventListener('DOMContentLoaded', app.init);
