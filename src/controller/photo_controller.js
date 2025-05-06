const PhotoModel = require('../model/photo')

const createPhoto = async (req, res) => {

  try {
    // get the task from the body
    const taskData = await req.body;
    //create a new task then save
    await PhotoModel.create(taskData)
      .then((createdTask) => {
        if (!createdTask) return res.status(404)
          .json({
            success: false,
            message: "Task creation failed",
            error: "Unable get created task"
          })
        res.status(201)
          .json({
            success: true,
            createdTask
          })
      })
      .catch((error) => {
        res.status(404)
          .json({
            success: false,
            error: error.message
          })
      })
  } catch (error) {
    res.status(500)
      .json({
        success: false,
        message: "Internal server error"
      })
  }
}

const getAllPhotos = async (req, res) => {
  //get all the data in the model and return it as response
  try {
    PhotoModel.find()
      .then((allTasks) => {
        res.status(200)
          .json({
            success: true,
            allTasks
          })
      })
      .catch((error) => {
        res.status(404)
          .json({
            success: false,
            message: "Cant fined ",
            error
          })
      })
  } catch (error) {
    res.status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message
      })
  }
}
module.exports = {
  getAllPhotos,
  createPhoto,
  //   updatePhoto,
  //   deletePhoto
}