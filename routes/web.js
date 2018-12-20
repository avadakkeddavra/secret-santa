const Router = require('express').Router();
const fs = require('fs');
const bcrypt = require('bcrypt');

function getFile() {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/friends.json', (err, data) => {
            if(!err) {
                resolve(JSON.parse(data));
            } else {
                reject(err);
            }
        });
    });
}

function writeFile(data) {
    return new Promise((resolve, reject) => {
        fs.writeFile('./data/friends.json', JSON.stringify(data), (err) => {
            if(!err) {
                resolve(true);
            } else {
                reject(false);
            }
        })
    });
}

function auth(req, res, next) {
    try {
        if(req.body.name && req.body.secret) {
            getFile().then(async friends => {
                const user =  friends.find((item) => item.name === req.body.name);
                if(user && bcrypt.compareSync(req.body.secret, user.secret)) {
                    next()
                } else {
                    res.status(401).send({succcess: false, message: 'Таких у нас нет'})
                }
            })
        } else {
            res.status(401).send({ success: false, message: 'Назови себя)' })
        }

    } catch(Error) {
        res.send(Error.message);
    }
}

function chooseUser(user, Friends) {
    const FreeGifted = Friends.filter((item) => {
        if(item.used === false && item.name != user.name) {
            return item;   
        } 
    });
    const max = FreeGifted.length - 1;
    const index = Math.floor(Math.random() * (max - 0 + 1)) + 0;
    const choosed = FreeGifted[index];
    console.log(choosed);
    if( choosed ) {
        if(
            (user.name === 'Леша' && choosed.name === 'Тая') ||
            (user.name === 'Тая' && choosed.name === 'Леша') ||
            (user.name === 'Саша' && choosed.name === 'Костя') ||
            (user.name === 'Костя' && choosed.name === 'Саша') 
        ) {
            return chooseUser(user, Friends);
        } else {
            return choosed;
        }
    } else {
        return false;
    }
}
Router.post('/', auth, (req, res) => {
    res.send('ok');
})

// Router.post('/friend', (req,res) => {
//     if(!req.body.name) {
//         res.send({success: false});
//         return;
//     }
//     fs.readFile('./data/friends.json', (err, data) => {
//         if (err) res.send(err);
//         const Friends = JSON.parse(data);
//         const exists = Friends.find((friend) => friend.name === req.auth);
//         if(!exists) {
//             Friends.push({
//                 name: req.auth,
//                 used: false,
//                 rolls: 0,
//                 gifted: '',
//                 secret: bcrypt.hashSync(req.body.secret, 10)
//             });
//             fs.writeFile('./data/friends.json', JSON.stringify(Friends), (err) => {
//                 if(!err) {
//                     res.send(Friends);
//                 } else {
//                     res.send(err)
//                 }
//             })
//         } else {
//             res.send({ success: false, message: 'Низя добавить' })
//         }

//     });    
// });

Router.post('/random', auth, (req, res) => {
    if(!req.body.name) {
        res.send({success: false});
        return;
    }
    getFile().then((data) => {
        const Friends = data;
        const exists = Friends.find((friend) => friend.name === req.body.name);
        if(exists && exists.gifted === '') {
            exists.rolls++;
            const choosed = chooseUser(exists, Friends);
            exists.gifted = choosed.name;
            choosed.used = true;
            writeFile(Friends).then(() =>{
                res.send(exists) 
            }).catch(err => { 
                res.send(err.message);
            })
        } else {
            res.send({ success: false, gifted: exists.gifted})
        }
    }).catch(Error => {
        res.status(500).send(Error.message)
    })
})


Router.get('/clear', (req,res) => {
    getFile().then((data) => {
        data = data.map((item) => {
            item.used = false;
            item.gifted = '';
            item.rolls = 0;
            return item;
        });
        writeFile(data).then(() => {
            res.send(data);
        }).catch(err => {
            res.send(err.message)
        })
    }).catch(Error => {
        res.status(500).send(Error.message)
    })
})

module.exports = Router;