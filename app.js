const PORT = 3000;
const express = require('express');
const session = require('express-session');
const app = express();
const exphbs = require('express-handlebars');
const { ExpressOIDC } = require('@okta/oidc-middleware');
const oidc = new ExpressOIDC({
    redirect_uri: 'http://localhost:3000/users/login/callback',
    issuer: 'https://dev-306148.okta.com/oauth2/default',
    client_id: '0oagzv27xk0sIZqY6356',
    client_secret: 'dITmzJEznox6K2np2K2khfJwAgkdejOl5_xxnpLR',
    scope: 'openid profile email',
    routes: {
        login: {
            path: '/users/login'
        }
    }
});

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "ajbfhasdkasd",
    resave: 'true',
    saveUninitialized: 'false'
}));
app.use(oidc.router);

app.use((req, res, next) => {
    if (req.userContext) {
        res.locals.user = req.user = req.userContext.userinfo;
        return next();
    }
    return next();

});


app.get('/', (req, res) => {
    res.render('index');
});
app.get('/users/login/callback', (req, res) => {

    console.log("That");
    res.redirect('/dashboard');
});
app.get('/dashboard', oidc.ensureAuthenticated(), (req, res) => {
    console.log(res.locals.user);
    res.render('dashboard', {
        user: req.user
    });
})

app.get('/users/logout', (req, res) => {


    // Remove the local session
    req.logout();

    // Location to redirect to after the logout has been performed. (Must be whitelisted)
    const postLogoutUri = 'http://localhost:3000/';

 
    res.redirect(postLogoutUri);
});

oidc.on('ready', () => {
    app.listen(PORT, () => {
        console.log("Server started at port " + PORT);
    });
});
oidc.on('error', err => {
    console.log('Unable to configure ExpressOIDC', err);
});


