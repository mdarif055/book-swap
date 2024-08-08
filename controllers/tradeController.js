const Item = require('../models/item');
const model = require('../models/user');
const watchList = require('../models/watch');
const tradeItem = require('../models/trade');
const { DateTime } = require("luxon");

exports.index = (req, res, next) => {
    let categories = []
    Item.find().sort('name')
        .then(trades => {
            Item.distinct('topic')
                .then(categories => {
                    res.render('./trades/index', { trades, categories });
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./trades/new');
};


exports.create = (req, res, next) => {
    let item = new Item(req.body);//create a new Item document
    item.host = req.session.user;
    item.status = "Available";
    item.save()//insert the document to the database
        .then(trades => {
            req.flash('success', 'You have created a new Item successfully!!');
            res.redirect('/trades')
        })
        .catch(err => {
            if (err.name === 'ValidationError') {
                req.flash('error', err.message);
                res.redirect('back');
            }
            next(err);
        });
};

exports.show = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Item id!');
        err.status = 404;
        return next(err);
    }
    Item.findById(id)
        .then(item=>{
            if(item) {
                let watch = false;
                let userId = req.session.user;
                watchList.findOne({username: userId, tradeList: id})
                .then(x => {
                    if(x)
                    {
                        watch = true;
                        item.createAt = DateTime.fromSQL(item.createAt).toFormat('LLLL dd, yyyy');
                        return res.render('./trades/show', {item, x});
                    }
                    else{
                        item.createAt = DateTime.fromSQL(item.createAt).toFormat('LLLL dd, yyyy');
                        return res.render('./trades/show', {item, x});
                    }
                })
                .catch(err =>next(err));    
                
            } else {
                let err = new Error('Cannot find a item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Item id');
        err.status = 404;
        return next(err);
    }
    Item.findById(id)
        .then(item => {
            if (item) {
                return res.render('./trades/edit', { item });
            } else {
                let err = new Error('Cannot find a Item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));
};

exports.update = (req, res, next) => {
    let item = req.body;
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Item id');
        err.status = 404;
        return next(err);
    }
    Item.findByIdAndUpdate(id, item, { useFindAndModify: false, runValidators: true })
        .then(Item => {
            if (Item) {
                req.flash('success', 'Item has been updated successfully!');
                res.redirect('/trades/' + id);

            } else {
                let err = new Error('Cannot find a Item with id ' + id);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => {
            if (err.name === 'ValidationError')
                req.flash('error', err.message);
            res.redirect('back');
            next(err);
        });
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid Item id');
        err.status = 404;
        return next(err);
    }
    Item.findByIdAndDelete(id, { useFindAndModify: false })
        .then(item => {
            if (item) {
                res.redirect('/trades');
            } else {
                let err = new Error('Cannot find a Item with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));

    tradeItem.findOneAndDelete({ offerid: id })
        .then(result => {
            if (result) {
                console.log("Item details deleted")
            }
            else {
                tradeItem.findOneAndDelete({ tradeid: id })
                    .then(Item => {
                        if (Item) {
                            console.log("Item details deleted")
                        }
                    })
                    .catch(err => next(err))
            }

        })
        .catch(err => next(err));

    Item.findByIdAndDelete(id, { useFindAndModify: false })
        .then(Item => {
            if (Item) {
                req.flash('success', 'Item has been successfully deleted');
                res.redirect('/Item');
            } else {
                let err = new Error('Cannot find a Item with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
    //res.redirect('/');
};

exports.tradeoffered = (req, res, next) => {
    console.log("In trade Offered")
    let offeredId = req.params.id;
    let tradeMadeId = req.body;
    let userId = req.session.user;
    let tmade1 = tradeMadeId.item
    console.log(offeredId);
    console.log(tradeMadeId);
    //console.log(tmade1);
    tradeItem.findOne({ tradeid: offeredId }, { offerid: tmade1 })
        .then(action => {
            if (!action) {
                let newtrade = new tradeItem();
                newtrade.traderid = userId;
                newtrade.tradeid = offeredId;
                newtrade.offerid = tmade1
                Item.findOneAndUpdate({ _id: offeredId }, { status: "Offer pending" })
                    .then(res => {
                    })
                    .catch(err => next(err));
                Item.findOneAndUpdate({ _id: tmade1 }, { status: "Offer pending" })
                    .then(res => {
                    })
                    .catch(err => next(err));
                newtrade.save();
                req.flash('success', 'Item has been offered succesfully!');
                res.redirect('/users/profile');
            }
            else {
                res.redirect('/trades');
            }

        })
        .catch(err => next(err));
}

exports.favourite = (req, res, next) => {
    let deviceId = req.params.id;
    let userId = req.session.user;
    console.log("In favourite");
    watchList.findOne({ username: userId })
        .then(user => {
            if (user) {
                watchList.updateOne({ username: userId },
                    { $push: { tradelist: [deviceId] } },
                    function (err) {
                        if (err) {
                            return next(err);
                        }
                    });
                console.log("Updated the list")
            }
            else {
                let addwlist = new watchList({ username: userId, tradelist: [deviceId] });
                addwlist.save();
            }
        })
        .catch(err => next(err));
    res.redirect('/users/profile');
};


exports.unfavourite = (req, res, next) => {
    let deviceId = req.params.id;
    let userId = req.session.user;
    console.log("In unfavourite");
    watchList.findOne({ username: userId })
        .then(user => {
            if (user) {
                watchList.updateOne({ username: userId },
                    { $pullAll: { tradelist: [deviceId] } },
                    function (err) {
                        if (err) {
                            return next(err);
                        }
                    });
            }
        })
        .catch(err => next(err));
    watchList.findOne({ username: userId })
        .then(result => {
            if (result) {
                console.log("results: " + result)
            }
        })
        .catch(err => next(err))
    res.redirect('/users/profile');
};

exports.tradeitem = (req, res, next) => {
    let offeredId = req.params.id;
    let userId = req.session.user;
    Promise.all([model.findById(userId), Item.find({ host: userId })])
        .then(results => {
            let a = true;
            const [user, trades] = results;
            res.render('./trades/tradeDevice', { user, trades, offeredId })
        })
        .catch(err => next(err));
}


exports.cancelOffer = (req, res, next) => {
    let deviceId = req.params.id;
    console.log(deviceId);

    tradeItem.findOneAndDelete({ tradeid: deviceId })
        .then(item => {
            //console.log(item)
            const offerId = item.offerid
            const tradeId = item.tradeid
            Item.findOneAndUpdate({ _id: offerId }, { status: "Available" })
                .then(item => {
                    
                })
                .catch(err => next(err));
            Item.findOneAndUpdate({ _id: tradeId }, { status: "Available" })
                .then(item => {
                   
                })
                .catch(err => next(err));
            //console.log("TD: "+item.traderid)
            req.flash('success', 'Offer has been successfully canceled');
            res.redirect('/users/profile');
        })
}

exports.manageOffer = (req, res, next) => {
    let tradeId = req.params.id;
    console.log(tradeId)
    let item = true
    tradeItem.findOne({ offerid: tradeId }).populate('tradeid').populate('offerid')
        .then(result => {
            if (result) {
                //console.log(result)
                res.render('./trades/manageOffer', { item, result })
            }
            else {
                item = false;
                //console.log(item)
                tradeItem.findOne({ tradeid: tradeId }).populate('tradeid').populate('offerid')
                    .then(result => {
                        res.render('./trades/manageOffer', { item, result })
                    })
                    .catch(err => next(err));

            }
        })
        .catch(err => next(err));
}


exports.rejectOffer = (req, res, next) => {
    let tradeId = req.params.id;
    console.log(tradeId);
    Item.findByIdAndUpdate(tradeId, { status: "Available" }, { useFindAndModify: false, runValidators: true })
        .then(Item => {
            if (Item) {
                req.flash('success', 'Item has been successfully updated');
                //res.redirect('/Item/'+id);
            } else {
                let err = new Error('Cannot find a Item with id ' + tradeId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));

    tradeItem.findOne({ tradeid: tradeId }).populate('offerid')
        .then(result => {
            offerId = result.offerid.id
            Item.findByIdAndUpdate(offerId, { status: "Available" }, { useFindAndModify: false, runValidators: true })
                .then(Item => {
                    if (Item) {
                        req.flash('success', 'Item has been successfully updated');
                    } else {
                        let err = new Error('Cannot find a Item with id ' + offerId);
                        err.status = 404;
                        next(err);
                    }
                })
                .catch(err => next(err));
            tradeItem.findOneAndDelete({ tradeid: tradeId })
                .then(result => {
                    req.flash('success', 'Offer has been Rejected');
                    res.redirect("/users/profile")
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));

}

exports.acceptOffer = (req, res, next) => {
    let tradeId = req.params.id;
   
    
    Item.findByIdAndUpdate(tradeId, { status: "Traded" }, { useFindAndModify: false, runValidators: true })
        .then(Item => {
            if (Item) {
                req.flash('success', 'Item has been successfully updated');
                //res.redirect('/Item/'+id);
            } else {
                let err = new Error('Cannot find a Item with id ' + tradeId);
                err.status = 404;
                next(err);
            }
        })
        .catch(err => next(err));


    tradeItem.findOne({ tradeid: tradeId }).populate('offerid')
        .then(result => {

            offerId = result.offerid.id
            console.log(offerId)
            Item.findByIdAndUpdate(offerId, { status: "Traded" }, { useFindAndModify: false, runValidators: true })
                .then(Item => {
                    if (Item) {
                        req.flash('success', 'Item has been successfully traded');

                    } else {
                        let err = new Error('Cannot find a Item with id ' + offerId);
                        err.status = 404;
                        next(err);
                    }
                })
                .catch(err => next(err));
            tradeItem.findOneAndDelete({ tradeid: tradeId })
                .then(result => {
                    if (result) {
                        req.flash('success', 'Offer has been Accepted');
                        res.redirect("/users/profile")
                    }
                })
                .catch(err => next(err));

        })
        .catch(err => next(err));

}

