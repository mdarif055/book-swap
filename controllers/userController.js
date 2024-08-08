const model = require('../models/user');
const Trade = require('../models/item');
const watchList = require('../models/watch');
const trades = require('../models/trade');

exports.new = (req, res)=>{
    res.render('./user/new');
};

exports.create = (req, res, next)=>{
    let user = new model(req.body);
    user.save()
    .then(user=> {
        req.flash('success', 'You have Successfully Registered!');
        res.redirect('/users/login');
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);  
            return res.redirect('/users/new');
        }

        if(err.code === 11000) {
            req.flash('error', 'Email has been used!');  
            return res.redirect('/users/new');
        }
        
        next(err);
    }); 
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
}

exports.login = (req, res, next)=>{
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong Email Address!!');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result) {
                    req.session.user = user._id;
                    req.session.firstName = user.firstName;
                    req.session.lastName = user.lastName;
                    req.flash('success', 'You have Logged In successfully!!');
                    res.redirect('/users/profile');
                } else {
                    req.flash('error', 'Wrong password!!');      
                    res.redirect('/users/login');
                }
            })
            .catch(err => next(err));;     
        }     
    })
    .catch(err => next(err));
};

exports.profile = (req, res, next)=>{
    let id = req.session.user;
    let list1 = []
    let list2 = []
    Promise.all([model.findById(id), Trade.find({host: id}),
        watchList.find({username: id}).populate('tradelist'),trades.find({traderid:id}).populate('tradeid')
    ]) 
    .then(results=>{
        const [user, trades, watchTrades, offerTrades] = results;
        const flag = false;
        trades.forEach(Trade =>{
           
            list1.push(Trade.id);
        })
        offerTrades.forEach(Trade =>{
            list2.push(Trade.offerid);
        })
        for (const l1 of list1){
            for (const l2 of list2){
                if( l1 === l2)
                {
                    flag = true;
                }
            }
        }
        res.render('./user/profile', {user, trades, watchTrades, offerTrades})
    })
    .catch(err=>next(err));
};


exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
       else
            res.redirect('/');  
    });
 };