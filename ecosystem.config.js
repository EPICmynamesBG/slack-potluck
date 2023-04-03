module.exports = {
    apps: [{
        name: 'slack-potluck-server',
        script: './src/app.js',
        env_production: {
            NODE_ENV: 'production'
        }
    }]
}