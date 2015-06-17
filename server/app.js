var express = require('express'),
    app = express(),
	fs = require('fs'),
	_ = require('underscore');

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// dica: 3-4 linhas de código (você deve usar o módulo de filesystem (fs))
var db = { 
	jogadores: JSON.parse(fs.readFileSync('server/data/jogadores.json', 'utf-8')),
	jogosPorJogador: JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json', 'utf-8'))
};
console.log('Dados carregados!');

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', 'server/views');

// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json
app.get('/', function(req, res){
	res.render('index', db.jogadores);
});

// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter umas 15 linhas de código
app.get('/jogador/:id', function (req, res) {
	var id = req.params['id'];
	var jogador = _.find(db.jogadores, function(jog){return jog.steamid == id;});
	var jogos = _.map(_.sortBy(db.jogosPorJogador[id], function(j){return -j.playtime_forever;}), function (jogo){
		return {
			appid: jogo.appid,
			name: jogo.name,
			playtime_forever: jogo.playtime_forever/60 | 0,
			img_logo_url: jogo.img_logo_url
		};
	});
	
	res.render('db',{
		steamid: jogador.steamid,
		avatarmedium: jogador.avatarmedium,
		personaname: jogador.personaname,
		loccountrycode: jogador.loccountrycode,
		realname: jogador.realname,
		game_count: db[id].jogosPorJogador.game_count,
		unplayedount: _.where(db.jogosPorJogador[id], {playtime_forever: 0}).length,
		favGame: jogos[0],
		fiveMostPlayed: jogos.slice(0,5)
	});
});

// configurar para servir os arquivos estáticos da pasta "client"
app.use('/', express.static(__dirname + '/../client'));

// abrir servidor
app.listen(2015);
console.log("Escutando a porta 2015!");
