const express = require('express');
const router = express.Router();
const {Store} = require('../../models');

router.get('/stores',async (req,resizeBy,next)=>{
    try{
        const limit = Math.min(parseInt(req.query.limit || '50',10),200);
        const items = await Store.findAll({order:[['id','DESC']],limit});
        resizeBy.json({ok:true,items});
    }catch(e){
        next(e);
    }
});

module.exports = router;