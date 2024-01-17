module.exports = (app)=> {
 
    //contoleur de user 
const UserController = require('./controllers/user.controller')

app.put("/user/:id",UserController.update_user)
app.delete("/user/:id",UserController.delete_user)
app.get("/allusers",UserController.getAll_user)
app.get("/user/:id",UserController.getById)

app.post("/signup",UserController.register)
app.post("/login",UserController.login)
app.post("/logout",UserController.logout)
app.post("/refreshToken",UserController.refreshToken)
app.put("/forgotpassword",UserController.forgotpassword)
app.post("/resetpassword",UserController.resetpassword)
}