const sql = require('mysql2');
const sequelize = require('sequelize');
const Sequelize = new sequelize('mysql://root:@localhost:3306/delilah_resto');
const productos = require('express').Router();
const bodyparser = require('body-parser');
const firma = "delilahresto";
const jwt = require('jsonwebtoken');
productos.use(bodyparser.json());

async function createproducts(foodname,price,url,categoria){  
    let datos = await Sequelize.query('INSERT INTO productos(foodname, price, url, categoria) VALUES (?, ?, ?, ?)',
    {replacements:[foodname,price,url,categoria]})
    .then(function(res) {
        return res;
    });
    return datos
};
/*autenticacion token de admin*/
const  autadmin = async (req,res,next) =>{
    let token =  req.headers.authorization;
    try {
        decode = jwt.verify(token, firma);
        if(decode){
            req.usuario = decode
            next();
        }else{
            throw "Sin permiso";
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({msj: 'Login inválido'})
    }
};
/*creo productos, FUNCIONA*/
productos.post('/post',autadmin, async(req,res)=>{
    if(!req.body.foodname || !req.body.price || !req.body.url || !req.body.categoria){
        res.status(404).send("no se cumplen todos los parametros")
    }else{
    await createproducts(req.body.foodname, req.body.price, req.body.url, req.body.categoria);
    res.status(201).send('tu producto fue agregado');
    }
});


/*modifico productos, FUNCIONA*/ 
productos.put('/put/:id',autadmin, async(req,res)=>{
    const id = req.params.id;
    let valor = JSON.stringify(Object.keys(req.query));
    console.log(Object.values(req.query))
    await Sequelize.query('UPDATE productos SET '+ Object.keys(req.query) +' = ? WHERE id = '+ id ,
        {replacements:[Object.values(req.query)]})
        .then(function(res){
            return res
        }); 
        res.status(201).send('tu producto fue modificado');      
});

/*borro productos, FUNCIONA*/
productos.delete('/delete',autadmin, async(req,res)=>{
    const {id} = req.query;
    await Sequelize.query('DELETE FROM productos WHERE id = ?',
    {replacements:[req.query.id]})
    .then(function (res){
        return res
    });
    res.status(201).send('tu producto fue eliminado');
});

/*obtengo los productos, FUNCIONA*/
productos.get('/get', async(req,res)=>{
    let datos = await Sequelize.query('SELECT * FROM productos',
    {type: Sequelize.QueryTypes.SELECT})
    if(datos[0] == undefined){
    res.status(401).send("no hay productos");
    }else{
        res.status(201).send({datos});
        console.log(datos);
    }
})
/*obtengo un producto en especifico, FUNCIONA*/
productos.get('/get/:id', async(req,res)=>{
    let id = req.params.id;
    let datos = await Sequelize.query('SELECT * FROM productos WHERE id = '+ id,
    {type: Sequelize.QueryTypes.SELECT})
    if(datos[0] === undefined){
        res.status(404).send("tu producto no se ha encontrado");
    }else{
        console.log(datos);
        res.status(201).send({datos});
    }
})



module.exports = productos;