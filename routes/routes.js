module.exports = function(express,app,passport,configOptions,rooms){
	let router = express.Router();

	router.get('/', (req,res,next) => {
		res.render('index', {});
	})

	function securePages(req,res,next){
		if(req.isAuthenticated()){
			next();
		} else {
			res.redirect('/');
		}
	}

	function findTitle(room_id){
		let i = 0;
		while(i < rooms.length){
			if(rooms[i].room_number == room_id){
				return rooms[i].room_name;
				break;
			} else {
				i++;
				continue;
			}
		}
	}

	router.get('/auth/facebook', passport.authenticate('facebook'));
	router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/lobby',
		failureRedirect: '/'
	}))

	router.get('/lobby', securePages, (req,res,next) => {
		res.render('lobby',{user:req.user, configOptions: configOptions});
	})

	router.get('/chatroom', securePages, (req,res,next) => {
		res.render('chatroom',{});
	})

	router.get('/logout', (req,res,next) => {
		req.logout();
		res.redirect('/');
	})

	router.get('/room/:id', securePages, (req,res,next) => {
		let room_name = findTitle(req.params.id);
		res.render('chatroom', {user:req.user, room_number:req.params.id, room_name:room_name, configOptions:configOptions})
	})

	app.use('/', router);
}