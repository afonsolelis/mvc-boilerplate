// Controlador da rota /sobre
exports.index = (req, res) => {
    res.render('pages/about', {
      titulo: 'Sobre',
      descricao: 'Esta é a página sobre do mini site MVC.'
    });
  };