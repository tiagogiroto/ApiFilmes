const express = require('express');
const app = express();
const axios = require('axios');

const httpRequest = axios.create({
  baseURL: ''
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

function maiorPremiacao(premiacoes) {
  const maior = premiacoes.reduce((maior, atual) => {
    if (atual.relevancia > maior.relevancia) 
      { return atual; }

    return maior;
  });

  return maior.nome;
}


function converterValor(valor) {
    valor = valor
        .replace('$', '')
        .trim();

    const numero = parseFloat(
        valor
            .replace(' bilhões', '')
            .replace(' bilhão', '')
            .replace(' milhões', '')
            .replace(' milhão', '')
            .trim()
    );

    if (valor.includes('bilhão') || valor.includes('bilhões')) {
        return numero * 1000;
    }

    if (valor.includes('milhão') || valor.includes('milhões')) {
        return numero;
    }

    return numero;
}

function calcLucro(orcamento, bilheteria) {

    const valorOrcamento = converterValor(orcamento);
    const valorBilheteria = converterValor(bilheteria);

    const lucro = valorBilheteria - valorOrcamento;

    if (lucro >= 1000) {
        return `$${(lucro / 1000).toFixed(3)} bilhões`;
    }

    return `$${lucro} milhões`;
}


function retornarSinopse(sinopse) {

  // procura o pt-br pelo find
  const ptBr = sinopse.find(sinopse => sinopse.idioma === "pt-br");

    if (ptBr) {
        return ptBr.texto;
    }

    // caso nao exista busca tb em ingles 
    const ingles = sinopse.find(sinopse => sinopse.idioma === "en");

    if (ingles) {
        return ingles.texto;
    }
    
    // caso nao exista nos pontos anteriores, traz o que tiver

    return sinopse[0].texto;
}


app.get('/filmes', async (req, res) => {
  try {
    const response = await httpRequest.get();

    //Novo retorno de Filmes

    const filmes = response.data.filmes;

    const resultadoFinal = filmes.map(filme => ({

      titulo: filme.titulo,
      ano: filme.ano,
      diretor: filme.diretor,
      genero: filme.genero,
      duracaoSegundos: filme.duracao * 60,
      notaIMDb: String(filme.ratings.find(rating => rating.fonte === "IMDb").valor),
      lucro: String(calcLucro(filme.orcamento, filme.bilheteria)), 
      maiorPremiacao: maiorPremiacao(filme.premios),
      sinopse: retornarSinopse(filme.sinopse)


    }))


    res.send(resultadoFinal)


  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao buscar filmes');
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});