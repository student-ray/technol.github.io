/*
===================
UTILIDADES GERAIS
===================
*/ 

function getCarrinho() {
    // Retorna o carrinho salvo no localStorage, ou um array vazio se não existir
    return JSON.parse(localStorage.getItem("carrinho")) || [];
}

function salvarCarrinho(carrinho) {
    // Salva o carrinho no localStorage (convertido para JSON)
    localStorage.setItem("carrinho", JSON.stringify(carrinho));

    // Atualiza o badge (contador de itens no carrinho) se existir
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = carrinho.length;
}

function formataBR(valor) {
    // Formata o valor em reais (R$), no padrão brasileiro
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/*
================================
OPERAÇÕES/FUNÇÕES NO CARRINHO
================================
*/

function adicionarProduto(nome, preco) {
    const carrinho = getCarrinho();

    // Verifica se o produto já existe no carrinho
    const existente = carrinho.find((p) => p.nome === nome);

    // Se já existe, apenas incrementa a quantidade
    if (existente) {
        existente.qtd++;
    } else {
        // Se não existe, adiciona novo produto ao carrinho
        carrinho.push({ nome, qtd: 1, preco: parseFloat(preco) });
    }

    // Salva o carrinho atualizado e atualiza a interface
    salvarCarrinho(carrinho);
    alert(nome + " adicionado com sucesso ao carrinho!");
    atualizarCarrinho();
}

/*
=====================================
FUNÇÕES PARA AUMENTAR, DIMINUIR E REMOVER ITEM DO CARRINHO
=====================================
*/

function aumentarQtd(index) {
    const carrinho = getCarrinho();
    carrinho[index].qtd++; // Aumenta a quantidade do item pelo índice
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function diminuirQtd(index) {
    const carrinho = getCarrinho();

    if (carrinho[index].qtd > 1) {
        carrinho[index].qtd--; // Diminui a quantidade se for maior que 1
    } else {
        carrinho.splice(index, 1); // Remove o item se for 1 (ou menos)
    }

    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function removerItem(index) {
    const carrinho = getCarrinho();
    carrinho.splice(index, 1); // Remove um item do carrinho pelo índice
    salvarCarrinho(carrinho);
    atualizarCarrinho();
}

function esvaziarCarrinho() {
    // Limpa completamente o carrinho
    salvarCarrinho([]);
    atualizarCarrinho();
}

/*
====================
FUNÇÕES PARA RECIBO
====================
*/

function montarRecibo() {
    const carrinho = getCarrinho();

    // Se o carrinho estiver vazio, exibe mensagem e retorna
    if (!carrinho.length) {
        $("#reciboTexto").html("<h3>Seu carrinho está vazio!</h3>");
        return;
    }

    let total = 0;
    let html = "<h3>Compra finalizada com sucesso!</h3><ul>";

    // Gera uma linha para cada item no carrinho
    carrinho.forEach(item => {
        const subtotal = item.qtd * item.preco;
        total += subtotal;
        html += `<li>${item.qtd}x ${item.nome} — ${formataBR(subtotal)}</li>`;
    });

    html += `</ul><p><strong>Total: ${formataBR(total)}</strong></p>`;
    $("#reciboTexto").html(html);
}

/*
=========================
RENDERIZAÇÃO DO CARRINHO
=========================
*/

function atualizarCarrinho() {
    const tabela = document.querySelector("#cart-table tbody");

    // Se não existir a tabela no DOM, retorna sem fazer nada
    if (!tabela) return;

    const carrinho = getCarrinho();
    let total = 0;
    tabela.innerHTML = ""; // Limpa a tabela antes de renderizar os itens

    carrinho.forEach((item, index) => {
        const subtotal = item.qtd * item.preco;
        total += subtotal;

        const linhaTabela = `
            <tr>
                <td>${item.nome}</td>
                <td>
                    <button class="ui-btn ui-mini ui-btn-inline" onclick="diminuirQtd(${index})">-</button>
                    ${item.qtd}
                    <button class="ui-btn ui-mini ui-btn-inline" onclick="aumentarQtd(${index})">+</button>
                </td>
                <td>${formataBR(subtotal)}</td>
                <td>
                    <button class="ui-btn ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-notext" onclick="removerItem(${index})">Remover</button>
                </td>
            </tr>
        `;

        tabela.insertAdjacentHTML("beforeend", linhaTabela);
    });

    // Atualiza o valor total na tela
    document.getElementById("cart-total").textContent = formataBR(total);

    // Atualiza o contador do carrinho (badge)
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = carrinho.length;
}

/*
=======================================
EVENTOS GLOBAIS - QUANDO TUDO ACONTECE
=======================================
*/

$(document).on("click", ".add-to-cart", function () {
    const nome = $(this).data("nome");
    const preco = $(this).data("preco");
    adicionarProduto(nome, preco);
});

/*
=================================================
MONTAR RECIBO - QUANDO A PÁGINA RECIBO.HTML ABRE
=================================================
*/

$(document).on("pageshow", "#reciboDialog", function () {
    montarRecibo();
});

/*
======================================
AO FECHAR O RECIBO, LIMPAR O CARRINHO
======================================
*/

$(document).on("pagehide", "#reciboDialog", function () {
    salvarCarrinho([]);
    atualizarCarrinho();
});

// Botão que limpa todo o carrinho (ícone de lixeira)
$(document).on("click", "a[data-icon='delete']", function () {
    esvaziarCarrinho();
});

// Ao carregar qualquer página, garante que o carrinho seja renderizado corretamente
$(document).on("pageshow", function () {
    salvarCarrinho(getCarrinho());
    atualizarCarrinho();
});
