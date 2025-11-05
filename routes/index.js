/*
 * Connect all of your endpoints together here.
 */
module.exports = function (app, router) {
    const userRoutes = require('./users');
    const taskRoutes = require('./tasks');

    app.use('/api/users', userRoutes);
    app.use('api/tasks', taskRoutes);
    app.use('/api', require('./home.js')(router));
};
