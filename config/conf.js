/**
 * Created by synerzip on 24/7/15.
 */

module.exports = {

    port: process.env.PORT || 9001,
    mongo: {
        uri: process.env.MONGOURI || 'mongodb://localhost/wallmart',
        options: {
            db: {
                safe: true
            }
        }
    }
}