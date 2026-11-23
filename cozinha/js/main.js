(function () {
  'use strict';

  var CHAVE = 'cozinha-para-todos-prefs';
  var prefs = { fonte: 100, contraste: false, espaco: false };

  // localStorage pode estar bloqueado (modo privado, política do navegador): o site funciona sem ele.
  function carregar() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE));
      if (salvo) {
        prefs.fonte = Number(salvo.fonte) || 100;
        prefs.contraste = !!salvo.contraste;
        prefs.espaco = !!salvo.espaco;
      }
    } catch (e) {}
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(prefs)); } catch (e) {}
  }

  // Região aria-live: leitores de tela avisam a mudança sem mover o foco.
  function anunciar(texto) {
    var area = document.getElementById('status-acess');
    if (area) { area.textContent = texto; }
  }

  function aplicar() {
    document.documentElement.style.fontSize = prefs.fonte + '%';
    document.body.classList.toggle('alto-contraste', prefs.contraste);
    document.body.classList.toggle('espacamento', prefs.espaco);
    var bc = document.getElementById('btn-contraste');
    var be = document.getElementById('btn-espaco');
    if (bc) { bc.setAttribute('aria-pressed', String(prefs.contraste)); }
    if (be) { be.setAttribute('aria-pressed', String(prefs.espaco)); }
  }

  function ligar(id, acao) {
    var el = document.getElementById(id);
    if (el) { el.addEventListener('click', acao); }
  }

  function iniciarBarra() {
    ligar('btn-aumentar', function () {
      prefs.fonte = Math.min(160, prefs.fonte + 10);
      aplicar(); salvar(); anunciar('Tamanho do texto: ' + prefs.fonte + '%');
    });
    ligar('btn-diminuir', function () {
      prefs.fonte = Math.max(80, prefs.fonte - 10);
      aplicar(); salvar(); anunciar('Tamanho do texto: ' + prefs.fonte + '%');
    });
    ligar('btn-contraste', function () {
      prefs.contraste = !prefs.contraste;
      aplicar(); salvar();
      anunciar(prefs.contraste ? 'Alto contraste ativado' : 'Alto contraste desativado');
    });
    ligar('btn-espaco', function () {
      prefs.espaco = !prefs.espaco;
      aplicar(); salvar();
      anunciar(prefs.espaco ? 'Espaçamento ampliado ativado' : 'Espaçamento ampliado desativado');
    });
    ligar('btn-restaurar', function () {
      prefs = { fonte: 100, contraste: false, espaco: false };
      aplicar(); salvar(); anunciar('Configurações restauradas ao padrão');
    });
  }

  function iniciarFormulario() {
    var form = document.getElementById('form-contato');
    if (!form) { return; }

    var regras = [
      { id: 'nome', msg: 'Informe seu nome.', ok: function (v) { return v.trim().length >= 2; } },
      { id: 'email', msg: 'Informe um e-mail válido, por exemplo nome@exemplo.com.',
        ok: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); } },
      { id: 'mensagem', msg: 'Escreva sua mensagem com pelo menos 10 caracteres.',
        ok: function (v) { return v.trim().length >= 10; } }
    ];

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var primeiroErro = null;
      var resumo = document.getElementById('resultado-form');
      resumo.textContent = '';
      resumo.className = '';

      regras.forEach(function (r) {
        var campo = document.getElementById(r.id);
        var erro = document.getElementById('erro-' + r.id);
        if (r.ok(campo.value)) {
          campo.removeAttribute('aria-invalid');
          erro.textContent = '';
        } else {
          campo.setAttribute('aria-invalid', 'true');
          erro.textContent = r.msg;
          if (!primeiroErro) { primeiroErro = campo; }
        }
      });

      // O foco vai para o primeiro campo com erro, para quem navega só pelo teclado.
      if (primeiroErro) {
        resumo.textContent = 'O formulário tem campos com erro. Corrija e envie novamente.';
        primeiroErro.focus();
        return;
      }
      resumo.className = 'mensagem-ok';
      resumo.textContent = 'Obrigado! Sua mensagem foi registrada (simulação: este site não envia dados a servidor).';
      form.reset();
    });
  }


  function plural(n, um, varios) { return n + ' ' + (n === 1 ? um : varios); }

  function tempoFalado(total) {
    var m = Math.floor(total / 60), s = total % 60, partes = [];
    if (m) { partes.push(plural(m, 'minuto', 'minutos')); }
    if (s || !m) { partes.push(plural(s, 'segundo', 'segundos')); }
    return partes.join(' e ');
  }

  // O visor tem role="timer" (sem aria-live): só os avisos importantes vão para a área de status,
  // assim o leitor de tela não fala a cada segundo.
  function iniciarTimer() {
    var visor = document.getElementById('timer-visor');
    if (!visor) { return; }
    var campoMin = document.getElementById('timer-min');
    var campoSeg = document.getElementById('timer-seg');
    var aviso = document.getElementById('timer-status');
    var som = document.getElementById('timer-som');
    var restante = 0, fim = 0, id = null;

    function lerCampos() {
      return (parseInt(campoMin.value, 10) || 0) * 60 + (parseInt(campoSeg.value, 10) || 0);
    }
    function mostrar() {
      var m = Math.floor(restante / 60), s = restante % 60;
      visor.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    function avisar(texto) { aviso.textContent = texto; }
    function parar() { clearInterval(id); id = null; }

    // O aviso sonoro só pode tocar depois de uma ação do usuário (regra dos navegadores).
    function apitar() {
      try {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        var ctx = new Ctx();
        for (var i = 0; i < 3; i++) {
          var osc = ctx.createOscillator();
          var ganho = ctx.createGain();
          osc.frequency.value = 880;
          osc.connect(ganho); ganho.connect(ctx.destination);
          ganho.gain.value = 0.2;
          osc.start(ctx.currentTime + i * 0.5);
          osc.stop(ctx.currentTime + i * 0.5 + 0.3);
        }
      } catch (e) {}
    }

    function acabou() {
      parar();
      visor.classList.add('acabou');
      avisar('O tempo acabou!');
      if (som.checked) { apitar(); }
      if (navigator.vibrate) { navigator.vibrate([300, 150, 300]); }
    }

    function tick() {
      restante = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
      mostrar();
      if (restante === 0) { acabou(); }
    }

    document.getElementById('timer-iniciar').addEventListener('click', function () {
      if (id) { return; }
      if (restante <= 0) { restante = lerCampos(); }
      if (restante <= 0) { avisar('Informe um tempo maior que zero.'); return; }
      visor.classList.remove('acabou');
      fim = Date.now() + restante * 1000;
      id = setInterval(tick, 250);
      mostrar();
      avisar('Cronômetro iniciado: ' + tempoFalado(restante) + '.');
    });
    document.getElementById('timer-pausar').addEventListener('click', function () {
      if (!id) { return; }
      parar();
      avisar('Pausado. Faltam ' + tempoFalado(restante) + '.');
    });
    document.getElementById('timer-falar').addEventListener('click', function () {
      avisar(restante > 0 ? 'Faltam ' + tempoFalado(restante) + '.' : 'O cronômetro está zerado.');
    });
    document.getElementById('timer-zerar').addEventListener('click', function () {
      parar();
      visor.classList.remove('acabou');
      restante = lerCampos();
      mostrar();
      avisar('Cronômetro zerado em ' + tempoFalado(restante) + '.');
    });
    [campoMin, campoSeg].forEach(function (c) {
      c.addEventListener('input', function () {
        if (!id) { restante = lerCampos(); mostrar(); visor.classList.remove('acabou'); }
      });
    });

    restante = lerCampos();
    mostrar();
  }

  // O VLibras é carregado do servidor do governo federal e exige internet.
  function iniciarVLibras() {
    if (!document.querySelector('[vw]')) { return; }
    var s = document.createElement('script');
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = function () {
      try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch (e) {}
    };
    document.body.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', function () {
    carregar();
    aplicar();
    iniciarBarra();
    iniciarFormulario();
    iniciarTimer();
    iniciarVLibras();
  });
})();
