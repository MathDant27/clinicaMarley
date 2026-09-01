/* =========================================================
   MARLEY BURGOS — Estética & Beleza
   Interações da página
   ========================================================= */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Isola cada módulo: um erro em um bloco nunca derruba os outros
     nem deixa conteúdo invisível na página. */
  const safe = (nome, fn) => {
    try { fn(); } catch (err) { console.error('[MB] falha em "' + nome + '":', err); }
  };


  /* ---------- CONFIGURAÇÃO RÁPIDA -----------------------
     Troque estes valores pelos dados reais da clínica.
     O número do WhatsApp usa o formato: 55 + DDD + número.
  ------------------------------------------------------- */
  const CONFIG = {
    whatsapp: '5500000000000',
    clinica: 'Marley Burgos Estética & Beleza'
  };

  /* =======================================================
     1. PRELOADER
     ======================================================= */
  const preloader = $('#preloader');
  const plBar = $('#plBar');
  let progress = 0;

  const tick = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 18 + 6);
    if (plBar) plBar.style.width = progress + '%';
    if (progress >= 100) clearInterval(tick);
  }, 130);

  function bootstrap() {
    if (plBar) plBar.style.width = '100%';
    setTimeout(() => {
      preloader && preloader.classList.add('done');
      $('.hero') && $('.hero').classList.add('ready');
      setTimeout(() => $('#wa') && $('#wa').classList.add('show'), 900);
      startCounters();
    }, reduced ? 0 : 620);
  }
  window.addEventListener('load', bootstrap);
  setTimeout(bootstrap, 3500); // rede lenta não pode travar o site

  /* =======================================================
     2. CURSOR PERSONALIZADO
     ======================================================= */
  const cur = $('#cursor');
  const dot = $('#cursorDot');
  if (cur && window.matchMedia('(hover:hover)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;

    addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });

    (function loop() {
      cx = lerp(cx, mx, 0.16);
      cy = lerp(cy, my, 0.16);
      cur.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    const grow = () => cur.classList.add('grow');
    const shrink = () => cur.classList.remove('grow');
    const bind = () => $$('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', grow);
      el.addEventListener('mouseleave', shrink);
    });
    bind();
  }

  /* =======================================================
     3. HEADER + BARRA DE PROGRESSO
     ======================================================= */
  const hdr = $('#hdr');
  const bar = $('#progress');
  const plxEls = $$('[data-parallax]');

  function parallax(y) {
    if (reduced) return;
    plxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  }

  function onScroll() {
    const y = scrollY;
    hdr && hdr.classList.toggle('stuck', y > 80);
    if (bar) {
      const max = document.body.scrollHeight - innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    parallax(y);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =======================================================
     4. MENU MOBILE
     ======================================================= */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  const toggleMenu = force => {
    const open = force !== undefined ? force : !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    document.body.classList.toggle('is-locked', open);
    burger && burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  burger && burger.addEventListener('click', () => toggleMenu());
  menu && $$('a', menu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && toggleMenu(false));

  /* =======================================================
     5. REVEAL ON SCROLL
     ======================================================= */
  const rvEls = $$('[data-rv]');

  if (reduced) {
    rvEls.forEach(el => el.classList.add('in'));
  } else {
    if ('IntersectionObserver' in window) {
      safe('reveal', () => {
        const io = new IntersectionObserver((entries) => {
          entries.forEach((entry, i) => {
            if (!entry.isIntersecting) return;
            setTimeout(() => entry.target.classList.add('in'), i * 90);
            io.unobserve(entry.target);
          });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        rvEls.forEach(el => io.observe(el));
      });
    }

    /* Rede de segurança permanente: revela o que já está na tela.
       Mantém o efeito de scroll intacto e garante que nada fique
       invisível caso o observer falhe em algum navegador. */
    const revealInView = () => {
      rvEls.forEach(el => {
        if (el.classList.contains('in')) return;
        const r = el.getBoundingClientRect();
        if (r.top < innerHeight * 0.92 && r.bottom > 0) el.classList.add('in');
      });
    };
    addEventListener('scroll', revealInView, { passive: true });
    addEventListener('resize', revealInView);
    setTimeout(revealInView, 1200);
  }

  /* =======================================================
     6. CONTADORES DO HERO
     ======================================================= */
  let countersDone = false;
  function startCounters() {
    if (countersDone) return;
    countersDone = true;
    $$('[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduced) { el.textContent = target + suffix; return; }
      const dur = 1800;
      const t0 = performance.now();
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('pt-BR') + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* =======================================================
     7. MARQUEE (duplica para loop contínuo)
     ======================================================= */
  const mq = $('#marquee');
  if (mq) mq.innerHTML += mq.innerHTML;

  /* =======================================================
     8. BOTÕES MAGNÉTICOS
     ======================================================= */
  safe('magnetico', () => {
    if (!reduced && window.matchMedia('(hover:hover)').matches) {
      $$('[data-magnetic]').forEach(el => {
        el.addEventListener('mousemove', e => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          el.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      });
    }
  });

  /* =======================================================
     9. PREVIEW FLUTUANTE DOS SERVIÇOS
     ======================================================= */
  safe('preview-servicos', () => {
    const preview = $('#svcPreview');
    const previewImgs = preview ? $$('.media', preview) : [];
    if (preview && window.matchMedia('(hover:hover)').matches) {
      let px = 0, py = 0, tx = 0, ty = 0, active = false;

      $$('.svc').forEach(card => {
        card.addEventListener('mouseenter', () => {
          const i = parseInt(card.dataset.img, 10) || 0;
          previewImgs.forEach((m, k) => m.classList.toggle('active', k === i));
          preview.classList.add('on');
          active = true;
        });
        card.addEventListener('mouseleave', () => {
          preview.classList.remove('on');
          active = false;
        });
      });

      addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
      (function loop() {
        if (active) {
          px = lerp(px || tx, tx, 0.11);
          py = lerp(py || ty, ty, 0.11);
          preview.style.left = px + 'px';
          preview.style.top = py + 'px';
        } else { px = tx; py = ty; }
        requestAnimationFrame(loop);
      })();
    }
  });

  /* =======================================================
     10. ANTES & DEPOIS (arrastar)
     ======================================================= */
  safe('antes-depois', () => {
    const ba = $('#ba');
    if (ba) {
      const after = $('#baAfter');
      const handle = $('#baHandle');
      let dragging = false;

      const setPos = clientX => {
        const r = ba.getBoundingClientRect();
        const pct = clamp(((clientX - r.left) / r.width) * 100, 2, 98);
        after.style.clipPath = `inset(0 0 0 ${pct}%)`;
        handle.style.left = pct + '%';
      };

      const start = e => { dragging = true; setPos(e.clientX ?? e.touches[0].clientX); };
      const move  = e => {
        if (!dragging) return;
        if (e.cancelable) e.preventDefault();
        setPos(e.clientX ?? e.touches[0].clientX);
      };
      const end = () => { dragging = false; };

      ba.addEventListener('pointerdown', start);
      addEventListener('pointermove', move, { passive: false });
      addEventListener('pointerup', end);
      ba.addEventListener('touchstart', start, { passive: true });
      addEventListener('touchmove', move, { passive: false });
      addEventListener('touchend', end);

      // pequena demonstração quando entra na tela
      if ('IntersectionObserver' in window && !reduced) {
        const demo = new IntersectionObserver(es => {
          es.forEach(e => {
            if (!e.isIntersecting) return;
            demo.unobserve(ba);
            const to = 30, t0 = performance.now();
            (function anim(now) {
              const k = clamp((now - t0) / 1400, 0, 1);
              const eased = Math.sin(k * Math.PI) * (to - 50) + 50;
              after.style.clipPath = `inset(0 0 0 ${eased}%)`;
              handle.style.left = eased + '%';
              if (k < 1) requestAnimationFrame(anim);
            })(t0);
          });
        }, { threshold: 0.4 });
        demo.observe(ba);
      }
    }
  });

  /* =======================================================
     11. DEPOIMENTOS
     ======================================================= */
  safe('depoimentos', () => {
    const slides = $$('#tstSlides .tst-slide');
    const photos = $$('#tstPhotos .media');
    if (slides.length) {
      let idx = 0, timer;
      const go = n => {
        idx = (n + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));
        photos.forEach((p, i) => p.classList.toggle('active', i === idx));
      };
      const auto = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 7000); };
      $('#tstNext') && $('#tstNext').addEventListener('click', () => { go(idx + 1); auto(); });
      $('#tstPrev') && $('#tstPrev').addEventListener('click', () => { go(idx - 1); auto(); });
      auto();
    }
  });

  /* =======================================================
     12. GRID DO INSTAGRAM
     ======================================================= */
  safe('instagram', () => {
    const ig = $('#igGrid');
    if (ig) {
      /* Fotos do feed: arquivo local primeiro, foto de banco como reserva. */
      const posts = [
        '1515377905703-c4788e51af15',
        '1571875257727-256c39da42af',
        '1598440947619-2c35fc9aa908',
        '1607779097040-26e80aa78e66',
        '1522337360788-8b13dee7a37e',
        '1573461160327-b450ce3d8e7f'
      ];
      ig.innerHTML = posts.map((p, i) => `
        <a href="https://instagram.com/marleyburgos_estetica" target="_blank" rel="noopener" data-cursor>
          <div class="media" data-mono="0${i + 1}">
            <img src="img/insta-${i + 1}.jpg" data-fb="https://images.unsplash.com/photo-${p}?auto=format&fit=crop&w=600&q=80" alt="Publicação da clínica" loading="lazy" onerror="if(this.dataset.fb){this.src=this.dataset.fb;this.removeAttribute('data-fb')}else{this.remove()}">
          </div>
          <span class="ig-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r=".9" fill="currentColor"/>
            </svg>
          </span>
        </a>`).join('');
    }
  });

  /* =======================================================
     13. FAQ (accordion)
     ======================================================= */
  safe('faq', () => {
    $$('.faq-item').forEach(item => {
      const q = $('.faq-q', item);
      const a = $('.faq-a', item);
      q.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.faq-item.open').forEach(o => {
          o.classList.remove('open');
          $('.faq-a', o).style.height = '0px';
        });
        if (!open) {
          item.classList.add('open');
          a.style.height = a.scrollHeight + 'px';
        }
      });
    });
    addEventListener('resize', () => {
      const open = $('.faq-item.open');
      if (open) $('.faq-a', open).style.height = $('.faq-a', open).scrollHeight + 'px';
    });
  });

  /* =======================================================
     14. FORMULÁRIO → WHATSAPP
     ======================================================= */
  safe('formulario', () => {
    const form = $('#form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const nome = $('#nome').value.trim();
        const tel = $('#tel').value.trim();
        const interesse = $('#interesse').value;
        const msg = $('#msg').value.trim();
        const btnTxt = $('#btnTxt');

        if (!nome || !tel) {
          btnTxt.textContent = 'Preencha nome e WhatsApp';
          setTimeout(() => (btnTxt.textContent = 'Enviar pelo WhatsApp'), 2600);
          (!nome ? $('#nome') : $('#tel')).focus();
          return;
        }

        const texto =
          `Olá! Meu nome é ${nome}.\n` +
          `Gostaria de agendar uma avaliação na ${CONFIG.clinica}.\n\n` +
          `• Interesse: ${interesse}\n` +
          `• WhatsApp: ${tel}` +
          (msg ? `\n• Objetivo: ${msg}` : '');

        btnTxt.textContent = 'Abrindo o WhatsApp…';
        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener');
        setTimeout(() => {
          btnTxt.textContent = 'Enviar pelo WhatsApp';
          form.reset();
        }, 1800);
      });
    }

    /* ---------- Links de WhatsApp seguem o CONFIG ---------- */
    $$('a[href*="wa.me/"]').forEach(a => {
      a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/' + CONFIG.whatsapp);
    });
  });

  /* =======================================================
     15. ANO NO RODAPÉ
     ======================================================= */
  const yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* =======================================================
     16. CLIQUE NO PROTOCOLO → AGENDAMENTO PRÉ-PREENCHIDO
     ======================================================= */
  safe('protocolo-clique', () => {
    const select = $('#interesse');
    const alvo = $('#contato');
    if (!select || !alvo) return;

    const escolher = card => {
      const nome = $('h3', card).textContent.trim();
      const opt = Array.from(select.options)
        .find(o => o.text.trim().toLowerCase() === nome.toLowerCase());
      if (opt) select.value = opt.value;

      alvo.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

      // pisca o campo para a pessoa perceber o que foi selecionado
      const campo = select.closest('.field');
      if (campo) {
        campo.classList.remove('destaque');
        void campo.offsetWidth;          // reinicia a animação
        campo.classList.add('destaque');
      }
    };

    $$('.svc').forEach(card => {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label',
        'Agendar avaliação de ' + $('h3', card).textContent.trim());

      card.addEventListener('click', () => escolher(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); escolher(card); }
      });
    });
  });

})();
