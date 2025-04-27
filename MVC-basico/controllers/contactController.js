// Controlador da rota /contato
exports.index = (req, res) => {
    res.render('pages/contact', {
      titulo: 'Contato',
      mensagem: 'Preencha o formulário abaixo para entrar em contato.'
    });
  };