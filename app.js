var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var bodyParser = require('body-parser');
var app = express();
const port = 3000;
var Filestore = require('session-file-store')(session);

const { sequelize } = require('./models');
const { request } = require('http');
const { response } = require('express');

sequelize.sync({ alter: true })
.then(() => {
    console.log('데이터베이스 연결 성공');
})
.catch((err) => {
    console.error(err);
});


app.use(session({
  secret:'abcdefg',
  resave: false,
  saveUninitialized: true,
  store:new Filestore()
}));
var passport = require('./controllers/passport')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));

app.use(function (req, res, next) {
  res.locals.islogin = req.user;
  next();
});
app.get('/logout', function(req, res, next){
  res.locals.islogin=undefined;
  req.logout();
  res.redirect('/');
  next();
});
app.use(expressLayouts);
app.set('layout', 'layout');
app.set("layout extractScripts", true);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);



// app.post('/process',
//   passport.authenticate('local', { successRedirect: '/', 
//   failureRedirect: '/login' }),
// );

app.post('/process',
  passport.authenticate('local',
  {failureRedirect:'/login'}),function(req,res){
    req.session.save(function(){
      console.log(req.session.passport);
      res.redirect('/');
    })
  }
);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

module.exports = app;