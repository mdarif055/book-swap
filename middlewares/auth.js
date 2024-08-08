const Connection = require('../models/item');

exports.isGuest = (req, res, next)=>{
    if(!req.session.user){
        return next();
    } else {
        req.flash('error','You are already logged in!');
        return res.redirect('/users/profile');
    }
};


exports.isLoggedIn = (req, res, next)=>{
    if(req.session.user){
        return next();
    } else {
        req.flash('error','You need to Login!');
        return res.redirect('/users/login');
    }
};


exports.isHost = (req, res, next)=>{
    let id = req.params.id;
    Connection.findById(id)
    .then(connection => {
        if(connection){
            if(connection.host == req.session.user){
                return next();
            } else {
                let err = new Error('Unauthorized to the resource access');
                err.status = 401;
                return next(err);
            }
        }
    })
    .catch(err=>next(err));
};