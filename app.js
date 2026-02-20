const SHEET_ID = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSbDvajeZp5_KWu1k1SKvhqw8nkMMt0GRws_5NikslnK3jEc8JRm_Wk2bVXrANr1lGUVVXAGaTcILgv/pub?output=csv";

const URL =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

async function carregarDados() {

  const res = await fetch(URL);
  const texto = await res.text();

  const linhas = texto.split("\n").slice(1);

  let saldo = 0;
  let labels = [];
  let dados = [];

  linhas.forEach(linha => {

    const colunas = linha.split(",");

    const data = colunas[0];
    const valor = parseFloat(colunas[2]);

    saldo += valor;

    labels.push(data);
    dados.push(saldo);

  });

  document.getElementById("saldo").innerText =
    "R$ " + saldo.toFixed(2);

  criarGrafico(labels, dados);

}

function criarGrafico(labels, dados) {

  new Chart(document.getElementById("grafico"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Saldo",
        data: dados
      }]
    }
  });

}

carregarDados();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}