﻿//==============================================================================
// import
//==============================================================================
var express = require('express');
var router = express.Router();


//==============================================================================
// public
//==============================================================================

//------------------------------------------------------------------------------
// definition
//------------------------------------------------------------------------------
module.exports = router;

//------------------------------------------------------------------------------
// implement
//------------------------------------------------------------------------------
router.get('/', function (req, res) {
    res.render("admin/pages-signin", {
        title: "Admin Signin",
    });
});
