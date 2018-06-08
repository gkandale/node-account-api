const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {accounts} = require('./models/accounts');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/rest/accounts', (req, res) => {
    accounts.find().then((accounts) => {
        res.send({accounts});
    }, (e) => {
        res.status(404).send(e);
    })
});

app.get('/rest/account/:username', (req, res) => {
    var user = req.params.username;

    accounts.find({username: user}).then((accounts) => {
        if (!accounts) {
            return res.status(404).send();
        }
        res.send({accounts});
    }).catch((e) => res.status(404).send());
});

app.post('/rest/account', (req, res) => {
    var account = new accounts({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        fullname: req.body.fullname,
        acountNumb: new ObjectID() + Math.random(100000)
    });
    account.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(404).send(e);
    });
});

app.delete('/rest/account/:username', (req, res) => {
    var user = req.params.username;

    accounts.findOneAndRemove({username: user}).then((accounts) => {
        if (!accounts) {
            return res.status(404).send();
        }
        res.send({accounts});
    }).catch((e) => res.status(400).send());
});


app.put('/rest/account/:username', (req, res) => {
        var user = req.params.username;
        var bodyBefore = req.body;
        var body = _.pick(req.body, ['password','fullname','email']);
        if ( !_.isEqual(body,bodyBefore) ){
                var err = "";
                if ( bodyBefore.hasOwnProperty('username') ){
                        err += ' username is not editable ';
                }
                if ( bodyBefore.hasOwnProperty('acountNumb') ){
                        err += ' account number is not editable ';
                }
                return res.status(404).send(`Following error(s) have been found: ${err}`);
        }
        accounts.findOneAndUpdate({username: user},{$set: body},{new:true}).then((accnt) =>{
                if (!accnt) {
                        return res.status(404).send('In the if block');
                }
                res.send({accnt});
        }).catch((e) => res.status(404).send('In the catch block'));
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};