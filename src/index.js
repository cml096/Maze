const express = require('express');
const path = require('path');

// initialization
const app = express();

// settings
app.set('port', process.env.PORT || 3000);

// static files
app.use(express.static(path.join(__dirname, 'public')));

// starting sv
app.listen(app.get('port'), () => {
    console.log('server on port 3000');
});