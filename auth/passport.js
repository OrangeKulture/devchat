module.exports = (passport, FacebookStrategy, configOptions, mongoose) => {

    let chatUser = new mongoose.Schema({
        profileID: String,
        fullName: String,
        profilePic: String
    })

    let userModel = mongoose.model('chatUser', chatUser);

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((id, done) => {
        userModel.findById(id, (err,user) => {
            done(err, user);
        })
    });

    passport.use(new FacebookStrategy({
        clientID: configOptions.fb.appID,
        clientSecret: configOptions.fb.appSecret,
        callbackURL: configOptions.fb.callbackUrl,
        profileFields: ['id', 'displayName', 'photos']
    }, (accessToken,refreshToken,profile,done) => {
        userModel.findOne({'profileID':profile.id}, (err,result) => {
            if(result){
                done(null, result);
            }else {
                let newChatUser = new userModel({
                    profileID: profile.id,
                    fullName: profile.displayName,
                    profilePic: profile.photos[0].value || ''
                });

                newChatUser.save((err) => {
                    done(null, newChatUser)
                })
            }
        })
    }))
}