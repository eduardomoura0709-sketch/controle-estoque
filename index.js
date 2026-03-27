const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ========== DADOS EM MEMÓRIA ==========
let fornecedores = [];
let produtos = [];
let associacoes = []; // { produtoId, fornecedorId }
let nextFornId = 1;
let nextProdId = 1;

// ========== FORNECEDORES ==========

// GET /fornecedores - Lista todos
app.get('/fornecedores', (req, res) => {
  res.json(fornecedores);
});

// GET /fornecedores/:id - Busca por ID
app.get('/fornecedores/:id', (req, res) => {
  const f = fornecedores.find(f => f.id === parseInt(req.params.id));
  if (!f) return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });
  res.json(f);
});

// POST /fornecedores - Cadastra novo
app.post('/fornecedores', (req, res) => {
  const { nome, cnpj, endereco, telefone, email, contato } = req.body;

  if (!nome || !cnpj || !endereco || !telefone || !email || !contato) {
    return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos!' });
  }

  if (fornecedores.find(f => f.cnpj === cnpj)) {
    return res.status(409).json({ mensagem: 'Fornecedor com esse CNPJ já está cadastrado!' });
  }

  const novo = { id: nextFornId++, nome, cnpj, endereco, telefone, email, contato };
  fornecedores.push(novo);
  res.status(201).json({ mensagem: 'Fornecedor cadastrado com sucesso!', fornecedor: novo });
});

// PUT /fornecedores/:id - Atualiza
app.put('/fornecedores/:id', (req, res) => {
  const idx = fornecedores.findIndex(f => f.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });

  fornecedores[idx] = { ...fornecedores[idx], ...req.body };
  res.json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: fornecedores[idx] });
});

// DELETE /fornecedores/:id - Remove
app.delete('/fornecedores/:id', (req, res) => {
  const idx = fornecedores.findIndex(f => f.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });

  fornecedores.splice(idx, 1);
  res.json({ mensagem: 'Fornecedor removido com sucesso!' });
});

// ========== PRODUTOS ==========

// GET /produtos - Lista todos
app.get('/produtos', (req, res) => {
  res.json(produtos);
});

// GET /produtos/:id - Busca por ID
app.get('/produtos/:id', (req, res) => {
  const p = produtos.find(p => p.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  res.json(p);
});

// POST /produtos - Cadastra novo
app.post('/produtos', (req, res) => {
  const { nome, codigoBarras, descricao, quantidade, categoria, dataValidade } = req.body;

  if (!nome || !descricao || !categoria) {
    return res.status(400).json({ mensagem: 'Campos obrigatórios: nome, descricao, categoria!' });
  }

  if (codigoBarras && produtos.find(p => p.codigoBarras === codigoBarras)) {
    return res.status(409).json({ mensagem: 'Produto com este código de barras já está cadastrado!' });
  }

  const novo = { id: nextProdId++, nome, codigoBarras: codigoBarras || null, descricao, quantidade: quantidade || 0, categoria, dataValidade: dataValidade || null };
  produtos.push(novo);
  res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!', produto: novo });
});

// PUT /produtos/:id - Atualiza
app.put('/produtos/:id', (req, res) => {
  const idx = produtos.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ mensagem: 'Produto não encontrado!' });

  produtos[idx] = { ...produtos[idx], ...req.body };
  res.json({ mensagem: 'Produto atualizado com sucesso!', produto: produtos[idx] });
});

// DELETE /produtos/:id - Remove
app.delete('/produtos/:id', (req, res) => {
  const idx = produtos.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ mensagem: 'Produto não encontrado!' });

  produtos.splice(idx, 1);
  res.json({ mensagem: 'Produto removido com sucesso!' });
});

// ========== ASSOCIAÇÃO ==========

// GET /produtos/:id/fornecedores - Lista fornecedores do produto
app.get('/produtos/:id/fornecedores', (req, res) => {
  const produtoId = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado!' });

  const ids = associacoes.filter(a => a.produtoId === produtoId).map(a => a.fornecedorId);
  const lista = fornecedores.filter(f => ids.includes(f.id));
  res.json(lista);
});

// POST /produtos/:id/fornecedores/:fornId - Associa
app.post('/produtos/:id/fornecedores/:fornId', (req, res) => {
  const produtoId = parseInt(req.params.id);
  const fornecedorId = parseInt(req.params.fornId);

  if (!produtos.find(p => p.id === produtoId)) return res.status(404).json({ mensagem: 'Produto não encontrado!' });
  if (!fornecedores.find(f => f.id === fornecedorId)) return res.status(404).json({ mensagem: 'Fornecedor não encontrado!' });

  if (associacoes.find(a => a.produtoId === produtoId && a.fornecedorId === fornecedorId)) {
    return res.status(409).json({ mensagem: 'Fornecedor já está associado a este produto!' });
  }

  associacoes.push({ produtoId, fornecedorId });
  res.status(201).json({ mensagem: 'Fornecedor associado com sucesso ao produto!' });
});

// DELETE /produtos/:id/fornecedores/:fornId - Desassocia
app.delete('/produtos/:id/fornecedores/:fornId', (req, res) => {
  const produtoId = parseInt(req.params.id);
  const fornecedorId = parseInt(req.params.fornId);

  const idx = associacoes.findIndex(a => a.produtoId === produtoId && a.fornecedorId === fornecedorId);
  if (idx === -1) return res.status(404).json({ mensagem: 'Associação não encontrada!' });

  associacoes.splice(idx, 1);
  res.json({ mensagem: 'Fornecedor desassociado com sucesso!' });
});

// ========== START ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});
