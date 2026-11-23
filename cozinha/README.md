# Cozinha para Todos

Site estático (HTML, CSS e JavaScript) de receitas acessíveis, com artigos sobre acessibilidade na cozinha e no dia a dia. Segue as recomendações da WCAG 2.0 e do eMAG 3.1.

## Páginas
- `index.html`: início
- `receitas.html`: lista de receitas, comparação e tabela de medidas
- `bolo-de-caneca.html`, `arroz-branco.html`, `tapioca.html`: receitas com adaptações de acessibilidade
- `cozinha-acessivel.html`: como adaptar a cozinha para cada necessidade
- `receita-acessivel.html`: como escrever receitas acessíveis
- `contato.html`: formulário acessível e perguntas frequentes
- `mapa.html`: mapa do site
- `acessibilidade.html`: recursos, atalhos e limitações

## Recursos de acessibilidade
- `lang="pt-BR"`, landmarks, títulos em ordem, sumário com âncoras e trilha de navegação
- Atalhos de teclado (accesskey 1 a 5) e foco sempre visível
- Texto alternativo nas imagens, links descritivos e siglas explicadas com `abbr`
- Contraste mínimo de 4,5:1, fonte sem serifa, sem itálico e sem texto justificado
- Barra de ajustes: tamanho do texto, alto contraste e espaçamento ampliado
- Cronômetro nas receitas: aviso na tela, som opcional, vibração e botão para ouvir o tempo restante
- Lista de ingredientes com caixas de marcar e sinais de ponto por tempo, som, cheiro e tato
- VLibras (tradução para Libras; precisa de internet)
- Formulário com `label`, obrigatórios indicados em texto e erros em `aria-live`

## Como publicar (gratuito)
- **Netlify Drop:** acesse app.netlify.com/drop e arraste a pasta do projeto.
- **GitHub Pages:** envie os arquivos para um repositório, vá em Settings > Pages e escolha a branch `main`, pasta `/ (root)`.

## Como testar
Navegue só com Tab, teste com NVDA, rode o Lighthouse (aba Acessibilidade) e a extensão WAVE.
