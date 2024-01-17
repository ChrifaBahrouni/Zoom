const UserModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const _ = require("lodash")
const randtoken = require("rand-token")
var nodemailer = require("nodemailer")

const fs = require('fs')
const multer = require('multer')
const upload = multer({ dest: __dirname + '/upload/image' })
var refreshTokens = {}
const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox1d159850d78643cbb0a612c6f40f9660.mailgun.org?';
const mg = mailgun({ apiKey: process.env.api_key, domain: DOMAIN });



exports.getAll_user = (req, res) => {

    UserModel.find({})
        .then(resultat => {
            res.send(resultat)
        }

        )

}
exports.getById = (req, res) => {

    var id = req.params.id;
    UserModel.findOne({ _id: id })
        .then((result) => {
            res.send(result);
        })
}
exports.delete_user = (req, res) => {
    var id = req.params.id;
    UserModel.remove({ _id: id })
        .then((result) => {
            res.send(result)
        })

}

exports.update_user = (req, res) => {
    var id = req.params.id;
    UserModel.updateOne({ _id: id }, req.body)
        .then((result) => {
            res.send(result)
        })


}
exports.login = (req, res) => {
       // checks if email exists
       UserModel.findOne( { email: req.body.email })
    .then(dbUser => {
        if (!dbUser) {
            return res.status(404).json({message: "user not found"});
        } else {
            // password hash
            bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
                if (err) { // error while comparing
                    res.status(502).json({message: "error while checking user password"});
                } else if (compareRes) { // password match
                    const token = jwt.sign({ email: req.body.email }, 'secret', { expiresIn: '1h' });
                    res.status(200).json({message: "user logged in", "token": token});
                } else { // password doesnt match
                    res.status(401).json({message: "invalid credentials"});
                };
            });
        };
    })
    .catch(err => {
        console.log('error', err);
    });
}
exports.register = (req, res) => {
    var email = req.body.email;
    //const { email } = req.body.email;
    UserModel.findOne({ email: email })
        .then((result) => {
            if (result) {
                res.status(403).send({ message: "utilisateur  exist" })
            } else {

                var user = new UserModel(req.body);

                var transporter = nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                        user: "chrifa.bahronui123@outlook.com",
                        pass: "@.11963235"
                    }
                });
                var mailOptions = {
                    from: 'chrifa.bahronui123@outlook.com',
                    to: email,
                    subject: 'Activation  compte Zoom clone',

                    html: '<p>Bonjour, </br> ' + user.nom + '  ' + user.prenom + '</p>'

                        + '<p>Cliquez sur ce lien pour actication  votre compte   Zoom clone' + user.email + '.</p>'
                        + '<p>Si vous n avez pas demandé à valider  votre compte , vous pouvez ignorer cet e-mail.</p>'
                        + '<p>Merci,</p>'

                        + '<p>L’Equipe du projet  Zoom clone et de  la ferme bio-écologique </p>'
                        + '<p>pédagogique « Zoom clone  » vous souhaite le bien venue et vous </p>'
                        + '<p>informe que Vous pouvez nous contacter sur :</p>'
                        + '<p>Sit web : www.Zoom-clone.com.tn</p>'
                        + '<h1> Code de validation </h1>'
                        + '<h2>' + user.code + '</h2>'
                        + '<p>Facebook :https://www.facebook.com/ </p>'

                        + '<p>Mail : (contact@zoom-clone.com.tn)</p>'
                        + '<p>WhatsApp : (216)992828278 </p>'
                        + '<p>Tél : 216) 27732204 ou (216) 992828278 </p>'
                        + '<p>http:127.0.0.1:5000/users/resetpassword/${token}</p>',
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                   // console.log('name' + user.name)
                    console.log('Email sent: ' + info.response);
                });
                //generate private key

                bcrypt.genSalt(10, (error, key) => {

                    //hash password
                    bcrypt.hash(user.password, key, (hash_err, hash_pwd) => {
                        user.password = hash_pwd;
                        user.save()
                            .then((saved_user) => {
                                res.status(200).json({message: "user created"});
                                res.send(saved_user)
                            })
                            .catch(()=>{
                                return res.status(500).json({message: "couldnt hash the password"}); 
                            })
                    })
                })
            }
        })
}
//ajouter un mot de passe 
exports.resetpassword = (req, res) => {

    const { resetLink, newPass } = req.body;

    if (resetLink) {

        jwt.verify(resetLink, req.app.get('secretKey'), function (err, decodeData) {

            if (err) {

                return res.json({

                    error: "incorrect token or it is exprired"

                })

            }

            UserModel.findOne({ resetLink }, (err, user) => {

                if (err || !user) {

                    return res.json({ error: "user with this token does not exist" });

                }

                const obj = {

                    password: newPass

                }

                user = _.extend(user, obj);

                user.save((err, result) => {

                    if (err) {

                        return res.status(400).json({ error: "reset password error" });

                    }

                    else {

                        return res.status(200).json({ message: "password has been changed" });

                    }

                })

            })

        })

    }

    else {

        return res.status(401).json({ error: "authentification erreur" });

    }
}
exports.forgotpassword = (req, res) => {

    const { email } = req.body;

    UserModel.findOne({ email }, (err, user) => {

        //  console.log('user', user) 
        if (err || !user) {

            return res.status(400).json({ error: "email does not exist" });

        }

        const token = jwt.sign({ _id: user._id }, process.env.REST_PASSWORD_KEY, { expiresIn: '20min' }); //req.app.get('secretKey')
        user.resetLink = token;

     UserModel.updateOne({ email: email } , user)
        
            .then((result) => {
               // res.send(user)
                
                var mailOptions = {
                    from: 'chrifa.bahronui123@outlook.com',
                    to: email,
                    subject: 'Rest compte csplus',

                    html: '<p>Bonjour,</p>'
                        + '<p>Cliquez sur ce lien pour réinitialiser votre mot de passe Csplus pour le compte ' + user.email + '.</p>'
                        + '<p>Si vous n avez pas demandé à réinitialiser votre mot de passe, vous pouvez ignorer cet e-mail.</p>'
                        + '<p>Merci,</p>'

                        + '<p>L’Equipe du projet csplus et de  la ferme bio-écologique </p>'
                        + '<p>pédagogique « csplus » vous souhaite le bien venue et vous </p>'
                        + '<p>informe que Vous pouvez nous contacter sur :</p>'
                        + '<p>Sit web : www.rissalakidsfam.com.tn</p>'
                        + '<p>Facebook :https://www.facebook.com/pages/category/Agriculture/Rissala-Kids-Farm-105217964746343/ </p>'
                        + '<p>Mail : (contact@rissalakidsfarm.com.tn)</p>'
                        + '<p>WhatsApp : (216)27732204 </p>'
                        + '<p>Tél : 216) 27732204 ou (216) 58183689 </p>'
                        + `<p>http:127.0.0.1:5000/reset/${token}</p>`

                };

                var transporter = nodemailer.createTransport({
                    service: 'hotmail',
                    auth: {
                        user: "chrifa.bahronui123@outlook.com",
                        pass: "@.11963235"
                    }
                });


                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                       // return console.log(error);
                        res.send("error "+error);
                    }
                    console.log('Email sent: ' + info);
                    res.send("Email send " + info);

                });
               
            }).catch(res =>{
                return res.status(400).json({ error: "reset password link error" });

            })


    })


}
exports.refreshToken = (req, res) => {
    var id = req.body._id
    var refreshToken = req.body.refreshToken
    if ((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == id)) {

        var token = jwt.sign(id, app.get("secretkey"), { expiresIn: "1h" })
        res.json({ token: token })
    }
    else {
        res.send(401)
    }

}

exports.logout = (req, res) => {
    var refreshToken = req.body.refreshToken //hadha token ili 5theh l user
    if (refreshToken in refreshTokens) {
        delete refreshTokens[refreshToken]
    }
    res.send(204)


}

exports.authenticate = (req, res) => {
    UserModel.findOne({ email: req.body.email }, function (err, userinfo) {

        if (err) {
            console.log(err)
        }
        else {
            if (userinfo != null) {

                console.log(userinfo.password)
                console.log(req.body.password)

                if (bcrypt.compare(req.body.password, userinfo._id)) { // bch ycompari bin password fi base w mdp ili da5elneh
                    const token = jwt.sign({ id: userinfo._id },
                        req.app.get("secretkey"), { expiresIn: "1h" })
                    const refreshToken = randtoken.uid(256)
                    refreshTokens[refreshToken] = userinfo._id //bch naatih wqt l token mt3o 


                    res.json({
                        status: "succes",
                        message: "user found",
                        data: {
                            user: userinfo,
                            accesstoken: token,
                            refreshtoken: refreshToken
                        }
                    })
                }
                else {
                    res.json({
                        status: "error",
                        message: "invalid password",
                        data: null
                    })
                }

            } else {

                res.json({
                    status: "error",
                    message: "invalid email",
                    data: null
                })

            }
        }

    })





}



