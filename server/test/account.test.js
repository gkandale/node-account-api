const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const {app} = require('./../server');
const {accounts} = require('./../models/accounts');

const account = [{
    username: 'lorainabobbet',
    email:    'dbstep@isdead.com',
    password: 'patchwork',
    fullname: 'Loraine Bobbet',
    acountNumb: '098765432345678769'
},{
    username: 'bodyrock',
    email:    'bodyrocking@allthetime.com',
    password: 'itchwork',
    fullname: 'Body Rockers',
    acountNumb: '123456713423'
}, {
    username: 'Dubstepisback',
    email:    'dbstep@isback.com',
    password: 'dubsteprules',
    fullname: 'Dub Step',
    acountNumb: '8274589474584'
}];

beforeEach((done) => {accounts.remove({}).then(() => {
        accounts.insertMany(account)
    })
    .then(() => done());
});

var newAccount = new accounts({
    username: 'frankzolla96',
    email: 'frankzolla1996@gmail.com',
    password: 'fancydogz',
    fullname: 'Frank Mazolla',
    acountNumb: new ObjectID() + Math.random(100000)
});

describe('PUT /rest/account/:username', () => {
    it('should update an existing account', (done) => {
        let user = 'lorainabobbet';
        let newpass = 'newpassword';
        let newfullname = 'George Newnames';
        let newemail = 'new@email.com';
        request(app)
            .put(`/rest/account/${user}`)
            .send({password: newpass,fullname: newfullname})
            .expect(200)
            .expect((res) => {
                expect(res.body.accnt.password).toBe(newpass);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                accounts.find({username: user}).then((accnt) => {
                        expect(accnt.length).toBe(1);
                        expect(accnt[0].username).toBe(user);
                    done();
                }).catch((err) => done(err));
            });
    });
    it('should throw a 404 error if user does not exist', (done) => {
            let user = 'lorainabobbette';
            request(app)
                    .put(`/rest/account/${user}`)
                    .send({username: user})
                    .expect(404)
                    .end((err, res) => {
                            if (err) {
                                    return done(err);
                            }
                            accounts.find({username: user}).then((accnt) => {
                                    expect(accnt.length).toBe(0);
                                    done();
                            }).catch((err) => done(err));
                    });
    });
});
describe('POST /rest/account', () => {
    it('should create a new account', (done) => {
        request(app)
            .post('/rest/account')
            .send(newAccount)
            .expect(200)
            .expect((res) => {
                    expect(res.body.username).toBe(newAccount.username);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                accounts.find({username: newAccount.username}).then((accnt) => {
                        expect(accnt.length).toBe(1);
                        expect(accnt[0].username).toBe(newAccount.username);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not create with invalid body data', (done) => {
        request(app)
            .post('/rest/account/')
            .send({})
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                accounts.find().then((accnt) => {
                        expect(accnt.length).toBe(3);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('DELETE /rest/account/:username', () => {
    it('should remove account', (done) => {
        var user = account[1].username;
        request(app)
            .delete(`/rest/account/${user}`)
            .expect(200)
            .expect((res) => {
                    expect(res.body.accounts.username).toBe(user);
            })
            .end(done);
    });
    
    it('should return 404 if account not found', (done) => {
        var user = 'jakaranda';
        request(app)
            .get(`/todos/${user}`)
            .expect(404)
            .end(done);

    });
});